import React from 'react';
import {
  Zap,
  Shield,
  Siren,
  Building2,
  CalendarCheck,
  BarChart3,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  FileCheck,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';

export const PublicLanding: React.FC = () => {
  const { setActivePage, kpis } = useAppState();

  return (
    <div className="min-h-screen bg-white text-[#202124] flex flex-col">
      {/* 1. Public Nav (64px) per DESIGN.md §6.0 */}
      <header className="h-[64px] border-b border-[#E8E8E6] sticky top-0 bg-white/95 backdrop-blur-xs z-40 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#3478D4] flex items-center justify-center text-white shadow-xs">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-semibold text-[17px] tracking-[0.02em] text-[#202124]">
              ZHATKA
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#737373]">
            <a href="#problem" className="hover:text-[#202124] transition-colors">
              The Challenge
            </a>
            <a href="#how-it-works" className="hover:text-[#202124] transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-[#202124] transition-colors">
              Platform Features
            </a>
            <a href="#impact" className="hover:text-[#202124] transition-colors">
              Simulated Impact
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('login')}
            className="h-[36px] px-4 rounded-[8px] text-[13px] font-medium text-[#202124] hover:bg-[#F1F1EF] transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => setActivePage('overview')}
            className="h-[36px] px-4 rounded-[8px] text-[13px] font-medium bg-[#3478D4] text-white hover:bg-[#2A67BC] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section per DESIGN.md §6.0 */}
      <section className="py-16 lg:py-24 px-6 lg:px-12 max-w-[1280px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#F7F7F5] border border-[#E8E8E6] text-[12px] font-medium text-[#737373]">
              <span className="w-2 h-2 rounded-full bg-[#3478D4]" />
              <span>PS6 Prototype · SRMIST Energy Intelligence</span>
              <DataNatureTag nature="SIMULATED" />
            </div>

            <h1 className="text-[38px] sm:text-[44px] leading-[48px] sm:leading-[52px] font-semibold text-[#202124] tracking-tight">
              Smarter campuses. Better energy decisions.
            </h1>

            <p className="text-[17px] leading-[26px] text-[#737373]">
              An adaptive, safety-first energy response planner for university campuses. Resolves electricity deficits with deterministic load prioritisation, guards essential laboratory equipment, and validates untrusted sensor telemetry.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActivePage('overview')}
                className="h-[40px] px-5 rounded-[8px] text-[14px] font-medium bg-[#3478D4] text-white hover:bg-[#2A67BC] transition-colors shadow-xs flex items-center gap-2"
              >
                <span>Explore ZHATKA Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActivePage('login')}
                className="h-[40px] px-4 rounded-[8px] text-[14px] font-medium text-[#202124] bg-white border border-[#D4D4D1] hover:bg-[#F1F1EF] transition-colors"
              >
                Admin Login
              </button>
            </div>

            <div className="pt-4 flex items-center gap-6 text-[12px] text-[#737373] border-t border-[#E8E8E6]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2F9E5B]" />
                <span>Zero AI Slop / Deterministic Rules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2F9E5B]" />
                <span>P0–P3 Priority Allocation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Render of Home Dashboard (Non-interactive Preview Frame) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-[12px] border border-[#D4D4D1] bg-[#FAFAF9] p-3 shadow-[0_4px_20px_rgba(32,33,36,0.06)] overflow-hidden">
              {/* Window Frame Bar */}
              <div className="h-[28px] border-b border-[#E8E8E6] mb-3 flex items-center justify-between px-2 text-[11px] text-[#737373]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8E8E6]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8E8E6]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8E8E6]" />
                  <span className="font-mono text-[10px] ml-2 text-[#737373]">
                    zhatka.campus.srmist.edu.in
                  </span>
                </div>
                <DataNatureTag nature="SIMULATED" />
              </div>

              {/* Scaled Preview Elements */}
              <div className="space-y-3 pointer-events-none select-none">
                {/* Stat Strip Mini */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-white border border-[#E8E8E6] rounded-[8px]">
                  <div>
                    <div className="text-[10px] text-[#737373]">Total Demand</div>
                    <div className="font-mono text-[16px] font-bold text-[#202124]">
                      {kpis.totalDemandKw} kW
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#737373]">Available Pool</div>
                    <div className="font-mono text-[16px] font-bold text-[#3478D4]">
                      {kpis.availableCapacityKw} kW
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#737373]">Potentially Avoidable</div>
                    <div className="font-mono text-[16px] font-bold text-[#8A5A00]">
                      {kpis.potentiallyAvoidableKw} kW
                    </div>
                  </div>
                </div>

                {/* Emergency Banner Preview */}
                <div className="p-2.5 bg-[#FCE4E4] border border-[#D92D20]/40 rounded-[8px] flex items-center justify-between text-[#B42318]">
                  <div className="flex items-center gap-2">
                    <Siren className="w-4 h-4 text-[#D92D20]" />
                    <span className="text-[11px] font-bold">SEVERE RESOURCE EMERGENCY</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold">16.67% Supplied</span>
                </div>

                {/* Room Mini List */}
                <div className="border border-[#E8E8E6] rounded-[8px] bg-white divide-y divide-[#F1F1EF] text-[11px]">
                  <div className="p-2 flex items-center justify-between">
                    <span className="font-mono font-medium">A-102 (Classroom)</span>
                    <span className="text-[#8A5A00] bg-[#FFF1D6] px-1.5 py-0.5 rounded text-[10px] font-medium">Empty but Consuming (3.1 kW)</span>
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <span className="font-mono font-medium">B-203 (Computer Lab)</span>
                    <span className="state-unknown px-1.5 py-0.5 rounded text-[10px]">UNKNOWN (?) Sensor Offline</span>
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <span className="font-mono font-medium">B-001 (Server Room)</span>
                    <span className="text-[#5B3FA8] bg-[#EEE7FA] px-1.5 py-0.5 rounded text-[10px] font-medium">Protected (EQ-001)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Problem Section */}
      <section id="problem" className="py-20 bg-[#F7F7F5] border-y border-[#E8E8E6] px-6 lg:px-12">
        <div className="max-w-[1120px] mx-auto space-y-12">
          <div className="max-w-2xl">
            <h2 className="text-[24px] font-semibold text-[#202124] tracking-tight">
              The Sleeping Campus Challenge
            </h2>
            <p className="text-[14px] text-[#737373] mt-2 leading-[22px]">
              Institutional campuses waste megawatts powering empty halls while facing abrupt load shedding. Automated systems must never cut power blindly or trust corrupted telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#E8E8E6] rounded-[10px]">
              <div className="font-mono text-[32px] font-semibold text-[#202124] tabular-nums">
                30–45%
              </div>
              <div className="text-[14px] font-semibold text-[#202124] mt-2">
                Avoidable Energy Waste
              </div>
              <p className="text-[13px] text-[#737373] mt-1.5 leading-[18px]">
                HVAC and lighting remain powered in vacated lecture theatres between timetable sessions.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E8E8E6] rounded-[10px]">
              <div className="font-mono text-[32px] font-semibold text-[#B42318] tabular-nums">
                50% Drop
              </div>
              <div className="text-[14px] font-semibold text-[#202124] mt-2">
                Sudden Grid Deficits
              </div>
              <p className="text-[13px] text-[#737373] mt-1.5 leading-[18px]">
                Demand spikes to 3× while substation limits halve. Proportional shedding risks blacking out medical labs.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E8E8E6] rounded-[10px]">
              <div className="font-mono text-[32px] font-semibold text-[#8A5A00] tabular-nums">
                100% Client-Side
              </div>
              <div className="text-[14px] font-semibold text-[#202124] mt-2">
                Telemetry Vulnerability
              </div>
              <p className="text-[13px] text-[#737373] mt-1.5 leading-[18px]">
                Sensor drift, offline gateways, and hostile payloads can trick naïve automation into false shutdowns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (4-Step Flow) */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-[1120px] mx-auto space-y-12">
          <div>
            <h2 className="text-[24px] font-semibold text-[#202124] tracking-tight">
              How ZHATKA Works
            </h2>
            <p className="text-[14px] text-[#737373] mt-2">
              A 4-step verified workflow ensuring every power adjustment is explainable, safe, and human-approved.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 border border-[#E8E8E6] rounded-[10px] bg-[#FAFAF9] space-y-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#EAF2FC] text-[#3478D4] flex items-center justify-center font-mono font-bold text-[14px]">
                01
              </div>
              <h3 className="text-[15px] font-semibold text-[#202124]">
                Data Validation
              </h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                7-stage pipeline parses CSV/JSON, strips malicious injection, and halts corrupted readings.
              </p>
            </div>

            <div className="p-5 border border-[#E8E8E6] rounded-[10px] bg-[#FAFAF9] space-y-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#EAF2FC] text-[#3478D4] flex items-center justify-center font-mono font-bold text-[14px]">
                02
              </div>
              <h3 className="text-[15px] font-semibold text-[#202124]">
                Occupancy Resolving
              </h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Never coerces missing data to zero. Offline sensors yield UNKNOWN, preserving human safety.
              </p>
            </div>

            <div className="p-5 border border-[#E8E8E6] rounded-[10px] bg-[#FAFAF9] space-y-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#EAF2FC] text-[#3478D4] flex items-center justify-center font-mono font-bold text-[14px]">
                03
              </div>
              <h3 className="text-[15px] font-semibold text-[#202124]">
                Adaptive Planning
              </h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                During grid deficits, transparent P0–P3 allocation protects critical laboratory freezers.
              </p>
            </div>

            <div className="p-5 border border-[#E8E8E6] rounded-[10px] bg-[#FAFAF9] space-y-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#EAF2FC] text-[#3478D4] flex items-center justify-center font-mono font-bold text-[14px]">
                04
              </div>
              <h3 className="text-[15px] font-semibold text-[#202124]">
                Approval & Audit
              </h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Admins approve simulated actions. Verified savings are measured over structured time windows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Platform Features (3x3 Grid of Bordered Text Tiles per DESIGN.md §6.0) */}
      <section id="features" className="py-20 bg-[#F7F7F5] border-t border-[#E8E8E6] px-6 lg:px-12">
        <div className="max-w-[1120px] mx-auto space-y-12">
          <div>
            <h2 className="text-[24px] font-semibold text-[#202124] tracking-tight">
              Platform Modules
            </h2>
            <p className="text-[14px] text-[#737373] mt-2">
              Comprehensive campus energy management designed as clean, structured workspace tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-white border border-[#E8E8E6] rounded-[10px] space-y-2">
              <Building2 className="w-5 h-5 text-[#3478D4]" />
              <h3 className="text-[15px] font-semibold text-[#202124]">Building & Floor Grids</h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Real-time overview of room states, circuit consumption, and sensor health across blocks.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E8E8E6] rounded-[10px] space-y-2">
              <Siren className="w-5 h-5 text-[#B42318]" />
              <h3 className="text-[15px] font-semibold text-[#202124]">Adaptive Resource Planner</h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Deterministic emergency rationing balancing P0 Critical down to P3 Flexible loads.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E8E8E6] rounded-[10px] space-y-2">
              <Shield className="w-5 h-5 text-[#1E6B3A]" />
              <h3 className="text-[15px] font-semibold text-[#202124]">Data Integrity Engine</h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Full 7-stage validation pipeline rejecting duplicate, malicious, or malformed inputs.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E8E8E6] rounded-[10px] space-y-2">
              <Lightbulb className="w-5 h-5 text-[#3478D4]" />
              <h3 className="text-[15px] font-semibold text-[#202124]">ZHATKA Intelligence</h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Transparent recommendation queue with complete audit evidence and safety checklists.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E8E8E6] rounded-[10px] space-y-2">
              <Lock className="w-5 h-5 text-[#5B3FA8]" />
              <h3 className="text-[15px] font-semibold text-[#202124]">Critical Equipment Shield</h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Rigid hardware registry protecting research freezers, servers, and safety ventilation.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E8E8E6] rounded-[10px] space-y-2">
              <CalendarCheck className="w-5 h-5 text-[#3478D4]" />
              <h3 className="text-[15px] font-semibold text-[#202124]">Room Booking Alignment</h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Integrates reservation requests with energy scheduling to avoid air conditioning idle rooms.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E8E8E6] rounded-[10px] space-y-2">
              <BarChart3 className="w-5 h-5 text-[#3478D4]" />
              <h3 className="text-[15px] font-semibold text-[#202124]">Analytics & Reports</h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Separate tracking of Potential, Estimated, and Measured savings with formula-safe CSV export.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E8E8E6] rounded-[10px] space-y-2">
              <FileCheck className="w-5 h-5 text-[#3478D4]" />
              <h3 className="text-[15px] font-semibold text-[#202124]">Immutable Activity Logs</h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Append-only audit trail recording every approval, rejection, and configuration modification.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E8E8E6] rounded-[10px] space-y-2">
              <Cpu className="w-5 h-5 text-[#3478D4]" />
              <h3 className="text-[15px] font-semibold text-[#202124]">Full-Stack Express API</h3>
              <p className="text-[13px] text-[#737373] leading-[18px]">
                Integrated backend endpoints for validation, scenario distribution, and formula-safe downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Impact Metrics Section */}
      <section id="impact" className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-[1120px] mx-auto space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-[24px] font-semibold text-[#202124] tracking-tight">
                Simulated Operational Impact
              </h2>
              <p className="text-[14px] text-[#737373] mt-1">
                Numbers calculated directly from the seeded campus benchmark dataset.
              </p>
            </div>
            <DataNatureTag nature="SIMULATED" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-[#E8E8E6] rounded-[10px] bg-[#FAFAF9]">
              <div className="text-[12px] font-medium text-[#737373] uppercase tracking-wider">
                Potentially Avoidable Load
              </div>
              <div className="font-mono text-[36px] font-semibold text-[#1F5FB0] mt-1 tabular-nums">
                6.0 kW
              </div>
              <div className="text-[12px] text-[#737373] mt-2">
                Derived from idle classrooms A-102 (2.5 kW) and laboratory L-301 (3.5 kW).
              </div>
            </div>

            <div className="p-6 border border-[#E8E8E6] rounded-[10px] bg-[#FAFAF9]">
              <div className="text-[12px] font-medium text-[#737373] uppercase tracking-wider">
                Single-Intervention Verified Savings
              </div>
              <div className="font-mono text-[36px] font-semibold text-[#1E6B3A] mt-1 tabular-nums">
                8.8 kWh
              </div>
              <div className="text-[12px] text-[#737373] mt-2">
                Simulated post-action measurement in room A-102 over a 4-hour window.
              </div>
            </div>

            <div className="p-6 border border-[#E8E8E6] rounded-[10px] bg-[#FAFAF9]">
              <div className="text-[12px] font-medium text-[#737373] uppercase tracking-wider">
                Protected Mandatory Loads
              </div>
              <div className="font-mono text-[36px] font-semibold text-[#5B3FA8] mt-1 tabular-nums">
                42.0 kW
              </div>
              <div className="text-[12px] text-[#737373] mt-2">
                Preserved unconditionally across P0, P1, and P2 priority thresholds.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer per DESIGN.md §6.0 */}
      <footer className="mt-auto border-t border-[#E8E8E6] bg-[#FAFAF9] py-12 px-6 lg:px-12 text-[13px] text-[#737373]">
        <div className="max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-[4px] bg-[#3478D4] text-white flex items-center justify-center font-bold text-[11px]">
                Z
              </div>
              <span className="font-semibold text-[#202124]">ZHATKA</span>
            </div>
            <p className="text-[12px] leading-[18px]">
              Adaptive Campus Energy Response Planner. Built for PS6 &quot;The Sleeping Campus&quot;.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#202124] mb-3 text-[12px] uppercase tracking-wider">
              Navigation
            </h4>
            <div className="space-y-2 text-[12px]">
              <div><button onClick={() => setActivePage('overview')} className="hover:underline">Home Dashboard</button></div>
              <div><button onClick={() => setActivePage('planner')} className="hover:underline">Emergency Planner</button></div>
              <div><button onClick={() => setActivePage('data-integrity')} className="hover:underline">Data Integrity</button></div>
              <div><button onClick={() => setActivePage('intelligence')} className="hover:underline">ZHATKA Intelligence</button></div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#202124] mb-3 text-[12px] uppercase tracking-wider">
              Project Info
            </h4>
            <div className="space-y-1.5 text-[12px]">
              <div>Team: The Other Side</div>
              <div>Institution: SRMIST</div>
              <div>Track: PS6 Occupancy-Aware Energy Intelligence</div>
              <div>Status: Demonstration Prototype</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#202124] mb-3 text-[12px] uppercase tracking-wider">
              Honest Boundary
            </h4>
            <p className="text-[11px] leading-[16px] text-[#737373]">
              All campus telemetry, sensor readings, and control outputs are simulated software models. ZHATKA does not directly control physical campus relays.
            </p>
          </div>
        </div>

        <div className="max-w-[1120px] mx-auto pt-6 border-t border-[#E8E8E6] flex items-center justify-between flex-wrap gap-4 text-[12px]">
          <div>
            © 2026 ZHATKA · Team The Other Side · SRMIST
          </div>
          <div className="font-mono text-[11px]">
            Node.js / Express / React / Vite
          </div>
        </div>
      </footer>
    </div>
  );
};
