import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import AIChatbot from '../components/AIChatbot';
import { 
  Package, 
  Plus, 
  Minus, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  RefreshCw,
  Edit2
} from 'lucide-react';

const YARD_ADJUST_ALLOWED = ['operator1', 'tata_operator'];

const InventoryList = ({ user }) => {
  const canAdjustYard = user && YARD_ADJUST_ALLOWED.includes(user.userId);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingCode, setUpdatingCode] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setInventory(data);
      setError('');
    } catch (err) {
      setError('Failed to download active plant inventories. Please retry.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const triggerUpdateMode = (item) => {
    setUpdatingCode(item.productCode);
    setNewStockVal(item.availableQuantity.toString());
    setUpdateMsg('');
  };

  const handleStockUpdate = async (productCode) => {
    const qty = Number(newStockVal);
    if (isNaN(qty) || qty < 0) {
      setUpdateMsg('Please input a valid quantity of tons (>= 0)');
      return;
    }

    try {
      await api.updateInventoryStock(productCode, qty);
      setUpdatingCode(null);
      setUpdateMsg('');
      // Reload inventory
      await fetchInventory();
    } catch (err) {
      setUpdateMsg(err.message || 'Failed to update stock.');
    }
  };

  const incrementDecrement = (type) => {
    const current = Number(newStockVal) || 0;
    if (type === 'inc') {
      setNewStockVal((current + 50).toString());
    } else {
      setNewStockVal(Math.max(0, current - 50).toString());
    }
  };

  // Filter Inventory based on search
  const filteredInventory = inventory.filter(item => 
    item.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8">
      {/* Header with Search and Reload button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center space-x-2">
            <Package className="w-6 h-6 text-blue-400" />
            <span>Yard Inventory Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor product availability, raw material levels, and execute emergency stock replenishments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none transition-colors"
              placeholder="Search product code/desc..."
            />
          </div>

          <button
            onClick={fetchInventory}
            className="p-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer"
            title="Refresh Yard Levels"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start space-x-3 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
            Connecting Stock Registries...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.length === 0 ? (
            <div className="col-span-full py-16 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-bold">No registered materials match your criteria</p>
              <p className="text-xs mt-1">Try verifying the product code query or refresh yard levels.</p>
            </div>
          ) : (
            filteredInventory.map((item) => (
              <div 
                key={item.productCode}
                className="glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all relative overflow-hidden"
              >
                {/* Visual low-stock alert stripe */}
                {item.availableQuantity < 200 && (
                  <div className="absolute left-0 top-0 h-full w-[4px] bg-amber-500"></div>
                )}

                {/* SKU Code & Label */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">{item.productCode}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{item.productName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    item.availableQuantity >= 200 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-500'
                  }`}>
                    {item.availableQuantity >= 200 ? 'In Stock' : 'Low Stock'}
                  </span>
                </div>

                {/* Stock progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Available Stock</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                      {item.availableQuantity} <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">tons</span>
                    </span>
                  </div>
                  {/* Safety Limit Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.availableQuantity >= 200 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (item.availableQuantity / 1000) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                    <span>Critical (0)</span>
                    <span>Safety Limit (200t)</span>
                    <span>Max Capacity (1000t)</span>
                  </div>
                </div>

                {/* Edit Stock action — visible to authorised operators only */}
                {canAdjustYard && (
                  <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 mt-auto">
                    {updatingCode === item.productCode ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => incrementDecrement('dec')}
                            className="p-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            value={newStockVal}
                            onChange={(e) => setNewStockVal(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 py-1.5 px-3 rounded-lg text-slate-800 dark:text-slate-100 text-xs font-bold text-center focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => incrementDecrement('inc')}
                            className="p-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {updateMsg && (
                          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium text-center">{updateMsg}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setUpdatingCode(null)}
                            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleStockUpdate(item.productCode)}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all border border-blue-500/20"
                          >
                            Apply Stock
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => triggerUpdateMode(item)}
                        className="w-full py-2 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Adjust Yard Stock</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      </div>

      {/* ─── AI Chatbot Widget ─── */}
      <AIChatbot context="inventory" />
    </>
  );
};

export default InventoryList;
