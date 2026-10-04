import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import AIChatbot from '../components/AIChatbot';
import { 
  CheckSquare, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Play, 
  Loader2,
  ListFilter,
  CheckCircle,
  Truck,
  HelpCircle
} from 'lucide-react';

const ComplianceList = ({ user }) => {
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [recalculatingId, setRecalculatingId] = useState(null);

  // Only tata_operator (Aditya Sen) and operator1 (Rajesh Kumar) can trigger Re-Audit
  const canReaudit = user?.userId === 'tata_operator' || user?.userId === 'operator1';

  const fetchCompliance = async () => {
    setLoading(true);
    try {
      const data = await api.getCompliance();
      setComplianceRecords(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch delivery compliance records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  const handleRecalculate = async (orderId) => {
    setRecalculatingId(orderId);
    try {
      const updatedRecord = await api.calculateCompliance(orderId);
      // Map and replace inside our local state
      setComplianceRecords(prev => 
        prev.map(rec => rec.orderId === orderId ? updatedRecord : rec)
      );
      setError('');
    } catch (err) {
      setError(`Recalculation error for ${orderId}: ${err.message}`);
    } finally {
      setRecalculatingId(null);
    }
  };

  // Search and Filter records
  const filteredRecords = complianceRecords.filter(rec => {
    const matchesSearch = 
      rec.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.productCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'COMPLIED' && rec.status === 'Fully Complied') ||
      (statusFilter === 'DELAYED' && rec.status === 'Partially Complied / Delayed');

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const total = complianceRecords.length;
  const complied = complianceRecords.filter(r => r.status === 'Fully Complied').length;
  const delayed = total - complied;
  const complianceRate = total > 0 ? ((complied / total) * 100).toFixed(1) : '0.0';

  return (
    <>
      <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-blue-400" />
            <span>Delivery Compliance Result Register</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit register comparing customer order demand with yard inventory to determine compliance status and delivery timelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none transition-colors"
              placeholder="Search ID/Client/SKU..."
            />
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2">
            <ListFilter className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-300 py-2 pr-6 text-xs focus:outline-none cursor-pointer font-semibold"
            >
              <option value="ALL" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-300">All Statuses</option>
              <option value="COMPLIED" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-300">Fully Complied</option>
              <option value="DELAYED" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-300">Delayed</option>
            </select>
          </div>

          <button
            onClick={fetchCompliance}
            className="p-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer"
            title="Refresh Audit Register"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start space-x-3 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glassmorphism-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Fulfillment Ratio</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{complianceRate}%</p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
            %
          </span>
        </div>

        <div className="glassmorphism-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fully Complied Orders</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{complied} / {total}</p>
          </div>
          <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="glassmorphism-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delayed Shortage Queues</p>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{delayed} / {total}</p>
          </div>
          <Clock className="w-5 h-5 text-rose-605 dark:text-rose-400" />
        </div>
      </div>

      {/* Main compliance details Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-slate-550 dark:text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
            Fetching Delivery Calculations...
          </p>
        </div>
      ) : (
        <div className="glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-4">Client ID</th>
                  <th className="py-4 px-4">Product SKU</th>
                  <th className="py-4 px-4 text-right">Demand</th>
                  <th className="py-4 px-4 text-right">Yard Stock</th>
                  <th className="py-4 px-4 text-right">Complied</th>
                  <th className="py-4 px-4 text-right">Shortage</th>
                  <th className="py-4 px-4 text-center">Status Badge</th>
                  <th className="py-4 px-6">Delivery Promise</th>
                  {canReaudit && (
                    <th className="py-4 px-6 text-center">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-16 text-center text-slate-500">
                      <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-bold">No calculated compliance logs match filters</p>
                      <p className="text-[11px] mt-1">Submit new orders or check other status criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr 
                      key={rec.orderId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-white tracking-wide">
                        {rec.orderId}
                      </td>
                      <td className="py-4 px-4 text-slate-550 dark:text-slate-400">
                        {rec.customerId}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-800 dark:text-slate-200">
                        {rec.productCode}
                      </td>
                      <td className="py-4 px-4 text-right text-blue-600 dark:text-blue-400 font-bold">
                        {rec.demandQuantity} t
                      </td>
                      <td className="py-4 px-4 text-right text-slate-500 dark:text-slate-400">
                        {rec.availableQuantity} t
                      </td>
                      <td className="py-4 px-4 text-right text-emerald-705 dark:text-emerald-400">
                        {rec.compliedQty} t
                      </td>
                      <td className="py-4 px-4 text-right text-rose-650 dark:text-rose-400 font-bold">
                        {rec.delayQty} t
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span 
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                            rec.status === 'Fully Complied'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
                              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
                          }`}
                        >
                          {rec.status === 'Fully Complied' ? 'Fully Complied' : 'Delayed'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                          <span>{new Date(rec.expectedDeliveryDate).toLocaleDateString()}</span>
                        </span>
                      </td>
                      {canReaudit && (
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleRecalculate(rec.orderId)}
                            disabled={recalculatingId === rec.orderId}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-lg flex items-center space-x-1.5 mx-auto transition-colors text-[10px] font-bold cursor-pointer disabled:opacity-50"
                            title="Trigger manual compliance audit recalculation"
                          >
                            {recalculatingId === rec.orderId ? (
                              <Loader2 className="w-3 h-3 animate-spin text-white" />
                            ) : (
                              <Play className="w-3 h-3 text-blue-500 dark:text-blue-400 fill-blue-500 dark:fill-blue-400" />
                            )}
                            <span>Re-Audit</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-950 px-6 py-4 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800 font-bold">
            <span className="uppercase">REGISTER STATUS: VERIFIED BY AUDIT SHELL</span>
            <span className="uppercase">Showing {filteredRecords.length} of {complianceRecords.length} orders</span>
          </div>
        </div>
      )}
      </div>

      {/* ─── AI Chatbot Widget ─── */}
      <AIChatbot context="compliance" />
    </>
  );
};

export default ComplianceList;
