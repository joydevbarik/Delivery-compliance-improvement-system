import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  PlusCircle, 
  Package, 
  CheckSquare, 
  LogOut, 
  User, 
  Layers, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

const Sidebar = ({ user, handleLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Plant Overview', icon: Activity },
    { to: '/create-order', label: 'Create Order', icon: PlusCircle },
    { to: '/inventory', label: 'Inventory Manager', icon: Package },
    { to: '/compliance', label: 'Delivery Compliance', icon: CheckSquare },
    { to: '/helpdesk', label: 'Help Desk', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 transition-colors duration-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg tata-gradient flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Layers className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-wider text-slate-800 dark:text-white uppercase font-sans">
            TATA <span className="text-blue-600 dark:text-blue-400">STEEL</span>
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Compliance System
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-l-4 border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Operational Badge */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>SYSTEM ACTIVE (Jamshedpur Yard)</span>
        </div>
      </div>

      {/* Logged in User Profile & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/60 flex flex-col space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-500 dark:text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.name || 'Tata Operator'}
            </h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">
              {user?.role || 'Plant Admin'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-200/80 dark:bg-slate-800/40 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-slate-300 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-900/60 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg text-xs font-medium transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Secure Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
