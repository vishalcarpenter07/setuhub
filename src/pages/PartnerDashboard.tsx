import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Phone,
  Sparkles,
  Home,
  ClipboardCheck,
  Search
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import type { Order } from '../context/AppContext';
import { OTPModal } from '../components/OTPModal';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import { Logo } from '../components/Logo';

interface PartnerDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ activeTab, setActiveTab }) => {
  const { orders, acceptOrder, verifyPickupOTP, verifyDeliveryOTP, earnings, setScreen, registerTrajectory } = useApp();

  // OTP modal control
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpType, setOtpType] = useState<'pickup' | 'delivery'>('pickup');
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);

  // Selected opportunity for route map highlight
  const [selectedOppId, setSelectedOppId] = useState<string>('');

  // Trajectory registration modal state
  const [trajectoryModalOpen, setTrajectoryModalOpen] = useState(false);
  const [trajFrom, setTrajFrom] = useState('Sehore Terminal');
  const [trajTo, setTrajTo] = useState('Bhopal Hub Node');
  const [trajSuccess, setTrajSuccess] = useState(false);

  const villageNodes = [
    'Bhopal Hub Node',
    'Sehore Terminal',
    'Kurawar Gateway',
    'Vidisha Portal',
    'Sonagir Depot',
    'Mandideep Sector',
    'Dewas Connector',
    'Sagar Trunk Stop'
  ];

  const handleRegisterTrajectory = (e: React.FormEvent) => {
    e.preventDefault();
    if (trajFrom === trajTo) {
      alert("Origin and destination cannot be the same!");
      return;
    }
    registerTrajectory(trajFrom, trajTo);
    setTrajSuccess(true);
    setTimeout(() => {
      setTrajectoryModalOpen(false);
      setTrajSuccess(false);
    }, 1500);
  };

  // Filter orders
  const availableOrders = orders.filter((o) => o.status === 'pending');
  const activeDeliveries = orders.filter((o) =>
    ['matched', 'picked_up', 'in_transit', 'near_destination'].includes(o.status)
  );

  // Default selected opportunity
  useEffect(() => {
    if (availableOrders.length > 0 && !selectedOppId) {
      setSelectedOppId(availableOrders[0].id);
    }
  }, [availableOrders]);

  // Mock Earnings Data for Chart
  const earningsData = [
    { day: 'Mon', amount: 450, distance: 48 },
    { day: 'Tue', amount: 820, distance: 74 },
    { day: 'Wed', amount: 280, distance: 30 },
    { day: 'Thu', amount: 1100, distance: 95 },
    { day: 'Fri', amount: 650, distance: 58 },
    { day: 'Sat', amount: 1450, distance: 120 },
    { day: 'Sun', amount: 980, distance: 82 },
  ];

  const travelHotspots = [
    { route: 'Sehore Bypass Road', volume: 'High Demand', estPayout: '₹380 avg', heat: 'high' },
    { route: 'Vidisha Highway Route 12', volume: 'Medium Demand', estPayout: '₹240 avg', heat: 'medium' },
    { route: 'Kurawar Highway Connector', volume: 'High Demand', estPayout: '₹410 avg', heat: 'high' }
  ];

  const handleAccept = (orderId: string) => {
    acceptOrder(orderId, 'Vikram Singh', '+91 88899 00112');
  };

  const triggerOTP = (order: Order, type: 'pickup' | 'delivery') => {
    setTargetOrder(order);
    setOtpType(type);
    setOtpModalOpen(true);
  };

  // Find currently highlighted order route to pass to the map
  const activeSelectedOpp = availableOrders.find(o => o.id === selectedOppId);

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
                  P
                </div>
                <span className="text-[10px] text-gray-800 font-semibold truncate">Commuter</span>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5">
                {[
                  { id: 'available', label: 'Opportunities', icon: Search },
                  { id: 'active', label: 'Telemetry Map', icon: Navigation },
                  { id: 'earnings', label: 'Wallet & Hotspots', icon: ClipboardCheck }
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
              <div className="truncate">Traveler Node</div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center text-white text-base font-semibold shrink-0 font-display">
                  V
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Vikram Singh</h2>
                </div>
              </div>
              
              <button 
                onClick={() => setTrajectoryModalOpen(true)}
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Register Trajectory</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
              {[
                { label: 'DELIVERED', value: `${earnings.total > 12450 ? 35 : 34}`, sub: 'Parcels completed' },
                { label: 'DISTANCE', value: `${earnings.distance} km`, sub: 'Mileage completed' },
                { label: 'RATING', value: `★ ${earnings.rating}`, sub: 'Custody compliance' },
                { label: 'EARNINGS', value: `₹${earnings.total.toLocaleString()}`, sub: 'UPI Wallet balance' }
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
              {/* 1. AVAILABLE OPPORTUNITIES (ROUTE OPPORTUNITY ENGINE) */}
              {activeTab === 'available' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">Route Opportunity Engine</h3>
                      <p className="text-[9px] text-gray-500">Interactive corridor volume heatmaps and commuter matching slots.</p>
                    </div>
                    <span className="text-[8px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-900 animate-pulse" />
                      SCANNING HIGHWAY CHANNELS // READY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Left/Center: Heatmap Map centerpiece */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <div className="flex-1 min-h-[300px] relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50">
                        <InteractiveRouteMap
                          mode="opportunity-engine"
                          highlightedRoute={activeSelectedOpp ? { pickup: activeSelectedOpp.pickup, destination: activeSelectedOpp.destination } : undefined}
                        />
                        {/* Heat legend */}
                        <div className="absolute top-3 left-3 bg-white/90 border border-gray-200 p-2 rounded-lg flex items-center gap-3 text-[8px] font-mono text-gray-650 z-10 pointer-events-none shadow-sm">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> HIGH LOAD</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> MED LOAD</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> NORMAL LOAD</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Available routes list details */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl h-full flex flex-col gap-3 overflow-hidden shadow-sm">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Matching Cargo Corridors</h4>
                        
                        <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1 flex-1">
                          {availableOrders.map((order) => {
                            const isSelected = order.id === selectedOppId;
                            const demand = order.distance > 30 ? 'High Demand' : 'Medium Demand';
                            
                            return (
                              <div
                                key={order.id}
                                onClick={() => setSelectedOppId(order.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer text-[10px] space-y-2 ${
                                  isSelected
                                    ? 'border-[#0284c7] bg-[#0284c7]/5 text-gray-900 font-bold'
                                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-mono text-[9px] text-[#0284c7] font-black">{order.id}</span>
                                    <h5 className="font-bold text-gray-900 mt-0.5">{order.category}</h5>
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold font-mono border ${
                                    order.distance > 30 
                                      ? 'bg-red-50 text-red-700 border-red-200' 
                                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  }`}>
                                    {demand}
                                  </span>
                                </div>

                                <div className="space-y-0.5 text-[9px] text-gray-500">
                                  <p className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#0284c7] shrink-0" />
                                    <span>Origin: {order.pickup.split(',')[0]}</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Navigation className="w-3 h-3 text-green-600 shrink-0" />
                                    <span>Target: {order.destination.split(',')[0]}</span>
                                  </p>
                                </div>

                                <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                                  <div className="flex gap-3">
                                    <div>
                                      <p className="text-[7.5px] text-gray-400">Payout</p>
                                      <strong className="text-green-600 font-mono">₹{order.reward}</strong>
                                    </div>
                                    <div>
                                      <p className="text-[7.5px] text-gray-400">Distance</p>
                                      <strong className="text-gray-900 font-mono">{order.distance} km</strong>
                                    </div>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAccept(order.id);
                                    }}
                                    className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-1 px-3 rounded-lg text-[9px] uppercase tracking-wider transition-colors"
                                  >
                                    Accept Route
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {availableOrders.length === 0 && (
                            <div className="text-center py-12">
                              <Compass className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-spin-slow" />
                              <h5 className="font-bold text-xs text-gray-800">Scanning commute paths...</h5>
                              <p className="text-[10px] text-gray-555 mt-0.5">Ledger matching queue is currently clear.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ACTIVE DELIVERIES TELEMETRY */}
              {activeTab === 'active' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-900">Active Courier Telemetry</h3>
                    <p className="text-[9px] text-gray-500">Trace active cargo vectors and verify custodian handover codes.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activeDeliveries.length === 0 ? (
                      <div className="col-span-2 text-center py-12 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                        <Navigation className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-bounce" />
                        <h4 className="font-bold text-xs text-gray-800">No active highway packages</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Select an opportunity corridor from the list to begin.</p>
                      </div>
                    ) : (
                      activeDeliveries.map((order) => {
                        const needsPickup = order.status === 'matched';

                        return (
                          <div key={order.id} className="bg-white border border-gray-200 p-4 rounded-xl space-y-4 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-mono text-[9px] text-[#0284c7] font-black">{order.id}</span>
                                <h4 className="font-bold text-gray-900 mt-0.5">{order.category}</h4>
                              </div>
                              <span className="bg-blue-50 text-[#0284c7] border border-blue-200 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono">
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="space-y-2 border-y border-gray-200 py-3 text-[10px] text-gray-600">
                              <div className="space-y-0.5">
                                <span className="text-[7.5px] uppercase font-bold text-gray-400 block font-mono">Pickup Origin Store Node:</span>
                                <p className="font-semibold text-gray-900">{order.pickup}</p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[7.5px] uppercase font-bold text-gray-400 block font-mono">Dropoff Customer Stand:</span>
                                <p className="font-semibold text-gray-900">{order.destination}</p>
                                <p className="text-gray-500">{order.receiverName} ({order.receiverPhone})</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {needsPickup ? (
                                <button
                                  onClick={() => triggerOTP(order, 'pickup')}
                                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  Verify Pickup OTP
                                </button>
                              ) : (
                                <button
                                  onClick={() => triggerOTP(order, 'delivery')}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors animate-pulse"
                                >
                                  Verify Delivery OTP
                                </button>
                              )}

                              <button className="py-2 px-3 border border-gray-200 hover:border-gray-300 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all text-gray-600 hover:text-gray-900 bg-white">
                                <Phone className="w-3 h-3 text-[#0284c7] shrink-0" /> Call Hub
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* 3. MY WALLET & ANALYTICS (EARNINGS TAB) */}
              {activeTab === 'earnings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">Commuter Wallet & Trajectories</h3>
                      <p className="text-[9px] text-gray-500">Payout analysis, cash balances, and travel mileage charts.</p>
                    </div>
                    <button className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-1.5 px-4 rounded-lg text-[10px] uppercase tracking-wider transition-colors">
                      Withdraw to UPI
                    </button>
                  </div>

                  {/* Chart and Hotspots */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Chart Area */}
                    <div className="lg:col-span-8 bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Earnings Telemetry cycles</h4>
                        <span className="text-[8px] font-mono text-[#0284c7] font-bold">CORRIDOR CLEARANCE 7D</span>
                      </div>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={earningsData}>
                            <defs>
                              <linearGradient id="earningsMatrix" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={8} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={8} tickLine={false} />
                            <Tooltip
                              contentStyle={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                color: '#0f172a',
                                fontSize: '8px',
                              }}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#0284c7" strokeWidth={1.5} fillOpacity={1} fill="url(#earningsMatrix)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Travel Hotspots */}
                    <div className="lg:col-span-4 bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3 shadow-sm">
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-gray-500">High-demand highway hotspots</h4>
                      
                      <div className="space-y-2">
                        {travelHotspots.map((hot, i) => (
                          <div key={i} className="p-2 bg-white border border-gray-200 rounded-lg space-y-0.5 text-[10px] font-mono shadow-sm">
                            <div className="flex justify-between font-bold text-gray-900">
                              <span className="truncate max-w-[100px]">{hot.route}</span>
                              <span className="text-green-600 shrink-0">{hot.estPayout}</span>
                            </div>
                            <div className="flex justify-between text-[8px] text-gray-505">
                              <span>{hot.volume}</span>
                              <span className={`w-1 h-1 rounded-full mt-1 ${hot.heat === 'high' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>


      {/* OTP verification overlays */}
      <OTPModal
        isOpen={otpModalOpen}
        onClose={() => {
          setOtpModalOpen(false);
          setTargetOrder(null);
        }}
        onSuccess={() => {
          if (targetOrder) {
            if (otpType === 'pickup') {
              verifyPickupOTP(targetOrder.id, targetOrder.pickupOTP);
            } else {
              verifyDeliveryOTP(targetOrder.id, targetOrder.deliveryOTP);
            }
          }
        }}
        type={otpType}
        orderId={targetOrder?.id}
        expectedOTP={otpType === 'pickup' ? targetOrder?.pickupOTP : targetOrder?.deliveryOTP}
      />

      {/* Trajectory Registration Modal Overlay */}
      {trajectoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-gray-250 p-6 w-full max-w-md shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setTrajectoryModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Register Trajectory</h3>
                <p className="text-[9px] text-gray-500">Specify your route details to notify customers.</p>
              </div>
            </div>

            {trajSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h4 className="font-bold text-xs text-gray-900">Trajectory Registered!</h4>
                <p className="text-[10px] text-gray-505">Your route is now visible on the customer dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterTrajectory} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8.5px] uppercase font-bold text-gray-400 block font-mono">From (Origin Node):</label>
                    <select
                      value={trajFrom}
                      onChange={(e) => setTrajFrom(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-250 rounded-xl p-2.5 text-xs text-gray-900 focus:border-[#0284c7] focus:outline-none"
                    >
                      {villageNodes.map(node => (
                        <option key={node} value={node}>{node}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] uppercase font-bold text-gray-400 block font-mono">To (Destination Node):</label>
                    <select
                      value={trajTo}
                      onChange={(e) => setTrajTo(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-250 rounded-xl p-2.5 text-xs text-gray-900 focus:border-[#0284c7] focus:outline-none"
                    >
                      {villageNodes.map(node => (
                        <option key={node} value={node}>{node}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setTrajectoryModalOpen(false)}
                    className="flex-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-colors"
                  >
                    Publish Route
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
