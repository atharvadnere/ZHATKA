import React, { useState } from 'react';
import { Building2, Layers, AlertTriangle, Users, Zap, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';
import { derivePrimaryStateForRoom } from '../logic/monitor/derivePrimaryState.ts';

export const BuildingsPage: React.FC = () => {
  const { rooms, equipment, setSelectedRoomId } = useAppState();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('A');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  // Group rooms by building
  const buildingGroups = ['A', 'B', 'C', 'D', 'L'];

  const buildingSummaries = buildingGroups.map((bId) => {
    const bRooms = rooms.filter((r) => r.buildingId === bId);
    const powerKw = bRooms.reduce((sum, r) => sum + r.powerKw, 0);
    const baselineKw = bRooms.reduce((sum, r) => sum + r.baselinePowerKw, 0);
    const hasAlert = bRooms.some(
      (r) => r.usageFlag !== 'NORMAL' || r.scheduleConflict !== 'NONE' || r.dataQuality === 'UNRELIABLE'
    );
    return {
      buildingId: bId,
      name: `Academic Block ${bId}`,
      roomCount: bRooms.length,
      powerKw: Math.round(powerKw * 10) / 10,
      baselineKw: Math.round(baselineKw * 10) / 10,
      hasAlert,
      rooms: bRooms,
    };
  });

  const activeBuilding = buildingSummaries.find((b) => b.buildingId === selectedBuildingId) || buildingSummaries[0];

  // Filter rooms for floor (extract floor from room ID: e.g. A-101 -> Floor 1, B-203 -> Floor 2, D-002 -> Ground Floor 0)
  const currentFloorRooms = activeBuilding.rooms.filter((r) => {
    const parts = r.roomId.split('-');
    if (parts.length > 1) {
      const num = parseInt(parts[1], 10);
      const floor = Math.floor(num / 100);
      return floor === selectedFloor || (selectedFloor === 0 && num < 100);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building2}
        title="Buildings & Floor Management"
        tag="SIMULATED"
        description="Master-detail campus infrastructure monitor. Inspect circuit loads and occupancy state room-by-room across building levels."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 280px Building List per DESIGN.md §6.3 */}
        <div className="lg:col-span-4 bg-white border border-[#E8E8E6] rounded-[10px] p-3 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#737373] border-b border-[#E8E8E6] mb-1">
            Campus Buildings
          </div>

          {buildingSummaries.map((b) => {
            const isSelected = b.buildingId === selectedBuildingId;
            return (
              <button
                key={b.buildingId}
                onClick={() => {
                  setSelectedBuildingId(b.buildingId);
                  setSelectedFloor(1);
                }}
                className={`w-full text-left p-3 rounded-[8px] transition-colors flex items-center justify-between border ${
                  isSelected
                    ? 'border-[#3478D4] bg-[#EAF2FC] text-[#1F5FB0]'
                    : 'border-transparent hover:bg-[#F7F7F5] text-[#202124]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13px]">{b.name}</span>
                    {b.hasAlert && (
                      <span className="w-2 h-2 rounded-full bg-[#D92D20]" title="Active alerts in building" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#737373] mt-0.5">
                    {b.roomCount} monitored rooms · Base: {b.baselineKw} kW
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[14px] font-bold tabular-nums">
                    {b.powerKw} kW
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Building Details & Floor Grid */}
        <div className="lg:col-span-8 space-y-4">
          {/* Building Header Strip */}
          <div className="p-4 bg-white border border-[#E8E8E6] rounded-[10px] flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[14px] text-[#3478D4] px-2 py-0.5 bg-[#EAF2FC] rounded">
                  Block {activeBuilding.buildingId}
                </span>
                <h2 className="text-[16px] font-semibold text-[#202124]">
                  {activeBuilding.name}
                </h2>
              </div>
              <div className="text-[12px] text-[#737373] mt-1">
                Monitored demand: {activeBuilding.powerKw} kW · Baseline: {activeBuilding.baselineKw} kW
              </div>
            </div>

            {/* Floor Selector (Tabs) */}
            <div className="flex items-center gap-1 p-1 bg-[#F1F1EF] rounded-[8px] text-[12px] font-medium">
              {[0, 1, 2, 3].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-3 py-1 rounded-[6px] transition-colors ${
                    selectedFloor === fl
                      ? 'bg-white text-[#202124] shadow-xs font-semibold'
                      : 'text-[#737373] hover:text-[#202124]'
                  }`}
                >
                  {fl === 0 ? 'Ground' : `Floor ${fl}`}
                </button>
              ))}
            </div>
          </div>

          {/* Legend Row above Grid per DESIGN.md §6.3 */}
          <div className="flex items-center justify-between flex-wrap gap-3 px-1 text-[11px] text-[#737373]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#EAF2FC] border border-[#3478D4]/40" />
                Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#F1F1EF] border border-[#D4D4D1]" />
                Empty
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs state-unknown" />
                Unknown (?)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#EEE7FA] border border-[#8B6FD0]" />
                Protected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#FFF1D6] border border-[#E0A03A]" />
                High / Empty Draw
              </span>
            </div>
            <span>Click any tile to inspect room details</span>
          </div>

          {/* Floor Grid: Responsive 96×72 room tiles per DESIGN.md §6.3 */}
          <div className="p-4 bg-white border border-[#E8E8E6] rounded-[10px]">
            {currentFloorRooms.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {currentFloorRooms.map((r) => {
                  const isProt = equipment.some((e) => e.roomId === r.roomId && e.active && e.protected);
                  const pState = derivePrimaryStateForRoom(r, isProt);
                  const isHighUsage = r.usageFlag === 'HIGH_USAGE' || r.usageFlag === 'EMPTY_BUT_CONSUMING';

                  return (
                    <div
                      key={r.roomId}
                      onClick={() => setSelectedRoomId(r.roomId)}
                      className={`h-[72px] p-2.5 rounded-[8px] border cursor-pointer hover:shadow-xs transition-all flex flex-col justify-between ${
                        pState === 'UNKNOWN'
                          ? 'state-unknown'
                          : pState === 'OCCUPIED'
                          ? 'bg-[#EAF2FC] border-[#3478D4]/40 text-[#1F5FB0]'
                          : pState === 'PROTECTED'
                          ? 'bg-[#EEE7FA] border-[#8B6FD0]/40 text-[#5B3FA8]'
                          : isHighUsage
                          ? 'bg-[#FFF1D6] border-[#E0A03A] text-[#8A5A00]'
                          : 'bg-[#F7F7F5] border-[#E8E8E6] text-[#202124]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[13px] font-bold">{r.roomId}</span>
                        <span className="font-mono text-[11px] font-medium tabular-nums">
                          {r.occupancy === 'UNKNOWN' ? '?' : `${r.occupancy}p`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-semibold tabular-nums">{r.powerKw} kW</span>
                        <span className="text-[10px] uppercase font-medium">{pState}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-[13px] text-[#737373]">
                No monitored rooms registered on this floor level in Block {activeBuilding.buildingId}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
