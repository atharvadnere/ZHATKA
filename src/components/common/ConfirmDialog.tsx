import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requireResetKeyword?: boolean;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  requireResetKeyword = false,
  isDestructive = false,
  onConfirm,
  onClose,
}) => {
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setKeyword('');
    }
  }, [isOpen]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const canConfirm = !requireResetKeyword || keyword.trim() === 'RESET';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[480px] bg-white rounded-[12px] border border-[#E8E8E6] shadow-[0_4px_16px_rgba(32,33,36,0.12)] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {isDestructive ? (
                <div className="w-8 h-8 rounded-full bg-[#FCE4E4] text-[#B42318] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              ) : null}
              <h3 className="text-[16px] font-semibold text-[#202124]">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#737373] hover:text-[#202124] p-1 rounded-md hover:bg-[#F1F1EF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[13px] text-[#737373] mt-2 leading-[18px]">
            {description}
          </p>

          {/* Mandatory notice per DESIGN.md §5 */}
          <div className="mt-3.5 p-2.5 bg-[#F7F7F5] border border-[#E8E8E6] rounded-[8px] text-[12px] text-[#737373] flex items-center gap-2">
            <span className="font-mono text-[10px] px-1 py-0.5 bg-[#E8E8E6] text-[#202124] rounded font-semibold uppercase">
              SAFETY NOTICE
            </span>
            <span>Simulated action — no real electrical system is affected.</span>
          </div>

          {requireResetKeyword && (
            <div className="mt-4">
              <label className="block text-[12px] font-medium text-[#202124] mb-1">
                Type <span className="font-mono font-bold text-[#B42318]">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="RESET"
                className="w-full h-[36px] px-3 font-mono text-[13px] border border-[#D4D4D1] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-[#FAFAF9] border-t border-[#E8E8E6] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="h-[32px] px-3.5 text-[13px] font-medium text-[#202124] bg-white border border-[#D4D4D1] rounded-[8px] hover:bg-[#F1F1EF] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => {
              if (canConfirm) {
                onConfirm();
                onClose();
              }
            }}
            className={`h-[32px] px-4 text-[13px] font-medium rounded-[8px] transition-colors ${
              isDestructive
                ? 'bg-[#B42318] text-white hover:bg-[#911c13] disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-[#3478D4] text-white hover:bg-[#2A67BC] disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
