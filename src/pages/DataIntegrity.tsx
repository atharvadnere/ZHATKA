import React, { useState } from 'react';
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  FileSpreadsheet,
  HelpCircle,
  AlertOctagon,
  Info,
  Edit3,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { validateIngestionFile } from '../logic/validation/validateFile.ts';
import { generateAttackCases, AttackCase } from '../logic/validation/attackGenerators.ts';
import {
  generateCombinedBadDemoCsv,
  generateSampleValidCsv,
  generateSampleValidJson,
} from '../data/seed.ts';
import { FileValidationReport, ValidationClass } from '../types/index.ts';
import { RemediateQuarantineModal } from '../components/common/RemediateQuarantineModal.tsx';

export const DataIntegrity: React.FC = () => {
  const {
    rooms,
    applyValidationResults,
    latestValidationReport,
    setActivePage,
    remediateQuarantinedRecord,
  } = useAppState();

  const [dragOver, setDragOver] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [activeAttackCase, setActiveAttackCase] = useState<AttackCase | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [remediatingRecord, setRemediatingRecord] = useState<any | null>(null);

  const attackCases = generateAttackCases();

  // Run validation
  const handleValidateContent = async (content: string, fileName: string, size?: number) => {
    setIsValidating(true);
    try {
      const fileSizeBytes = size || new Blob([content]).size;
      const report = await validateIngestionFile(content, fileName, fileSizeBytes, {
        knownRooms: rooms,
      });
      applyValidationResults(report);
    } catch (err: any) {
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  // File upload handler
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content !== undefined) {
        handleValidateContent(content, file.name, file.size);
      }
    };
    reader.readAsText(file);
  };

  // Helper download trigger
  const triggerDownload = (filename: string, text: string, mime = 'text/csv') => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const report = latestValidationReport;
  const filteredRecords = report
    ? report.records.filter((r) =>
        selectedClassFilter === 'ALL' ? true : r.classification === selectedClassFilter
      )
    : [];

  const STAGES = [
    { num: 1, name: 'File', desc: 'Size, extension & NUL bytes' },
    { num: 2, name: 'Format', desc: 'JSON/CSV & Prototype guard' },
    { num: 3, name: 'Types', desc: 'Strict IDs, types & ISO dates' },
    { num: 4, name: 'Range', desc: 'Bounds, negative power & export' },
    { num: 5, name: 'Duplicates', desc: 'Identical & conflicting keys' },
    { num: 6, name: 'Malicious', desc: 'XSS, SQL, bidi & formula sanitizing' },
    { num: 7, name: 'Classify', desc: '5-class deterministic routing' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={ShieldCheck}
        title="Data Integrity & Security Engine"
        tag="SIMULATED"
        description="Dual-layer client & server ingestion security: 7-stage validation pipeline protecting campus decision engines from corrupted or malicious inputs."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerDownload('sample_valid.csv', generateSampleValidCsv())}
              className="h-[32px] px-3 rounded-[8px] bg-white border border-[#D4D4D1] text-[#202124] hover:bg-[#F1F1EF] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </button>
            <button
              onClick={() => triggerDownload('sample_valid.json', generateSampleValidJson(), 'application/json')}
              className="h-[32px] px-3 rounded-[8px] bg-white border border-[#D4D4D1] text-[#202124] hover:bg-[#F1F1EF] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample JSON</span>
            </button>
          </div>
        }
      />

      {/* Honest Boundary Banner (MASTER.md §8.8) */}
      <div className="p-3.5 bg-[#F7F7F5] border border-[#E8E8E6] rounded-[8px] text-[12px] text-[#737373] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#3478D4] shrink-0 mt-0.5" />
        <div className="leading-[18px]">
          <strong className="text-[#202124]">Security Architecture Note (MASTER §8.8):</strong> Client-side validation only demonstrates input sanitisation principles. Production deployments require authenticated TLS ingestion endpoints, rate-limiting, and server-side cryptographic signatures.
        </div>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`p-8 border-2 border-dashed rounded-[10px] text-center transition-colors bg-white ${
          dragOver ? 'border-[#3478D4] bg-[#EAF2FC]/30' : 'border-[#D4D4D1] hover:border-[#737373]'
        }`}
      >
        <UploadCloud className="w-8 h-8 text-[#737373] mx-auto mb-2" />
        <div className="text-[14px] font-semibold text-[#202124]">
          Drop a CSV or JSON file here, or{' '}
          <label className="text-[#3478D4] hover:underline cursor-pointer">
            browse computer
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-[12px] text-[#737373] mt-1">
          Max file size: 1 MB · Max records: 5,000 rows · Supported schema: Room Reading telemetry
        </p>

        {/* Quick Load Bad-Data Demo Button (§8.6) */}
        <div className="mt-4 pt-3 border-t border-[#E8E8E6] flex items-center justify-center gap-3">
          <button
            onClick={() => {
              const content = generateCombinedBadDemoCsv();
              handleValidateContent(content, 'combined_bad_demo.csv');
            }}
            className="h-[32px] px-3.5 rounded-[8px] bg-[#FFF1D6] text-[#8A5A00] hover:bg-[#ffe3af] text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Load Combined Bad-Data Demo (MASTER §17.5)</span>
          </button>
        </div>
      </div>

      {/* 7-Stage Pipeline Visual Stepper */}
      <div className="bg-white border border-[#E8E8E6] rounded-[10px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[#202124]">
            7-Stage Ingestion Security Pipeline
          </h3>
          <span className="text-[11px] font-mono text-[#737373]">
            Strict Execution Order
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STAGES.map((s) => {
            const isFailingStage = report?.failingStage === s.num;
            const hasRun = !!report;

            return (
              <div
                key={s.num}
                className={`p-2.5 rounded-[6px] border text-left transition-colors ${
                  isFailingStage
                    ? 'bg-[#FCE4E4] border-[#D92D20] text-[#B42318]'
                    : hasRun
                    ? 'bg-[#DDF3E4]/30 border-[#2F9E5B]/30 text-[#1E6B3A]'
                    : 'bg-[#FAFAF9] border-[#E8E8E6] text-[#202124]'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>0{s.num}</span>
                  {isFailingStage ? (
                    <XCircle className="w-3 h-3 text-[#D92D20]" />
                  ) : hasRun ? (
                    <CheckCircle className="w-3 h-3 text-[#2F9E5B]" />
                  ) : null}
                </div>
                <div className="font-semibold text-[12px] mt-1">{s.name}</div>
                <div className="text-[10px] text-[#737373] mt-0.5 leading-[13px]">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Report Details (If report exists) */}
      {report && (
        <div className="space-y-4">
          {/* File Status Banner if rejected */}
          {report.fileStatus === 'FILE_REJECTED' && (
            <div className="p-4 rounded-[10px] bg-[#FCE4E4] border border-[#D92D20] text-[#B42318] flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[14px]">FILE-LEVEL INGESTION REJECTED</div>
                <div className="text-[13px] mt-0.5">{report.fileError}</div>
                <div className="text-[11px] text-[#B42318]/80 mt-1">
                  Stage {report.failingStage} failed closed. Zero records were admitted into campus engines.
                </div>
              </div>
            </div>
          )}

          {/* Totals Tiles (The 5 classes sum to total per MASTER §8.4) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-white border border-[#E8E8E6] rounded-[8px]">
              <div className="text-[11px] text-[#737373] uppercase font-medium">Processed</div>
              <div className="font-mono text-[22px] font-bold text-[#202124] tabular-nums mt-0.5">
                {report.totals.total}
              </div>
            </div>

            <div
              onClick={() => setSelectedClassFilter('ACCEPTED')}
              className={`p-3 rounded-[8px] border cursor-pointer transition-colors ${
                selectedClassFilter === 'ACCEPTED'
                  ? 'bg-[#DDF3E4] border-[#2F9E5B]'
                  : 'bg-white border-[#E8E8E6] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="text-[11px] text-[#1E6B3A] uppercase font-medium">Accepted</div>
              <div className="font-mono text-[22px] font-bold text-[#1E6B3A] tabular-nums mt-0.5">
                {report.totals.accepted}
              </div>
            </div>

            <div
              onClick={() => setSelectedClassFilter('WARNING')}
              className={`p-3 rounded-[8px] border cursor-pointer transition-colors ${
                selectedClassFilter === 'WARNING'
                  ? 'bg-[#FFF1D6] border-[#E0A03A]'
                  : 'bg-white border-[#E8E8E6] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="text-[11px] text-[#8A5A00] uppercase font-medium">Warning</div>
              <div className="font-mono text-[22px] font-bold text-[#8A5A00] tabular-nums mt-0.5">
                {report.totals.warning}
              </div>
            </div>

            <div
              onClick={() => setSelectedClassFilter('DUPLICATE')}
              className={`p-3 rounded-[8px] border cursor-pointer transition-colors ${
                selectedClassFilter === 'DUPLICATE'
                  ? 'bg-[#F1F1EF] border-[#A3A3A0]'
                  : 'bg-white border-[#E8E8E6] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="text-[11px] text-[#6B6B6B] uppercase font-medium">Duplicate</div>
              <div className="font-mono text-[22px] font-bold text-[#6B6B6B] tabular-nums mt-0.5">
                {report.totals.duplicate}
              </div>
            </div>

            <div
              onClick={() => setSelectedClassFilter('REJECTED')}
              className={`p-3 rounded-[8px] border cursor-pointer transition-colors ${
                selectedClassFilter === 'REJECTED'
                  ? 'bg-[#FCE4E4] border-[#D92D20]'
                  : 'bg-white border-[#E8E8E6] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="text-[11px] text-[#B42318] uppercase font-medium">Rejected</div>
              <div className="font-mono text-[22px] font-bold text-[#B42318] tabular-nums mt-0.5">
                {report.totals.rejected}
              </div>
            </div>

            <div
              onClick={() => setSelectedClassFilter('QUARANTINED')}
              className={`p-3 rounded-[8px] border cursor-pointer transition-colors ${
                selectedClassFilter === 'QUARANTINED'
                  ? 'bg-[#FFF1D6] border-[#E0A03A]'
                  : 'bg-white border-[#E8E8E6] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="text-[11px] text-[#8A5A00] uppercase font-medium">Quarantined</div>
              <div className="font-mono text-[22px] font-bold text-[#8A5A00] tabular-nums mt-0.5">
                {report.totals.quarantined}
              </div>
            </div>
          </div>

          {/* Results Table per MASTER §8.5 */}
          <div className="bg-white border border-[#E8E8E6] rounded-[10px] overflow-hidden">
            <div className="p-3.5 border-b border-[#E8E8E6] flex items-center justify-between flex-wrap gap-3 bg-[#FAFAF9]">
              <div className="text-[13px] font-semibold text-[#202124]">
                Classification Audit Table ({filteredRecords.length} records shown)
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  onClick={() => setSelectedClassFilter('ALL')}
                  className={`px-2 py-1 rounded-[6px] font-medium ${
                    selectedClassFilter === 'ALL'
                      ? 'bg-[#202124] text-white'
                      : 'bg-white border border-[#D4D4D1] text-[#737373] hover:text-[#202124]'
                  }`}
                >
                  All ({report.totals.total})
                </button>
                <button
                  onClick={() => setSelectedClassFilter('REJECTED')}
                  className={`px-2 py-1 rounded-[6px] font-medium ${
                    selectedClassFilter === 'REJECTED'
                      ? 'bg-[#B42318] text-white'
                      : 'bg-white border border-[#D4D4D1] text-[#B42318]'
                  }`}
                >
                  Rejected ({report.totals.rejected})
                </button>
                <button
                  onClick={() => setSelectedClassFilter('QUARANTINED')}
                  className={`px-2 py-1 rounded-[6px] font-medium ${
                    selectedClassFilter === 'QUARANTINED'
                      ? 'bg-[#8A5A00] text-white'
                      : 'bg-white border border-[#D4D4D1] text-[#8A5A00]'
                  }`}
                >
                  Quarantined ({report.totals.quarantined})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[360px]">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#F7F7F5] border-b border-[#E8E8E6] text-[11px] text-[#737373] sticky top-0">
                  <tr>
                    <th className="p-2.5 w-12">Row</th>
                    <th className="p-2.5">Record Identifier</th>
                    <th className="p-2.5">Classification</th>
                    <th className="p-2.5">Reason Code</th>
                    <th className="p-2.5">Detailed Explanation</th>
                    <th className="p-2.5 font-mono">Inert Preview</th>
                    <th className="p-2.5 text-right">Admin Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E6] dark:divide-[#243557]">
                  {filteredRecords.map((r) => (
                    <tr key={r.rowIndex} className="hover:bg-[#F7F7F5] dark:hover:bg-[#182A4A] transition-colors">
                      <td className="p-2.5 font-mono text-[#737373]">{r.rowIndex}</td>
                      <td className="p-2.5 font-mono font-semibold text-[#202124] dark:text-[#F5F0E6]">{r.recordRef}</td>
                      <td className="p-2.5">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            r.classification === 'ACCEPTED'
                              ? 'bg-[#DDF3E4] text-[#1E6B3A] dark:bg-emerald-950 dark:text-emerald-300'
                              : r.classification === 'WARNING'
                              ? 'bg-[#FFF1D6] text-[#8A5A00] dark:bg-amber-950 dark:text-amber-300'
                              : r.classification === 'DUPLICATE'
                              ? 'bg-[#F1F1EF] text-[#6B6B6B] dark:bg-slate-800 dark:text-slate-300'
                              : r.classification === 'REJECTED'
                              ? 'bg-[#FCE4E4] text-[#B42318] dark:bg-red-950 dark:text-red-300'
                              : 'bg-[#FFF1D6] text-[#8A5A00] dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {r.classification}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-[#202124] dark:text-[#F5F0E6]">
                        {r.reasons.map((re) => re.code).join(', ') || 'NONE'}
                      </td>
                      <td className="p-2.5 text-[#737373] dark:text-[#AEB8CC] max-w-[280px]">
                        {r.reasons.map((re) => re.message).join(' · ') || 'Passed all 7 validation stages.'}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-[#737373] dark:text-[#AEB8CC] max-w-[200px] truncate" title={r.displayPreview}>
                        {r.displayPreview}
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        {r.classification === 'QUARANTINED' || r.classification === 'REJECTED' ? (
                          <button
                            onClick={() => setRemediatingRecord(r)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center gap-1 shadow-xs transition-colors"
                            title="Manually correct values and admit into live state"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit & Remediate</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#737373] font-mono">
                            {r.classification === 'ACCEPTED' ? 'Admitted' : 'Ignored'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quarantined Record Remediation Modal */}
      {remediatingRecord && (
        <RemediateQuarantineModal
          isOpen={true}
          onClose={() => setRemediatingRecord(null)}
          record={remediatingRecord}
          knownRooms={rooms}
          onSave={(_rec, updatedPayload) => {
            remediateQuarantinedRecord(remediatingRecord.rowIndex, {
              readingId: updatedPayload.readingId,
              roomId: updatedPayload.roomId,
              timestamp: updatedPayload.timestamp,
              powerKw: Number(updatedPayload.powerKw) || 0,
              occupancy: updatedPayload.occupancy === 'UNKNOWN' ? null : (typeof updatedPayload.occupancy === 'number' ? updatedPayload.occupancy : null),
              note: updatedPayload.note || updatedPayload.adminRemediationReason,
            });
            setRemediatingRecord(null);
          }}
        />
      )}

      {/* Attack Simulation Panel (DESIGN.md §6.8 & MASTER §8.7) */}
      <div className="bg-white border border-[#E8E8E6] rounded-[10px] p-5 space-y-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#202124]">
            Attack Simulation & Resilience Testing (Constraint 2)
          </h3>
          <p className="text-[12px] text-[#737373]">
            Trigger controlled malformed datasets from MASTER §8.7. Each button reveals an escaped monospace preview with validation and download controls.
          </p>
        </div>

        {/* 7 Attack Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {attackCases.map((ac) => {
            const isSelected = activeAttackCase?.id === ac.id;
            return (
              <button
                key={ac.id}
                onClick={() => setActiveAttackCase(ac)}
                className={`p-2.5 rounded-[8px] border text-left text-[12px] transition-colors ${
                  isSelected
                    ? 'border-[#3478D4] bg-[#EAF2FC] text-[#1F5FB0]'
                    : 'border-[#E8E8E6] bg-[#FAFAF9] hover:bg-[#F1F1EF] text-[#202124]'
                }`}
              >
                <div className="font-semibold truncate">{ac.name}</div>
                <div className="text-[10px] text-[#737373] uppercase font-mono mt-0.5">{ac.format}</div>
              </button>
            );
          })}
        </div>

        {/* Attack Case Preview Pane */}
        {activeAttackCase && (
          <div className="p-4 border border-[#E8E8E6] rounded-[8px] bg-[#FAFAF9] space-y-3 animate-in fade-in duration-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-[13px] font-semibold text-[#202124]">
                  {activeAttackCase.name} ({activeAttackCase.fileName})
                </h4>
                <p className="text-[12px] text-[#737373] mt-0.5">
                  {activeAttackCase.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerDownload(activeAttackCase.fileName, activeAttackCase.content, activeAttackCase.format === 'json' ? 'application/json' : 'text/csv')}
                  className="h-[30px] px-3 rounded-[6px] text-[12px] font-medium bg-white border border-[#D4D4D1] hover:bg-[#F1F1EF] text-[#202124] flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleValidateContent(activeAttackCase.content, activeAttackCase.fileName)}
                  className="h-[30px] px-3.5 rounded-[6px] text-[12px] font-medium bg-[#3478D4] text-white hover:bg-[#2A67BC] flex items-center gap-1.5 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Validate this file</span>
                </button>
              </div>
            </div>

            {/* Read-only Escaped Monospace Preview */}
            <div className="relative">
              <pre className="p-3 bg-white border border-[#E8E8E6] rounded-[6px] text-[11px] font-mono text-[#202124] overflow-x-auto max-h-[160px] whitespace-pre select-all">
                {activeAttackCase.content}
              </pre>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-[#737373] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#E8E8E6]">
                inert text preview
              </div>
            </div>

            <div className="text-[11px] text-[#737373] flex items-center gap-1.5">
              <span className="font-semibold text-[#202124]">Expected Behavior:</span>
              <span>{activeAttackCase.expectedOutcome}</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Explanation Panel (DESIGN.md §6.8) */}
      <div className="p-4 bg-[#F7F7F5] border border-[#E8E8E6] rounded-[10px] space-y-2 text-[12px] text-[#737373]">
        <h4 className="font-semibold text-[#202124] text-[13px]">
          Classification Rules & System Behavior (MASTER §8.3 Stage 7)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-[18px]">
          <div>
            <strong className="text-[#1E6B3A]">ACCEPTED:</strong> Fully valid readings that update the live room registry.
          </div>
          <div>
            <strong className="text-[#8A5A00]">WARNING:</strong> Non-fatal discrepancies (e.g. missing occupancy coerced to UNKNOWN, stale timestamp).
          </div>
          <div>
            <strong className="text-[#6B6B6B]">DUPLICATE:</strong> Identical repeat readings ignored to prevent double counting.
          </div>
          <div>
            <strong className="text-[#B42318]">REJECTED / QUARANTINED:</strong> Structurally corrupt, out-of-range, or hostile payloads blocked from all engines. Sets target room to UNRELIABLE.
          </div>
        </div>
      </div>
    </div>
  );
};
