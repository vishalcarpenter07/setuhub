import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RouteCanvas } from './components/RouteCanvas';
import { LandingPage } from './pages/LandingPage';

// Pages
import { Auth } from './pages/Auth';
import { ShopkeeperDashboard } from './pages/ShopkeeperDashboard';
import { PartnerDashboard } from './pages/PartnerDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { TrackingPage } from './pages/TrackingPage';
import { WhatsAppIntegration } from './pages/WhatsAppIntegration';

const AppContent: React.FC = () => {
  const { currentScreen, userRole } = useApp();
  const { theme, setTheme } = useTheme();
  
  // Dashboard internal active tabs
  const [activeTab, setActiveTab] = useState('overview');

  // Align active tab with the dashboard role when screen transitions
  useEffect(() => {
    if (currentScreen === 'shopkeeper') {
      setActiveTab('overview');
    } else if (currentScreen === 'partner') {
      setActiveTab('available');
    } else if (currentScreen === 'customer') {
      setActiveTab('customer-track');
    } else if (currentScreen === 'admin') {
      setActiveTab('admin-analytics');
    }
  }, [currentScreen, userRole]);

  // Reset window scroll position to top when transitioning screens
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [currentScreen]);

  // Decides whether the layout needs a sidebar (meaning it is a dashboard workspace)
  const isDashboardMode = ['shopkeeper', 'partner', 'customer', 'admin'].includes(currentScreen);

  // Reset theme to light if exiting dashboard mode (user console)
  useEffect(() => {
    if (!isDashboardMode && theme !== 'light') {
      setTheme('light');
    }
  }, [isDashboardMode, theme]);

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage />;
      case 'login':
      case 'register':
        return <Auth />;
      case 'tracking':
        return <TrackingPage />;
      case 'whatsapp':
        return <WhatsAppIntegration />;
      
      // Dashboards
      case 'shopkeeper':
        return <ShopkeeperDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'partner':
        return <PartnerDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'customer':
        return <CustomerDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'admin':
        return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      {/* Hidden Matrix Theme Global Grid backdrop */}
      {theme === 'matrix' && <RouteCanvas fullScreen />}

      {/* Main Header - only displayed when not on landing hero page and not in a dashboard role */}
      {currentScreen !== 'landing' && !isDashboardMode && <Navbar />}

      {/* Body Viewport */}
      {isDashboardMode ? (
        <div className="flex-1 flex flex-col relative z-10 pb-28 bg-bgApp">
          {renderActiveScreen()}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      ) : (
        <main className="flex-1 relative z-10">
          {renderActiveScreen()}
        </main>
      )}

      {/* Small floating theme switch button (down to left side) - only displayed when logged in */}
      {isDashboardMode && (
        <button
          onClick={() => setTheme(theme === 'midnight' ? 'light' : 'midnight')}
          className="fixed bottom-14 left-4 z-40 p-2.5 rounded-full bg-cardBg border border-cardBorder text-fgApp hover:text-primaryApp transition-all shadow-lg flex items-center justify-center cursor-pointer backdrop-blur-md"
          title={theme === 'midnight' ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {theme === 'midnight' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>
      )}

      {/* Mini Simulator Indicator overlay */}
      <div className="fixed bottom-4 left-4 z-40 bg-cardBg border border-cardBorder py-1.5 px-3 rounded-full flex items-center gap-2 text-[10px] text-mutedApp backdrop-blur-md shadow-lg select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-primaryApp animate-pulse" />
        <span>Demo: <strong>Setu Hub Sandbox</strong></span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
