import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { 
  ShieldCheck, Lock, User, AlertCircle, Loader2, Factory, 
  Sun, Moon, ArrowLeft, Phone, Mail, Building2, UserPlus, LogIn, Layers, Eye, EyeOff,
  Cpu, Activity, Radio, Terminal, Database, Shield, Zap
} from 'lucide-react';

// Compact high-tech input field
const TechInputField = ({ 
  icon: Icon, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  id, 
  name, 
  autoComplete, 
  required = true,
  isDark
}) => {
  const labelColor = isDark ? 'text-cyan-400/90' : 'text-blue-700';
  const borderGlow = isDark 
    ? 'border-slate-800 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20' 
    : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10';
  const inputBg = isDark 
    ? 'bg-slate-950/90 text-white placeholder-slate-700' 
    : 'bg-white text-slate-900 placeholder-slate-400';
  const iconColor = isDark ? 'text-cyan-500' : 'text-blue-600';

  return (
    <div className="space-y-1 group relative">
      <label htmlFor={id} className={`block text-[9px] font-bold uppercase tracking-wider transition-colors group-focus-within:text-cyan-400 ${labelColor}`}>
        {label}
      </label>
      
      <div className="relative">
        <span className={`absolute inset-y-0 left-0 pl-3 flex items-center transition-colors group-focus-within:text-cyan-400 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </span>
        <input 
          id={id}
          name={name}
          type={type} 
          value={value} 
          onChange={onChange} 
          required={required}
          autoComplete={autoComplete}
          className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs focus:outline-none transition-all duration-300 ${borderGlow} ${inputBg}`}
          placeholder={placeholder} 
        />
      </div>
    </div>
  );
};

const Login = ({ setAuth }) => {
  const { isDark, toggleTheme } = useTheme();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Operations');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [cpuUsage, setCpuUsage] = useState(48);
  const [millSpeed, setMillSpeed] = useState(1.6);
  const navigate = useNavigate();

  // Simulated telemetry logger updates
  useEffect(() => {
    const logs = [
      'SYS_INIT: Decrypting Handshake Session [secure-gateway-5]',
      'SECURE_NET: SSL Handshake validated over TLS 1.3 (256-bit)',
      'DB_POINTER: Connecting to Tata-Warehouse-Central...',
      'COMP_ENG: Compliance engine validated (v2.4.1)',
      'MILL_YARD: Hot Strip Mill stock counts retrieved successfully'
    ];
    setTelemetryLogs(logs);

    const interval = setInterval(() => {
      const liveEvents = [
        'TELEMETRY: Active yard volume depth checked: 5,480 MT',
        'COMP_ENG: Order dispatch scans finalized: 100% compliant',
        'CORE_TEMP: Mill furnace cooling levels within tolerance [32°C]',
        'SECURE: Session audit keys successfully rotated',
        'SYS_DB: Synced with Jamshedpur Mainframe'
      ];
      const randomEvent = liveEvents[Math.floor(Math.random() * liveEvents.length)];
      setTelemetryLogs(prev => [randomEvent, ...prev.slice(0, 4)]);
      
      setCpuUsage(Math.floor(40 + Math.random() * 20));
      setMillSpeed(parseFloat((1.4 + Math.random() * 0.4).toFixed(2)));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) { 
      setError('Please fill in all fields.'); 
      return; 
    }
    setLoading(true); 
    setError('');
    try {
      const data = await api.login(userId, password);
      localStorage.setItem('tata_compliance_token', data.token);
      localStorage.setItem('tata_compliance_user', JSON.stringify({ userId: data.userId, name: data.name, role: data.role }));
      setAuth(data.token, data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Access Denied: Invalid Credentials.');
    } finally { 
      setLoading(false); 
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regUserId || !regPassword || !regPhone) {
      setError('Name, User ID, Password, and Phone Number are required.'); 
      return;
    }
    if (regPassword.length < 6) { 
      setError('Password must be at least 6 characters.'); 
      return; 
    }
    setLoading(true); 
    setError(''); 
    setRegSuccess('');
    try {
      await api.register({ 
        name: regName, 
        userId: regUserId, 
        password: regPassword, 
        phone: regPhone, 
        email: regEmail, 
        department: regDepartment 
      });
      setRegSuccess(`Account "${regUserId}" generated. Redirecting...`);
      setTimeout(() => {
        setMode('login');
        setUserId(regUserId);
        setRegSuccess('');
        setRegName(''); 
        setRegUserId(''); 
        setRegPassword(''); 
        setRegPhone(''); 
        setRegEmail(''); 
        setRegDepartment('Operations');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally { 
      setLoading(false); 
    }
  };

  const fillCredentials = (user, pass) => {
    setUserId(user);
    setPassword(pass);
    setError('');
  };

  const switchMode = (newMode) => { 
    setMode(newMode); 
    setError(''); 
    setRegSuccess(''); 
  };

  // Theme variable bindings
  const dashboardBg = isDark 
    ? 'bg-[#02050d] text-slate-100' 
    : 'bg-[#f4f7fa] text-slate-900';
  
  const techCardBg = isDark 
    ? 'bg-[#050b18]/80 border-cyan-500/20 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.12)]' 
    : 'bg-white border-blue-500/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.06)]';
  
  const headerBg = isDark 
    ? 'bg-slate-950/70 border-slate-900 text-white' 
    : 'bg-white border-slate-200 text-slate-900';

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const textCyan = isDark ? 'text-cyan-400' : 'text-blue-600';
  const textMuted = isDark ? 'text-slate-600' : 'text-slate-400';
  const iconColor = isDark ? 'text-cyan-400' : 'text-blue-600';

  return (
    <div className={`h-screen w-screen relative flex flex-col justify-between ${dashboardBg} transition-colors duration-500 overflow-hidden font-sans p-4 select-none`}>
      
      {/* 1. FUTURISTIC SCANNING GRID BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-15%] left-[-15%] w-[45%] h-[45%] rounded-full blur-[140px] opacity-20 ${isDark ? 'bg-cyan-500' : 'bg-blue-300'}`} />
        <div className={`absolute bottom-[-15%] right-[-15%] w-[45%] h-[45%] rounded-full blur-[140px] opacity-15 ${isDark ? 'bg-indigo-600' : 'bg-indigo-300'}`} />
        
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{ 
            backgroundImage: `linear-gradient(to right, ${isDark ? '#06b6d4' : '#2563eb'} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? '#06b6d4' : '#2563eb'} 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }}
        />

        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent top-0 animate-scanner" 
             style={{ 
               animation: 'scanner 8s linear infinite',
               boxShadow: '0 0 8px rgba(6,182,212,0.4)'
             }} 
        />
      </div>

      {/* 2. COMPACT SYSTEM HEADER BAR */}
      <header className={`relative z-10 w-full h-12 flex items-center justify-between px-4 py-2 border rounded-xl backdrop-blur-md ${headerBg} flex-shrink-0 mb-3`}>
        <div className="flex items-center space-x-3">
          <Link 
            to="/" 
            className={`flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-300 pointer-events-auto ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800 text-cyan-400 hover:text-white hover:border-cyan-500/40 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                : 'bg-slate-50 border-slate-200 text-blue-700 hover:text-blue-900 hover:border-blue-500/40'
            }`}
          >
            <ArrowLeft className="w-3 h-3" />
            <span>PORTAL</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-800/80" />
          <div className="flex items-center space-x-2">
            <div className={`w-6.5 h-6.5 rounded flex items-center justify-center border ${isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-blue-50 border-blue-200'}`}>
              <Factory className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-700'}`} />
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>TATA STEEL</span>
              <span className={`text-[8px] uppercase font-bold tracking-widest ml-2 px-1.5 py-0.5 rounded border ${
                isDark 
                  ? 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20' 
                  : 'text-blue-700 bg-blue-50 border-blue-200'
              }`}>OPERATIONS CONTROL HUB</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[8px] text-emerald-400 font-mono font-bold tracking-widest">GATEWAY_ACTIVE</span>
          </div>
          <button 
            onClick={toggleTheme} 
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-cyan-500/40' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-blue-500/40'
            }`}
            aria-label="Toggle system interface light/dark"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 3. THREE-COLUMN SCROLL-FREE MAIN SECTION */}
      <main className="relative z-10 w-full flex-1 flex flex-col lg:flex-row gap-4 items-stretch overflow-hidden mb-3">
        
        {/* COLUMN A: COMPACT LEFT HUD (DIAGNOSTICS & SYSTEM VALUES) */}
        <div className="hidden lg:flex lg:w-[28%] flex-col gap-4 justify-between h-full">
          
          {/* Card A1: Core Main Diagnostics */}
          <div className={`p-4 rounded-xl border backdrop-blur-xl flex flex-col justify-between flex-1 relative overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-slate-950/65 border-cyan-500/10' : 'bg-white border-blue-500/15'
          }`}>
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/40" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/40" />
            
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>
                <Cpu className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-700'}`} />
                <span>CORE MAIN DIAGNOSTICS</span>
              </div>
              <span className={`text-[7px] font-mono font-bold tracking-widest ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>SYS_OK</span>
            </div>

            <div className="space-y-2 mt-2">
              <div>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">CPU COMPUTATIONAL LOAD</span>
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-xl font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{cpuUsage}%</span>
                    <span className="text-[8px] text-emerald-400 font-bold font-mono">▲ OK</span>
                  </div>
                  {/* Visual bar */}
                  <div className={`w-full rounded-full h-1 mt-1 overflow-hidden ${isDark ? 'bg-slate-950/80' : 'bg-slate-200'}`}>
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1 transition-all duration-500" style={{ width: `${cpuUsage}%` }}></div>
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">BUFFER CRYPTO</span>
                  <span className={`text-xs font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>AES_256</span>
                </div>
                <div>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">HANDSHAKE</span>
                  <span className={`text-[9px] font-mono leading-none ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>SHA-512 V2</span>
                </div>
              </div>
            </div>

            {/* Reactive SVG wave */}
            <div className="w-full h-6 overflow-hidden relative mt-2">
              <svg className="w-full h-full opacity-40" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path 
                  d={`M0,10 Q15,${5 + Math.sin(cpuUsage)*3} 30,10 T60,10 T90,10 L100,10`} 
                  fill="none" 
                  stroke={isDark ? '#06b6d4' : '#2563eb'} 
                  strokeWidth="1" 
                  strokeDasharray="2 1"
                  className="animate-wave"
                />
              </svg>
            </div>
          </div>

          {/* Card A2: Hot Strip Yard Metrics */}
          <div className={`p-4 rounded-xl border backdrop-blur-xl flex flex-col justify-between flex-1 relative overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-slate-950/65 border-cyan-500/10' : 'bg-white border-blue-500/15'
          }`}>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500/40" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500/40" />

            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                <Activity className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`} />
                <span>HOT STRIP METRICS</span>
              </div>
              <span className="text-[7px] text-emerald-400 font-mono font-bold tracking-widest flex items-center space-x-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping mr-1"></span>LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">ROLL SPEED</span>
                <div className="flex items-baseline space-x-0.5">
                  <span className={`text-xl font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{millSpeed}</span>
                  <span className={`text-[8px] font-bold font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>M/M</span>
                </div>
              </div>

              <div>
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">COMPLIANCE YIELD</span>
                <span className="text-xl font-black font-mono text-emerald-400 block">94.2%</span>
              </div>
            </div>

            {/* Circular active stock depth monitor */}
            <div className={`mt-2 flex items-center space-x-3 p-2.5 rounded-lg border ${isDark ? 'bg-slate-950/50 border-slate-900/60' : 'bg-slate-50 border-slate-200'}`}>
              <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                  <path className={isDark ? 'text-slate-800' : 'text-slate-200'} strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={isDark ? 'text-cyan-500' : 'text-blue-600'} strokeWidth="2.5" strokeDasharray="78, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <Database className={`w-3.5 h-3.5 absolute ${isDark ? 'text-cyan-400' : 'text-blue-700'}`} />
              </div>
              <div className="leading-tight">
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">YARD STEEL STOCK</span>
                <span className={`text-[10px] font-bold font-mono ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>5,480 MT Reserves</span>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN B: THE CENTRAL HIGH-TECH SECURITY ACCESS HATCH (THE MAIN CARD) */}
        <div className="w-full lg:w-[44%] flex flex-col justify-between h-full gap-4">
          
          <div className={`rounded-2xl border p-6 backdrop-blur-2xl flex-1 flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${techCardBg}`}>
            
            {/* Corner Bracket Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500" />
            
            {/* Top Scanning Line Overlay */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

            {/* Top Mini Security Clearance Info */}
            <div className="flex items-center justify-between text-[8px] font-mono font-bold tracking-widest text-slate-500 select-none pb-2 border-b border-slate-900/40 flex-shrink-0">
              <span className="flex items-center space-x-1">
                <Shield className={`w-3 h-3 animate-pulse ${isDark ? 'text-cyan-500' : 'text-blue-600'}`} />
                <span>RESTRICTED_ACCESS</span>
              </span>
              <span>SEC_CLEARANCE_LVL_4</span>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="my-2 p-3 rounded-lg flex items-start space-x-2 animate-shake bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex-shrink-0">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <div className="font-semibold">{error}</div>
              </div>
            )}

            {regSuccess && (
              <div className="my-2 p-3 rounded-lg flex items-start space-x-2 bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex-shrink-0">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <div className="font-semibold">{regSuccess}</div>
              </div>
            )}

            {/* Central Form Container */}
            <div className="flex-1 flex flex-col justify-center my-auto overflow-y-auto max-h-[360px] lg:max-h-none pr-1 scrollbar-thin">
              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Operator ID or Email input */}
                  <TechInputField 
                    id="userId"
                    name="username"
                    icon={User} 
                    label="OPERATOR ACCESS KEY (USER ID / EMAIL)" 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)} 
                    placeholder="Enter operator ID or corporate email" 
                    autoComplete="username"
                    isDark={isDark}
                  />

                  {/* Password input with scan ocular toggle */}
                  <div className="space-y-1 group relative">
                    <label htmlFor="password" className={`block text-[9px] font-bold uppercase tracking-wider transition-colors group-focus-within:text-cyan-400 ${
                      isDark ? 'text-cyan-400/90' : 'text-blue-700'
                    }`}>
                      ACCESS AUTHORIZATION KEYWORD
                    </label>
                    
                    <div className="relative">
                      <span className={`absolute inset-y-0 left-0 pl-3 flex items-center transition-colors group-focus-within:text-cyan-400 ${iconColor}`}>
                        <Lock className="w-4 h-4" />
                      </span>
                      <input 
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        autoComplete="current-password"
                        className={`w-full pl-9 pr-10 py-2 border rounded-lg text-xs focus:outline-none transition-all duration-300 ${
                          isDark 
                            ? 'bg-slate-950/90 border-slate-800 text-white placeholder-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                        }`}
                        placeholder="••••••••••••" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${iconColor} hover:text-cyan-400 cursor-pointer`}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* High-tech Action Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-white tata-gradient hover:opacity-95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 border border-cyan-500/30 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>VERIFYING ACCESS PATH...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 text-cyan-300 mr-2" />
                        <span>INITIATE OPERATOR SESSION</span>
                      </>
                    )}
                  </button>

                  {/* QUICK-ACCESS TESTING CREDENTIALS */}
                  <div className="pt-3 border-t border-slate-900/40 space-y-2">
                    <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-500 select-none">
                      <span>SECURE TESTING ACCESS TOKENS</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded font-mono ${
                        isDark 
                          ? 'text-cyan-400 bg-cyan-500/5 border border-cyan-500/20' 
                          : 'text-blue-700 bg-blue-50 border border-blue-200'
                      }`}>SEEDED</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fillCredentials('tata_operator', 'password123')}
                        className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                          isDark 
                            ? 'bg-slate-950 border-slate-900 text-slate-300 hover:bg-[#0a142c] hover:border-cyan-500/50 hover:text-cyan-400' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-blue-500/50'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ADMIN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillCredentials('operator1', 'password123')}
                        className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                          isDark 
                            ? 'bg-slate-950 border-slate-900 text-slate-300 hover:bg-[#0a142c] hover:border-cyan-500/50 hover:text-cyan-400' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-blue-500/50'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>PLANNER</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-2">
                  {/* Two Column Input Grid for scroll-free optimization */}
                  <div className="grid grid-cols-2 gap-2">
                    <TechInputField 
                      id="regName"
                      name="name"
                      icon={User} 
                      label="OPERATOR FULL NAME" 
                      value={regName} 
                      onChange={(e) => setRegName(e.target.value)} 
                      placeholder="e.g. Priya Sharma" 
                      autoComplete="name"
                      isDark={isDark}
                    />

                    <TechInputField 
                      id="regUserId"
                      name="username"
                      icon={Layers} 
                      label="SYSTEM USER ID KEY" 
                      value={regUserId} 
                      onChange={(e) => setRegUserId(e.target.value)} 
                      placeholder="e.g. priya_sharma" 
                      autoComplete="username"
                      isDark={isDark}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 group relative">
                      <label htmlFor="regPassword" className={`block text-[9px] font-bold uppercase tracking-wider transition-colors group-focus-within:text-cyan-400 ${
                        isDark ? 'text-cyan-400/90' : 'text-blue-700'
                      }`}>
                        ACCESS PASS (MIN 6)
                      </label>
                      <div className="relative">
                        <span className={`absolute inset-y-0 left-0 pl-3 flex items-center transition-colors group-focus-within:text-cyan-400 ${iconColor}`}>
                          <Lock className="w-4 h-4" />
                        </span>
                        <input 
                          id="regPassword"
                          name="new-password"
                          type={showPassword ? 'text' : 'password'} 
                          value={regPassword} 
                          onChange={(e) => setRegPassword(e.target.value)} 
                          required 
                          minLength={6}
                          autoComplete="new-password"
                          className={`w-full pl-9 pr-8 py-2 border rounded-lg text-xs focus:outline-none transition-all duration-300 ${
                            isDark 
                              ? 'bg-slate-950/90 border-slate-800 text-white placeholder-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20' 
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1'
                          }`}
                          placeholder="Passcode" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute inset-y-0 right-0 pr-2.5 flex items-center transition-colors ${iconColor} hover:text-cyan-400 cursor-pointer`}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <TechInputField 
                      id="regPhone"
                      name="tel"
                      icon={Phone} 
                      label="PHONE NUMBER" 
                      value={regPhone} 
                      onChange={(e) => setRegPhone(e.target.value)} 
                      placeholder="+91-XXXXXXXXXX" 
                      autoComplete="tel"
                      isDark={isDark}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <TechInputField 
                      id="regEmail"
                      name="email"
                      icon={Mail} 
                      label="CORPORATE EMAIL (OPT)" 
                      value={regEmail} 
                      onChange={(e) => setRegEmail(e.target.value)} 
                      placeholder="name@tatasteel.com" 
                      required={false}
                      autoComplete="email"
                      isDark={isDark}
                    />

                    <div className="space-y-1">
                      <label htmlFor="regDepartment" className={`block text-[9px] font-bold uppercase tracking-wider ${
                        isDark ? 'text-cyan-400/90' : 'text-blue-700'
                      }`}>
                        OPERATIONS DEPARTMENT
                      </label>
                      <div className="relative">
                        <span className={`absolute inset-y-0 left-0 pl-3 flex items-center ${iconColor}`}>
                          <Building2 className="w-4 h-4" />
                        </span>
                        <select 
                          id="regDepartment"
                          value={regDepartment} 
                          onChange={(e) => setRegDepartment(e.target.value)}
                          className={`w-full pl-9 pr-8 py-2 border rounded-lg text-xs focus:outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-cyan-500/20 ${
                            isDark 
                              ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500' 
                              : 'bg-white border-slate-300 text-slate-950 focus:border-blue-600'
                          }`}
                        >
                          <option value="Operations">Operations</option>
                          <option value="Supply Chain">Supply Chain</option>
                          <option value="Quality Assurance">Quality</option>
                          <option value="Logistics">Logistics</option>
                          <option value="Production">Production</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-500">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 px-4 mt-2 rounded-lg font-black text-[10px] uppercase tracking-widest text-white tata-gradient hover:opacity-95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 border border-cyan-500/30 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>BUILDING ACCESS KEY...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-cyan-300 mr-2" />
                        <span>REGISTER ACCESS KEY</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Card Footer toggle links */}
            <div className={`mt-3 pt-3 border-t text-center flex-shrink-0 ${isDark ? 'border-slate-900/40' : 'border-slate-200'}`}>
              {mode === 'login' ? (
                <p className={`text-[9px] ${textSecondary} font-semibold uppercase tracking-wider`}>
                  No active operator key ID?{' '}
                  <button 
                    onClick={() => switchMode('register')} 
                    className={`font-black cursor-pointer transition-colors ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-700 hover:text-blue-800'}`}
                  >
                    REGISTER KEY HERE
                  </button>
                </p>
              ) : (
                <p className={`text-[9px] ${textSecondary} font-semibold uppercase tracking-wider`}>
                  Operator key ID already verified?{' '}
                  <button 
                    onClick={() => switchMode('login')} 
                    className={`font-black cursor-pointer transition-colors ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-700 hover:text-blue-800'}`}
                  >
                    SIGN IN SECURELY
                  </button>
                </p>
              )}
            </div>

          </div>

        </div>

        {/* COLUMN C: FULL-HEIGHT TELEMETRY LOGGER PANEL (RIGHT HUD) */}
        <div className="hidden lg:flex lg:w-[28%] flex-col h-full">
          
          <div className={`p-4 rounded-xl border backdrop-blur-xl flex-1 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-slate-950/65 border-cyan-500/10' : 'bg-white border-blue-500/15'
          }`}>
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/40" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/40" />

            <div className="flex items-center justify-between border-b border-slate-900/40 pb-2">
              <div className={`flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-cyan-400/90' : 'text-blue-700'}`}>
                <Terminal className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-700'}`} />
                <span>TERMINAL LOG MONITOR</span>
              </div>
              <span className={`text-[7px] font-mono tracking-widest ${isDark ? 'text-cyan-400/70' : 'text-blue-600'}`}>TLS_1.3</span>
            </div>

            {/* Expanded scrolling content */}
            <div className="font-mono text-[9px] leading-relaxed space-y-2 mt-3 flex-1 overflow-hidden pr-1 select-text">
              {telemetryLogs.map((log, index) => {
                let colorClass = isDark ? 'text-slate-400' : 'text-slate-600';
                if (log.startsWith('SYS_INIT') || log.startsWith('TELEMETRY')) {
                  colorClass = isDark ? 'text-cyan-400 font-semibold' : 'text-blue-700 font-semibold';
                } else if (log.startsWith('SECURE') || log.startsWith('SUCCESS')) {
                  colorClass = isDark ? 'text-emerald-400 font-semibold' : 'text-emerald-700 font-semibold';
                } else if (log.startsWith('DB_POINTER')) {
                  colorClass = isDark ? 'text-indigo-400' : 'text-indigo-700';
                }
                
                return (
                  <div key={index} className="flex items-start">
                    <span className={`${isDark ? 'text-slate-700' : 'text-slate-400'} select-none mr-2 font-bold`}>[{10 - index}]</span>
                    <span className={`break-all ${colorClass}`}>{log}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 mt-2 border-t border-slate-900/40 flex items-center justify-between text-[7px] text-slate-500 font-mono tracking-widest flex-shrink-0">
              <span>MAINFRAME: JSR_NODE_1</span>
              <span>SECURED</span>
            </div>
          </div>

        </div>

      </main>

      {/* 4. SLEEK COMPACT PORTAL FOOTER */}
      <footer className="relative z-10 w-full h-5 flex items-center justify-between text-[8px] text-slate-600 font-mono tracking-wider flex-shrink-0 border-t border-slate-900/45 pt-1.5 px-4 select-none">
        <span>© 2026 TATA STEEL LIMITED. CO-OPERATIVE DIVISION.</span>
        <span>ACCESS IS SECURED BY ENTERPRISE PRIVACY POLICY (PROTOCOL 742-A)</span>
      </footer>

    </div>
  );
};

export default Login;
