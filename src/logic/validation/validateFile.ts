import Papa from 'papaparse';
import { CONFIG } from '../../config/defaults.ts';
import {
  FileValidationReport,
  RecordValidationResult,
  RoomRecord,
  ValidationClass,
  ValidationReason,
} from '../../types/index.ts';

const REQUIRED_HEADERS = ['readingId', 'sourceId', 'roomId', 'timestamp', 'powerKw'];
const ALLOWED_HEADERS = ['readingId', 'sourceId', 'roomId', 'timestamp', 'powerKw', 'occupancy', 'meterType', 'sensorStatus', 'note'];

// Suspicious patterns check (Stage 6)
const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /<\/script>/i,
  /javascript:/i,
  /data:text\/html/i,
  /on\w+\s*=/i,
  /;\s*DROP\s+TABLE/i,
  /UNION\s+SELECT/i,
  /\{\{/,
  /\$\{/,
  /<[a-zA-Z]/,
];

// Control and hidden unicode chars (Stage 6)
const CONTROL_OR_HIDDEN_REGEX = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2060\uFEFF\u202A-\u202E\u2066-\u2069]/;

function escapePreview(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidCalendarDate(year: number, month: number, day: number, hour: number, minute: number, second: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return false;
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day &&
    d.getUTCHours() === hour &&
    d.getUTCMinutes() === minute &&
    d.getUTCSeconds() === second
  );
}

export interface ValidationPipelineOptions {
  knownRooms?: RoomRecord[];
  nowIso?: string;
  storedDuplicateKeys?: Set<string>;
}

/**
 * 7-Stage Ingestion Validation Pipeline (MASTER.md §8.3)
 */
export async function validateIngestionFile(
  content: string,
  fileName: string,
  fileSizeBytes: number,
  options: ValidationPipelineOptions = {}
): Promise<FileValidationReport> {
  const processedAt = new Date().toISOString();
  const now = options.nowIso ? new Date(options.nowIso) : new Date();
  const knownRooms = options.knownRooms || [];
  const knownRoomMap = new Map<string, RoomRecord>(knownRooms.map(r => [r.roomId, r]));

  const baseReport: FileValidationReport = {
    fileName,
    fileSizeBytes,
    processedAt,
    fileStatus: 'PROCESSED',
    fileError: null,
    failingStage: null,
    totals: {
      total: 0,
      accepted: 0,
      warning: 0,
      duplicate: 0,
      rejected: 0,
      quarantined: 0,
    },
    records: [],
  };

  // ==========================================
  // STAGE 1: File Validation
  // ==========================================
  const lowerName = fileName.toLowerCase();
  const isCsv = lowerName.endsWith('.csv');
  const isJson = lowerName.endsWith('.json');

  if (!isCsv && !isJson) {
    baseReport.fileStatus = 'FILE_REJECTED';
    baseReport.fileError = `Invalid file extension. Only .csv and .json are accepted.`;
    baseReport.failingStage = 1;
    return baseReport;
  }

  if (fileSizeBytes > CONFIG.maxFileSizeBytes || content.length > CONFIG.maxFileSizeBytes) {
    baseReport.fileStatus = 'FILE_REJECTED';
    baseReport.fileError = `File exceeds 1 MB limit (${Math.round(fileSizeBytes / 1024)} KB).`;
    baseReport.failingStage = 1;
    return baseReport;
  }

  // Reject files with NUL bytes
  if (content.includes('\u0000')) {
    baseReport.fileStatus = 'FILE_REJECTED';
    baseReport.fileError = `Binary content or NUL bytes detected in file.`;
    baseReport.failingStage = 1;
    return baseReport;
  }

  // Check JSON start
  const trimmedContent = content.trim();
  if (isJson && !trimmedContent.startsWith('{') && !trimmedContent.startsWith('[')) {
    baseReport.fileStatus = 'FILE_REJECTED';
    baseReport.fileError = `Invalid JSON: file must start with '{' or '['.`;
    baseReport.failingStage = 1;
    return baseReport;
  }

  // ==========================================
  // STAGE 2: Format Validation & Prototype Pollution Guard
  // ==========================================
  let rawRecords: any[] = [];

  if (isJson) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        rawRecords = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.records)) {
        rawRecords = parsed.records;
      } else {
        baseReport.fileStatus = 'FILE_REJECTED';
        baseReport.fileError = `Unexpected JSON structure: root must be an array or { records: [...] }.`;
        baseReport.failingStage = 2;
        return baseReport;
      }
    } catch (err: any) {
      baseReport.fileStatus = 'FILE_REJECTED';
      baseReport.fileError = `Malformed JSON: ${escapePreview(err?.message || 'Syntax error')}`;
      baseReport.failingStage = 2;
      return baseReport;
    }
  } else {
    // CSV Parsing via PapaParse
    const parsed = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (parsed.errors && parsed.errors.length > 0) {
      // Check for catastrophic CSV parser errors
      const fatalErrors = parsed.errors.filter(e => e.type === 'Delimiter' || e.code === 'UndetectableDelimiter');
      if (fatalErrors.length > 0 && parsed.data.length === 0) {
        baseReport.fileStatus = 'FILE_REJECTED';
        baseReport.fileError = `Malformed CSV: ${fatalErrors[0].message}`;
        baseReport.failingStage = 2;
        return baseReport;
      }
    }

    rawRecords = parsed.data as any[];

    // Check headers
    const metaHeaders = (parsed.meta.fields || []).map(h => h.trim().normalize('NFKC'));
    for (const req of REQUIRED_HEADERS) {
      if (!metaHeaders.includes(req)) {
        baseReport.fileStatus = 'FILE_REJECTED';
        baseReport.fileError = `Missing required CSV column: '${req}'.`;
        baseReport.failingStage = 2;
        return baseReport;
      }
    }
  }

  if (rawRecords.length > CONFIG.maxRows) {
    baseReport.fileStatus = 'FILE_REJECTED';
    baseReport.fileError = `File exceeds maximum row limit of ${CONFIG.maxRows} records (found ${rawRecords.length}).`;
    baseReport.failingStage = 1;
    return baseReport;
  }

  if (rawRecords.length === 0) {
    baseReport.fileStatus = 'PROCESSED';
    baseReport.fileError = `File contained 0 records.`;
    return baseReport;
  }

  // Two-pass duplicate analysis setup for Stage 5
  // Key = sourceId|roomId|timestampUtcMillis
  const keyOccurrences = new Map<string, { rowIndex: number; record: any; isIdentical: boolean }[]>();

  // Intermediate validation holder
  const evaluatedRows: {
    rowIndex: number;
    recordRef: string;
    reasons: ValidationReason[];
    strongestClass: ValidationClass;
    dedupeKey: string | null;
    rawPayload: any;
    displayPreview: string;
  }[] = [];

  for (let i = 0; i < rawRecords.length; i++) {
    const raw = rawRecords[i];
    const rowIndex = i + 1;
    const reasons: ValidationReason[] = [];

    // Stage 2 Prototype Pollution Check:
    if (raw && typeof raw === 'object') {
      const ownKeys = Object.getOwnPropertyNames(raw);
      if (ownKeys.includes('__proto__') || ownKeys.includes('constructor') || ownKeys.includes('prototype')) {
        evaluatedRows.push({
          rowIndex,
          recordRef: `ROW-${rowIndex}`,
          reasons: [{ code: 'PROTOTYPE_POLLUTION_ATTEMPT', message: 'Record contains banned prototype manipulation keys (__proto__).' }],
          strongestClass: 'REJECTED',
          dedupeKey: null,
          rawPayload: {},
          displayPreview: `Row ${rowIndex} | Security reject`,
        });
        continue;
      }
    }

    // Whitelist extraction into fresh object
    const clean: Record<string, any> = {};
    for (const key of ALLOWED_HEADERS) {
      if (raw && key in raw) {
        clean[key] = raw[key];
      }
    }

    // Report extra unexpected fields as WARNING
    if (raw && typeof raw === 'object') {
      for (const k of Object.keys(raw)) {
        if (!ALLOWED_HEADERS.includes(k) && k.trim() !== '') {
          reasons.push({ code: 'UNEXPECTED_FIELD', field: k, message: `Unknown extra field '${k}' ignored.` });
        }
      }
    }

    const readingId = clean.readingId !== undefined ? String(clean.readingId).trim().normalize('NFKC') : '';
    const sourceId = clean.sourceId !== undefined ? String(clean.sourceId).trim().normalize('NFKC') : '';
    const roomId = clean.roomId !== undefined ? String(clean.roomId).trim().normalize('NFKC') : '';
    const rawTimestamp = clean.timestamp !== undefined ? String(clean.timestamp).trim() : '';
    const rawPower = clean.powerKw;
    const rawOcc = clean.occupancy;
    const rawMeterType = clean.meterType ? String(clean.meterType).trim().toUpperCase() : 'UNIDIRECTIONAL';
    const rawSensorStatus = clean.sensorStatus ? String(clean.sensorStatus).trim().toUpperCase() : 'HEALTHY';
    const rawNote = clean.note !== undefined ? String(clean.note) : '';

    const recordRef = readingId || (roomId ? `${roomId}` : `ROW-${rowIndex}`);

    // ==========================================
    // STAGE 6: Unicode & Malicious-Input Scanning
    // ==========================================
    const fieldsToCheck = [readingId, sourceId, roomId, rawMeterType, rawSensorStatus];
    if (fieldsToCheck.some(f => CONTROL_OR_HIDDEN_REGEX.test(f))) {
      reasons.push({ code: 'CONTROL_OR_HIDDEN_CHARACTERS', message: 'Identifier or enum contains C0/C1 or hidden zero-width unicode characters.' });
    }

    if (rawNote) {
      if (rawNote.length > CONFIG.maxNoteLength) {
        reasons.push({ code: 'NOTE_EXCEEDS_LENGTH', field: 'note', message: `Note exceeds max length of ${CONFIG.maxNoteLength}.` });
      }
      if (SUSPICIOUS_PATTERNS.some(pat => pat.test(rawNote))) {
        reasons.push({ code: 'SUSPICIOUS_TEXT', field: 'note', message: 'Script tags, HTML or SQL execution patterns detected in note.' });
      }
      if (/^[=+\-@]/.test(rawNote)) {
        reasons.push({ code: 'FORMULA_LIKE_TEXT', field: 'note', message: 'Note begins with formula-leading character (=, +, -, @).' });
      }
    }

    // ==========================================
    // STAGE 3: Data-Type Validation
    // ==========================================
    // Required fields check
    if (!readingId) reasons.push({ code: 'MISSING_REQUIRED_FIELD', field: 'readingId', message: 'Missing readingId.' });
    if (!sourceId) reasons.push({ code: 'MISSING_REQUIRED_FIELD', field: 'sourceId', message: 'Missing sourceId.' });
    if (!roomId) reasons.push({ code: 'MISSING_REQUIRED_FIELD', field: 'roomId', message: 'Missing roomId.' });

    // ID Format check
    const idRegex = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
    if (readingId && !idRegex.test(readingId)) {
      reasons.push({ code: 'INVALID_ID_FORMAT', field: 'readingId', message: `Invalid readingId format: '${readingId}'.` });
    }
    if (sourceId && !idRegex.test(sourceId)) {
      reasons.push({ code: 'INVALID_ID_FORMAT', field: 'sourceId', message: `Invalid sourceId format: '${sourceId}'.` });
    }
    if (roomId && !idRegex.test(roomId)) {
      reasons.push({ code: 'INVALID_ID_FORMAT', field: 'roomId', message: `Invalid roomId format: '${roomId}'.` });
    }

    // Known room check
    const roomRecord = knownRoomMap.get(roomId);
    if (roomId && idRegex.test(roomId) && !roomRecord) {
      reasons.push({ code: 'UNKNOWN_ROOM', field: 'roomId', message: `Room '${roomId}' does not exist in the campus registry.` });
    }

    // Power type check
    let parsedPower: number | null = null;
    if (rawPower === undefined || rawPower === null || rawPower === '') {
      reasons.push({ code: 'MISSING_REQUIRED_FIELD', field: 'powerKw', message: 'Missing powerKw.' });
    } else if (isJson && typeof rawPower !== 'number') {
      reasons.push({ code: 'INVALID_POWER_TYPE', field: 'powerKw', message: `JSON powerKw must be a number, got string '${rawPower}'.` });
    } else {
      const pStr = String(rawPower).trim();
      if (!/^-?\d+(\.\d+)?$/.test(pStr) || !Number.isFinite(Number(pStr))) {
        reasons.push({ code: 'INVALID_POWER_TYPE', field: 'powerKw', message: `Power reading '${pStr}' is not a valid finite number.` });
      } else {
        parsedPower = Number(pStr);
      }
    }

    // Occupancy type check
    let parsedOcc: number | 'UNKNOWN' = 'UNKNOWN';
    if (rawOcc === undefined || rawOcc === null || rawOcc === '' || String(rawOcc).trim() === '') {
      reasons.push({ code: 'OCCUPANCY_MISSING', field: 'occupancy', message: 'Missing occupancy reading; defaulting to UNKNOWN.' });
      parsedOcc = 'UNKNOWN';
    } else if (String(rawOcc).trim().toUpperCase() === 'UNKNOWN') {
      parsedOcc = 'UNKNOWN';
    } else {
      const oStr = String(rawOcc).trim();
      if (!/^\d+$/.test(oStr)) {
        if (/^-\d+$/.test(oStr)) {
          // Negative occupancy handled in Stage 4
          parsedOcc = Number(oStr);
        } else {
          reasons.push({ code: 'INVALID_OCCUPANCY_TYPE', field: 'occupancy', message: `Occupancy '${oStr}' must be an integer count or 'UNKNOWN'.` });
        }
      } else {
        parsedOcc = Number(oStr);
      }
    }

    // Timestamp check
    let parsedTsMillis: number | null = null;
    if (!rawTimestamp) {
      reasons.push({ code: 'MISSING_TIMESTAMP', field: 'timestamp', message: 'Missing timestamp.' });
    } else {
      const strictIsoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;
      if (!strictIsoRegex.test(rawTimestamp)) {
        reasons.push({ code: 'INVALID_TIMESTAMP', field: 'timestamp', message: `Timestamp '${rawTimestamp}' is not valid ISO 8601.` });
      } else {
        // Date existence check
        const parts = rawTimestamp.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (parts) {
          const y = parseInt(parts[1], 10);
          const m = parseInt(parts[2], 10);
          const d = parseInt(parts[3], 10);
          const h = parseInt(parts[4], 10);
          const min = parseInt(parts[5], 10);
          const s = parseInt(parts[6], 10);
          if (!isValidCalendarDate(y, m, d, h, min, s)) {
            reasons.push({ code: 'INVALID_TIMESTAMP', field: 'timestamp', message: `Timestamp has invalid calendar values (e.g. invalid day or month): '${rawTimestamp}'.` });
          }
        }

        const parsedDate = new Date(rawTimestamp);
        if (isNaN(parsedDate.getTime())) {
          reasons.push({ code: 'INVALID_TIMESTAMP', field: 'timestamp', message: `Unparseable date: '${rawTimestamp}'.` });
        } else {
          parsedTsMillis = parsedDate.getTime();
          const ageMinutes = (now.getTime() - parsedTsMillis) / (1000 * 60);
          if (ageMinutes < -5) {
            reasons.push({ code: 'FUTURE_TIMESTAMP', field: 'timestamp', message: `Timestamp is more than 5 minutes in the future (${Math.round(-ageMinutes)} min).` });
          } else if (ageMinutes > CONFIG.freshnessMinutes) {
            reasons.push({ code: 'STALE_TIMESTAMP', field: 'timestamp', message: `Timestamp is older than freshness window (${Math.round(ageMinutes)} min).` });
          }
        }
      }
    }

    // Meter and sensor status check
    if (clean.meterType && !['UNIDIRECTIONAL', 'BIDIRECTIONAL'].includes(rawMeterType)) {
      reasons.push({ code: 'INVALID_ENUM', field: 'meterType', message: `Invalid meterType '${clean.meterType}'. Expected UNIDIRECTIONAL or BIDIRECTIONAL.` });
    }
    if (clean.sensorStatus && !['HEALTHY', 'DEGRADED', 'OFFLINE'].includes(rawSensorStatus)) {
      reasons.push({ code: 'INVALID_ENUM', field: 'sensorStatus', message: `Invalid sensorStatus '${clean.sensorStatus}'. Expected HEALTHY, DEGRADED, or OFFLINE.` });
    }

    // ==========================================
    // STAGE 4: Range Validation
    // ==========================================
    if (typeof parsedOcc === 'number') {
      if (parsedOcc < 0) {
        reasons.push({ code: 'NEGATIVE_OCCUPANCY', field: 'occupancy', message: `Occupancy cannot be negative (${parsedOcc}).` });
      } else if (roomRecord && parsedOcc > roomRecord.roomCapacity) {
        reasons.push({ code: 'OCCUPANCY_EXCEEDS_CAPACITY', field: 'occupancy', message: `Occupancy (${parsedOcc}) exceeds room capacity (${roomRecord.roomCapacity}).` });
      }
    }

    if (parsedPower !== null) {
      if (Math.abs(parsedPower) > 100000) {
        reasons.push({ code: 'ABSURD_POWER', field: 'powerKw', message: `Absurd power reading exceeding 100,000 kW (${parsedPower} kW).` });
      } else if (roomRecord && parsedPower > roomRecord.maxPowerKw) {
        reasons.push({ code: 'UNREALISTIC_POWER', field: 'powerKw', message: `Power (${parsedPower} kW) exceeds circuit rating (${roomRecord.maxPowerKw} kW).` });
      }

      // Negative power check
      if (parsedPower < 0) {
        if (!roomRecord || roomRecord.meterType === 'UNIDIRECTIONAL') {
          reasons.push({ code: 'NEGATIVE_POWER_UNIDIRECTIONAL', field: 'powerKw', message: `Negative power (${parsedPower} kW) is not permitted on unidirectional meter.` });
        } else if (roomRecord.meterType === 'BIDIRECTIONAL') {
          if (parsedPower < -roomRecord.maxPowerKw) {
            reasons.push({ code: 'UNREALISTIC_POWER', field: 'powerKw', message: `Negative power export exceeds reverse rating (${roomRecord.maxPowerKw} kW).` });
          } else {
            reasons.push({ code: 'ENERGY_EXPORT', field: 'powerKw', message: `Negative power reading accepted as solar/battery energy export.` });
          }
        }
      }

      // Check if file claims bidirectional on a unidirectional room
      if (rawMeterType === 'BIDIRECTIONAL' && roomRecord && roomRecord.meterType === 'UNIDIRECTIONAL') {
        reasons.push({ code: 'METER_TYPE_MISMATCH', field: 'meterType', message: `File claims BIDIRECTIONAL meter but room is configured UNIDIRECTIONAL in registry.` });
      }
    }

    // Construct dedupe key for Stage 5
    let dedupeKey: string | null = null;
    if (sourceId && roomId && parsedTsMillis !== null) {
      dedupeKey = `${sourceId}|${roomId}|${parsedTsMillis}`;
      const entry = { rowIndex, record: clean, isIdentical: true };
      if (!keyOccurrences.has(dedupeKey)) {
        keyOccurrences.set(dedupeKey, [entry]);
      } else {
        keyOccurrences.get(dedupeKey)!.push(entry);
      }
    }

    // Build display preview (safe inert string)
    const displayPreview = `${recordRef} | ${parsedOcc === 'UNKNOWN' ? '?' : parsedOcc} occ | ${parsedPower !== null ? `${parsedPower} kW` : 'invalid power'}`;

    evaluatedRows.push({
      rowIndex,
      recordRef,
      reasons,
      strongestClass: 'ACCEPTED',
      dedupeKey,
      rawPayload: clean,
      displayPreview,
    });
  }

  // ==========================================
  // STAGE 5: Duplicate & Conflicting Duplicate Detection
  // ==========================================
  for (const [key, occs] of keyOccurrences.entries()) {
    if (occs.length > 1) {
      // Check if payloads are identical
      const firstPayloadJson = JSON.stringify(occs[0].record);
      const allIdentical = occs.every(o => JSON.stringify(o.record) === firstPayloadJson);

      if (allIdentical) {
        // First is kept, later ones are DUPLICATE
        for (let j = 1; j < occs.length; j++) {
          const row = evaluatedRows.find(r => r.rowIndex === occs[j].rowIndex);
          if (row) {
            row.reasons.push({ code: 'DUPLICATE_READING', message: `Identical reading already present in file for key '${key}'.` });
          }
        }
      } else {
        // Conflicting duplicates! All occurrences quarantined
        for (const o of occs) {
          const row = evaluatedRows.find(r => r.rowIndex === o.rowIndex);
          if (row) {
            row.reasons.push({ code: 'CONFLICTING_DUPLICATE', message: `Conflicting values reported for identical timestamp and source key '${key}'.` });
          }
        }
      }
    }
  }

  // Check against previously stored duplicate keys
  if (options.storedDuplicateKeys) {
    for (const row of evaluatedRows) {
      if (row.dedupeKey && options.storedDuplicateKeys.has(row.dedupeKey)) {
        row.reasons.push({ code: 'PREVIOUS_DUPLICATE', message: `Reading key '${row.dedupeKey}' was already ingested in a previous file.` });
      }
    }
  }

  // ==========================================
  // STAGE 7: Final Classification
  // Precedence: REJECTED > QUARANTINED > DUPLICATE > WARNING > ACCEPTED
  // ==========================================
  const results: RecordValidationResult[] = [];

  for (const row of evaluatedRows) {
    let finalClass: ValidationClass = 'ACCEPTED';

    const hasReject = row.reasons.some(r =>
      [
        'PROTOTYPE_POLLUTION_ATTEMPT',
        'CONTROL_OR_HIDDEN_CHARACTERS',
        'MISSING_REQUIRED_FIELD',
        'INVALID_ID_FORMAT',
        'INVALID_POWER_TYPE',
        'INVALID_OCCUPANCY_TYPE',
        'NEGATIVE_OCCUPANCY',
        'ABSURD_POWER',
        'NEGATIVE_POWER_UNIDIRECTIONAL',
        'INVALID_ENUM',
      ].includes(r.code)
    );

    const hasQuarantine = row.reasons.some(r =>
      [
        'UNKNOWN_ROOM',
        'MISSING_TIMESTAMP',
        'INVALID_TIMESTAMP',
        'FUTURE_TIMESTAMP',
        'OCCUPANCY_EXCEEDS_CAPACITY',
        'UNREALISTIC_POWER',
        'METER_TYPE_MISMATCH',
        'CONFLICTING_DUPLICATE',
        'SUSPICIOUS_TEXT',
        'NOTE_EXCEEDS_LENGTH',
      ].includes(r.code)
    );

    const hasDuplicate = row.reasons.some(r =>
      ['DUPLICATE_READING', 'PREVIOUS_DUPLICATE'].includes(r.code)
    );

    const hasWarning = row.reasons.some(r =>
      [
        'UNEXPECTED_FIELD',
        'OCCUPANCY_MISSING',
        'STALE_TIMESTAMP',
        'ENERGY_EXPORT',
        'FORMULA_LIKE_TEXT',
      ].includes(r.code)
    );

    if (hasReject) {
      finalClass = 'REJECTED';
    } else if (hasQuarantine) {
      finalClass = 'QUARANTINED';
    } else if (hasDuplicate) {
      finalClass = 'DUPLICATE';
    } else if (hasWarning) {
      finalClass = 'WARNING';
    } else {
      finalClass = 'ACCEPTED';
    }

    // Totals count
    if (finalClass === 'ACCEPTED') baseReport.totals.accepted++;
    else if (finalClass === 'WARNING') baseReport.totals.warning++;
    else if (finalClass === 'DUPLICATE') baseReport.totals.duplicate++;
    else if (finalClass === 'REJECTED') baseReport.totals.rejected++;
    else if (finalClass === 'QUARANTINED') baseReport.totals.quarantined++;

    baseReport.totals.total++;

    results.push({
      rowIndex: row.rowIndex,
      recordRef: row.recordRef,
      classification: finalClass,
      reasons: row.reasons,
      displayPreview: row.displayPreview,
      rawPayload: row.rawPayload,
    });
  }

  baseReport.records = results;
  return baseReport;
}
