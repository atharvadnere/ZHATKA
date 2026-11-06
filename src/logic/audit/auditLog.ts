import { CONFIG } from '../../config/defaults.ts';
import { AuditRecord } from '../../types/index.ts';

export function createAuditEvent({
  action,
  target,
  recommendationId = null,
  requestedAction,
  approvalStatus,
  reason,
  actor = 'Administrator (simulated)',
  beforeReading = null,
  afterReading = null,
  simulatedResult = null,
  outcome = 'SUCCESS',
  counter = 1,
}: {
  action: string;
  target?: string | null;
  recommendationId?: string | null;
  requestedAction?: string;
  approvalStatus?: string;
  reason: string;
  actor?: string;
  beforeReading?: Record<string, any> | null;
  afterReading?: Record<string, any> | null;
  simulatedResult?: Record<string, any> | string | null;
  outcome?: 'SUCCESS' | 'BLOCKED' | 'FAILED';
  counter?: number;
}): AuditRecord {
  const eventId = `AUD-${String(counter).padStart(6, '0')}`;
  const timestamp = new Date().toISOString();

  return {
    eventId,
    recommendationId,
    target: target || null,
    action,
    requestedAction,
    approvalStatus,
    actor,
    timestamp,
    reason,
    beforeReading,
    afterReading,
    simulatedResult,
    outcome,
  };
}

/**
 * Formula-Injection-Safe CSV Export (MASTER.md §8.3 Stage 6)
 * Prefixes single quote (') to any value starting with =, +, -, @
 */
export function generateSafeAuditCsv(events: AuditRecord[]): string {
  const sanitizeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    // Neutralize formula injection
    if (/^[=+\-@]/.test(str)) {
      str = `'${str}`;
    }
    // Escape internal quotes
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headers = ['Event ID', 'Timestamp (UTC)', 'Timestamp (Asia/Kolkata)', 'Actor', 'Action', 'Target', 'Outcome', 'Reason', 'Before Reading', 'After Reading'];
  const rows = events.map(evt => {
    const kolkataTime = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(new Date(evt.timestamp));

    return [
      sanitizeCell(evt.eventId),
      sanitizeCell(evt.timestamp),
      sanitizeCell(kolkataTime),
      sanitizeCell(evt.actor),
      sanitizeCell(evt.action),
      sanitizeCell(evt.target),
      sanitizeCell(evt.outcome),
      sanitizeCell(evt.reason),
      sanitizeCell(evt.beforeReading ? JSON.stringify(evt.beforeReading) : ''),
      sanitizeCell(evt.afterReading ? JSON.stringify(evt.afterReading) : ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
