import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AIChatbot from '../components/AIChatbot';
import { 
  Sun, Moon, Factory, TrendingUp, Shield, Truck, 
  BarChart3, Package, CheckCircle, ArrowRight, 
  Zap, Globe, Clock, ChevronRight, Layers, Star,
  Play, RefreshCw, AlertTriangle, Activity, Database, Cpu,
  Terminal, ShieldCheck, HardHat, AlertOctagon, Info
} from 'lucide-react';

// ─── Animated Counter Component (Hoisted for React stability) ───
const AnimatedCounter = ({ target, decimals = 0, suffix = '', prefix = '', formatK = false, isVisible }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out quart for a snappy feel
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentValue = eased * target;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, target]);

  const formatValue = (val) => {
    if (formatK) {
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return Math.floor(val).toString();
    }
    return decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toString();
  };

  return <>{prefix}{formatValue(count)}{suffix}</>;
};

// ─── Animated Stats Section with IntersectionObserver ───
const AnimatedStatsSection = ({ stats, cardBg, isDark, textPrimary, textMuted }) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // only trigger once
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`py-10 px-6 border-y ${
        isDark ? 'bg-slate-900/20 border-slate-900/60' : 'bg-slate-100/60 border-slate-200'
      } relative z-10`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-105 group hover:shadow-xl ${cardBg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'} group-hover:scale-110 transition-transform`} />
                <span className="w-1.5 h-1.5 rounded-full bg-tata-orange opacity-40 group-hover:opacity-100 transition-opacity"></span>
              </div>
              <p className={`text-3xl font-black tracking-tight bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                <AnimatedCounter
                  target={stat.target}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                  prefix={stat.prefix || ''}
                  formatK={stat.formatK || false}
                  isVisible={isVisible}
                />
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${textPrimary}`}>{stat.label}</p>
              <p className={`text-[9px] mt-0.5 leading-normal ${textMuted}`}>{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  
  // Interactive Simulation Sandbox State
  const [selectedPlant, setSelectedPlant] = useState('Jamshedpur Works');
  const [selectedProduct, setSelectedProduct] = useState('Hot Rolled Coils');
  const [orderVolume, setOrderVolume] = useState(1200);
  const [inventoryStock, setInventoryStock] = useState(1500);
  const [simulationState, setSimulationState] = useState('idle'); // idle, running, complete
  const [simStep, setSimStep] = useState(0);
  const [simProgress, setSimProgress] = useState(0);
  const [simResult, setSimResult] = useState(null);

  // Live Operational Logs Console State
  const [logs, setLogs] = useState([
    { id: 1, time: '21:34:12', type: 'SYS', msg: 'Delivery Compliance System Initialized Securely' },
    { id: 2, time: '21:34:18', type: 'PLT-JMS', msg: 'Stock verification active: Slab Storage yard #3' },
    { id: 3, time: '21:34:25', type: 'AUDIT', msg: 'Real-time compliance calculation compiled for Order #2890' },
    { id: 4, time: '21:34:39', type: 'PLT-KLN', msg: 'Kalinganagar Blast Furnace telemetry feed linked' },
    { id: 5, time: '21:34:52', type: 'LOGI', msg: 'Transit fleet status checked: 48 active logistics routes' }
  ]);

  const logIndexRef = useRef(6);
  const simIntervalRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  // Cycle Live Operational Logs
  useEffect(() => {
    const mockLogs = [
      { type: 'PLT-MRM', msg: 'Meramandali rolling mill reports batch 4A completed' },
      { type: 'SYS', msg: 'Global inventory compliance status: 99.2% matching SLA' },
      { type: 'AUDIT', msg: 'Automatic shortage warning dispatched to Kalinganagar Logistical Office' },
      { type: 'SYS', msg: 'Database backup synchronized successfully (AWS Secure Gateway)' },
      { type: 'ORDER', msg: 'Incoming demand request matched with immediate stock yield' },
      { type: 'PLT-JMS', msg: 'Jamshedpur cold rolling mill reports 100% SLA compliance' },
      { type: 'LOGI', msg: 'Logistics SLA threshold buffer updated: Dispatch buffer set to +2hrs' }
    ];

    const logInterval = setInterval(() => {
      const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      setLogs(prev => [
        ...prev.slice(1), 
        { id: logIndexRef.current++, time: timeStr, type: randomLog.type, msg: randomLog.msg }
      ]);
    }, 4000);

    return () => clearInterval(logInterval);
  }, []);

  // Plant Data Configuration
  const plantConfigs = {
    'Jamshedpur Works': { 
      capacity: '12 Mtpa', 
      defaultStock: 2500, 
      defaultOrder: 2200,
      desc: 'Tata Steel\'s flagship steelmaking facility. Integrated metallurgical hub.',
      products: ['Hot Rolled Coils', 'Cold Rolled Sheets', 'Steel Slabs'],
      coordinates: { x: 120, y: 70 }
    },
    'Kalinganagar Plant': { 
      capacity: '8 Mtpa', 
      defaultStock: 1600, 
      defaultOrder: 1900,
      desc: 'Highly automated steel processing center specializing in flat and high-grade steel.',
      products: ['Hot Rolled Coils', 'Wire Rods', 'Steel Slabs'],
      coordinates: { x: 260, y: 150 }
    },
    'Meramandali Plant': { 
      capacity: '5 Mtpa', 
      defaultStock: 1100, 
      defaultOrder: 950,
      desc: 'High-speed rolling mills producing structural steel and structural wires.',
      products: ['Wire Rods', 'Cold Rolled Sheets', 'Hot Rolled Coils'],
      coordinates: { x: 80, y: 180 }
    }
  };

  const selectPlantFromMap = (plantName) => {
    setSelectedPlant(plantName);
    setInventoryStock(plantConfigs[plantName].defaultStock);
    setOrderVolume(plantConfigs[plantName].defaultOrder);
    setSelectedProduct(plantConfigs[plantName].products[0]);
    if (simulationState === 'complete') {
      setSimulationState('idle');
    }
  };

  // Run Simulation Sequence
  const runSimulation = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }

    setSimulationState('running');
    setSimProgress(0);
    setSimStep(0);
    setSimResult(null);

    const steps = [
      'Establishing secure connection to plant database nodes...',
      'Checking stockpile inventory in local storage yards...',
      'Cross-referencing active sales orders & demand volume...',
      'Computing compliance metrics & logging logistics dispatch recommendations...'
    ];

    let currentProgress = 0;
    simIntervalRef.current = setInterval(() => {
      currentProgress += 5;
      setSimProgress(currentProgress);

      if (currentProgress < 25) setSimStep(0);
      else if (currentProgress < 55) setSimStep(1);
      else if (currentProgress < 85) setSimStep(2);
      else setSimStep(3);

      if (currentProgress >= 100) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
        
        // Calculate simulation results
        const target = parseFloat(orderVolume);
        const stock = parseFloat(inventoryStock);
        const complianceScore = Math.min(100, Math.round((stock / target) * 100));
        const shortage = Math.max(0, target - stock);
        
        let statusText = 'COMPLIANT';
        let statusColor = 'emerald';
        let recommendation = '';

        if (complianceScore === 100) {
          statusText = 'FULLY COMPLIANT';
          statusColor = 'emerald';
          recommendation = `Logistics schedule approved immediately. 100% of order volume (${target} Tons) matches current yard inventory reserves. Automated dispatch manifest created.`;
        } else if (complianceScore >= 80) {
          statusText = 'PARTIALLY COMPLIANT';
          statusColor = 'amber';
          recommendation = `Operational compliance meets acceptable limits at ${complianceScore}%. Dispatching immediate stockpile of ${stock} Tons. Recommended action: Route remaining ${shortage} Tons from alternative yards to prevent delay.`;
        } else {
          statusText = 'CRITICAL STOCK SHORTAGE';
          statusColor = 'rose';
          recommendation = `Alert: Delivery compliance fails baseline thresholds at ${complianceScore}%. Critical deficit of ${shortage} Tons. Recommended action: Auto-trigger immediate replenishment ticket and alert logistics manager.`;
        }

        setSimResult({
          complianceScore,
          shortage,
          statusText,
          statusColor,
          recommendation
        });
        setSimulationState('complete');
      }
    }, 150);
  };

  const resetSimulation = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setSimulationState('idle');
    setSimProgress(0);
    setSimResult(null);
  };

  const handleHeroSimulatorClick = (e) => {
    e.preventDefault();
    
    // Scroll to the simulator panel smoothly and center it in viewport
    const element = document.getElementById('simulator-panel');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Trigger the simulation
    runSimulation();
  };

  // Base Aesthetics Configuration
  const bg = isDark ? 'bg-[#030712]' : 'bg-slate-50';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const cardBg = isDark ? 'bg-slate-900/40 border-slate-800/80 backdrop-blur-xl' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-200/40';
  const navBg = isDark ? 'bg-slate-950/80 border-slate-900' : 'bg-white/80 border-slate-200';
  const inputBg = isDark ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800';

  const stats = [
    { target: 99.2, decimals: 1, suffix: '%', label: 'Uptime Reliability', icon: Zap, desc: 'Real-time calculation availability', gradient: 'from-cyan-400 via-blue-400 to-blue-600' },
    { target: 15400, decimals: 0, suffix: '+', prefix: '', formatK: true, label: 'Orders Audited', icon: Package, desc: 'Fulfillment matches tracked', gradient: 'from-orange-400 via-pink-500 to-rose-500' },
    { target: 340, decimals: 0, suffix: '+', label: 'Plants Monitored', icon: Globe, desc: 'Across global shipping lanes', gradient: 'from-violet-400 via-purple-500 to-indigo-500' },
    { target: 2, decimals: 0, suffix: ' hrs', prefix: '< ', label: 'Average SLA Buffer', icon: Clock, desc: 'Average turnaround on alerts', gradient: 'from-emerald-400 via-teal-400 to-cyan-500' },
  ];

  const features = [
    { 
      icon: TrendingUp, title: 'Real-Time Compliance Auditing',
      desc: 'Verify order compliance and fulfillment metrics in microseconds against active customer demand and SLA guidelines.',
      color: 'blue'
    },
    { 
      icon: Package, title: 'Intelligent Inventory Bins',
      desc: 'Monitor storage yard levels dynamically. Automate threshold alerts, yard drawdown requests, and logistics reserves.',
      color: 'amber'
    },
    { 
      icon: Shield, title: 'Secure Cryptographic Logging',
      desc: 'State-of-the-art JWT access security with military-grade encryption, detailed role-based tracking, and transaction history.',
      color: 'violet'
    },
    { 
      icon: BarChart3, title: 'Advanced Analytics HUD',
      desc: 'Beautiful interactive charting showing active shortages, plant logs, predictive logistics analysis, and real-time yield reports.',
      color: 'cyan'
    },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'shadow-violet-500/10' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500 overflow-x-hidden relative`}>
      {/* ─── Cybernetic Grid & Ambient Light Orbs Background ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className={`absolute inset-0 opacity-[0.03] ${isDark ? 'opacity-[0.07]' : 'opacity-[0.03]'}`}
          style={{ 
            backgroundImage: `linear-gradient(to right, ${isDark ? '#38bdf8' : '#0369a1'} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? '#38bdf8' : '#0369a1'} 1px, transparent 1px)`,
            backgroundSize: '36px 36px' 
          }}
        ></div>
        
        {/* Ambient Glowing Orbs */}
        <div className={`absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] ${
          isDark ? 'bg-blue-500/8' : 'bg-blue-500/4'
        } animate-pulse`} style={{ animationDuration: '8s' }}></div>
        
        <div className={`absolute top-1/3 -right-20 w-[450px] h-[450px] rounded-full blur-[140px] ${
          isDark ? 'bg-amber-500/6' : 'bg-amber-500/3'
        } animate-pulse`} style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

        <div className={`absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-[120px] ${
          isDark ? 'bg-violet-500/6' : 'bg-violet-500/3'
        }`}></div>
      </div>


      {/* ─── Floating Navbar ─── */}
      <nav className={`sticky top-0 left-0 right-0 z-50 backdrop-blur-xl ${navBg} border-b transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-800 to-indigo-950 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-md font-bold tracking-tight flex items-center ${textPrimary}`}>
                TATA <span className="text-blue-500 ml-1 font-extrabold">STEEL</span>
              </h1>
              <p className={`text-[9px] font-bold uppercase tracking-[0.25em] ${textMuted}`}>Compliance Command</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Toggle Layout Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 transition-all border border-blue-500/30 shadow-lg shadow-blue-500/10 active:scale-95 flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Operator Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Command HUD Section ─── */}
      <section className="relative px-6 z-10 min-h-[calc(100vh-56px)] flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
          
          {/* Hero Content (Left 5 Cols) */}
          <div className="lg:col-span-5 text-left flex flex-col justify-center">
            
            {/* Operational Banner */}
            <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border mb-4 text-[10px] font-bold tracking-widest uppercase w-fit ${
              isDark ? 'bg-blue-950/40 border-blue-900/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              <Activity className="w-3 h-3 text-tata-orange animate-pulse" />
              <span>TATA STEEL OPERATIONS COMMAND • ACTIVE</span>
            </div>

            {/* Headline */}
            <h1 className={`text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.06] tracking-tight ${textPrimary} mb-4`}>
              Optimizing
              <br />
              <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-tata-orange bg-clip-text text-transparent">
                Delivery Compliance
              </span>
              <br />
              Through Intelligence
            </h1>

            {/* Subtext */}
            <p className={`text-sm sm:text-[0.95rem] leading-relaxed mb-5 max-w-xl ${textSecondary}`}>
              High-throughput supply chain orchestration. Cross-reference customer demand contracts against yard reserves, automate SLA margin audits, and prevent penalty-grade logistics delays instantly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
              <Link
                to="/login"
                className="group px-7 py-3.5 rounded-xl text-sm font-bold text-center text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 transition-all border border-blue-500/30 shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Layers className="w-4 h-4" />
                <span>Enter Operator Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={handleHeroSimulatorClick}
                className={`px-7 py-3.5 rounded-xl text-sm font-bold text-center border transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Play className="w-4 h-4 text-tata-orange" />
                <span>Run Compliance Simulator</span>
              </button>
            </div>

            {/* Mini Dashboard Highlight */}
            <div className="border-t border-slate-800/80 pt-4">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">J</div>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white">K</div>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-700 flex items-center justify-center text-[10px] font-bold text-white">M</div>
                </div>
                <div>
                  <p className={`text-sm font-bold ${textPrimary}`}>Integrated Plant Telemetry Linked</p>
                  <p className={`text-xs ${textMuted}`}>Jamshedpur, Kalinganagar, and Meramandali yards connected in real-time</p>
                </div>
              </div>
            </div>

          </div>

          {/* Operations Command Center Panel (Right 7 Cols) */}
          <div id="simulator-panel" className="lg:col-span-7 flex flex-col">
            <div className={`p-4 sm:p-5 rounded-2xl border ${cardBg} relative overflow-hidden shadow-2xl`}>
              
              {/* Card Header */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-tata-orange/10 border border-tata-orange/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-tata-orange" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold tracking-wide uppercase ${textPrimary}`}>
                      Live Compliance Sandbox
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">NODE ID: TS-AUDIT-39A</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${simulationState === 'running' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    {simulationState === 'running' ? 'CALCULATING' : 'READY'}
                  </span>
                </div>
              </div>

              {/* SIMULATION STATE: IDLE / CONTROL ROOM */}
              {simulationState === 'idle' && (
                <div className="space-y-4">
                  
                  {/* Grid of Map and Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* SVG MAP (5 Columns) */}
                    <div className={`md:col-span-5 flex flex-col items-center justify-center rounded-2xl p-4 relative border transition-all ${
                      isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <p className={`text-[9px] font-mono font-bold mb-3 uppercase tracking-wider text-center ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        INTERACTIVE PLANT MAP
                      </p>
                      
                      {/* Integrated Plant Map SVG */}
                      <svg viewBox="0 0 320 240" className="w-full h-auto max-w-[220px]">
                        {/* Grid Blueprint Lines */}
                        <defs>
                          <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.04)"} strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#map-grid)" rx="10"/>

                        {/* Plant Connection Lines */}
                        <line x1="120" y1="70" x2="180" y2="130" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="5,4" />
                        <line x1="260" y1="150" x2="180" y2="130" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,4" />
                        <line x1="80" y1="180" x2="180" y2="130" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="5,4" />

                        {/* Central HUB Node */}
                        <circle cx="180" cy="130" r="8" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#3b82f6" strokeWidth="2" />
                        <circle cx="180" cy="130" r="14" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />

                        {/* Plant Nodes */}
                        {/* Jamshedpur */}
                        <g className="cursor-pointer group" onClick={() => selectPlantFromMap('Jamshedpur Works')}>
                          <circle cx="120" cy="70" r="7" fill={selectedPlant === 'Jamshedpur Works' ? '#f25f22' : '#0369a1'} className="transition-colors duration-300" />
                          <circle cx="120" cy="70" r="13" fill="none" stroke={selectedPlant === 'Jamshedpur Works' ? '#f25f22' : '#0284c7'} strokeWidth="1" className={selectedPlant === 'Jamshedpur Works' ? 'opacity-60' : 'opacity-20'} />
                          <text x="120" y="52" fill={isDark ? "#ffffff" : "#0f172a"} fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none drop-shadow">JAMSHEDPUR</text>
                        </g>

                        {/* Kalinganagar */}
                        <g className="cursor-pointer group" onClick={() => selectPlantFromMap('Kalinganagar Plant')}>
                          <circle cx="260" cy="150" r="7" fill={selectedPlant === 'Kalinganagar Plant' ? '#f25f22' : '#0369a1'} className="transition-colors duration-300" />
                          <circle cx="260" cy="150" r="13" fill="none" stroke={selectedPlant === 'Kalinganagar Plant' ? '#f25f22' : '#0284c7'} strokeWidth="1" className={selectedPlant === 'Kalinganagar Plant' ? 'opacity-60' : 'opacity-20'} />
                          <text x="260" y="135" fill={isDark ? "#ffffff" : "#0f172a"} fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none drop-shadow">KALINGANAGAR</text>
                        </g>

                        {/* Meramandali */}
                        <g className="cursor-pointer group" onClick={() => selectPlantFromMap('Meramandali Plant')}>
                          <circle cx="80" cy="180" r="7" fill={selectedPlant === 'Meramandali Plant' ? '#f25f22' : '#0369a1'} className="transition-colors duration-300" />
                          <circle cx="80" cy="180" r="13" fill="none" stroke={selectedPlant === 'Meramandali Plant' ? '#f25f22' : '#0284c7'} strokeWidth="1" className={selectedPlant === 'Meramandali Plant' ? 'opacity-60' : 'opacity-20'} />
                          <text x="80" y="165" fill={isDark ? "#ffffff" : "#0f172a"} fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none drop-shadow">MERAMANDALI</text>
                        </g>
                      </svg>
                      
                      <p className={`text-[8px] mt-2 text-center ${isDark ? 'text-slate-500' : 'text-slate-655'}`}>
                        *Click nodes to select plant and sync telemetry
                      </p>
                    </div>

                    {/* SETTINGS (7 Columns) */}
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${
                          isDark ? 'text-slate-400' : 'text-blue-900/80'
                        }`}>
                          Active Target Plant
                        </label>
                        <select 
                          value={selectedPlant}
                          onChange={(e) => selectPlantFromMap(e.target.value)}
                          className={`w-full text-xs p-2.5 rounded-xl outline-none border focus:border-blue-500 font-bold transition-all ${inputBg}`}
                        >
                          <option value="Jamshedpur Works">Jamshedpur Works (12 Mtpa)</option>
                          <option value="Kalinganagar Plant">Kalinganagar Plant (8 Mtpa)</option>
                          <option value="Meramandali Plant">Meramandali Plant (5 Mtpa)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${
                            isDark ? 'text-slate-400' : 'text-blue-900/80'
                          }`}>
                            SLA Product Group
                          </label>
                          <select 
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className={`w-full text-xs p-2.5 rounded-xl border focus:border-blue-500 font-bold transition-all ${inputBg}`}
                          >
                            {plantConfigs[selectedPlant].products.map((p, idx) => (
                              <option key={idx} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className={`block text-[10px] font-black uppercase tracking-wider ${
                              isDark ? 'text-slate-400' : 'text-blue-900/80'
                            }`}>
                              Order Demand
                            </label>
                            <span className="text-[10px] font-mono text-tata-orange font-bold">{orderVolume} T</span>
                          </div>
                          <input 
                            type="number"
                            value={orderVolume}
                            onChange={(e) => setOrderVolume(Math.max(1, parseInt(e.target.value) || 0))}
                            className={`w-full text-xs p-2 rounded-xl border focus:border-blue-500 font-bold font-mono transition-all ${inputBg}`}
                            min="10"
                            max="9999"
                          />
                        </div>
                      </div>

                      {/* Inventory Tonnage Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className={`block text-[10px] font-black uppercase tracking-wider ${
                            isDark ? 'text-slate-400' : 'text-blue-900/80'
                          }`}>
                            Available Storage Stock
                          </label>
                          <span className="text-xs font-mono text-blue-500 font-extrabold">{inventoryStock} Tons</span>
                        </div>
                        <input 
                          type="range"
                          min="100"
                          max="4000"
                          step="50"
                          value={inventoryStock}
                          onChange={(e) => setInventoryStock(parseInt(e.target.value))}
                          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-colors ${
                            isDark ? 'bg-slate-800' : 'bg-slate-200'
                          }`}
                        />
                        <div className={`flex justify-between text-[8px] font-mono mt-1 ${
                          isDark ? 'text-slate-500' : 'text-slate-655'
                        }`}>
                          <span>100T (CRITICAL)</span>
                          <span>4,000T (ABUNDANT)</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Operational info bar */}
                  <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${textPrimary}`}>
                        {selectedPlant} Configuration
                      </p>
                      <p className={`text-[10px] ${textSecondary} leading-normal mt-0.5`}>
                        {plantConfigs[selectedPlant].desc} Telemetry is active. Press the audit button below to run the live calculation engine comparing demand with inventory.
                      </p>
                    </div>
                  </div>

                  {/* Run Button */}
                  <button
                    onClick={runSimulation}
                    className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 transition-all border border-blue-500/30 shadow-xl shadow-blue-500/20 active:scale-98 flex items-center justify-center space-x-2"
                  >
                    <Cpu className="w-4 h-4 text-tata-orange animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Run Real-Time Compliance Audit</span>
                  </button>

                </div>
              )}

              {/* SIMULATION STATE: RUNNING PROGRESS */}
              {simulationState === 'running' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                  
                  {/* Glowing core animation */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-tata-orange/10 border-t-tata-orange animate-spin"></div>
                    <Database className="w-7 h-7 text-blue-400 animate-pulse" />
                  </div>

                  <div className="text-center space-y-2 max-w-sm">
                    <h4 className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
                      Executing Operational Audit
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 min-h-[30px] leading-relaxed">
                      {
                        simStep === 0 ? '📡 Securing encrypted telemetry link...' :
                        simStep === 1 ? '📦 Scanning stockpiles in storage yard reserves...' :
                        simStep === 2 ? '📊 Performing SLA demand-matching matrices...' :
                        '✍️ Compiling certified compliance report coefficients...'
                      }
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-full h-3 overflow-hidden p-[1px]">
                    <div 
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-tata-orange h-full rounded-full transition-all duration-150"
                      style={{ width: `${simProgress}%` }}
                    ></div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">{simProgress}% COMPLETE</span>

                </div>
              )}

              {/* SIMULATION STATE: COMPLETE / CERTIFICATE REPORT */}
              {simulationState === 'complete' && simResult && (
                <div className="space-y-4">
                  
                  <div className={`p-5 rounded-2xl border ${
                    simResult.statusColor === 'emerald' ? 'bg-emerald-950/10 border-emerald-500/20' :
                    simResult.statusColor === 'amber' ? 'bg-amber-950/10 border-amber-500/20' :
                    'bg-rose-950/10 border-rose-500/20'
                  } flex flex-col sm:flex-row items-center gap-6`}>
                    
                    {/* SVG Radial Gauge */}
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background track circle */}
                        <circle cx="48" cy="48" r="40" stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="6" fill="transparent" />
                        {/* Foreground animated value circle */}
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke={
                            simResult.statusColor === 'emerald' ? '#10b981' :
                            simResult.statusColor === 'amber' ? '#f59e0b' : '#f43f5e'
                          } 
                          strokeWidth="7" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - simResult.complianceScore / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      {/* Inside text score */}
                      <div className="absolute text-center">
                        <span className={`text-xl font-black ${textPrimary}`}>{simResult.complianceScore}%</span>
                        <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Score</p>
                      </div>
                    </div>

                    {/* Result Texts */}
                    <div className="text-left space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${
                          simResult.statusColor === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          simResult.statusColor === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                          'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}>
                          {simResult.statusText}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">REF: #JMS-{orderVolume}T</span>
                      </div>
                      <h4 className={`text-md font-extrabold ${textPrimary}`}>
                        Compliance Analysis Complete
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        <strong>Target:</strong> {orderVolume} Tons {selectedProduct} | <strong>Current Stock:</strong> {inventoryStock} Tons
                      </p>
                    </div>

                  </div>

                  {/* Recommendations */}
                  <div className={`p-4 rounded-xl border text-left space-y-2 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>SLA COMPLIANCE RECOMMENDATIONS</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                      {simResult.recommendation}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={resetSimulation}
                      className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all active:scale-95 flex items-center justify-center space-x-1.5 ${
                        isDark 
                          ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Test New Setup</span>
                    </button>
                    <Link
                      to="/login"
                      className="py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 border border-blue-500/30 transition-all active:scale-95 flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-500/10"
                    >
                      <span>Authorize Log Dispatch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ─── Core Capabilities Section ─── */}
      <section className="py-12 px-6 z-10 relative">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-8 space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-200 text-slate-600'
            }`}>
              SYSTEM PARAMETERS
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
              Built for Heavy-Industry Operations
            </h2>
            <p className={`max-w-xl mx-auto text-sm ${textSecondary}`}>
              Engineered to support heavy logistic demands, plant matching, and automated threshold forecasting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat, i) => {
              const c = colorMap[feat.color];
              return (
                <div 
                  key={i}
                  className={`group p-6 rounded-2xl border transition-all duration-500 cursor-default relative overflow-hidden ${cardBg} hover:scale-[1.02] hover:shadow-2xl hover:border-slate-700/80`}
                >
                  {/* Subtle top indicator border */}
                  <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r transition-transform duration-500 scale-x-0 group-hover:scale-x-100 ${
                    feat.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                    feat.color === 'amber' ? 'from-amber-500 to-tata-orange' :
                    feat.color === 'violet' ? 'from-violet-500 to-fuchsia-500' :
                    'from-cyan-500 to-blue-500'
                  }`}></div>
                  
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feat.icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <h3 className={`text-md font-bold mb-2 ${textPrimary}`}>{feat.title}</h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${textSecondary}`}>{feat.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── Animated Statistics Row ─── */}
      <AnimatedStatsSection stats={stats} cardBg={cardBg} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} />

      {/* ─── How It Works / Processing Pipeline ─── */}
      <section className="py-12 px-6 z-10 relative">
        <div className="max-w-5xl mx-auto text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${
            isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-200 text-slate-600'
          }`}>
            PIPELINE FLOW
          </span>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-8 ${textPrimary}`}>
            How Compliance Auditing Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Visual connector lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-blue-500/20 via-indigo-500/40 to-tata-orange/20 -translate-y-8 z-0"></div>

            {[
              { step: '01', title: 'Register Demand', desc: 'SLA contracts are logged in the active system with volume constraints.', icon: Truck, border: 'border-blue-500/20' },
              { step: '02', title: 'Match Real-Time Storage', desc: 'System automatically fetches yard stockpiles from plant telemetry nodes.', icon: Package, border: 'border-indigo-500/20' },
              { step: '03', title: 'Compile Compliance', desc: 'Fulfillment ratings, deficits, and auto-dispatch logs are compiled instantly.', icon: CheckCircle, border: 'border-tata-orange/20' },
            ].map((item, i) => (
              <div 
                key={i} 
                className={`group p-6 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl relative z-10 ${cardBg} hover:border-slate-700/80`}
              >
                <span className={`absolute top-4 right-4 text-5xl font-black font-mono tracking-tighter ${isDark ? 'text-slate-850 opacity-15' : 'text-slate-200'} group-hover:text-tata-orange/15 transition-colors`}>
                  {item.step}
                </span>
                
                <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-slate-950/40 border ${item.border} group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-6 h-6 ${isDark ? 'text-slate-350' : 'text-slate-700'}`} />
                </div>
                
                <h3 className={`text-md font-bold mb-2 ${textPrimary}`}>{item.title}</h3>
                <p className={`text-xs leading-relaxed ${textSecondary}`}>{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Secure Access CTA Banner ─── */}
      <section className="py-10 px-6 z-10 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-8 sm:p-10 rounded-3xl border relative overflow-hidden ${
            isDark ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-2xl'
          }`}>
            {/* Glowing background highlights inside card */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-tata-orange/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              
              <div className="flex justify-center space-x-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
                Secure Compliance Control Node
              </h2>
              
              <p className={`max-w-lg mx-auto text-xs sm:text-sm leading-relaxed ${textSecondary}`}>
                Authorize delivery schedules, view historical compliance audits, manage live stockpiles, and review audit certificates dynamically.
              </p>

              <div className="flex justify-center">
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 transition-all border border-blue-500/30 shadow-xl shadow-blue-500/20 active:scale-95 flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Operations Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className={`py-6 px-6 border-t z-10 relative ${
        isDark ? 'border-slate-900 bg-slate-950/70' : 'border-slate-200 bg-slate-100/50'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
              <Factory className={`w-4 h-4 text-blue-500`} />
            </div>
            <div>
              <p className={`text-xs font-extrabold tracking-wide uppercase ${textPrimary}`}>
                TATA <span className="text-blue-500">STEEL</span>
              </p>
              <p className={`text-[8px] uppercase tracking-wider ${textMuted}`}>Delivery Compliance Operations</p>
            </div>
          </div>
          
          <p className={`text-[10px] ${textMuted} font-mono max-w-md leading-normal md:text-right`}>
            © 2026 Tata Steel Limited. All Rights Reserved. Confidential Industrial System telemetry. 
            Access is log-monitored. ISO 9001/27001 Certified System Operations.
          </p>

        </div>
      </footer>

      {/* ─── AI Chatbot Widget ─── */}
      <AIChatbot context="landing" />
    </div>
  );
};

export default LandingPage;
