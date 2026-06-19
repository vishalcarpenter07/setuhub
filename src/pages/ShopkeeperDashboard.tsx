import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Truck,
  ArrowRight,
  ArrowLeft,
  Search,
  Activity,
  Compass,
  Sparkles,
  Home,
  Layers,
  ListTodo,
  ClipboardCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Order } from '../context/AppContext';
import { OTPModal } from '../components/OTPModal';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import { Logo } from '../components/Logo';

interface ShopkeeperDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ShopkeeperDashboard: React.FC<ShopkeeperDashboardProps> = ({ activeTab, setActiveTab }) => {
  const { orders, createOrder, verifyPickupOTP, setScreen } = useApp();
  const [formStep, setFormStep] = useState(1);

  // New Order Form States
  const [pickup, setPickup] = useState('Bhopal Hub Node');
  const [destination, setDestination] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('Small (under 1 kg)');
  const [instructions, setInstructions] = useState('');

  // Selected order for tracking path highlight
  const [trackingOrderId, setTrackingOrderId] = useState<string>('SH-2931');

  // Matching simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [matchedPartner, setMatchedPartner] = useState<any>(null);

  // OTP Verification modal state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  const shopkeeperOrders = orders;

  // Calculate quick stats
  const activeCount = shopkeeperOrders.filter((o) => ['matched', 'picked_up', 'in_transit', 'near_destination'].includes(o.status)).length;
  const completedCount = shopkeeperOrders.filter((o) => o.status === 'delivered').length;
  const pendingCount = shopkeeperOrders.filter((o) => o.status === 'pending').length;
  const totalSpend = shopkeeperOrders.reduce((acc, curr) => acc + curr.reward, 0);
  const estimatedSavings = Math.floor(totalSpend * 0.4);

  // Default trackable order fallback
  useEffect(() => {
    if (shopkeeperOrders.length > 0 && !shopkeeperOrders.find(o => o.id === trackingOrderId)) {
      setTrackingOrderId(shopkeeperOrders[0].id);
    }
  }, [shopkeeperOrders]);

  // Village nodes available in simulation
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

  // Run matching simulation on entering step 5
  useEffect(() => {
    if (formStep === 5) {
      setIsSimulating(true);
      setSimulationProgress(0);
      setMatchedPartner(null);

      const interval = setInterval(() => {
        setSimulationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsSimulating(false);
            setMatchedPartner({
              name: 'Vikram Singh',
              rating: '★ 4.95',
              route: `${pickup.split(' ')[0]} ➔ ${destination.split(' ')[0]} corridor`,
              eta: '18 mins away'
            });
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [formStep]);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !receiverName || !receiverPhone || !category) return;

    const simulatedDistance = Math.floor(Math.random() * 40) + 12;
    const simulatedReward = simulatedDistance * 9;

    createOrder({
      pickup,
      destination,
      receiverName,
      receiverPhone,
      category,
      size,
      instructions,
      reward: simulatedReward,
      distance: simulatedDistance,
    });

    // Reset Form
    setDestination('');
    setReceiverName('');
    setReceiverPhone('');
    setCategory('');
    setSize('Small (under 1 kg)');
    setInstructions('');
    setFormStep(1);
    setMatchedPartner(null);
  };

  const openPickupOTP = (order: Order) => {
    setVerifyingOrder(order);
    setOtpModalOpen(true);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono">BROADCASTING</span>;
      case 'matched':
        return <span className="bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono">MATCHED</span>;
      case 'picked_up':
        return <span className="bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono">SECURED</span>;
      case 'in_transit':
        return <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono">IN TRANSIT</span>;
      case 'near_destination':
        return <span className="bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono">ARRIVING</span>;
      case 'delivered':
        return <span className="bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono">DELIVERED</span>;
    }
  };

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
                  S
                </div>
                <span className="text-[10px] text-gray-800 font-semibold truncate">Shopkeeper</span>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5">
                {[
                  { id: 'overview', label: 'Live Routes', icon: Compass },
                  { id: 'create', label: 'Dispatch Cargo', icon: Layers },
                  { id: 'track', label: 'Active Transit', icon: ListTodo },
                  { id: 'history', label: 'Route Ledger', icon: ClipboardCheck }
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
              <div className="truncate">Shopkeeper Node</div>
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
                  <h2 className="text-sm font-semibold text-gray-900">Vijay Kirana Store</h2>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveTab('create')}
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Match Route</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
              {[
                { label: 'DELIVERED', value: '62', sub: 'Parcels completed' },
                { label: 'CORRIDORS', value: '12', sub: 'Highway routes' },
                { label: 'PENDING', value: '412', sub: 'Available orders' },
                { label: 'SAVINGS', value: `₹${estimatedSavings.toLocaleString()}`, sub: 'Direct payout pool' }
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
              {/* 1. MERCHANT COMMAND CONSOLE (OVERVIEW) */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">Merchant Command Center</h3>
                      <p className="text-[9px] text-gray-500">Live telemetry map and corridor status indicators.</p>
                    </div>
                    <span className="text-[8px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                      GATEWAY: SONAGIR-02 // SYSTEM ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Centerpiece: Dynamic Route Map */}
                    <div className="lg:col-span-8 flex flex-col justify-between">
                      <div className="flex-1 min-h-[300px] relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50">
                        <InteractiveRouteMap
                          mode="mission-control"
                          activeOrders={shopkeeperOrders}
                        />
                      </div>
                    </div>

                    {/* Right Pane: Command metrics & Logs */}
                    <div className="lg:col-span-4 flex flex-col gap-4 justify-between">
                      {/* List Metrics Stack */}
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3 shadow-sm">
                        <h4 className="text-[9px] font-bold uppercase tracking-wider text-gray-500">System Yield Parameters</h4>
                        
                        <div className="space-y-2 text-[10px]">
                          <div className="flex justify-between items-center py-1 border-b border-gray-200">
                            <span className="text-gray-600">Active Transit Parcels</span>
                            <strong className="text-gray-900 font-mono">{activeCount}</strong>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-200">
                            <span className="text-gray-600">Completed Dropoffs</span>
                            <strong className="text-green-600 font-mono">{completedCount}</strong>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-200">
                            <span className="text-gray-600">Broadcast Match Queue</span>
                            <strong className="text-yellow-600 font-mono">{pendingCount}</strong>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600">Platform Yield Savings</span>
                            <strong className="text-[#0284c7] font-mono">₹{estimatedSavings.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Console Logs Ticker */}
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex-1 space-y-2 shadow-sm">
                        <div className="flex items-center gap-1.5 pb-1.5 border-b border-gray-200 text-[9px] font-bold text-gray-700">
                          <Activity className="w-3.5 h-3.5 text-[#0284c7] animate-pulse" />
                          <span>Ingestion telemetry logs</span>
                        </div>
                        <div className="space-y-1.5 font-mono text-[8px] text-gray-500 max-h-[120px] overflow-y-auto">
                          <p className="flex items-start gap-1"><span className="text-[#0284c7] font-bold">➔</span> <span>[17:21:02] Routing matched: SH-2931 assigned to Commuter Vikram Singh.</span></p>
                          <p className="flex items-start gap-1"><span className="text-[#0284c7] font-bold">➔</span> <span>[17:15:33] Payout release: ₹220 credited to Vikram Singh wallet for SH-1024.</span></p>
                          <p className="flex items-start gap-1"><span className="text-[#0284c7] font-bold">➔</span> <span>[16:55:01] Cryptographic lock: OTP handshake verified at Sonagir depot gate.</span></p>
                          <p className="flex items-start gap-1"><span className="text-[#0284c7] font-bold">➔</span> <span>[16:42:19] Cargo request: Agrawal Sweets from Sehore to Bhopal Hub.</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. GUIDED ORDER CREATION WIZARD (MAP-BASED WORKFLOW) */}
              {activeTab === 'create' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-900">Guided Route Dispatch Console</h3>
                    <p className="text-[9px] text-gray-500">Enter origin and destination stops. The route network highlights active trajectories live.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Left/Center: Guided Flow Interactive Map */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <div className="flex-1 min-h-[320px] relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50">
                        <InteractiveRouteMap
                          mode="guided-flow"
                          highlightedRoute={{ pickup, destination }}
                        />
                      </div>
                    </div>

                    {/* Right: Steps form container */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl h-full flex flex-col justify-between shadow-sm">
                        {/* Stage Indicators */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest font-mono">Stage {formStep} of 5</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <div
                                key={s}
                                className={`w-4 h-1 rounded-full transition-all duration-300 ${
                                  formStep >= s ? 'bg-gray-900' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <form onSubmit={handleCreateOrder} className="flex-1 flex flex-col justify-between">
                          <AnimatePresence mode="wait">
                            {/* STEP 1: Pickup Selection */}
                            {formStep === 1 && (
                              <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-3"
                              >
                                <div>
                                  <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mb-1 font-mono">
                                    Select Dispatch Origin Node
                                  </label>
                                  <select
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    className="w-full bg-white rounded-xl border border-gray-300 py-2.5 px-3 text-xs focus:border-[#0284c7] focus:outline-none transition-all cursor-pointer font-semibold text-gray-900"
                                  >
                                    {villageNodes.map((n) => (
                                      <option key={n} value={n}>{n}</option>
                                    ))}
                                  </select>
                                </div>
                                <p className="text-[9px] text-gray-500 leading-relaxed">
                                  Choosing the pickup node pins your storefront coordinates. Available commuters nearby will be matched.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setFormStep(2)}
                                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                                >
                                  Next: Destination coordinates <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </motion.div>
                            )}

                            {/* STEP 2: Destination Selection */}
                            {formStep === 2 && (
                              <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-3"
                              >
                                <div>
                                  <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mb-1 font-mono">
                                    Select Dropoff Destination Node
                                  </label>
                                  <select
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full bg-white rounded-xl border border-gray-300 py-2.5 px-3 text-xs focus:border-[#0284c7] focus:outline-none transition-all cursor-pointer font-semibold text-gray-900"
                                  >
                                    <option value="">Select target stand...</option>
                                    {villageNodes.filter(n => n !== pickup).map((n) => (
                                      <option key={n} value={n}>{n}</option>
                                    ))}
                                  </select>
                                </div>
                                {destination && (
                                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-[9px] text-blue-700 font-mono">
                                    📍 Route: {pickup.replace(' Node','')} ➔ {destination.replace(' Node','')} corridor active.
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setFormStep(1)}
                                    className="flex-1 py-2.5 border border-gray-300 hover:border-gray-400 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1.5 transition-all bg-white"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFormStep(3)}
                                    disabled={!destination}
                                    className="flex-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                  >
                                    Cargo Details <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            )}

                            {/* STEP 3: Cargo Details */}
                            {formStep === 3 && (
                              <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-3"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mb-1 font-mono">
                                      Category type
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Medicines, Sweets, Spares"
                                      value={category}
                                      onChange={(e) => setCategory(e.target.value)}
                                      className="w-full bg-white rounded-xl border border-gray-300 py-2 px-3 text-xs focus:border-[#0284c7] focus:outline-none transition-all text-gray-900"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mb-1 font-mono">
                                      Parcel weight
                                    </label>
                                    <select
                                      value={size}
                                      onChange={(e) => setSize(e.target.value)}
                                      className="w-full bg-white rounded-xl border border-gray-300 py-2 px-3 text-xs focus:border-[#0284c7] focus:outline-none transition-all text-gray-900 font-semibold"
                                    >
                                      <option>Small (under 1 kg)</option>
                                      <option>Medium (1 - 5 kg)</option>
                                      <option>Heavy (5 - 15 kg)</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mb-1 font-mono">
                                    Handling Notes
                                  </label>
                                  <textarea
                                    rows={2}
                                    placeholder="Fragile spare parts, keep dry..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="w-full bg-white rounded-xl border border-gray-300 py-2 px-3 text-xs focus:border-[#0284c7] focus:outline-none transition-all resize-none text-gray-900"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setFormStep(2)}
                                    className="flex-1 py-2.5 border border-gray-300 hover:border-gray-400 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1.5 transition-all bg-white"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFormStep(4)}
                                    disabled={!category}
                                    className="flex-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                  >
                                    Customer Custodian <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            )}

                            {/* STEP 4: Receiver Details */}
                            {formStep === 4 && (
                              <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-3"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mb-1 font-mono">
                                      Receiver Full Name
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Aarav Sharma"
                                      value={receiverName}
                                      onChange={(e) => setReceiverName(e.target.value)}
                                      className="w-full bg-white rounded-xl border border-gray-300 py-2 px-3 text-xs focus:border-[#0284c7] focus:outline-none transition-all text-gray-900"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mb-1 font-mono">
                                      Receiver Mobile Contact
                                    </label>
                                    <input
                                      type="tel"
                                      required
                                      placeholder="+91 XXXXX XXXXX"
                                      value={receiverPhone}
                                      onChange={(e) => setReceiverPhone(e.target.value)}
                                      className="w-full bg-white rounded-xl border border-gray-300 py-2 px-3 text-xs focus:border-[#0284c7] focus:outline-none transition-all text-gray-900"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setFormStep(3)}
                                    className="flex-1 py-2.5 border border-gray-300 hover:border-gray-400 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1.5 transition-all bg-white"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFormStep(5)}
                                    disabled={!receiverName || !receiverPhone}
                                    className="flex-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                  >
                                    Corridor matching <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            )}

                            {/* STEP 5: Correlation Radar scan */}
                            {formStep === 5 && (
                              <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-3"
                              >
                                {isSimulating ? (
                                  <div className="text-center py-4 space-y-3 flex flex-col items-center justify-center">
                                    <div className="relative w-10 h-10">
                                      <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
                                      <div className="absolute inset-0 rounded-full border-2 border-gray-950 border-t-transparent animate-spin" />
                                    </div>
                                    <h4 className="font-bold text-[10px] tracking-wide text-gray-800">Scanning overlapping trajectories...</h4>
                                    <div className="w-32 bg-gray-200 h-1 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gray-950 transition-all duration-300"
                                        style={{ width: `${simulationProgress}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="p-2.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                      <div>
                                        <h5 className="font-bold text-[10px] text-green-700">Overlap Commuter Identified!</h5>
                                        <p className="text-[9px] text-gray-500 leading-relaxed font-sans">
                                          Found matching highway traveler scheduled to depart.
                                        </p>
                                      </div>
                                    </div>

                                    {matchedPartner && (
                                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl space-y-1.5 text-[10px] font-mono shadow-sm">
                                        <div className="flex justify-between items-center">
                                          <span className="font-bold text-gray-900">{matchedPartner.name}</span>
                                          <span className="text-[#0284c7] font-black">{matchedPartner.rating}</span>
                                        </div>
                                        <p className="text-[9px] text-gray-550 flex items-center gap-1">
                                          <Compass className="w-3 h-3 text-[#0284c7] shrink-0" />
                                          <span>Route: {matchedPartner.route}</span>
                                        </p>
                                        <p className="text-[9px] text-gray-550">
                                          ETA to storefront: <strong className="text-gray-900">{matchedPartner.eta}</strong>
                                        </p>
                                      </div>
                                    )}

                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setFormStep(4)}
                                        className="flex-1 py-2.5 border border-gray-300 hover:border-gray-400 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1.5 transition-all bg-white"
                                      >
                                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                                      </button>
                                      <button
                                        type="submit"
                                        onClick={handleCreateOrder}
                                        className="flex-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                                      >
                                        Approve Dispatch Route
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ACTIVE TRANSIT MAP & DETAIL (TRACKING TAB) */}
              {activeTab === 'track' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-900">Active Transit Telemetry</h3>
                    <p className="text-[9px] text-gray-500">Trace selected package routes, current traveler position, and input secure custody OTP handshakes.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Centerpiece map */}
                    <div className="lg:col-span-8 flex flex-col justify-between">
                      <div className="flex-1 min-h-[320px] relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50">
                        <InteractiveRouteMap
                          mode="journey-tracking"
                          activeOrders={shopkeeperOrders}
                          selectedOrderId={trackingOrderId}
                        />
                      </div>
                    </div>

                    {/* Right: Active orders list */}
                    <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex-1 flex flex-col gap-3 overflow-hidden shadow-sm">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Active Package Ledger</h4>
                        
                        <div className="space-y-2.5 overflow-y-auto max-h-[260px] pr-1">
                          {shopkeeperOrders
                            .filter((o) => o.status !== 'delivered')
                            .map((order) => {
                              const isSelected = order.id === trackingOrderId;
                              return (
                                <div
                                  key={order.id}
                                  onClick={() => setTrackingOrderId(order.id)}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer text-[10px] space-y-2 ${
                                    isSelected
                                      ? 'border-[#0284c7] bg-[#0284c7]/5 text-gray-900 font-bold'
                                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-650 hover:text-gray-900 shadow-sm'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-mono text-[#0284c7] font-black">{order.id}</span>
                                    {getStatusBadge(order.status)}
                                  </div>
                                  
                                  <div className="space-y-0.5 text-[9.5px]">
                                    <p className="truncate font-semibold text-gray-900">{order.category}</p>
                                    <p className="truncate text-gray-500">To: {order.destination.split(',')[0]}</p>
                                  </div>

                                  <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                                    <div>
                                      <p className="text-[8px] text-gray-400">Payout</p>
                                      <strong className="text-green-600">₹{order.reward}</strong>
                                    </div>

                                    {order.status === 'matched' ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openPickupOTP(order);
                                        }}
                                        className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-1 px-2.5 rounded text-[8px] uppercase tracking-wider transition-colors"
                                      >
                                        Enter Pickup OTP
                                      </button>
                                    ) : order.status === 'pending' ? (
                                      <span className="text-[8px] font-semibold italic text-yellow-600 animate-pulse">Broadcasting...</span>
                                    ) : (
                                      <div className="text-right">
                                        <span className="text-[7px] uppercase text-gray-400 block font-mono">DELIVERY OTP:</span>
                                        <span className="text-[9px] font-bold font-mono text-gray-800">{order.deliveryOTP}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                          {shopkeeperOrders.filter((o) => o.status !== 'delivered').length === 0 && (
                            <div className="text-center py-8">
                              <Truck className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                              <p className="text-[10px] text-gray-500 font-semibold">No active shipments in transit.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TRANSACTION HISTORY TAB */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-200 gap-3">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">Ledger Archive</h3>
                      <p className="text-[9px] text-gray-500">Cryptographic log of all successfully finalized commute handovers.</p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search category, destination..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg py-1.5 pl-8 pr-3 text-[10px] focus:border-[#0284c7] focus:outline-none w-48 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[10px] select-text">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50 text-[8px] font-black uppercase text-gray-500 tracking-widest font-mono">
                            <th className="p-3">Cargo ID</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Dropoff Stop</th>
                            <th className="p-3">Receiver Name</th>
                            <th className="p-3">Commuter Partner</th>
                            <th className="p-3">Settle Reward</th>
                            <th className="p-3">Ledger Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 font-medium text-gray-700">
                          {shopkeeperOrders
                            .filter((o) => {
                              if (searchTerm) {
                                return (
                                  o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  o.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  o.destination.toLowerCase().includes(searchTerm.toLowerCase())
                                );
                              }
                              return true;
                            })
                            .map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-3 font-bold text-[#0284c7] font-mono">{order.id}</td>
                                <td className="p-3 font-semibold text-gray-900">{order.category}</td>
                                <td className="p-3 max-w-[120px] truncate text-gray-500">{order.destination.split(',')[0]}</td>
                                <td className="p-3 text-gray-650">{order.receiverName}</td>
                                <td className="p-3 text-gray-500">{order.partnerName || 'N/A'}</td>
                                <td className="p-3 font-bold text-green-600 font-mono">₹{order.reward}</td>
                                <td className="p-3">{getStatusBadge(order.status)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>


      {/* Reusable OTP Verification Modal */}
      <OTPModal
        isOpen={otpModalOpen}
        onClose={() => {
          setOtpModalOpen(false);
          setVerifyingOrder(null);
        }}
        onSuccess={() => {
          if (verifyingOrder) {
            verifyPickupOTP(verifyingOrder.id, verifyingOrder.pickupOTP);
          }
        }}
        type="pickup"
        orderId={verifyingOrder?.id}
        expectedOTP={verifyingOrder?.pickupOTP}
      />
    </div>
  );
};
