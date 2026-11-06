import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { RecordValidationResult, RoomRecord } from '../../types/index.ts';

export interface RemediateQuarantineModalProps {
  isOpen: boolean;
  record: RecordValidationResult | null;
  knownRooms: RoomRecord[];
  onClose: () => void;
  onSave: (updatedRecord: RecordValidationResult, updatedPayload: Record<string, any>) => void;
}

export const RemediateQuarantineModal: React.FC<RemediateQuarantineModalProps> = ({
  isOpen,
  record,
  knownRooms,
  onClose,
  onSave,
}) => {
  if (!isOpen || !record) return null;

  const raw = record.rawPayload || {};

  const [readingId, setReadingId] = useState(raw.readingId || record.recordRef || 'READ-CORRECTED');
  const [sourceId, setSourceId] = useState(raw.sourceId || 'SRC-ADMIN-OVERRIDE');
  const [roomId, setRoomId] = useState(raw.roomId || (knownRooms[0]?.roomId || 'A-101'));
  const [timestamp, setTimestamp] = useState(
    raw.timestamp && !raw.timestamp.includes('13-45') ? raw.timestamp : new Date().toISOString()
  );
  const [powerKw, setPowerKw] = useState(
    typeof raw.powerKw === 'number' && raw.powerKw <= 25 ? String(raw.powerKw) : '3.5'
  );
  const [occupancy, setOccupancy] = useState(
    raw.occupancy !== undefined && raw.occupancy !== '' && Number(raw.occupancy) >= 0
      ? String(raw.occupancy)
      : '0'
  );
  const [note, setNote] = useState(
    raw.note && !raw.note.includes('<script') ? raw.note : 'Remediated by administrator'
  );
  const [adminReason, setAdminReason] = useState('Corrected corrupt telemetry value during administrative quarantine review.');

  const setTimestampNow = () => {
    setTimestamp(new Date().toISOString());
  };

  const sanitizeScriptNote = () => {
    setNote('Sanitized by administrator: script payload removed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedPayload = {
      ...raw,
      readingId: readingId.trim(),
      sourceId: sourceId.trim(),
      roomId: roomId.trim(),
      timestamp: timestamp.trim(),
      powerKw: Number(powerKw) || 0,
      occupancy: occupancy.trim().toUpperCase() === 'UNKNOWN' ? 'UNKNOWN' : Number(occupancy) || 0,
      note: note.trim(),
      adminRemediationReason: adminReason.trim(),
    };

    onSave(record, updatedPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white dark:bg-[#12203A] rounded-[12px] border border-[#E8E8E6] dark:border-[#243557] max-w-[520px] w-full p-6 space-y-4 shadow-[0_8px_32px_rgba(32,33,36,0.16)] text-[#202124] dark:text-[#F5F0E6]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E8E6] dark:border-[#243557] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF1D6] dark:bg-[#451A03] text-[#8A5A00] dark:text-[#FCD34D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold">
                Remediate Quarantined Record #{record.rowIndex}
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#AEB8CC]">
                Manually edit invalid values to re-validate and admit into campus engines
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#737373] hover:text-[#202124] dark:hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Rejection Reasons */}
        <div className="p-2.5 rounded-[6px] bg-[#FCE4E4] dark:bg-[#450A0A] border border-[#D92D20]/40 text-[#B42318] dark:text-[#FCA5A5] text-[12px] space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Quarantine / Rejection Reasons:</span>
          </div>
          <ul className="list-disc pl-5 text-[11px] space-y-0.5">
            {record.reasons.map((r, i) => (
              <li key={i}>
                <span className="font-mono font-bold mr-1">{r.code}:</span>
                {r.message}
              </li>
            ))}
          </ul>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-[12px]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Reading ID</label>
              <input
                type="text"
                value={readingId}
                onChange={(e) => setReadingId(e.target.value)}
                className="w-full h-[32px] px-2.5 font-mono border rounded-[6px] bg-white dark:bg-[#0B1426] border-[#D4D4D1] dark:border-[#243557]"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Target Room ID</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full h-[32px] px-2.5 font-mono border rounded-[6px] bg-white dark:bg-[#0B1426] border-[#D4D4D1] dark:border-[#243557]"
              >
                {knownRooms.map((r) => (
                  <option key={r.roomId} value={r.roomId}>
                    {r.roomId} ({r.roomName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium">Timestamp (ISO 8601)</label>
              <button
                type="button"
                onClick={setTimestampNow}
                className="text-[11px] text-[#3478D4] dark:text-[#7DD3FC] hover:underline flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Use Current Timestamp</span>
              </button>
            </div>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full h-[32px] px-2.5 font-mono border rounded-[6px] bg-white dark:bg-[#0B1426] border-[#D4D4D1] dark:border-[#243557]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Power Draw (kW)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={powerKw}
                onChange={(e) => setPowerKw(e.target.value)}
                className="w-full h-[32px] px-2.5 font-mono border rounded-[6px] bg-white dark:bg-[#0B1426] border-[#D4D4D1] dark:border-[#243557]"
              />
              <span className="text-[10px] text-[#737373] dark:text-[#AEB8CC] mt-0.5 block">
                Rated circuit max: 15.0 kW
              </span>
            </div>

            <div>
              <label className="block font-medium mb-1">Occupancy Count</label>
              <input
                type="text"
                value={occupancy}
                onChange={(e) => setOccupancy(e.target.value)}
                placeholder="0 or UNKNOWN"
                className="w-full h-[32px] px-2.5 font-mono border rounded-[6px] bg-white dark:bg-[#0B1426] border-[#D4D4D1] dark:border-[#243557]"
              />
              <span className="text-[10px] text-[#737373] dark:text-[#AEB8CC] mt-0.5 block">
                Non-negative int or literal UNKNOWN
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium">Free-Text Note / Remarks</label>
              {note.includes('<') && (
                <button
                  type="button"
                  onClick={sanitizeScriptNote}
                  className="text-[11px] text-[#B42318] dark:text-[#FCA5A5] hover:underline"
                >
                  Sanitize Script
                </button>
              )}
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-[32px] px-2.5 border rounded-[6px] bg-white dark:bg-[#0B1426] border-[#D4D4D1] dark:border-[#243557]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Administrative Remediation Justification</label>
            <input
              type="text"
              required
              value={adminReason}
              onChange={(e) => setAdminReason(e.target.value)}
              className="w-full h-[32px] px-2.5 border rounded-[6px] bg-white dark:bg-[#0B1426] border-[#D4D4D1] dark:border-[#243557]"
            />
          </div>

          <div className="pt-3 border-t border-[#E8E8E6] dark:border-[#243557] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[32px] px-3.5 font-medium rounded-[6px] bg-white dark:bg-[#12203A] border border-[#D4D4D1] dark:border-[#243557] hover:bg-[#F1F1EF] dark:hover:bg-[#182A4A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[32px] px-4 font-medium rounded-[6px] bg-[#3478D4] hover:bg-[#2A67BC] text-white flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Re-Validate & Admit Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
