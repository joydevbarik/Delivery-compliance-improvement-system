import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import CreateOrder from './pages/CreateOrder';
import InventoryList from './pages/InventoryList';
import ComplianceList from './pages/ComplianceList';
import HelpDesk from './pages/HelpDesk';
import { ShieldCheck, Loader2, Sun, Moon } from 'lucide-react';

const AppContent = () => {
  const { isDark, toggleTheme } = useTheme();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('tata_compliance_token');
    const storedUser = localStorage.getItem('tata_compliance_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const setAuth = (newToken, authUser) => {
    setToken(newToken);
    setUser(authUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('tata_compliance_token');
    localStorage.removeItem('tata_compliance_user');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b15] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <span className="text-xs font-bold tracking-widest uppercase">Initializing Secure Terminal...</span>
      </div>
    );
  }

  const isAuthenticated = !!token;

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login setAuth={setAuth} />
        }
      />

      {/* Private Dashboard Shell Routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b15] flex transition-colors duration-300">
              <Sidebar user={user} handleLogout={handleLogout} />
              <main className="flex-1 ml-64 min-h-screen p-8 lg:p-10 text-slate-800 dark:text-slate-100 overflow-y-auto transition-colors duration-300">
                <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <span>Operator:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{user?.name}</strong>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>OPERATIONAL (JWT VERIFIED)</span>
                      </span>
                    </div>
                    
                    {/* Compact Right Header Theme Toggle */}
                    <button
                      onClick={toggleTheme}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-amber-400 transition-all cursor-pointer shadow-sm"
                      title={isDark ? "Switch to Light Mode" : "Switch to Night Mode"}
                      aria-label="Toggle Theme"
                    >
                      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </header>
                <Routes>
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/create-order" element={<CreateOrder />} />
                  <Route path="/inventory" element={<InventoryList user={user} />} />
                  <Route path="/compliance" element={<ComplianceList user={user} />} />
                  <Route path="/helpdesk" element={<HelpDesk user={user} />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;
