import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Search,
  RotateCcw,
  Lock,
  ThumbsUp,
  Sparkles,
  Home,
  Compass,
  ClipboardCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Order } from '../context/AppContext';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import { Logo } from '../components/Logo';

interface CustomerDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ activeTab, setActiveTab }) => {
  const { orders, verifyDeliveryOTP, selectedOrderId, setSelectedOrderId, setScreen } = useApp();
  const [searchId, setSearchId] = useState('');

  // Inline OTP states
  const [inlineOtp, setInlineOtp] = useState<string[]>(['', '', '', '']);
  const [verifyingInline, setVerifyingInline] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [inlineSuccess, setInlineSuccess] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Clear inputs when selected order changes
  useEffect(() => {
    setInlineOtp(['', '', '', '']);
    setInlineError('');
    setInlineSuccess(false);
    setVerifyingInline(false);
  }, [selectedOrderId]);

  // Handle inline OTP changes
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...inlineOtp];
    newOtp[index] = value.substring(value.length - 1);
    setInlineOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!inlineOtp[index] && index > 0) {
        const newOtp = [...inlineOtp];
        newOtp[index - 1] = '';
        setInlineOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...inlineOtp];
        newOtp[index] = '';
        setInlineOtp(newOtp);
      }
    }
  };

  const activeTrackedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleVerifyInline = (expectedOTP: string) => {
    const code = inlineOtp.join('');
    if (code.length < 4) {
      setInlineError('Enter 4-digit code.');
      return;
    }

    setVerifyingInline(true);
    setInlineError('');

    setTimeout(() => {
      if (code === expectedOTP) {
        setVerifyingInline(false);
        setInlineSuccess(true);
        setTimeout(() => {
          verifyDeliveryOTP(activeTrackedOrder.id, code);
          setInlineSuccess(false);
        }, 1200);
      } else {
        setVerifyingInline(false);
        setInlineError(`Invalid signature. (Hint: ${expectedOTP})`);
      }
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    const found = orders.find((o) => o.id.toLowerCase() === searchId.toLowerCase().trim());
    if (found) {
      setSelectedOrderId(found.id);
    }
  };

  // Stats calculation
  const inboundCount = orders.filter(o => o.status !== 'delivered').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const transitCount = orders.filter(o => ['picked_up', 'in_transit', 'near_destination'].includes(o.status)).length;
  const completedCount = orders.filter(o => o.status === 'delivered').length;

  // Generate logs output based on order status for the terminal feed
  const getTerminalLogs = (order: Order) => {
    const logs = [];
    if (!order) return [];
    const id = order.id;
    logs.push({ time: '09:12:04', log: `[${id}] INGEST_DAEMON: Initializing route correlation search...` });
    logs.push({ time: '09:12:05', log: `[${id}] LEDGER_SUCCESS: Ingested order category [${order.category}] from pickup point.` });

    if (order.status === 'pending') {
      logs.push({ time: '09:12:10', log: `[${id}] NET_SCANNER: Scanning active traveler routes on Bhopal-Sehore highway corridor...` });
      logs.push({ time: '09:15:30', log: `[${id}] AWAITING_CORRELATION: No instant traveler overlap found. Retrying in background...` });
    }

    if (['matched', 'picked_up', 'in_transit', 'near_destination', 'delivered'].includes(order.status)) {
      logs.push({ time: '09:18:22', log: `[${id}] ROUTE_CORRELATION: Driver [${order.partnerName || 'Vikram Singh'}] matched. Overlap score: 94.2%.` });
      logs.push({ time: '09:20:01', log: `[${id}] SIGNATURE_GEN: Handover OTPs issued. Pickup Signature secure.` });
    }

    if (['picked_up', 'in_transit', 'near_destination', 'delivered'].includes(order.status)) {
      logs.push({ time: '09:44:12', log: `[${id}] HANDOVER_CONFIRMED: Commuter verified Pickup OTP. Cargo secured in vehicle.` });
    }

    if (['in_transit', 'near_destination', 'delivered'].includes(order.status)) {
      logs.push({ time: '10:02:18', log: `[${id}] GPS_DAEMON: Telemetry ping active. Speed: 64km/h. Route: NH-86 Corridor.` });
      logs.push({ time: '10:15:40', log: `[${id}] DYNAMIC_ETA: Re-calculating grid congestion... Updated ETA: ${order.eta}.` });
    }

    if (['near_destination', 'delivered'].includes(order.status)) {
      logs.push({ time: '10:35:10', log: `[${id}] STAND_APPROACH: Core commuter approach detected within 1.5km radial boundary.` });
      logs.push({ time: '10:36:00', log: `[${id}] RECIPIENT_PING: SMS dispatched to receiver phone ${order.receiverPhone}.` });
    }

    if (order.status === 'delivered') {
      logs.push({ time: '10:42:15', log: `[${id}] DELIVERY_VERIFIED: Recipient OTP cryptographic release handshake confirmed.` });
      logs.push({ time: '10:42:16', log: `[${id}] LEDGER_RELEASE: Reward payout of ₹${order.reward} routed to traveler vault.` });
      logs.push({ time: '10:42:18', log: `[${id}] DAEMON_ARCHIVE: Route ledger session finalized. Standby.` });
    } else {
      logs.push({ time: '11:27:03', log: `[${id}] LOGS_MONITOR: Listening for live telemetry pings...` });
    }

    return logs;
  };

  const activeLogs = activeTrackedOrder ? getTerminalLogs(activeTrackedOrder) : [];

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-white text-gray-800 select-none font-sans min-h-screen">
          {/* Left Sidebar (22% width) */}
          <div className="w-full md:w-[22%] border-r border-gray-200 bg-gray-50/50 px-3 py-4 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              {/* Logo & Brand and Home Action */}
              <div className="flex items-center justify-between px-1">
                <div 
                  onClick={() => setScreen('landing')}
                  className="flex items-center gap-2 text-gray-900 cursor-pointer hover:opacity-85 transition-opacity"
                >
                  <Logo className="w-6 h-6 shrink-0" />
                  <span className="font-semibold text-sm tracking-tight select-none">SetuHub</span>
                </div>
                <button 
                  onClick={() => setScreen('landing')}
                  className="p-1.5 hover:bg-gray-200/60 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                  title="Go to Landing Page"
                >
                  <Home className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Workspace Badge */}
              <div className="flex items-center gap-2 bg-gray-100 ring-1 ring-gray-200 rounded-lg p-1.5">
                <div className="w-4 h-4 rounded bg-gray-900 flex items-center justify-center text-[8px] font-bold text-white uppercase shrink-0 font-display">
                  C
                </div>
                <span className="text-[10px] text-gray-800 font-semibold truncate">Customer</span>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5">
                {[
                  { id: 'customer-track', label: 'Track Package', icon: Compass },
                  { id: 'customer-history', label: 'Receipt Ledger', icon: ClipboardCheck }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white font-medium shadow-sm'
                          : 'text-gray-600 hover:text-gray-955 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Active Shipments Section */}
              <div className="pt-2">
                <div className="px-2 text-[8px] tracking-wider text-gray-500 font-bold uppercase mb-2">
                  Active Shipments
                </div>
                <div className="space-y-2 px-2">
                  {[
                    "Bhopal ➔ Vidisha",
                    "Ahmedabad ➔ Mehsana",
                    "Sehore ➔ Bhopal",
                    "Indore ➔ Dewas"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] text-gray-600 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 animate-pulse" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Area */}
            <div className="text-[9px] text-gray-400 px-2 pt-2 border-t border-gray-200 space-y-1">
              <div className="truncate">SetuHub Engine v2.5</div>
              <div className="truncate">Customer Node</div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center text-white text-base font-semibold shrink-0 font-display">
                  R
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Ramesh Patel</h2>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveTab('customer-track')}
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Track Package</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
              {[
                { label: 'INBOUND', value: `${inboundCount}`, sub: 'Packages arriving' },
                { label: 'BROADCASTING', value: `${pendingCount}`, sub: 'Match scans' },
                { label: 'CHECKPOINTS', value: `${transitCount}`, sub: 'Transit nodes passed' },
                { label: 'RECEIVED', value: `${completedCount}`, sub: 'Ledger handovers settled' }
              ].map((stat, idx) => (
                <div key={idx} className="p-3 text-left">
                  <span className="block text-[8px] tracking-wider text-gray-500 uppercase font-bold">
                    {stat.label}
                  </span>
                  <span className="block text-base font-bold text-gray-900 mt-1 leading-none font-display">
                    {stat.value}
                  </span>
                  <span className="block text-[8px] text-gray-500 mt-1 truncate">
                    {stat.sub}
                  </span>
                </div>
              ))}
            </div>

            {/* Active Corridors */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: 'Bhopal-Vidisha', travelers: 18, overlap: '85%', color: 'bg-orange-500' },
                { title: 'Ahmedabad-Mehsana', travelers: 12, overlap: '62%', color: 'bg-yellow-500' },
                { title: 'Sehore-Bhopal', travelers: 15, overlap: '90%', color: 'bg-green-500' }
              ].map((card, idx) => (
                <div key={idx} className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-800 truncate max-w-[90px]">{card.title}</span>
                    <span className="text-[8px] text-gray-500">{card.travelers} pings</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${card.color}`} style={{ width: card.overlap }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Active Tab Content Area */}
            <div className="flex-1 mt-2">
              {/* 1. TRACK PACKAGE */}
              {activeTab === 'customer-track' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-200 gap-3">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">Live Telemetry Ledger</h3>
                      <p className="text-[9px] text-gray-500">Verify incoming cargo handovers and monitor commuter transit vectors.</p>
                    </div>
                    
                    <form onSubmit={handleSearch} className="flex gap-2 shrink-0">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search Order ID..."
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          className="bg-white border border-gray-300 rounded-lg py-1.5 pl-8 pr-3 text-[10px] focus:border-[#0284c7] focus:outline-none w-44 text-gray-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors"
                      >
                        Track
                      </button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Left panel: List registry */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl h-full flex flex-col gap-3 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Inbound Registry</h4>
                          <span className="text-[8px] text-gray-500 font-mono uppercase bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                            {orders.length} total
                          </span>
                        </div>

                        <div className="space-y-2.5 overflow-y-auto max-h-[260px] pr-1 flex-1">
                          {orders.map((o) => {
                            const isSelected = o.id === activeTrackedOrder?.id;
                            return (
                              <div
                                key={o.id}
                                onClick={() => setSelectedOrderId(o.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer text-[10px] space-y-2 ${
                                  isSelected
                                    ? 'border-[#0284c7] bg-[#0284c7]/5 text-gray-900 font-bold'
                                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-mono text-[#0284c7] font-black">{o.id}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    o.status === 'delivered'
                                      ? 'bg-green-50 text-green-700 border border-green-200'
                                      : o.status === 'pending'
                                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                      : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                  }`}>
                                    {o.status}
                                  </span>
                                </div>

                                <div className="space-y-0.5 text-[9.5px]">
                                  <p className="truncate font-semibold text-gray-900">{o.category}</p>
                                  <p className="truncate text-gray-500">From: {o.pickup.split(',')[0]}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right panel: Map telemetry and signature verification */}
                    <div className="lg:col-span-8 flex flex-col gap-4 justify-between">
                      {activeTrackedOrder ? (
                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                          {/* Centerpiece map */}
                          <div className="min-h-[220px] relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50">
                            <InteractiveRouteMap
                              mode="journey-tracking"
                              activeOrders={orders}
                              selectedOrderId={activeTrackedOrder.id}
                            />
                          </div>

                          {/* Secure OTP custody verification & Logs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                            {/* OTP Panel */}
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-sm">
                              <div>
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Lock className="w-3.5 h-3.5 text-[#0284c7]" />
                                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-gray-500 font-mono">Custody Release Signature</h4>
                                </div>
                                
                                {activeTrackedOrder.status === 'delivered' ? (
                                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center text-[10px] font-bold text-green-700">
                                    ✓ Handover verified. Ledger closed.
                                  </div>
                                ) : activeTrackedOrder.status === 'pending' ? (
                                  <p className="text-[9px] text-gray-500 leading-relaxed font-sans">
                                    Awaiting commuter overlap match before release protocol is available.
                                  </p>
                                ) : (
                                  <div className="space-y-2 text-[10px]">
                                    <p className="text-[9px] text-gray-500 leading-normal">
                                      Provide OTP signature to commuter to verify dropoff:
                                    </p>
                                    <div className="flex justify-between items-center bg-gray-100 border border-gray-250 p-2 rounded-xl text-xs font-mono">
                                      <span className="text-gray-400 uppercase text-[8px]">OTP Token:</span>
                                      <span className="text-gray-800 font-bold tracking-widest font-mono">{activeTrackedOrder.deliveryOTP}</span>
                                    </div>

                                    {/* Inline verification input */}
                                    {inlineSuccess ? (
                                      <div className="text-center py-1.5 text-[10px] font-bold text-green-600">
                                        Success! Closing ledger...
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        <div className="flex gap-1">
                                          {inlineOtp.map((digit, idx) => (
                                            <input
                                              key={idx}
                                              ref={(el) => { inputRefs.current[idx] = el as HTMLInputElement; }}
                                              type="text"
                                              maxLength={1}
                                              value={digit}
                                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                              className="w-8 h-8 text-center text-xs font-black bg-white rounded-lg border border-gray-300 focus:border-[#0284c7] focus:outline-none transition-all text-gray-900"
                                            />
                                          ))}
                                          <button
                                            onClick={() => handleVerifyInline(activeTrackedOrder.deliveryOTP)}
                                            disabled={verifyingInline}
                                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all disabled:opacity-50"
                                          >
                                            Verify
                                          </button>
                                        </div>
                                        {inlineError && <p className="text-[8px] text-red-655 font-bold text-center">{inlineError}</p>}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Logs Panel */}
                            <div className="bg-[#0b0f19] border border-gray-800 p-4 rounded-xl flex flex-col justify-between shadow-md">
                              <div className="flex items-center justify-between border-b border-gray-850 pb-1.5 mb-1.5">
                                <span className="text-[9px] font-bold uppercase text-gray-500 font-mono">Baud 115200 Logs</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              </div>

                              <div className="space-y-1.5 font-mono text-[8px] text-green-400 max-h-[100px] overflow-y-auto pr-1">
                                {activeLogs.slice(0, 4).map((logItem, idx) => (
                                  <div key={idx} className="flex gap-1 leading-relaxed">
                                    <span className="text-gray-600 shrink-0">➔</span>
                                    <span>{logItem.log}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl flex-1 flex flex-col items-center justify-center shadow-sm">
                          <Package className="w-8 h-8 text-gray-400 mb-2" />
                          <h4 className="font-bold text-xs text-gray-900">No active packages</h4>
                          <p className="text-[10px] text-gray-500 font-semibold">Choose a registry ledger to initialize.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. RESOLVED HANDOVER HISTORY */}
              {activeTab === 'customer-history' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-900">Resolved Handovers</h3>
                    <p className="text-[9px] text-gray-500">Historical custody transfers settled on the Route Matrix ledger.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orders
                      .filter((o) => o.status === 'delivered')
                      .map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 p-4 rounded-xl space-y-2 hover:border-[#0284c7]/30 transition-all duration-300 relative group overflow-hidden shadow-sm">
                          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                            <ThumbsUp className="w-10 h-10 text-gray-900" />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-[#0284c7] font-mono">{order.id}</span>
                            <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">
                              Delivered
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[10px] border-y border-gray-200 py-2 text-gray-600">
                            <div className="flex justify-between">
                              <span>Commodity:</span>
                              <strong className="text-gray-900">{order.category}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Traveler Commuter:</span>
                              <strong className="text-gray-900">{order.partnerName}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Segment:</span>
                              <span className="text-gray-900 truncate max-w-[120px]">{order.pickup.split(',')[0]} ➔ {order.destination.split(',')[0]}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                    {orders.filter((o) => o.status === 'delivered').length === 0 && (
                      <div className="col-span-2 text-center py-10 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                        <RotateCcw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin-slow" />
                        <p className="text-[10px] text-gray-555 font-semibold">No resolved receipt ledgers.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
    </div>
  );
};
