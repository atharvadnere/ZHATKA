import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { StatStrip } from '../components/common/StatStrip.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';

export const MaintenancePage: React.FC = () => {
  const {
    maintenanceItems,
    addMaintenanceItem,
    updateMaintenanceStatus,
    rooms,
    toggleRoomMaintenance,
  } = useAppState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomId, setRoomId] = useState('B-203');
  const [equipmentName, setEquipmentName] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('Campus Electrical Team');

  const openCount = maintenanceItems.filter((m) => m.status === 'REPORTED' || m.status === 'ASSIGNED').length;
  const inProgressCount = maintenanceItems.filter((m) => m.status === 'IN_PROGRESS').length;
  const completedCount = maintenanceItems.filter((m) => m.status === 'COMPLETED').length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName.trim() || !issue.trim()) return;

    addMaintenanceItem({
      roomId,
      equipment: equipmentName.trim(),
      issue: issue.trim(),
      priority,
      assignedTo,
      status: 'ASSIGNED',
    });

    // Automatically toggle maintenance lockout on the room per MASTER INV-5
    toggleRoomMaintenance(roomId, true);

    setIsModalOpen(false);
    setEquipmentName('');
    setIssue('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wrench}
        title="Maintenance & Facilities Lockout"
        tag="SIMULATED"
        description="Preventive hardware tickets and circuit maintenance lockouts. Active maintenance suppresses conflicting shutdown recommendations (MASTER INV-5)."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-[32px] px-3.5 rounded-[8px] bg-[#3478D4] text-white hover:bg-[#2A67BC] text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Maintenance Ticket</span>
          </button>
        }
      />

      {/* Stat Strip per DESIGN.md §6.12 */}
      <StatStrip
        cells={[
          { label: 'Open Tickets', value: openCount, caption: 'Awaiting technician review' },
          { label: 'In Progress', value: inProgressCount, captionColor: 'text-[#E0A03A]', caption: 'Active field investigation' },
          { label: 'Resolved This Month', value: completedCount, captionColor: 'text-[#1E6B3A]', caption: 'Post-repair certified' },
          { label: 'Recurring Rooms', value: 2, caption: 'B-203 & L-301 highest repeats' },
        ]}
      />

      {/* Main Request Table */}
      <div className="bg-white border border-[#E8E8E6] rounded-[10px] overflow-hidden">
        <div className="p-4 border-b border-[#E8E8E6] flex items-center justify-between bg-[#FAFAF9]">
          <h3 className="text-[14px] font-semibold text-[#202124]">
            Facilities Maintenance Work Orders
          </h3>
          <span className="text-[12px] text-[#737373]">
            Active maintenance sets room status to MAINTENANCE and halts automated shutdowns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F7F7F5] border-b border-[#E8E8E6] text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
              <tr>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Target Room</th>
                <th className="p-3">Reported Issue & Equipment</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {maintenanceItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F7F5] transition-colors">
                  <td className="p-3 font-mono font-bold text-[#3478D4]">{item.id}</td>
                  <td className="p-3">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        item.priority === 'CRITICAL'
                          ? 'bg-[#FCE4E4] text-[#B42318]'
                          : item.priority === 'HIGH'
                          ? 'bg-[#FFF1D6] text-[#8A5A00]'
                          : 'bg-[#F1F1EF] text-[#737373]'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-[#202124]">{item.roomId}</td>
                  <td className="p-3">
                    <div className="font-semibold text-[#202124]">{item.equipment}</div>
                    <div className="text-[11px] text-[#737373] mt-0.5">{item.issue}</div>
                  </td>
                  <td className="p-3 text-[#737373] text-[12px]">{item.assignedTo}</td>
                  <td className="p-3">
                    <span
                      className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.status === 'COMPLETED'
                          ? 'bg-[#DDF3E4] text-[#1E6B3A]'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-[#FFF1D6] text-[#8A5A00]'
                          : 'bg-[#F1F1EF] text-[#737373]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {item.status !== 'COMPLETED' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateMaintenanceStatus(item.id, 'IN_PROGRESS')}
                          className="h-[28px] px-2 text-[11px] font-medium bg-[#F1F1EF] hover:bg-[#E8E8E6] rounded"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => {
                            updateMaintenanceStatus(item.id, 'COMPLETED');
                            toggleRoomMaintenance(item.roomId, false);
                          }}
                          className="h-[28px] px-2.5 text-[11px] font-medium bg-[#3478D4] text-white hover:bg-[#2A67BC] rounded"
                        >
                          Resolve & Clear Lockout
                        </button>
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#1E6B3A] font-medium flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] border border-[#E8E8E6] max-w-[480px] w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
              <h3 className="text-[16px] font-semibold text-[#202124]">
                Create Facilities Maintenance Ticket
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#737373] hover:text-[#202124]">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#202124] mb-1">
                    Target Room
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full h-[34px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px] bg-white"
                  >
                    {rooms.map((r) => (
                      <option key={r.roomId} value={r.roomId}>
                        {r.roomId} ({r.roomName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#202124] mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-[34px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px] bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#202124] mb-1">
                  Equipment Tag / Description
                </label>
                <input
                  type="text"
                  required
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="e.g. Occupancy PIR Sensor #02, AC Compressor Unit"
                  className="w-full h-[34px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#202124] mb-1">
                  Defect Description & Safety Hazard
                </label>
                <textarea
                  required
                  rows={3}
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Describe observed sensor dropout or electrical irregularity..."
                  className="w-full p-2.5 text-[13px] border border-[#D4D4D1] rounded-[8px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#202124] mb-1">
                  Assigned Team / Technician
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full h-[34px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E8E6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[32px] px-3 text-[13px] text-[#737373]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[32px] px-4 text-[13px] font-medium bg-[#3478D4] text-white rounded-[8px] hover:bg-[#2A67BC]"
                >
                  Dispatch Ticket & Set Lockout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
