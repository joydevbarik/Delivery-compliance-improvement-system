import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  Package2, 
  TrendingDown, 
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  Factory
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    compliance: [],
    inventory: [],
    orders: []
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [compRes, invRes, ordRes] = await Promise.all([
          api.getCompliance(),
          api.getInventory(),
          api.getOrders()
        ]);

        setData({
          compliance: compRes,
          inventory: invRes,
          orders: ordRes
        });
      } catch (err) {
        setError('Failed to fetch plant metrics. Please ensure API service is live.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
          Syncing Real-time Plant Analytics...
        </p>
      </div>
    );
  }

  // Calculate Metrics
  const totalOrders = data.compliance.length;
  const compliedOrdersCount = data.compliance.filter(c => c.status === 'Fully Complied').length;
  const complianceRate = totalOrders > 0 ? ((compliedOrdersCount / totalOrders) * 100).toFixed(1) : 0;
  
  const totalStockVolume = data.inventory.reduce((acc, curr) => acc + curr.availableQuantity, 0).toFixed(1);
  const totalShortageQty = data.compliance.reduce((acc, curr) => acc + curr.delayQty, 0).toFixed(1);

  const lowStockMaterials = data.inventory.filter(i => i.availableQuantity < 200);
  const recentCompliance = data.compliance.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Factory className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Jamshedpur Hot-Strip Mill Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Visualizing customer demand fulfillment compliance metrics and plant stock levels.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-semibold self-start md:self-auto">
          <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>OPERATIONAL DATE: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Compliance Card */}
        <div className="glassmorphism-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Delivery Compliance Rate
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                {complianceRate}%
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-200 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${complianceRate}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Target benchmark: <span className="text-emerald-600 dark:text-emerald-400 font-bold">95.0%</span> | Current standard
            </p>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="glassmorphism-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Total Orders Processed
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                {totalOrders}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="text-blue-600 dark:text-blue-400 font-bold">{compliedOrdersCount}</span> fully complied, <span className="text-rose-600 dark:text-rose-400 font-bold">{totalOrders - compliedOrdersCount}</span> delayed
          </p>
        </div>

        {/* Shortages Card */}
        <div className="glassmorphism-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Active Supply Shortage
              </p>
              <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-500 mt-1">
                {totalShortageQty} <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">tons</span>
              </h3>
            </div>
            <div className={`p-3 rounded-xl border transition-colors ${Number(totalShortageQty) > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
              {Number(totalShortageQty) > 0 ? <AlertTriangle className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {Number(totalShortageQty) > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">Immediate supply redistribution required</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">All customer orders satisfied</span>
            )}
          </p>
        </div>

        {/* Inventory Volume Card */}
        <div className="glassmorphism-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Overall Yard Inventory
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                {totalStockVolume} <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">tons</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400">
              <Package2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Across <span className="text-violet-600 dark:text-violet-400 font-bold">{data.inventory.length}</span> registered plant steel SKU lines
          </p>
        </div>
      </div>

      {/* Main Grid: Compliance Timeline & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Compliance Audit Timeline */}
        <div className="lg:col-span-2 glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Compliance Appraisals</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time status feed of computed customer order audits.</p>
            </div>
            <Link 
              to="/compliance" 
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center space-x-1 transition-colors"
            >
              <span>View Audit Register</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {recentCompliance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                <CheckCircle className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-semibold">No recent compliance entries found.</p>
                <p className="text-xs">Create a new customer order to trigger calculations.</p>
              </div>
            ) : (
              recentCompliance.map((comp) => (
                <div 
                  key={comp.orderId}
                  className="p-4 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{comp.orderId}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{comp.customerId}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Product: <strong className="text-slate-700 dark:text-slate-300">{comp.productCode}</strong></span>
                      <span>Demand: <strong className="text-slate-700 dark:text-slate-300">{comp.demandQuantity} tons</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">EXPECTED DELIVERY</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                        <span>{new Date(comp.expectedDeliveryDate).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <span 
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-center border ${
                        comp.status === 'Fully Complied'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450 border border-rose-200 dark:border-rose-900/30'
                      }`}
                    >
                      {comp.status === 'Fully Complied' ? 'Fully Complied' : 'Delayed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock alerts & Inventory status */}
        <div className="glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <span>Inventory Threshold Monitor</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Materials flagging below safety levels (&lt; 200 tons).</p>
          </div>

          <div className="flex-1 space-y-4">
            {lowStockMaterials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center h-full">
                <CheckCircle className="w-10 h-10 mb-2 text-emerald-500 opacity-60" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Stock Levels Stable</p>
                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">All yard raw materials are above structural reserve levels.</p>
              </div>
            ) : (
              lowStockMaterials.map((mat) => (
                <div 
                  key={mat.productCode} 
                  className="p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{mat.productCode}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{mat.productName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                      Low Stock
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>Reserve Levels</span>
                      <span className="text-amber-600 dark:text-amber-500">{mat.availableQuantity} / 1000 tons</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-1.5 rounded-full" 
                        style={{ width: `${(mat.availableQuantity / 1000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link 
            to="/inventory"
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-center rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Launch Stock Replenisher</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
