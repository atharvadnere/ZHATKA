import React, { useState, useEffect } from 'react';
import { Search, X, DoorOpen, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAppState } from '../../store/AppStateContext.tsx';
import { StatusBadge } from './StatusBadge.tsx';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { rooms, loads, recommendations, setSelectedRoomId, setActivePage } = useAppState();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedRooms = q
    ? rooms.filter(
        (r) =>
          r.roomId.toLowerCase().includes(q) ||
          r.roomName.toLowerCase().includes(q) ||
          r.buildingId.toLowerCase().includes(q)
      )
    : rooms.slice(0, 4);

  const matchedLoads = q
    ? loads.filter(
        (l) =>
          l.loadId.toLowerCase().includes(q) ||
          l.loadName.toLowerCase().includes(q) ||
          l.priority.toLowerCase().includes(q)
      )
    : [];

  const matchedRecs = q
    ? recommendations.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.roomId && r.roomId.toLowerCase().includes(q))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#202124]/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-[560px] bg-white rounded-[12px] border border-[#E8E8E6] shadow-[0_8px_32px_rgba(32,33,36,0.16)] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#E8E8E6] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#737373] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campus rooms, loads, recommendations..."
            className="w-full text-[14px] text-[#202124] placeholder-[#737373] focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#737373] hover:text-[#202124]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 divide-y divide-[#F1F1EF]">
          {/* Rooms */}
          {matchedRooms.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                Rooms & Facilities
              </div>
              <div className="space-y-0.5 mt-1">
                {matchedRooms.map((r) => (
                  <button
                    key={r.roomId}
                    onClick={() => {
                      setSelectedRoomId(r.roomId);
                      setActivePage('rooms');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-[8px] hover:bg-[#F7F7F5] flex items-center justify-between text-[13px] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <DoorOpen className="w-4 h-4 text-[#3478D4]" />
                      <div>
                        <div className="font-medium text-[#202124]">
                          <span className="font-mono text-[#3478D4] mr-1.5">{r.roomId}</span>
                          {r.roomName}
                        </div>
                        <div className="text-[11px] text-[#737373]">
                          {r.powerKw} kW · {r.occupancy === 'UNKNOWN' ? 'Unknown Occ' : `${r.occupancy} people`}
                        </div>
                      </div>
                    </div>
                    <StatusBadge state={r.occupancyState} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loads */}
          {matchedLoads.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                Emergency Loads (Planner)
              </div>
              <div className="space-y-0.5 mt-1">
                {matchedLoads.map((l) => (
                  <button
                    key={l.loadId}
                    onClick={() => {
                      setActivePage('planner');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-[8px] hover:bg-[#F7F7F5] flex items-center justify-between text-[13px] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-[#E0A03A]" />
                      <div>
                        <div className="font-medium text-[#202124]">
                          <span className="font-mono mr-1.5">{l.loadId}</span>
                          {l.loadName}
                        </div>
                        <div className="text-[11px] text-[#737373]">
                          Priority {l.priority} · {l.requestedKw} kW
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A3A3A0]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {matchedRecs.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                Intelligence Recommendations
              </div>
              <div className="space-y-0.5 mt-1">
                {matchedRecs.map((rec) => (
                  <button
                    key={rec.recommendationId}
                    onClick={() => {
                      setActivePage('intelligence');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-[8px] hover:bg-[#F7F7F5] flex items-center justify-between text-[13px] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-[#D92D20]" />
                      <div className="truncate">
                        <div className="font-medium text-[#202124] truncate">{rec.title}</div>
                        <div className="text-[11px] text-[#737373] truncate">{rec.suggestedAction}</div>
                      </div>
                    </div>
                    <StatusBadge state={rec.safetyStatus.decision} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && matchedRooms.length === 0 && matchedLoads.length === 0 && matchedRecs.length === 0 && (
            <div className="p-8 text-center text-[#737373] text-[13px]">
              No matches found for &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-[#FAFAF9] border-t border-[#E8E8E6] flex items-center justify-between text-[11px] text-[#737373]">
          <span>Tip: Type room code like &quot;A-102&quot; or &quot;P0&quot;</span>
          <span className="font-mono">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
