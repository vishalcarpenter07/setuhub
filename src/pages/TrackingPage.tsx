import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Activity,
  Terminal
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';

export const TrackingPage: React.FC = () => {
  const { orders, selectedOrderId, setSelectedOrderId } = useApp();
  const currentOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  // Generate live-ticker telemetry entries based on order status
  useEffect(() => {
    if (!currentOrder) return;
    const logs = [];
    const origin = currentOrder.pickup.split(',')[0];
    const destination = currentOrder.destination.split(',')[0];

    logs.push(`[SYSTEM] Initializing route matching protocols for cargo ${currentOrder.id}...`);
    logs.push(`[LEDGER] Broadcasted parameters: Origin [${origin}] ➔ Destination [${destination}]`);

    if (currentOrder.status !== 'pending') {
      logs.push(`[MATCHER] Traveler matched: ${currentOrder.partnerName} (${currentOrder.partnerPhone}) accepted route.`);
    }
    if (['picked_up', 'in_transit', 'near_destination', 'delivered'].includes(currentOrder.status)) {
      logs.push(`[CHECKPOINT] Origin OTP custody handover verified at ${origin} Node.`);
    }
    if (['in_transit', 'near_destination', 'delivered'].includes(currentOrder.status)) {
      logs.push(`[TELEMETRY] Cruising NH-86 Corridor. Speed: 62km/h. Status: Optimal.`);
    }
    if (['near_destination', 'delivered'].includes(currentOrder.status)) {
      logs.push(`[TELEMETRY] Approving arrival gates at ${destination} stand.`);
    }
    if (currentOrder.status === 'delivered') {
      logs.push(`[LEDGER] Customer OTP verification verified. Payout released. Journey completed.`);
    }

    setTelemetryLogs(logs.reverse());
  }, [currentOrder]);

  const getStatusText = (status: typeof currentOrder.status) => {
    switch (status) {
      case 'pending': return 'Scanning Commuter Routes';
      case 'matched': return 'Commuter Matched (Awaiting Handover)';
      case 'picked_up': return 'Cargo Secured (Departing Hub)';
      case 'in_transit': return 'Cruising on Highway Route';
      case 'near_destination': return 'Arrived at City Gateway';
      case 'delivered': return 'Delivered & Confirmed';
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-73px)] font-sans">
      <div className="pb-4 border-b border-cardBorder mb-8">
        <h2 className="text-xl font-bold font-display tracking-wide text-fgApp uppercase">Live Route Telemetry Center</h2>
        <p className="text-xs text-mutedApp font-medium font-sans">Verify cryptographic GPS parameters and commuter logs.</p>
      </div>

      {currentOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Interactive Map Simulation */}
          <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
            <div className="glass-panel p-6 rounded-3xl border border-cardBorder relative overflow-hidden bg-bgApp/60 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primaryApp animate-pulse" />
                  <span className="text-xs font-bold font-display uppercase tracking-widest font-mono">Live SVG Pathway</span>
                </div>
                <span className="text-[9px] text-mutedApp font-mono uppercase">Telemetry Frequency: 100Hz</span>
              </div>

              {/* Dynamic Map centerpiece */}
              <div className="flex-1 min-h-[300px] relative">
                <InteractiveRouteMap
                  mode="journey-tracking"
                  activeOrders={orders}
                  selectedOrderId={currentOrder.id}
                />
              </div>

              {/* Origin-Destination text info */}
              <div className="flex justify-between items-center mt-5 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-mutedApp block font-mono">From origin node</span>
                  <p className="font-semibold text-white truncate max-w-xs">{currentOrder.pickup}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-mutedApp shrink-0" />
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-mutedApp block font-mono">Target Stand coordinates</span>
                  <p className="font-semibold text-white truncate max-w-xs">{currentOrder.destination}</p>
                </div>
              </div>
            </div>

            {/* Live GPS Telemetry Logs Panel */}
            <div className="glass-panel p-6 rounded-3xl border border-cardBorder bg-black/95 relative space-y-4">
              <div className="flex items-center gap-2 border-b border-cardBorder/60 pb-3">
                <Terminal className="w-4 h-4 text-primaryApp" />
                <span className="text-[10px] font-bold text-fgApp uppercase font-mono tracking-wider">Live Telemetry logs console</span>
              </div>
              <div className="space-y-3 font-mono text-[9px] text-green-400 max-h-[150px] overflow-y-auto pr-1">
                {telemetryLogs.map((log, i) => (
                  <p key={i} className="leading-relaxed"><span className="text-[#00F2FE] font-bold">➔</span> {log}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Parcel State Card */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            <div className="glass-panel p-6 rounded-3xl border border-cardBorder space-y-4 bg-bgApp/60 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-primaryApp uppercase tracking-widest bg-primaryApp/10 border border-primaryApp/25 px-2.5 py-1 rounded font-mono">
                  Security Ledger
                </span>

                <div className="mt-4">
                  <h3 className="text-xl font-bold font-display uppercase tracking-wide text-white">{currentOrder.id}</h3>
                  <p className="text-xs text-primaryApp font-semibold mt-1">
                    {getStatusText(currentOrder.status)}
                  </p>
                </div>

                <div className="space-y-3.5 border-t border-cardBorder/50 pt-4 mt-4 text-xs font-sans text-mutedApp">
                  <div className="flex justify-between">
                    <span>Cargo Category:</span>
                    <strong className="text-white">{currentOrder.category}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Route Commuter:</span>
                    <strong className="text-white">{currentOrder.partnerName || 'Assigning...'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Payout:</span>
                    <strong className="text-green-400 font-bold font-mono">₹{currentOrder.reward}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Arrival:</span>
                    <strong className="text-primaryApp font-mono">{currentOrder.eta}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-cardBorder/50">
                <span className="text-[9px] uppercase font-bold text-mutedApp block mb-1 font-mono">Route Status</span>
                <div className="w-full bg-cardBg rounded-xl p-3 border border-cardBorder text-center font-bold text-xs font-mono text-white">
                  {currentOrder.status === 'delivered' ? '✓ Custody Verified & Transferred' : '⚡ Package moving on Highway'}
                </div>
              </div>
            </div>

            {/* Switch active parcels */}
            <div className="glass-panel p-5 rounded-3xl border border-cardBorder space-y-3 bg-bgApp/60">
              <h4 className="text-[9px] font-bold text-mutedApp uppercase tracking-widest font-mono">Trace another parcel</h4>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-mono ${
                      o.id === selectedOrderId
                        ? 'border-primaryApp bg-primaryApp/5 text-primaryApp font-bold'
                        : 'border-transparent hover:bg-cardBg/30 text-mutedApp hover:text-fgApp'
                    }`}
                  >
                    <span>{o.id} ({o.category})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-3xl border border-cardBorder">
          <p className="text-xs text-mutedApp font-medium">Awaiting orders in mock database.</p>
        </div>
      )}
    </div>
  );
};
