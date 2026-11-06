import React, { useState } from 'react';
import {
  Lightbulb,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Plus,
  Lock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';
import { SafetyChecklist } from '../components/common/SafetyChecklist.tsx';
import { EvidencePanel } from '../components/common/EvidencePanel.tsx';
import { EquipmentCategory, EquipmentRecord, RecommendationRecord } from '../types/index.ts';

export const ZhatkaIntelligence: React.FC = () => {
  const {
    recommendations,
    equipment,
    rooms,
    approveRecommendation,
    rejectRecommendation,
    markFalseAlarm,
    applyRecommendation,
    verifySavings,
    toggleEquipmentProtection,
    addEquipment,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'recommendations' | 'safety' | 'projections'>('recommendations');
  const [recSubTab, setRecSubTab] = useState<'actionable' | 'held' | 'history'>('actionable');
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isAddEquipOpen, setIsAddEquipOpen] = useState(false);

  // New Equipment Form State
  const [newEquipName, setNewEquipName] = useState('');
  const [newEquipRoom, setNewEquipRoom] = useState('A-101');
  const [newEquipCategory, setNewEquipCategory] = useState<EquipmentCategory>('LAB_ESSENTIAL');
  const [newEquipKw, setNewEquipKw] = useState(2.0);
  const [newEquipReason, setNewEquipReason] = useState('');

  // Filter recommendations
  const actionableRecs = recommendations.filter(
    (r) => r.approvalStatus === 'PENDING REVIEW' && r.safetyStatus.eligible
  );

  const heldRecs = recommendations.filter(
    (r) => r.approvalStatus === 'PENDING REVIEW' && !r.safetyStatus.eligible
  );

  const historyRecs = recommendations.filter(
    (r) =>
      r.approvalStatus === 'APPROVED' ||
      r.approvalStatus === 'COMPLETED' ||
      r.approvalStatus === 'VERIFIED' ||
      r.approvalStatus === 'REJECTED' ||
      r.approvalStatus === 'FALSE_ALARM'
  );

  const currentRecList =
    recSubTab === 'actionable' ? actionableRecs : recSubTab === 'held' ? heldRecs : historyRecs;

  const activeRec =
    recommendations.find((r) => r.recommendationId === selectedRecId) ||
    currentRecList[0] ||
    recommendations[0];

  const handleAddEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipName.trim() || !newEquipReason.trim()) return;

    const targetRoom = rooms.find((r) => r.roomId === newEquipRoom);
    addEquipment({
      name: newEquipName.trim(),
      buildingId: targetRoom?.buildingId || 'A',
      roomId: newEquipRoom,
      category: newEquipCategory,
      protected: true,
      active: true,
      minimumOperatingKw: Number(newEquipKw) || 1.0,
      reasonForProtection: newEquipReason.trim(),
    });

    setIsAddEquipOpen(false);
    setNewEquipName('');
    setNewEquipReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={Lightbulb}
        title="ZHATKA Intelligence & Safety Centre"
        tag="SIMULATED"
        description="Unified recommendation queue, Critical Equipment Shield registry, and transparent rule-based load projections (MASTER §10)."
        tabs={[
          { id: 'recommendations', label: 'Recommendations Queue', count: actionableRecs.length },
          { id: 'safety', label: 'Critical Equipment Shield', count: equipment.length },
          { id: 'projections', label: 'Demand Projections' },
        ]}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as any)}
      />

      {/* TAB 1: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {/* Sub-tabs: Actionable · Held and protected · History per DESIGN.md §6.10 */}
          <div className="flex items-center gap-2 p-1 bg-[#F1F1EF] rounded-[8px] w-fit text-[12px] font-medium">
            <button
              onClick={() => setRecSubTab('actionable')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
                recSubTab === 'actionable'
                  ? 'bg-white text-[#202124] shadow-xs font-semibold'
                  : 'text-[#737373] hover:text-[#202124]'
              }`}
            >
              <span>Actionable</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#EAF2FC] text-[#1F5FB0] rounded-full">
                {actionableRecs.length}
              </span>
            </button>

            <button
              onClick={() => setRecSubTab('held')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
                recSubTab === 'held'
                  ? 'bg-white text-[#202124] shadow-xs font-semibold'
                  : 'text-[#737373] hover:text-[#202124]'
              }`}
            >
              <span>Held & Protected</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#FFF1D6] text-[#8A5A00] rounded-full">
                {heldRecs.length}
              </span>
            </button>

            <button
              onClick={() => setRecSubTab('history')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
                recSubTab === 'history'
                  ? 'bg-white text-[#202124] shadow-xs font-semibold'
                  : 'text-[#737373] hover:text-[#202124]'
              }`}
            >
              <span>Audit History</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#E8E8E6] text-[#737373] rounded-full">
                {historyRecs.length}
              </span>
            </button>
          </div>

          {/* List-Detail Layout per DESIGN.md §6.10 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Recommendations Queue */}
            <div className="lg:col-span-5 space-y-2.5">
              {currentRecList.length > 0 ? (
                currentRecList.map((rec) => {
                  const isSelected = activeRec?.recommendationId === rec.recommendationId;
                  return (
                    <div
                      key={rec.recommendationId}
                      onClick={() => setSelectedRecId(rec.recommendationId)}
                      className={`p-3.5 rounded-[10px] border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#3478D4] bg-[#EAF2FC]/30 shadow-xs ring-1 ring-[#3478D4]'
                          : 'border-[#E8E8E6] bg-white hover:bg-[#F7F7F5]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold text-[#3478D4]">
                          {rec.recommendationId}
                        </span>
                        <StatusBadge state={rec.safetyStatus.decision} size="sm" />
                      </div>

                      <h4 className="text-[13px] font-semibold text-[#202124] leading-[18px]">
                        {rec.title}
                      </h4>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-[#737373]">
                        <span>Target: {rec.roomId || rec.affectedLoadId}</span>
                        {rec.estimatedSaving && (
                          <span className="font-mono font-semibold text-[#1F5FB0]">
                            {rec.estimatedSaving.kwh} kWh
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-[13px] text-[#737373] bg-white border border-[#E8E8E6] rounded-[10px]">
                  No recommendations in this queue.
                </div>
              )}
            </div>

            {/* Right Column: Detailed Pane */}
            {activeRec ? (
              <div className="lg:col-span-7 bg-white border border-[#E8E8E6] rounded-[10px] p-5 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-[#E8E8E6] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[12px] font-bold text-[#3478D4] px-1.5 py-0.5 bg-[#EAF2FC] rounded">
                        {activeRec.recommendationId}
                      </span>
                      <StatusBadge state={activeRec.safetyStatus.decision} />
                      <span className="font-mono text-[11px] uppercase px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#737373]">
                        {activeRec.priority}
                      </span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#202124]">
                      {activeRec.title}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-[#737373]">
                      Status: {activeRec.approvalStatus}
                    </span>
                  </div>
                </div>

                {/* 3 Separate Savings Cells per MASTER §11.2 & DESIGN §6.10 */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAFAF9] border border-[#E8E8E6] rounded-[8px]">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-[#737373]">Potential</span>
                      <DataNatureTag nature="POTENTIAL" />
                    </div>
                    <div className="font-mono text-[18px] font-bold text-[#8A5A00] tabular-nums">
                      {Math.max(0, activeRec.currentPowerKw - activeRec.baselinePowerKw).toFixed(1)} kW
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-[#737373]">Estimated</span>
                      <DataNatureTag nature="ESTIMATED" />
                    </div>
                    <div className="font-mono text-[18px] font-bold text-[#1F5FB0] tabular-nums">
                      {activeRec.estimatedSaving ? `${activeRec.estimatedSaving.kwh} kWh` : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-[#737373]">Measured</span>
                      <DataNatureTag nature="MEASURED (SIMULATED)" />
                    </div>
                    <div className="font-mono text-[18px] font-bold text-[#1E6B3A] tabular-nums">
                      {activeRec.approvalStatus === 'VERIFIED' ? '8.8 kWh' : 'Pending'}
                    </div>
                  </div>
                </div>

                {/* Issue Detected & Suggested Action */}
                <div className="space-y-3 text-[13px]">
                  <div>
                    <div className="font-semibold text-[#202124] mb-1">Issue Detected</div>
                    <p className="text-[#737373] leading-[18px]">{activeRec.reason}</p>
                  </div>

                  <div>
                    <div className="font-semibold text-[#202124] mb-1">Suggested Control Action</div>
                    <p className="text-[#202124] leading-[18px] p-2.5 bg-[#F7F7F5] rounded-[6px] border border-[#E8E8E6]">
                      {activeRec.suggestedAction}
                    </p>
                  </div>
                </div>

                {/* Safety Checklist */}
                <div>
                  <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#737373] mb-2">
                    Safety Evaluation Checklist ({activeRec.safetyStatus.reasonCode})
                  </h4>
                  <SafetyChecklist checks={activeRec.safetyStatus.checks} />
                </div>

                {/* Evidence Panel */}
                <EvidencePanel evidence={activeRec.evidence} defaultExpanded={false} />

                {/* Action Controls & Comment Box */}
                <div className="pt-4 border-t border-[#E8E8E6] space-y-3">
                  <input
                    type="text"
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Administrator justification comment (required on reject)..."
                    className="w-full h-[36px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
                  />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-[12px] text-[#737373]">
                      {!activeRec.safetyStatus.eligible ? (
                        <span className="text-[#B42318] font-medium">
                          Approval disabled: {activeRec.safetyStatus.explanation}
                        </span>
                      ) : (
                        <span>Safety gate cleared. Administrator approval authorized.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {activeRec.approvalStatus === 'PENDING REVIEW' && (
                        <>
                          <button
                            onClick={() =>
                              markFalseAlarm(
                                activeRec.recommendationId,
                                adminComment || 'Dismissed as benign sensor reading / false alarm by administrator'
                              )
                            }
                            className="h-[32px] px-3 text-[13px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 rounded-[8px] hover:bg-amber-100 dark:hover:bg-amber-900/60 flex items-center gap-1.5 transition-colors"
                            title="Mark as benign or false positive"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>False Alarm</span>
                          </button>
                          <button
                            onClick={() => rejectRecommendation(activeRec.recommendationId, adminComment || 'Rejected by administrator')}
                            className="h-[32px] px-3 text-[13px] font-medium text-[#B42318] bg-white border border-[#D92D20]/40 dark:bg-[#18181B] dark:text-red-400 dark:border-red-900/60 rounded-[8px] hover:bg-[#FCE4E4]/40 dark:hover:bg-red-950/30"
                          >
                            Reject
                          </button>
                          <button
                            disabled={!activeRec.safetyStatus.eligible}
                            onClick={() => approveRecommendation(activeRec.recommendationId, adminComment)}
                            className="h-[32px] px-4 text-[13px] font-medium text-white bg-[#3478D4] hover:bg-[#2A67BC] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                          >
                            Approve
                          </button>
                        </>
                      )}

                      {activeRec.approvalStatus === 'FALSE_ALARM' && (
                        <span className="text-[13px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Dismissed as False Alarm
                        </span>
                      )}

                      {activeRec.approvalStatus === 'APPROVED' && (
                        <button
                          onClick={() => applyRecommendation(activeRec.recommendationId)}
                          className="h-[32px] px-4 text-[13px] font-medium text-white bg-[#1E6B3A] hover:bg-[#16542d] rounded-[8px] shadow-xs flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Apply (Simulated)</span>
                        </button>
                      )}

                      {activeRec.approvalStatus === 'COMPLETED' && (
                        <button
                          onClick={() => verifySavings(activeRec.recommendationId)}
                          className="h-[32px] px-4 text-[13px] font-medium text-white bg-[#3478D4] hover:bg-[#2A67BC] rounded-[8px] shadow-xs"
                        >
                          Verify Measured Savings
                        </button>
                      )}

                      {activeRec.approvalStatus === 'VERIFIED' && (
                        <span className="text-[13px] font-medium text-[#1E6B3A] flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          Verified in Activity Logs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: CRITICAL EQUIPMENT SHIELD (MASTER §10.1) */}
      {activeTab === 'safety' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-[15px] font-semibold text-[#202124]">
                Critical Equipment Shield Registry
              </h3>
              <p className="text-[12px] text-[#737373]">
                Institution-designated essential loads. Equipment registered here unconditionally blocks shutdown recommendations.
              </p>
            </div>
            <button
              onClick={() => setIsAddEquipOpen(true)}
              className="h-[32px] px-3.5 rounded-[8px] bg-[#3478D4] text-white hover:bg-[#2A67BC] text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Equipment</span>
            </button>
          </div>

          <div className="bg-white border border-[#E8E8E6] rounded-[10px] overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F7F7F5] border-b border-[#E8E8E6] text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Equipment Name</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Min Floor</th>
                  <th className="p-3">Protection Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {equipment.map((eq) => (
                  <tr key={eq.equipmentId} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#3478D4]">{eq.equipmentId}</td>
                    <td className="p-3 font-medium text-[#202124]">{eq.name}</td>
                    <td className="p-3 text-[#737373]">Block {eq.buildingId} / {eq.roomId}</td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#737373]">
                        {eq.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold tabular-nums">
                      {eq.minimumOperatingKw} kW
                    </td>
                    <td className="p-3 text-[#737373] text-[12px] max-w-xs">{eq.reasonForProtection}</td>
                    <td className="p-3">
                      <StatusBadge state={eq.protected ? 'PROTECTED' : 'EMPTY'} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleEquipmentProtection(eq.equipmentId)}
                        className="text-[12px] font-medium text-[#3478D4] hover:underline"
                      >
                        {eq.protected ? 'Deactivate Shield' : 'Activate Shield'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Equipment Modal */}
          {isAddEquipOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-xs">
              <div className="bg-white rounded-[12px] border border-[#E8E8E6] max-w-[480px] w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
                  <h3 className="text-[16px] font-semibold text-[#202124]">
                    Register Protected Essential Equipment
                  </h3>
                  <button onClick={() => setIsAddEquipOpen(false)} className="text-[#737373] hover:text-[#202124]">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddEquipmentSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-medium text-[#202124] mb-1">
                      Equipment Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newEquipName}
                      onChange={(e) => setNewEquipName(e.target.value)}
                      placeholder="e.g. Server rack R2, Research Cryo Freezer"
                      className="w-full h-[34px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-[#202124] mb-1">
                        Room Location
                      </label>
                      <select
                        value={newEquipRoom}
                        onChange={(e) => setNewEquipRoom(e.target.value)}
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
                        Category
                      </label>
                      <select
                        value={newEquipCategory}
                        onChange={(e) => setNewEquipCategory(e.target.value as any)}
                        className="w-full h-[34px] px-3 text-[13px] border border-[#D4D4D1] rounded-[8px] bg-white"
                      >
                        <option value="SERVER">Server</option>
                        <option value="NETWORK">Network Infrastructure</option>
                        <option value="LAB_ESSENTIAL">Lab Essential</option>
                        <option value="SAFETY_SYSTEM">Safety System</option>
                        <option value="SECURITY">Security</option>
                        <option value="OTHER">Other Essential</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#202124] mb-1">
                      Minimum Safe Operating Power Floor (kW)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      required
                      value={newEquipKw}
                      onChange={(e) => setNewEquipKw(Number(e.target.value))}
                      className="w-full h-[34px] px-3 font-mono text-[13px] border border-[#D4D4D1] rounded-[8px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#202124] mb-1">
                      Reason for Protection
                    </label>
                    <textarea
                      required
                      value={newEquipReason}
                      onChange={(e) => setNewEquipReason(e.target.value)}
                      rows={2}
                      placeholder="e.g. Critical sample preservation requires continuous uninterrupted power."
                      className="w-full p-2.5 text-[13px] border border-[#D4D4D1] rounded-[8px]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E8E6]">
                    <button
                      type="button"
                      onClick={() => setIsAddEquipOpen(false)}
                      className="h-[32px] px-3 text-[13px] font-medium text-[#737373] hover:text-[#202124]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-[32px] px-4 text-[13px] font-medium bg-[#3478D4] text-white rounded-[8px] hover:bg-[#2A67BC]"
                    >
                      Save to Shield Registry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROJECTIONS (DESIGN.md §6.10: Dashed PROJECTED tag + Rule note) */}
      {activeTab === 'projections' && (
        <div className="bg-white border border-[#E8E8E6] rounded-[10px] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-semibold text-[#202124]">
                  Rule-Based Projected Demand & Occupancy Curve
                </h3>
                <DataNatureTag nature="PROJECTED" />
              </div>
              <p className="text-[12px] text-[#737373] mt-1">
                Rule-based projection from timetable schedules and recent simulated readings. Never claims trained AI models or machine learning.
              </p>
            </div>
          </div>

          {/* Simple projected hourly schedule comparison */}
          <div className="space-y-3">
            {[
              { hour: '08:00 - 10:00', projectedKw: 35.0, measuredKw: 31.3, state: 'Morning Ramp' },
              { hour: '10:00 - 12:00', projectedKw: 42.5, measuredKw: 31.3, state: 'Peak Lecture Hours' },
              { hour: '12:00 - 14:00', projectedKw: 28.0, measuredKw: 25.0, state: 'Lunch Recess' },
              { hour: '14:00 - 16:00', projectedKw: 38.0, measuredKw: 31.3, state: 'Afternoon Labs' },
              { hour: '16:00 - 18:00', projectedKw: 22.0, measuredKw: 20.0, state: 'Study Hall Sessions' },
              { hour: '18:00 - 22:00', projectedKw: 15.0, measuredKw: 14.5, state: 'Evening Curfew' },
            ].map((slot, idx) => (
              <div key={idx} className="p-3 bg-[#FAFAF9] border border-[#E8E8E6] rounded-[8px] flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#737373] font-semibold">{slot.hour}</span>
                  <span className="font-medium text-[#202124]">{slot.state}</span>
                </div>
                <div className="flex items-center gap-6 font-mono tabular-nums">
                  <span className="text-[#3478D4]">
                    Measured: {slot.measuredKw} kW
                  </span>
                  <span className="text-[#5B3FA8] border-b border-dashed border-[#8B6FD0]">
                    Projected: {slot.projectedKw} kW
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
