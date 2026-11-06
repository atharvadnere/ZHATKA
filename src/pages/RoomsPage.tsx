import React, { useState } from 'react';
import { DoorOpen, Search, Filter, Shield, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';
import { derivePrimaryStateForRoom } from '../logic/monitor/derivePrimaryState.ts';

export const RoomsPage: React.FC = () => {
  const { rooms, equipment, setSelectedRoomId } = useAppState();

  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');

  const filteredRooms = rooms.filter((r) => {
    const isProt = equipment.some((e) => e.roomId === r.roomId && e.active && e.protected);
    const pState = derivePrimaryStateForRoom(r, isProt);

    if (buildingFilter !== 'ALL' && r.buildingId !== buildingFilter) return false;
    if (stateFilter !== 'ALL' && pState !== stateFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.roomId.toLowerCase().includes(q) ||
        r.roomName.toLowerCase().includes(q) ||
        r.roomType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={DoorOpen}
        title="Rooms & Facilities Directory"
        tag="SIMULATED"
        description="Comprehensive room-level telemetry table per MASTER §7.6. Filter by building block, state, and unusual consumption flags."
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E8E8E6] rounded-[10px] p-3.5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room ID, name..."
              className="w-full h-[34px] pl-9 pr-3 text-[13px] border border-[#D4D4D1] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
            />
          </div>

          {/* Building Filter */}
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="h-[34px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px] bg-white text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
          >
            <option value="ALL">All Buildings</option>
            <option value="A">Block A (Academic)</option>
            <option value="B">Block B (Computing)</option>
            <option value="C">Block C (Lecture)</option>
            <option value="D">Block D (Library)</option>
            <option value="L">Block L (Laboratories)</option>
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="h-[34px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px] bg-white text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
          >
            <option value="ALL">All States</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="VERIFIED_EMPTY">Verified Empty</option>
            <option value="UNKNOWN">Unknown (?)</option>
            <option value="PROTECTED">Protected</option>
            <option value="HIGH_USAGE">High Usage</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        <div className="text-[12px] text-[#737373]">
          Showing <span className="font-semibold text-[#202124] font-mono">{filteredRooms.length}</span> of {rooms.length} rooms
        </div>
      </div>

      {/* Main Table per MASTER.md §7.6 */}
      <div className="bg-white border border-[#E8E8E6] rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F7F7F5] border-b border-[#E8E8E6] text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
              <tr>
                <th className="p-3">Room / Facility</th>
                <th className="p-3">Building</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Occupancy</th>
                <th className="p-3 text-right">Capacity</th>
                <th className="p-3 text-right">Power</th>
                <th className="p-3 text-right">Baseline</th>
                <th className="p-3 text-center">Sensor</th>
                <th className="p-3 text-center">Meter</th>
                <th className="p-3">Primary State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {filteredRooms.map((room) => {
                const isProt = equipment.some((e) => e.roomId === room.roomId && e.active && e.protected);
                const pState = derivePrimaryStateForRoom(room, isProt);
                const isExcess = room.powerKw > room.baselinePowerKw;

                return (
                  <tr
                    key={room.roomId}
                    onClick={() => setSelectedRoomId(room.roomId)}
                    className="hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-semibold text-[#202124]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[#3478D4]">{room.roomId}</span>
                        <span className="text-[12px] font-normal text-[#737373]">({room.roomName})</span>
                      </div>
                    </td>

                    <td className="p-3 text-[#202124]">Block {room.buildingId}</td>

                    <td className="p-3 text-[#737373]">{room.roomType}</td>

                    <td className="p-3 text-right font-mono tabular-nums">
                      {room.occupancy === 'UNKNOWN' ? (
                        <span className="text-[#8A5A00] font-bold">?</span>
                      ) : (
                        <span className="font-semibold text-[#202124]">{room.occupancy}</span>
                      )}
                    </td>

                    <td className="p-3 text-right font-mono text-[#737373] tabular-nums">
                      {room.roomCapacity}
                    </td>

                    <td className={`p-3 text-right font-mono font-bold tabular-nums ${isExcess ? 'text-[#3478D4]' : 'text-[#202124]'}`}>
                      {room.powerKw} kW
                    </td>

                    <td className="p-3 text-right font-mono text-[#737373] tabular-nums">
                      {room.baselinePowerKw} kW
                    </td>

                    <td className="p-3 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${room.sensorStatus === 'HEALTHY' ? 'bg-[#2F9E5B]' : 'bg-[#D92D20]'}`} title={`Sensor: ${room.sensorStatus}`} />
                    </td>

                    <td className="p-3 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${room.meterStatus === 'HEALTHY' ? 'bg-[#2F9E5B]' : 'bg-[#D92D20]'}`} title={`Meter: ${room.meterStatus}`} />
                    </td>

                    <td className="p-3">
                      <StatusBadge state={pState} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
