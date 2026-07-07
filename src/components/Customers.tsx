import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Sparkles, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Smile, 
  X, 
  Send, 
  RefreshCw,
  Copy,
  CheckCircle,
  ShoppingBag,
  Award,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { fetchCustomers, generateCustomerReminder, fetchSales } from '../lib/api';
import { Customer, Sale } from '../types';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'ACTIVE' | 'INACTIVE'>('All');

  // Unified Profile & Engagement Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSales, setCustomerSales] = useState<Sale[]>([]);
  const [reminderText, setReminderText] = useState('');
  const [reminderLoading, setReminderLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersData, salesData] = await Promise.all([
        fetchCustomers(),
        fetchSales()
      ]);
      setCustomers(customersData);
      setSales(salesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenProfile = (c: Customer) => {
    setSelectedCustomer(c);
    // Filter sales history for this customer
    const filteredSales = sales.filter(s => s.customerId === c.id || s.customerName.toLowerCase() === c.name.toLowerCase());
    setCustomerSales(filteredSales);
    setReminderText('');
    setSent(false);
    setCopied(false);
    setProfileModalOpen(true);
  };

  const handleTriggerReminder = async () => {
    if (!selectedCustomer) return;
    setReminderLoading(true);
    setSent(false);
    setCopied(false);

    try {
      const text = await generateCustomerReminder(selectedCustomer.id);
      setReminderText(text);
    } catch (err) {
      console.error(err);
      setReminderText('Failed to generate automatic message. Please check server connections.');
    } finally {
      setReminderLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reminderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSimulated = () => {
    setSent(true);
    setTimeout(() => {
      setProfileModalOpen(false);
      alert(`✅ Re-engagement message dispatched successfully to ${selectedCustomer?.name} via VyaparaMitra SMS Gateway!`);
    }, 1500);
  };

  // Predefined marketing campaigns helpers
  const handleLoadTemplate = (type: 'BFCM' | 'FESTIVE' | 'LOYALTY') => {
    if (!selectedCustomer) return;
    let template = '';
    if (type === 'BFCM') {
      template = `Hi ${selectedCustomer.name}!\n\nOur exclusive Clearance Flash Sale is LIVE! Enjoy a flat 20% discount on all household groceries and staples. Use code FLASH20 at counter billing.\n\nOnly valid for 48 hours!\n\nBest, VyaparaMitra Team`;
    } else if (type === 'FESTIVE') {
      template = `Namaste ${selectedCustomer.name}!\n\nCelebrate the upcoming festive season with your family. We've compiled a special Festive Biryani grocery combo with a flat ₹150 discount code: SHUBH150.\n\nShow this at checkout to claim.`;
    } else {
      template = `Hi ${selectedCustomer.name}!\n\nThank you for being a Gold Patron with us. We've credited 500 loyalty points directly to your phone. Claim code: LOYAL500 on your next visit.\n\nWarm regards,\nVyaparaMitra Team`;
    }
    setReminderText(template);
  };

  // KPIs
  const totalCount = customers.length;
  const activeCount = customers.filter(c => c.status === 'ACTIVE').length;
  const inactiveCount = customers.filter(c => c.status === 'INACTIVE').length;

  // CLV and Tiers helper
  const getCustomerTier = (purchases: number) => {
    if (purchases >= 15000) return { label: 'Prestige VIP', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (purchases >= 5000) return { label: 'Gold Patron', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Regular Shopper', color: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  // Attrition Risk Alert calculation
  const lapsingHighValueCustomers = customers.filter(c => c.status === 'INACTIVE' && c.totalPurchases >= 5000);

  // Filter
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Advanced Customer Relationship Management</h1>
        <p className="text-xs text-slate-400">Track Customer Lifetime Value (CLV), inspect order histories, auto-detect inactive clients, and dispatch AI re-engagement campaigns</p>
      </div>

      {/* Lapsing Warning Alert Banner */}
      {lapsingHighValueCustomers.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-900">High-Value Retention Risk Identified</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              We identified <strong>{lapsingHighValueCustomers.length} high-value customers</strong> (CLV &gt; ₹5,000) currently in the <strong>Inactive</strong> window. It is highly recommended to click on them to generate a personalized re-engagement discount code immediately.
            </p>
          </div>
        </div>
      )}

      {/* Roster KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Client Roster</span>
            <h3 className="text-xl font-bold text-slate-800 font-sans">{totalCount} customers</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Shoppers</span>
            <h3 className="text-xl font-bold text-slate-800 font-sans">{activeCount} clients</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Smile className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Inactive (Lapsed &gt;45 Days)</span>
            <h3 className="text-xl font-bold text-slate-800 font-sans">{inactiveCount} clients</h3>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, phone..."
            className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs text-slate-700 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-150 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="flex gap-1.5 shrink-0">
          {(['All', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                statusFilter === status 
                  ? 'bg-blue-600 text-white shadow-xs border-blue-600' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {status === 'All' ? 'All' : status === 'ACTIVE' ? 'Active' : 'Lapsed / Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Registry List */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-xs text-slate-400">Syncing registered ledger...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">No customers found in directory.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-150 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Client Profile</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Customer Lifetime Value</th>
                  <th className="px-6 py-4">Visit Frequency</th>
                  <th className="px-6 py-4">Loyalty Tier</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => {
                  const tier = getCustomerTier(c.totalPurchases);
                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => handleOpenProfile(c)}
                      className="hover:bg-slate-50/50 transition cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 group-hover:text-blue-600 transition flex items-center gap-1">
                          <span>{c.name}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-600 transition -translate-x-1 group-hover:translate-x-0" />
                        </div>
                        <div className="text-[10px] text-slate-400">Joined: {new Date(c.lastVisit).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-sm">
                        ₹{c.totalPurchases.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        <div className="font-semibold">{c.visitCount} visits</div>
                        <div className="text-[9px] text-slate-400">Avg ticket: ₹{Math.round(c.totalPurchases / (c.visitCount || 1))}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          c.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {c.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleOpenProfile(c)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition shadow-xs border ${
                            c.status === 'INACTIVE'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700'
                              : 'bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-slate-200 hover:border-blue-200'
                          }`}
                        >
                          <span>Manage Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unified Profile, Purchase History & AI Campaign Dialog */}
      <AnimatePresence>
        {profileModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden border border-slate-150 shadow-xl flex flex-col md:flex-row h-[85vh] max-h-[700px]"
            >
              {/* Left Column: Loyalty & Purchase timeline (60%) */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 border-r border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="font-extrabold text-slate-800 text-sm">Customer Profile Overview</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getCustomerTier(selectedCustomer.totalPurchases).color}`}>
                    {getCustomerTier(selectedCustomer.totalPurchases).label}
                  </span>
                </div>

                {/* Profile Stats Overview */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-center space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Customer Lifetime Value</p>
                    <p className="text-base font-extrabold text-slate-800 font-mono">₹{selectedCustomer.totalPurchases.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-center space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Visits</p>
                    <p className="text-base font-extrabold text-slate-800 font-mono">{selectedCustomer.visitCount} visits</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-center space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Average Order Value</p>
                    <p className="text-base font-extrabold text-slate-800 font-mono">₹{Math.round(selectedCustomer.totalPurchases / (selectedCustomer.visitCount || 1))}</p>
                  </div>
                </div>

                {/* Details Section */}
                <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Contact & System Ledger Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <p className="text-slate-500">Name: <strong className="text-slate-800">{selectedCustomer.name}</strong></p>
                    <p className="text-slate-500">Phone: <strong className="text-slate-800 font-mono">{selectedCustomer.phone}</strong></p>
                    <p className="text-slate-500">Email: <strong className="text-slate-800 font-mono">{selectedCustomer.email}</strong></p>
                    <p className="text-slate-500">Last Invoice: <strong className="text-slate-800">{new Date(selectedCustomer.lastVisit).toLocaleDateString('en-IN')}</strong></p>
                  </div>
                </div>

                {/* Chronological Sales Timeline */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    Chronological Purchase History ({customerSales.length} items)
                  </h4>
                  
                  {customerSales.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 bg-white">
                      No transactional sales found for this customer.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[25vh] overflow-y-auto pr-1">
                      {customerSales.map((sale) => (
                        <div key={sale.id} className="bg-white p-3.5 border border-slate-150 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 font-mono">{sale.invoiceNumber}</span>
                            <span className="text-slate-400 text-[10px]">{new Date(sale.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          
                          {/* Products line breakdown */}
                          <div className="divide-y divide-slate-50">
                            {sale.products.map((p, pIdx) => (
                              <div key={pIdx} className="flex justify-between py-1 text-[11px] text-slate-600">
                                <span>{p.name} (x{p.quantity})</span>
                                <span className="font-mono text-slate-700">₹{p.total}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold text-slate-800">
                            <span>Grand Total:</span>
                            <span className="font-mono text-blue-600">₹{sale.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: AI Re-engagement & SMS Draft (40%) */}
              <div className="w-full md:w-[360px] p-6 flex flex-col justify-between space-y-4 bg-slate-50 border-t md:border-t-0 border-slate-200">
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <h4 className="text-xs font-bold text-slate-800">AI Re-Engagement Panel</h4>
                    </div>
                    <button 
                      onClick={() => setProfileModalOpen(false)}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Generate highly persuasive marketing drafts tuned to their purchase patterns. Drag pre-defined templates or invoke Gemini live:
                  </p>

                  {/* Predefined Coupon templates */}
                  <div className="flex flex-wrap gap-1.5">
                    <button 
                      onClick={() => handleLoadTemplate('BFCM')}
                      className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-150 text-[10px] font-semibold text-slate-600 hover:text-blue-600 rounded-lg transition"
                    >
                      Clearance 20%
                    </button>
                    <button 
                      onClick={() => handleLoadTemplate('FESTIVE')}
                      className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-150 text-[10px] font-semibold text-slate-600 hover:text-emerald-600 rounded-lg transition"
                    >
                      Festive Combo
                    </button>
                    <button 
                      onClick={() => handleLoadTemplate('LOYALTY')}
                      className="px-2 py-1 bg-white hover:bg-purple-50 border border-slate-150 text-[10px] font-semibold text-slate-600 hover:text-purple-600 rounded-lg transition"
                    >
                      Patron Bonus
                    </button>
                  </div>

                  {/* Gemini Trigger button */}
                  <button
                    onClick={handleTriggerReminder}
                    disabled={reminderLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[10px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider"
                  >
                    {reminderLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Prompting Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        Invoke Personalized Copilot
                      </>
                    )}
                  </button>

                  {/* SMS Mock screen */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Interactive Smartphone Mock</span>
                    <div className="bg-slate-900 rounded-2xl p-3 border-4 border-slate-700 shadow-md h-52 flex flex-col justify-between">
                      <div className="w-12 h-3 bg-slate-700 rounded-full mx-auto shrink-0"></div>
                      
                      <div className="flex-1 overflow-y-auto mt-2 text-[9px] leading-relaxed text-white space-y-2">
                        {reminderLoading ? (
                          <div className="flex flex-col items-center justify-center h-full space-y-1 text-slate-400">
                            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Crafting tailored draft...</span>
                          </div>
                        ) : reminderText ? (
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-blue-600 text-white p-2.5 rounded-xl rounded-tl-none whitespace-pre-wrap font-sans"
                          >
                            {reminderText}
                          </motion.div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400 text-center font-light px-4">
                            Click 'Invoke Copilot' or select a template to build a draft SMS.
                          </div>
                        )}
                      </div>

                      {reminderText && !reminderLoading && (
                        <div className="flex gap-1 justify-end shrink-0 mt-1">
                          <button 
                            onClick={handleCopy}
                            className="p-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                            title="Copy SMS text"
                          >
                            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={handleSendSimulated}
                            disabled={sent}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-bold transition flex items-center gap-1 text-[8px]"
                          >
                            {sent ? (
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-2.5 h-2.5" />
                                Send
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer close button */}
                <button 
                  onClick={() => setProfileModalOpen(false)}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Close Profile Center
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
