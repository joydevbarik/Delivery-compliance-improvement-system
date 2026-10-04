import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  PlusCircle, 
  ShoppingCart, 
  User, 
  Weight, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  CornerDownRight, 
  Calendar,
  Layers,
  ArrowRight,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateOrder = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    productCode: '',
    demandQuantity: ''
  });
  const [inventoryList, setInventoryList] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingInventory, setFetchingInventory] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Fetch all active products in inventory to provide select dropdown options
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await api.getInventory();
        setInventoryList(data);
      } catch (err) {
        console.error('Failed to load inventory for dropdown:', err);
      }
    };
    fetchInventory();
  }, []);

  // Monitor productCode changes to fetch inventory stock details dynamically
  useEffect(() => {
    const fetchSelectedProductInventory = async () => {
      if (!formData.productCode) {
        setSelectedInventory(null);
        return;
      }

      setFetchingInventory(true);
      try {
        const data = await api.getInventoryByProductCode(formData.productCode);
        setSelectedInventory(data);
      } catch (err) {
        // If product doesn't exist yet, we treat stock as 0
        setSelectedInventory({
          productCode: formData.productCode,
          productName: 'Custom/New Product Code',
          availableQuantity: 0
        });
      } finally {
        setFetchingInventory(false);
      }
    };

    // Debounce/Trigger lookup when product code changes
    const timer = setTimeout(() => {
      fetchSelectedProductInventory();
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.productCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductSelect = (code) => {
    setFormData(prev => ({
      ...prev,
      productCode: code
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { orderId, customerId, productCode, demandQuantity } = formData;

    if (!orderId || !customerId || !productCode || !demandQuantity) {
      setError('Please input all essential compliance order fields.');
      return;
    }

    const demand = Number(demandQuantity);
    if (isNaN(demand) || demand <= 0) {
      setError('Demand quantity must be a positive number of tons.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.createOrder({
        orderId: orderId.toUpperCase(),
        customerId: customerId.toUpperCase(),
        productCode: productCode.toUpperCase(),
        demandQuantity: demand
      });

      // Show toast first, then reveal the success screen
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setSuccessResult(result);
      // Reset form on success
      setFormData({
        orderId: '',
        customerId: '',
        productCode: '',
        demandQuantity: ''
      });
      setSelectedInventory(null);
    } catch (err) {
      setError(err.message || 'Failed to submit order. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  const resetSuccess = () => {
    setSuccessResult(null);
    setError('');
  };

  const downloadInvoice = () => {
    if (!successResult) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const order = successResult.order || {};
    const compliance = successResult.compliance || {};
    const pageW = doc.internal.pageSize.getWidth();
    const deliveryDate = compliance.expectedDeliveryDate
      ? new Date(compliance.expectedDeliveryDate).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'long', year: 'numeric'
        })
      : 'N/A';
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const isFullyComplied = compliance.status === 'Fully Complied';

    // ── Header bar ──────────────────────────────────────────────
    doc.setFillColor(15, 23, 42); // slate-950
    doc.rect(0, 0, pageW, 38, 'F');

    // Company name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('TATA STEEL', 14, 16);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Delivery Compliance Management System', 14, 22);
    doc.text('Tata Steel Limited, Jamshedpur, Jharkhand - 831001, India', 14, 27);
    doc.text('CIN: L27100JH1907PLC000001  |  GSTIN: 20AABCT1234A1ZC', 14, 32);

    // Invoice label (top-right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // blue-500
    doc.text('INVOICE', pageW - 14, 16, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Invoice Date: ${invoiceDate}`, pageW - 14, 22, { align: 'right' });
    doc.text(`Order ID: ${order.orderId || 'N/A'}`, pageW - 14, 27, { align: 'right' });

    // ── Status badge ────────────────────────────────────────────
    let badgeY = 44;
    if (isFullyComplied) {
      doc.setFillColor(6, 78, 59);   // emerald-950-ish
      doc.setDrawColor(16, 185, 129);
    } else {
      doc.setFillColor(69, 10, 10);
      doc.setDrawColor(239, 68, 68);
    }
    doc.roundedRect(14, badgeY - 5, 60, 8, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(isFullyComplied ? 52 : 252, isFullyComplied ? 211 : 165, isFullyComplied ? 153 : 165);
    doc.text(
      `STATUS: ${(compliance.status || 'N/A').toUpperCase()}`,
      44, badgeY, { align: 'center' }
    );

    // ── Bill-to section ─────────────────────────────────────────
    let y = 58;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('BILL TO:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(order.customerId || 'N/A', 14, y + 6);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Customer Reference ID', 14, y + 11);

    // ── Order details table ──────────────────────────────────────
    y = 78;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('ORDER DETAILS', 14, y);

    autoTable(doc, {
      startY: y + 3,
      head: [['Field', 'Value']],
      body: [
        ['Order ID', order.orderId || 'N/A'],
        ['Customer ID', order.customerId || 'N/A'],
        ['Product SKU / Material Code', order.productCode || 'N/A'],
        ['Demand Quantity', `${order.demandQuantity ?? 'N/A'} Metric Tons`],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
      margin: { left: 14, right: 14 },
    });

    // ── Compliance audit table ───────────────────────────────────
    const afterOrderTable = doc.lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('COMPLIANCE AUDIT RESULTS', 14, afterOrderTable);

    autoTable(doc, {
      startY: afterOrderTable + 3,
      head: [['Metric', 'Value']],
      body: [
        ['Compliance Status', compliance.status || 'N/A'],
        ['Availability at Yard', `${compliance.availableQuantity ?? 'N/A'} Metric Tons`],
        ['Complied Quantity', `${compliance.compliedQty ?? 'N/A'} Metric Tons`],
        ['Delayed / Shortage Quantity', `${compliance.delayQty ?? 0} Metric Tons`],
        ['Expected Delivery Date', deliveryDate],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
      didDrawCell: (data) => {
        // Highlight delivery date row
        if (data.section === 'body' && data.row.index === 4 && data.column.index === 1) {
          doc.setTextColor(59, 130, 246);
        }
        // Highlight compliance status
        if (data.section === 'body' && data.row.index === 0 && data.column.index === 1) {
          doc.setTextColor(isFullyComplied ? 16 : 239, isFullyComplied ? 185 : 68, isFullyComplied ? 129 : 68);
        }
      },
      margin: { left: 14, right: 14 },
    });

    // ── Notes section ────────────────────────────────────────────
    const notesY = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, notesY, pageW - 28, 22, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('TERMS & NOTES:', 18, notesY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      isFullyComplied
        ? '• Full stock available. Delivery scheduled within 2 business days of order registration.'
        : '• Partial stock available. Delivery delayed by up to 5 business days pending material resupply.',
      18, notesY + 12
    );
    doc.text(
      '• This document is system-generated and serves as an official delivery compliance invoice.',
      18, notesY + 17
    );

    // ── Footer ───────────────────────────────────────────────────
    const footerY = doc.internal.pageSize.getHeight() - 14;
    doc.setFillColor(15, 23, 42);
    doc.rect(0, footerY - 4, pageW, 18, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Tata Steel Limited — Delivery Compliance System  |  Generated: ' + new Date().toLocaleString('en-IN'),
      pageW / 2, footerY + 2,
      { align: 'center' }
    );
    doc.text(
      'This is a computer-generated document and does not require a physical signature.',
      pageW / 2, footerY + 7,
      { align: 'center' }
    );

    // ── Save ─────────────────────────────────────────────────────
    doc.save(`Invoice_${order.orderId || 'ORDER'}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Order Success Toast Notification ── */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          transform: showToast ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.95)',
          opacity: showToast ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, #052e16 0%, #064e3b 100%)',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          borderRadius: '14px',
          padding: '14px 20px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25), 0 2px 8px rgba(0,0,0,0.5)',
          minWidth: '300px',
          maxWidth: '380px',
          backdropFilter: 'blur(12px)',
          pointerEvents: showToast ? 'auto' : 'none',
        }}
        role="alert"
        aria-live="polite"
      >
        {/* Animated green tick circle */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '2px solid rgba(52, 211, 153, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          animation: showToast ? 'toastPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <polyline
              points="4,10 8,14 16,6"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: showToast ? 0 : 24,
                transition: 'stroke-dashoffset 0.45s ease 0.2s',
              }}
            />
          </svg>
        </div>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#ecfdf5', letterSpacing: '0.01em' }}>
            Order Placed Successfully!
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6ee7b7', fontWeight: 500 }}>
            Compliance audit computed instantly.
          </p>
        </div>
        {/* Progress bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, height: '3px',
          background: 'rgba(52, 211, 153, 0.3)', borderRadius: '0 0 14px 14px', width: '100%',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            borderRadius: 'inherit',
            width: showToast ? '0%' : '100%',
            transition: showToast ? 'width 3s linear' : 'none',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes toastPop {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
      {/* Page Header */}
      <div className="flex flex-col space-y-1.5 p-6 glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Register Customer Sales Order</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Enter customer demands to instantly record and calculate delivery compliance based on active stock levels.
        </p>
      </div>

      {successResult ? (
        /* Success Screen showing calculated compliance results immediately */
        <div className="glassmorphism-card rounded-2xl border border-emerald-500/30 p-8 space-y-6 relative overflow-hidden shadow-2xl shadow-emerald-500/5">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-emerald-500"></div>
          
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Order Registered & Compliance Calculated</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculations computed instantly without manual operator action.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-950/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Order Parameters
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-slate-550">ORDER ID</p>
                  <p className="text-slate-700 dark:text-slate-200 mt-0.5">{successResult.order?.orderId}</p>
                </div>
                <div>
                  <p className="text-slate-550">CUSTOMER ID</p>
                  <p className="text-slate-700 dark:text-slate-200 mt-0.5">{successResult.order?.customerId}</p>
                </div>
                <div>
                  <p className="text-slate-550">PRODUCT SKU</p>
                  <p className="text-slate-700 dark:text-slate-200 mt-0.5">{successResult.order?.productCode}</p>
                </div>
                <div>
                  <p className="text-slate-550">DEMAND QUANTITY</p>
                  <p className="text-blue-600 dark:text-blue-400 mt-0.5 font-bold">{successResult.order?.demandQuantity} tons</p>
                </div>
              </div>
            </div>

            {/* Calculated Compliance Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Calculated Compliance Audit
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-550">COMPLIANCE STATUS:</span>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-extrabold uppercase border ${
                    successResult.compliance?.status === 'Fully Complied'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                      : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450 border border-rose-200 dark:border-rose-900/30'
                  }`}>
                    {successResult.compliance?.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-550">AVAILABILITY AT YARD:</span>
                  <span className="text-slate-700 dark:text-slate-200">{successResult.compliance?.availableQuantity} tons</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-550">COMPLIED QUANTITY:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{successResult.compliance?.compliedQty} tons</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-550">DELAYED/SHORTAGE QTY:</span>
                  <span className="text-rose-700 dark:text-rose-450 font-bold">{successResult.compliance?.delayQty} tons</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold border-t border-slate-200 dark:border-slate-800 pt-2.5">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span>EXPECTED DELIVERY:</span>
                  </span>
                  <span className="text-slate-800 dark:text-slate-100 font-bold text-sm">
                    {new Date(successResult.compliance?.expectedDeliveryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={resetSuccess}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-colors text-center cursor-pointer"
            >
              Register Another Sales Order
            </button>
            <button
              onClick={downloadInvoice}
              className="flex-1 py-3 px-4 bg-emerald-950/20 dark:bg-emerald-950/40 hover:bg-emerald-900/30 dark:hover:bg-emerald-900/50 border border-emerald-500/30 dark:border-emerald-700/50 hover:border-emerald-550 dark:hover:border-emerald-600/70 text-emerald-700 dark:text-emerald-300 font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice PDF</span>
            </button>
            <Link
              to="/compliance"
              className="flex-1 py-3 px-4 tata-gradient text-white font-semibold rounded-xl text-sm transition-opacity hover:opacity-90 flex items-center justify-center space-x-2 border border-blue-500/20 text-center shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              <span>View Full Compliance Register</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Double Column Layout: Form and Real-time stock lookup next to it */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Registration Form */}
          <div className="lg:col-span-3 glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-650 dark:text-blue-400" />
              <span>Order Input Console</span>
            </h2>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start space-x-3 text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                <div className="text-sm font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  ORDER ID / SALES REFERENCE
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                    <Layers className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none transition-all duration-200"
                    placeholder="E.g., ORD-2026-099"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  CUSTOMER ID / REGISTRY
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none transition-all duration-200"
                    placeholder="E.g., CUST-MARUTI-SUZUKI"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  PRODUCT SKU / MATERIAL CODE
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                    <ShoppingCart className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none transition-all duration-200"
                    placeholder="E.g., TATA-HR-001"
                    required
                  />
                </div>
                {/* Select Quick-Pick Tags for seeded materials */}
                <div className="mt-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                    Quick-Pick Plant Materials:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {inventoryList.map((item) => (
                      <button
                        key={item.productCode}
                        type="button"
                        onClick={() => handleProductSelect(item.productCode)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                          formData.productCode.toUpperCase() === item.productCode
                            ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80'
                            : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {item.productCode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  DEMAND QUANTITY (TONS)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                    <Weight className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    name="demandQuantity"
                    value={formData.demandQuantity}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none transition-all duration-200"
                    placeholder="Quantity in metric tons"
                    min="0.1"
                    step="any"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white tata-gradient hover:opacity-90 active:scale-[0.98] transition-all duration-150 flex items-center justify-center space-x-2 border border-blue-500/30 cursor-pointer shadow-lg shadow-blue-500/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>CALCULATING COMPLIANCE...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>SUBMIT ORDER & AUDIT</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Real-time stock lookup / material checker */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-3">
                Real-Time Stock Intelligence
              </h2>
              {fetchingInventory ? (
                <div className="flex items-center justify-center py-8 space-x-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-medium">Fetching yard inventory...</span>
                </div>
              ) : selectedInventory ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PRODUCT CODE</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedInventory.productCode}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PRODUCT DESCRIPTION</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{selectedInventory.productName}</p>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AVAILABLE YARD STOCK</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                          {selectedInventory.availableQuantity} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal uppercase">tons</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visual Compliance Projection */}
                  {formData.demandQuantity && (
                    <div className="p-4 bg-slate-50/30 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5">
                        Projected Compliance Result
                      </p>
                      {Number(formData.demandQuantity) <= selectedInventory.availableQuantity ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" />
                            <span>100% FULLY COMPLIED</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Perfect balance! Available stock satisfies the demand of <strong className="text-slate-700 dark:text-slate-300">{formData.demandQuantity} tons</strong> completely. Delivery delay will be <strong>0</strong>.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
                            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                            <span>PARTIALLY COMPLIED / DELAYED</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Material shortage! Customer demands <strong className="text-slate-700 dark:text-slate-300">{formData.demandQuantity} tons</strong> but yard stock is only <strong className="text-slate-700 dark:text-slate-300">{selectedInventory.availableQuantity} tons</strong>.<br/>
                            Shortage delay: <strong className="text-rose-500 dark:text-rose-400">{(Number(formData.demandQuantity) - selectedInventory.availableQuantity).toFixed(1)} tons</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                  <CornerDownRight className="w-8 h-8 mb-2 opacity-35 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select or Input Product SKU</p>
                  <p className="text-[10px] px-4 mt-0.5"> We will fetch real-time yard inventory levels and display fulfillment expectations.</p>
                </div>
              )}
            </div>

            {/* Inventory Guidelines Card */}
            <div className="glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 text-xs text-slate-500 dark:text-slate-400 space-y-2.5">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Plant Guidelines</h4>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Orders are immediately queued for delivery matching.</li>
                <li>Fully complied orders are slated for delivery in <strong className="text-emerald-600 dark:text-emerald-400">2 days</strong>.</li>
                <li>Partially complied orders hold delivery for <strong className="text-rose-600 dark:text-rose-400">5 days</strong> to resolve material shortages.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
