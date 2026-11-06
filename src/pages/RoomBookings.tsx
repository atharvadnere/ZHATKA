import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';

export const RoomBookings: React.FC = () => {
  const { bookingRequests, updateBookingStatus, rooms } = useAppState();

  const [activeTab, setActiveTab] = useState<'requests' | 'schedule' | 'history'>('requests');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [reallocateId, setReallocateId] = useState<string | null>(null);
  const [newRoomSelected, setNewRoomSelected] = useState('A-101');

  const pendingRequests = bookingRequests.filter((b) => b.status === 'PENDING');
  const historyBookings = bookingRequests.filter((b) => b.status !== 'PENDING');

  const handleConfirmReject = () => {
    if (rejectId) {
      updateBookingStatus(rejectId, 'REJECTED', rejectComment || 'Booking rejected by energy administrator.');
      setRejectId(null);
      setRejectComment('');
    }
  };

  const handleConfirmReallocate = () => {
    if (reallocateId) {
      updateBookingStatus(reallocateId, 'REALLOCATED', `Reallocated to room ${newRoomSelected} for load optimization.`);
      setReallocateId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarCheck}
        title="Room Bookings & Timetable Alignment"
        tag="SIMULATED"
        description="Demo reservation management aligning classroom bookings with HVAC schedules to eliminate empty-room conditioning (DESIGN §6.5)."
        tabs={[
          { id: 'requests', label: 'Reservation Requests', count: pendingRequests.length },
          { id: 'schedule', label: 'Weekly Schedule Grid' },
          { id: 'history', label: 'Booking History', count: historyBookings.length },
        ]}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as any)}
      />

      {/* TAB 1: REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-[#E8E8E6] rounded-[10px] overflow-hidden">
          <div className="p-4 border-b border-[#E8E8E6] flex items-center justify-between bg-[#FAFAF9]">
            <h3 className="text-[14px] font-semibold text-[#202124]">
              Pending Approval Requests
            </h3>
            <span className="text-[12px] text-[#737373]">
              Every booking decision updates the Activity Log
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F7F7F5] border-b border-[#E8E8E6] text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Requester & Event Purpose</th>
                  <th className="p-3">Target Room</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3 text-right">Attendees</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {pendingRequests.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#3478D4]">{b.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-[#202124]">{b.purpose}</div>
                      <div className="text-[11px] text-[#737373] mt-0.5">{b.requester}</div>
                    </td>
                    <td className="p-3 font-mono font-medium text-[#202124]">{b.roomId}</td>
                    <td className="p-3 text-[#737373] font-mono text-[12px]">
                      {b.date} · {b.startTime} - {b.endTime}
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums">{b.attendees}</td>
                    <td className="p-3">
                      <StatusBadge state={b.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateBookingStatus(b.id, 'APPROVED')}
                          className="h-[28px] px-2.5 rounded-[6px] bg-[#3478D4] text-white hover:bg-[#2A67BC] text-[12px] font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setReallocateId(b.id)}
                          className="h-[28px] px-2.5 rounded-[6px] bg-white border border-[#D4D4D1] hover:bg-[#F1F1EF] text-[#202124] text-[12px] font-medium"
                        >
                          Reallocate
                        </button>
                        <button
                          onClick={() => setRejectId(b.id)}
                          className="h-[28px] px-2.5 rounded-[6px] bg-white border border-[#D92D20]/40 hover:bg-[#FCE4E4]/40 text-[#B42318] text-[12px] font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULE GRID */}
      {activeTab === 'schedule' && (
        <div className="bg-white border border-[#E8E8E6] rounded-[10px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#202124]">
              Weekly Academic Schedule
            </h3>
            <span className="text-[12px] text-[#737373]">
              Highlighted: booked = reserved tone · occupied = blue tint · conflict = warning stripe
            </span>
          </div>

          <div className="space-y-3">
            {rooms.map((room) => (
              <div key={room.roomId} className="p-3 bg-[#FAFAF9] border border-[#E8E8E6] rounded-[8px] flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#3478D4]">{room.roomId}</span>
                  <span className="font-medium text-[#202124]">{room.roomName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] text-[#737373]">
                    Schedule Status: <strong className="text-[#202124]">{room.scheduledStatus}</strong>
                  </span>
                  <StatusBadge state={room.occupancyState} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-[#E8E8E6] rounded-[10px] overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F7F7F5] border-b border-[#E8E8E6] text-[11px] font-semibold text-[#737373] uppercase">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Requester</th>
                <th className="p-3">Room</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {historyBookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#F7F7F5]">
                  <td className="p-3 font-mono font-bold text-[#3478D4]">{b.id}</td>
                  <td className="p-3 font-medium">{b.requester}</td>
                  <td className="p-3 font-mono">{b.roomId}</td>
                  <td className="p-3 text-[#737373] font-mono text-[12px]">{b.date}</td>
                  <td className="p-3"><StatusBadge state={b.status} size="sm" /></td>
                  <td className="p-3 text-[#737373] text-[12px]">{b.adminNotes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Dialog */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] border border-[#E8E8E6] max-w-[420px] w-full p-5 space-y-4">
            <h3 className="text-[16px] font-semibold text-[#202124]">Reject Booking Request</h3>
            <p className="text-[13px] text-[#737373]">A comment is required when rejecting a reservation:</p>
            <textarea
              required
              rows={3}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="e.g. Room exceeds thermal allowance during scheduled maintenance window."
              className="w-full p-2.5 text-[13px] border border-[#D4D4D1] rounded-[8px]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectId(null)} className="h-[32px] px-3 text-[13px] text-[#737373]">
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="h-[32px] px-4 text-[13px] font-medium bg-[#B42318] text-white rounded-[8px]"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reallocate Dialog */}
      {reallocateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] border border-[#E8E8E6] max-w-[420px] w-full p-5 space-y-4">
            <h3 className="text-[16px] font-semibold text-[#202124]">Reallocate to Energy-Optimized Room</h3>
            <p className="text-[13px] text-[#737373]">Suggest alternate room with adequate capacity:</p>
            <select
              value={newRoomSelected}
              onChange={(e) => setNewRoomSelected(e.target.value)}
              className="w-full h-[36px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px] bg-white"
            >
              {rooms.map((r) => (
                <option key={r.roomId} value={r.roomId}>
                  {r.roomId} ({r.roomName} - {r.roomCapacity} cap)
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setReallocateId(null)} className="h-[32px] px-3 text-[13px] text-[#737373]">
                Cancel
              </button>
              <button
                onClick={handleConfirmReallocate}
                className="h-[32px] px-4 text-[13px] font-medium bg-[#3478D4] text-white rounded-[8px]"
              >
                Confirm Reallocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
