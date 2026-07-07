import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  X, 
  Sparkles, 
  Upload, 
  Download, 
  Camera, 
  AlertCircle, 
  Eye, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Percent, 
  Calendar, 
  Package, 
  Layers, 
  ShoppingBag, 
  DollarSign, 
  Coins, 
  CheckCircle2, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  BarChart2,
  FileText,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  fetchProducts, 
  addProduct, 
  editProduct, 
  deleteProduct 
} from '../lib/api';
import { Product } from '../types';
import { useNotifications } from './NotificationManager';

export default function Products() {
  const { triggerNotification } = useNotifications();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Form Fields
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Grocery');
  const [formBrand, setFormBrand] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formBuyingPrice, setFormBuyingPrice] = useState('0');
  const [formSellingPrice, setFormSellingPrice] = useState('0');
  const [formDiscount, setFormDiscount] = useState('0');
  const [formGst, setFormGst] = useState('12');
  const [formQuantity, setFormQuantity] = useState('50');
  const [formMinStock, setFormMinStock] = useState('10');
  const [formUnit, setFormUnit] = useState('piece');
  const [formSupplier, setFormSupplier] = useState('');
  const [formSupplierContact, setFormSupplierContact] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // AI Extraction State
  const [aiNote, setAiNote] = useState('');
  const [aiExtracting, setAiExtracting] = useState(false);

  // Barcode Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanError, setScanError] = useState('');

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importMapping, setImportMapping] = useState<any>({});
  const [importFeedback, setImportFeedback] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  // Product Details active item
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Fetch Failed', 'Could not load products data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products
  const filteredProducts = products.filter(p => {
    const pName = p.name || p.productName || '';
    const pSku = p.sku || '';
    const pBarcode = p.barcode || '';
    const pCategory = p.category || '';
    const pBrand = p.brand || '';
    const pStatus = p.status || 'IN_STOCK';

    const matchesSearch = 
      pName.toLowerCase().includes(search.toLowerCase()) ||
      pSku.toLowerCase().includes(search.toLowerCase()) ||
      pBarcode.toLowerCase().includes(search.toLowerCase()) ||
      pCategory.toLowerCase().includes(search.toLowerCase()) ||
      pBrand.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || pCategory === categoryFilter;
    const matchesBrand = brandFilter === 'All' || pBrand === brandFilter;
    const matchesStatus = statusFilter === 'All' || pStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  // Calculate Paginated List
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  // Brands list
  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))];

  // Helper Calculations for Stats
  const totalCatalog = products.length;
  const inventoryValue = products.reduce((acc, p) => acc + (p.quantity * (p.buyingPrice || 0)), 0);
  const potentialRevenue = products.reduce((acc, p) => acc + (p.quantity * p.sellingPrice), 0);
  const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;

  // Handle Form open
  const openFormModal = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormName(prod.name || prod.productName || '');
      setFormCategory(prod.category || 'Grocery');
      setFormBrand(prod.brand || '');
      setFormSku(prod.sku || '');
      setFormBarcode(prod.barcode || '');
      setFormBuyingPrice((prod.buyingPrice || prod.purchasePrice || 0).toString());
      setFormSellingPrice(prod.sellingPrice.toString());
      setFormDiscount((prod.discount || 0).toString());
      setFormGst((prod.gst || 12).toString());
      setFormQuantity(prod.quantity.toString());
      setFormMinStock(prod.minStock.toString());
      setFormUnit(prod.unit || 'piece');
      setFormSupplier(prod.supplier || '');
      setFormSupplierContact(prod.supplierContact || '');
      setFormExpiryDate(prod.expiryDate || '');
      setFormImage(prod.image || '');
      setFormNotes(prod.description || '');
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormCategory('Grocery');
      setFormBrand('');
      setFormSku('');
      setFormBarcode('');
      setFormBuyingPrice('0');
      setFormSellingPrice('0');
      setFormDiscount('0');
      setFormGst('12');
      setFormQuantity('50');
      setFormMinStock('10');
      setFormUnit('piece');
      setFormSupplier('');
      setFormSupplierContact('');
      setFormExpiryDate('');
      setFormImage('');
      setFormNotes('');
    }
    setFormModalOpen(true);
  };

  // AI Extract Product Info
  const handleAIExtract = async () => {
    if (!aiNote.trim()) {
      triggerNotification('error', 'Empty Input', 'Please describe the purchase details.');
      return;
    }

    try {
      setAiExtracting(true);
      const res = await fetch('/api/products/ai-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: aiNote })
      });

      if (!res.ok) throw new Error('AI extraction failed');
      const data = await res.json();

      // Pre-fill fields
      setFormName(data.productName || '');
      setFormCategory(data.category || 'Grocery');
      setFormBrand(data.brand || '');
      setFormBuyingPrice((data.purchasePrice || 0).toString());
      setFormSellingPrice((data.sellingPrice || 0).toString());
      setFormQuantity((data.stock || 50).toString());
      setFormUnit(data.unit || 'piece');
      setFormGst((data.gst || 12).toString());
      setFormSupplier(data.supplier || '');
      setFormBarcode(data.barcode || '');
      setFormSku(data.sku || `VM-${Math.floor(100 + Math.random() * 900)}`);

      setAiModalOpen(false);
      setAiNote('');
      setFormModalOpen(true);
      triggerNotification('success', 'AI Extracted Successfully', `Identified: ${data.productName || 'Product'}. Review form details before saving.`);
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'AI Extraction Failed', 'Fitted with smart mockup defaults because API limits or key not setup.');
      
      // smart local mockup extractor fallback so user gets a seamless experience
      const lower = aiNote.toLowerCase();
      let extractedQty = 50;
      let extractedPrice = 58;
      let extractedName = 'Amul Gold Milk 1L';
      let extractedBrand = 'Amul';
      let extractedCategory = 'Milk Products';

      if (lower.includes('milk') || lower.includes('amul')) {
        extractedName = 'Amul Gold Milk 1L';
        extractedBrand = 'Amul';
        extractedCategory = 'Milk Products';
      } else if (lower.includes('atta') || lower.includes('aashirvaad')) {
        extractedName = 'Aashirvaad Atta 5kg';
        extractedBrand = 'ITC';
        extractedCategory = 'Grocery';
      }

      // try parsing quantity and price using regex
      const qtyMatch = lower.match(/(\d+)\s*(?:packet|kg|litre|box|piece|unit|ltr|ml|g|x)/) || lower.match(/(?:purchased|buy|got)\s*(\d+)/);
      if (qtyMatch) extractedQty = parseInt(qtyMatch[1], 10);
      
      const priceMatch = lower.match(/(?:at|for|rs|₹|@)\s*(\d+)/) || lower.match(/(\d+)\s*(?:each|rupees|rs|INR)/);
      if (priceMatch) extractedPrice = parseInt(priceMatch[1], 10);

      setFormName(extractedName);
      setFormCategory(extractedCategory);
      setFormBrand(extractedBrand);
      setFormBuyingPrice(extractedPrice.toString());
      setFormSellingPrice(Math.round(extractedPrice * 1.25).toString());
      setFormQuantity(extractedQty.toString());
      setFormUnit(lower.includes('packet') ? 'packet' : lower.includes('kg') ? 'kg' : 'piece');
      setFormGst('5');
      setFormSupplier('Local Distributor');
      setFormBarcode(`890${Math.floor(100000000000 + Math.random() * 900000000000)}`);
      setFormSku(`VM-AI-${Math.floor(100 + Math.random() * 900)}`);

      setAiModalOpen(false);
      setAiNote('');
      setFormModalOpen(true);
    } finally {
      setAiExtracting(false);
    }
  };

  // Handle Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim() || !formUnit.trim()) {
      triggerNotification('error', 'Form Error', 'Please fill out all required fields.');
      return;
    }

    const buyingVal = Number(formBuyingPrice);
    const sellingVal = Number(formSellingPrice);
    const profitMargin = sellingVal > 0 ? Math.round(((sellingVal - buyingVal) / sellingVal) * 100) : 0;
    const qtyVal = Number(formQuantity);
    const minStockVal = Number(formMinStock);

    // Duplicate Checks (Barcode and SKU)
    const duplicateBarcode = products.find(p => p.barcode && p.barcode === formBarcode && p.id !== editingProduct?.id);
    const duplicateSku = products.find(p => p.sku && p.sku === formSku && p.id !== editingProduct?.id);
    const duplicateName = products.find(p => p.name.toLowerCase() === formName.toLowerCase() && p.id !== editingProduct?.id);

    if (duplicateBarcode) {
      triggerNotification('error', 'Duplicate Barcode', `Barcode "${formBarcode}" is already assigned to ${duplicateBarcode.name}.`);
      return;
    }
    if (duplicateSku) {
      triggerNotification('error', 'Duplicate SKU', `SKU "${formSku}" is already assigned to ${duplicateSku.name}.`);
      return;
    }
    if (duplicateName) {
      triggerNotification('info', 'Potential Duplicate', `A product named "${formName}" already exists in the system.`);
    }

    try {
      const payload = {
        name: formName,
        productName: formName,
        category: formCategory,
        brand: formBrand,
        sku: formSku || `VM-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: formBarcode,
        buyingPrice: buyingVal,
        purchasePrice: buyingVal,
        sellingPrice: sellingVal,
        profitMargin,
        gst: Number(formGst),
        quantity: qtyVal,
        stock: qtyVal,
        minStock: minStockVal,
        minimumStock: minStockVal,
        unit: formUnit,
        supplier: formSupplier,
        supplierContact: formSupplierContact,
        expiryDate: formExpiryDate || undefined,
        image: formImage || '',
        description: formNotes,
        status: qtyVal <= 0 ? 'OUT_OF_STOCK' : qtyVal <= minStockVal ? 'LOW_STOCK' : 'IN_STOCK'
      } as any;

      if (editingProduct) {
        await editProduct(editingProduct.id, payload);
        triggerNotification('success', 'Product Updated', `${formName} has been updated in the catalog.`);
      } else {
        await addProduct(payload);
        triggerNotification('success', 'Product Added', `Added brand new item: ${formName} to database.`);
      }

      setFormModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Failed to Save', 'Could not save product to local DB.');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the catalog? This is irreversible.`)) {
      try {
        await deleteProduct(id);
        triggerNotification('info', 'Product Removed', `Permanently deleted "${name}" from catalog records.`);
        loadData();
      } catch (err) {
        console.error(err);
        triggerNotification('error', 'Delete Failed', 'Failed to remove product from server database.');
      }
    }
  };

  // Barcode Scanner Simulator Actions
  const simulateScan = (barcode: string) => {
    setScannedCode(barcode);
    const match = products.find(p => p.barcode === barcode);
    if (match) {
      setViewingProduct(match);
      setScanModalOpen(false);
      setDetailsModalOpen(true);
      triggerNotification('success', 'Barcode Recognized', `Found match for ${match.name}`);
    } else {
      setScanModalOpen(false);
      openFormModal(null);
      setFormBarcode(barcode);
      triggerNotification('info', 'New Barcode Scanned', 'No matching product found. Add form pre-filled.');
    }
  };

  // CSV Import parsing logic
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text);
        parseCSVText(text);
      };
      reader.readAsText(file);
    }
  };

  const parseCSVText = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return;

    const headers = lines[0].split(',').map(h => h.replace(/['"]+/g, '').trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/['"]+/g, '').trim());
      const rowObj: any = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index] || '';
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);

    // Initial default mapping suggestion
    const mapping: any = {};
    const lowerHeaders = headers.map(h => h.toLowerCase());

    const findMatch = (keys: string[]) => {
      const idx = lowerHeaders.findIndex(lh => keys.some(k => lh.includes(k)));
      return idx !== -1 ? headers[idx] : '';
    };

    mapping.productName = findMatch(['product', 'name', 'title']);
    mapping.sku = findMatch(['sku', 'code']);
    mapping.barcode = findMatch(['barcode', 'upc', 'ean']);
    mapping.category = findMatch(['category', 'type']);
    mapping.brand = findMatch(['brand', 'manufacturer']);
    mapping.purchasePrice = findMatch(['purchase', 'buy', 'cost']);
    mapping.sellingPrice = findMatch(['sell', 'price']);
    mapping.stock = findMatch(['stock', 'qty', 'quantity']);
    mapping.unit = findMatch(['unit', 'pkg']);
    mapping.gst = findMatch(['gst', 'tax']);

    setImportMapping(mapping);
  };

  const executeCSVImport = async () => {
    let successCount = 0;
    let failedCount = 0;
    const errorsList: string[] = [];

    for (const row of parsedRows) {
      try {
        const productName = row[importMapping.productName] || '';
        const sku = row[importMapping.sku] || `VM-IMP-${Math.floor(1000 + Math.random() * 9000)}`;
        const barcode = row[importMapping.barcode] || '';
        const category = row[importMapping.category] || 'Grocery';
        const brand = row[importMapping.brand] || 'Generic';
        const purchasePrice = Number(row[importMapping.purchasePrice] || 0);
        const sellingPrice = Number(row[importMapping.sellingPrice] || 0);
        const stock = Number(row[importMapping.stock] || 0);
        const unit = row[importMapping.unit] || 'piece';
        const gst = Number(row[importMapping.gst] || 12);

        if (!productName) {
          failedCount++;
          errorsList.push(`Row missing Product Name`);
          continue;
        }

        // Duplicate checks
        if (products.some(p => p.barcode && p.barcode === barcode)) {
          failedCount++;
          errorsList.push(`Barcode "${barcode}" already exists for row ${productName}`);
          continue;
        }

        const profitMargin = sellingPrice > 0 ? Math.round(((sellingPrice - purchasePrice) / sellingPrice) * 100) : 0;

        await addProduct({
          name: productName,
          productName: productName,
          category,
          brand,
          sku,
          barcode,
          buyingPrice: purchasePrice,
          purchasePrice: purchasePrice,
          sellingPrice,
          profitMargin,
          gst,
          quantity: stock,
          stock,
          minStock: 10,
          minimumStock: 10,
          unit,
          status: stock <= 0 ? 'OUT_OF_STOCK' : stock <= 10 ? 'LOW_STOCK' : 'IN_STOCK'
        });

        successCount++;
      } catch (err: any) {
        failedCount++;
        errorsList.push(err.message || 'Row addition failed');
      }
    }

    setImportFeedback({
      success: successCount,
      failed: failedCount,
      errors: errorsList
    });

    if (successCount > 0) {
      triggerNotification('success', 'Import Completed', `Imported ${successCount} products successfully.`);
      loadData();
    } else {
      triggerNotification('error', 'Import Failed', 'No products were imported.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (products.length === 0) {
      triggerNotification('error', 'Export Failed', 'No product catalog data to export.');
      return;
    }

    const csvRows = [];
    const headers = ['id', 'productName', 'sku', 'barcode', 'category', 'brand', 'purchasePrice', 'sellingPrice', 'stock', 'unit', 'gst', 'status'];
    csvRows.push(headers.join(','));

    products.forEach(p => {
      const row = [
        p.id,
        `"${(p.name || p.productName || '').replace(/"/g, '""')}"`,
        p.sku || '',
        p.barcode || '',
        p.category || '',
        p.brand || '',
        p.buyingPrice || p.purchasePrice || 0,
        p.sellingPrice,
        p.quantity,
        p.unit || 'piece',
        p.gst || 12,
        p.status
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vyaparamitra_products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification('success', 'Export Succeeded', 'CSV Catalog catalog file ready for download.');
  };

  // Custom mock data for detail charts
  const getProductChartData = (id: string) => {
    // Deterministic random arrays based on character code sum
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseSales = (sum % 20) + 10;
    
    const stockData = [
      { month: 'Jan', stock: baseSales + 30 },
      { month: 'Feb', stock: baseSales + 25 },
      { month: 'Mar', stock: baseSales + 15 },
      { month: 'Apr', stock: baseSales + 40 },
      { month: 'May', stock: baseSales + 10 },
      { month: 'Jun', stock: baseSales }
    ];

    const salesData = [
      { month: 'Jan', sales: baseSales * 4 },
      { month: 'Feb', sales: baseSales * 5 },
      { month: 'Mar', sales: baseSales * 3 },
      { month: 'Apr', sales: baseSales * 6 },
      { month: 'May', sales: baseSales * 5 },
      { month: 'Jun', sales: baseSales * 8 }
    ];

    return { stockData, salesData };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Product Management</h1>
          <p className="text-xs text-slate-400">Manage unified master catalog, execute automated AI stock inputs, view stock health, and export logs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            Add using AI
          </button>
          <button
            onClick={() => setScanModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            Scan Barcode
          </button>
          <button
            onClick={() => openFormModal(null)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-slate-150 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Catalog</p>
            <h3 className="text-lg font-black text-slate-800">{totalCatalog} Products</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-slate-150 shadow-xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Value</p>
            <h3 className="text-lg font-black text-slate-800">₹{inventoryValue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-slate-150 shadow-xs">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock alerts</p>
            <h3 className="text-lg font-black text-slate-800">{lowStockCount} Items</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-slate-150 shadow-xs">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Potential Revenue</p>
            <h3 className="text-lg font-black text-slate-800">₹{potentialRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Panel */}
      <div className="glass-card rounded-2xl p-4 space-y-4 border border-slate-150 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search products by name, SKU, barcode, brand, category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setImportModalOpen(true)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              Import CSV
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Export
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2.5 items-center border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter:</span>
          
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-500">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] px-2 py-1 outline-none font-bold"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-500">Brand</span>
            <select
              value={brandFilter}
              onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] px-2 py-1 outline-none font-bold"
            >
              <option value="All">All Brands</option>
              {brands.filter(b => b !== 'All').map(br => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-500">Stock status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] px-2 py-1 outline-none font-bold"
            >
              <option value="All">All Stock</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl border border-slate-150 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Synchronizing Catalog Ledger...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <Package className="w-12 h-12 text-slate-200" />
            <p className="font-semibold text-slate-500">No matching products found.</p>
            <p className="text-[10px] text-slate-400">Create a product or try modifying your active search query filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Image</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU / Barcode</th>
                  <th className="p-4">Category / Brand</th>
                  <th className="p-4 text-right">Purchase Price</th>
                  <th className="p-4 text-right">Selling Price</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-center">GST</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedProducts.map((p) => {
                  const nameVal = p.name || p.productName || '';
                  const statusLabel = p.quantity <= 0 ? 'Out of Stock' : p.quantity <= p.minStock ? 'Low Stock' : 'In Stock';
                  const statusColor = p.quantity <= 0 
                    ? 'bg-red-50 text-red-600 border-red-100' 
                    : p.quantity <= p.minStock 
                      ? 'bg-amber-50 text-amber-600 border-amber-100' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 pl-6">
                        {p.image ? (
                          <img 
                            src={p.image} 
                            alt={nameVal} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-xl border border-slate-150 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center font-bold text-sm">
                            {nameVal.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 line-clamp-1">{nameVal}</div>
                        <div className="text-[10px] text-slate-400">{p.unit || 'piece'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-[10px] text-slate-500 font-medium">{p.sku || 'No SKU'}</div>
                        <div className="font-mono text-[9px] text-slate-400">{p.barcode || 'No Barcode'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-700">{p.category || 'Uncategorized'}</div>
                        <div className="text-[10px] text-slate-400">{p.brand || 'Generic'}</div>
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-600">
                        ₹{Number(p.buyingPrice || p.purchasePrice || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-800">
                        ₹{Number(p.sellingPrice).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-slate-800">{p.quantity}</div>
                        <div className="text-[9px] text-slate-400">Min: {p.minStock}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-bold">
                          {p.gst || 12}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-wide ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => { setViewingProduct(p); setDetailsModalOpen(true); }}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg hover:text-slate-800 transition cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openFormModal(p)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, nameVal)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-500 disabled:opacity-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-500 disabled:opacity-50 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD/EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {formModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Fill in details below to organize physical inventory and commercial values</p>
                </div>
                <button
                  onClick={() => setFormModalOpen(false)}
                  className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveProduct}>
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Row 1: Basic Info */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">1. Basic Information</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. Amul Gold Milk 1L"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category *</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition cursor-pointer"
                        >
                          <option value="Grocery">Grocery / Staples</option>
                          <option value="Dairy">Dairy Products</option>
                          <option value="Beverage">Beverages / Drinks</option>
                          <option value="Pharmacy">Pharmacy / Medicine</option>
                          <option value="Cosmetics">Cosmetics / Beauty</option>
                          <option value="Household">Household / Cleaning</option>
                          <option value="Stationery">Stationery / Office</option>
                          <option value="Apparel">Apparel / Clothing</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brand Name</label>
                        <input
                          type="text"
                          value={formBrand}
                          onChange={(e) => setFormBrand(e.target.value)}
                          placeholder="e.g. Amul"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SKU Code</label>
                        <input
                          type="text"
                          value={formSku}
                          onChange={(e) => setFormSku(e.target.value)}
                          placeholder="e.g. VM-AMUL-M100"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Barcode ID</label>
                        <input
                          type="text"
                          value={formBarcode}
                          onChange={(e) => setFormBarcode(e.target.value)}
                          placeholder="e.g. 8901262010010"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Pricing */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">2. Commercial & GST Pricing</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purchase Price (₹) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formBuyingPrice}
                          onChange={(e) => setFormBuyingPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selling Price (₹) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formSellingPrice}
                          onChange={(e) => setFormSellingPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discount Amt (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formDiscount}
                          onChange={(e) => setFormDiscount(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition font-bold text-red-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GST % Rate</label>
                        <select
                          value={formGst}
                          onChange={(e) => setFormGst(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition cursor-pointer font-bold"
                        >
                          <option value="0">0% (Exempt)</option>
                          <option value="5">5% (Essential)</option>
                          <option value="12">12% (Standard)</option>
                          <option value="18">18% (Standard Services)</option>
                          <option value="28">28% (Luxury)</option>
                        </select>
                      </div>
                    </div>
                    {/* Auto Profit Calculation Info Box */}
                    {Number(formSellingPrice) > 0 && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Auto profit index:</span>
                        </div>
                        <span className="text-xs font-black text-emerald-700">
                          ₹{(Number(formSellingPrice) - Number(formBuyingPrice)).toLocaleString('en-IN')} Profit Margin ({Math.round(((Number(formSellingPrice) - Number(formBuyingPrice)) / Number(formSellingPrice)) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Inventory */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">3. Inventory & Units</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock quantity *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formQuantity}
                          onChange={(e) => setFormQuantity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Min Stock Level</label>
                        <input
                          type="number"
                          min="1"
                          value={formMinStock}
                          onChange={(e) => setFormMinStock(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Measurement Unit *</label>
                        <select
                          value={formUnit}
                          onChange={(e) => setFormUnit(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition cursor-pointer"
                        >
                          <option value="piece">piece (pcs)</option>
                          <option value="packet">packet (pkt)</option>
                          <option value="kg">kilogram (kg)</option>
                          <option value="litre">litre (ltr)</option>
                          <option value="box">box (bx)</option>
                          <option value="bottle">bottle (btl)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Supplier Details */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">4. Supplier Details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supplier Name</label>
                        <input
                          type="text"
                          value={formSupplier}
                          onChange={(e) => setFormSupplier(e.target.value)}
                          placeholder="e.g. Reliance Food Wholesalers"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supplier Contact Phone</label>
                        <input
                          type="text"
                          value={formSupplierContact}
                          onChange={(e) => setFormSupplierContact(e.target.value)}
                          placeholder="e.g. +91 99887 76655"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Additional */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">5. Additional Information</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                        <input
                          type="date"
                          value={formExpiryDate}
                          onChange={(e) => setFormExpiryDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Image URL</label>
                        <input
                          type="text"
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/... or blank"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Internal Notes / Description</label>
                      <textarea
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="Add some notes about storage conditions, bulk discounts or packaging particulars..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs outline-none transition resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: AI ADD PRODUCT MODAL */}
      <AnimatePresence>
        {aiModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100 animate-pulse" />
                  <h3 className="font-extrabold text-slate-800 text-sm">AI Product Smart Input</h3>
                </div>
                <button
                  onClick={() => setAiModalOpen(false)}
                  className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Provide a simple natural language statement about a purchase invoice. VyaparaMitra's AI will parse quantities, products, brand, and supplier values automatically.
                </p>

                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-[10px] text-slate-600 space-y-1">
                  <p className="font-bold text-indigo-800">💡 Try typing something like:</p>
                  <p className="font-medium">"I purchased 25 packets of Amul Gold Milk 1L at Rs. 58 each from Ramesh Dairy Distributors"</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purchase Note</label>
                  <textarea
                    value={aiNote}
                    onChange={(e) => setAiNote(e.target.value)}
                    placeholder="e.g. Purchased 40 bags of Fortune Soya Oil 1L at ₹125 per piece with 18% GST..."
                    rows={4}
                    disabled={aiExtracting}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs outline-none transition resize-none leading-normal font-medium"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  disabled={aiExtracting}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAIExtract}
                  disabled={aiExtracting}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {aiExtracting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      Analyze & Pre-fill
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: BARCODE SCANNER SIMULATOR MODAL */}
      <AnimatePresence>
        {scanModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-slate-800 text-sm">Automated Barcode Scanner</h3>
                </div>
                <button
                  onClick={() => { setScanModalOpen(false); setCameraActive(false); }}
                  className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Simulated Camera Window */}
                <div className="relative bg-slate-950 aspect-video rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center text-slate-500 p-4 border border-slate-800">
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/50" />
                  
                  {/* Laser line simulator */}
                  <div className="absolute left-0 right-0 h-0.5 bg-red-500/80 shadow-lg shadow-red-500 animate-bounce top-[45%]" />

                  {/* Recognition box */}
                  <div className="border-2 border-dashed border-blue-500/60 w-3/4 h-1/2 rounded-lg flex items-center justify-center relative">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute top-2">Align Barcode</span>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-4 absolute bottom-3 z-10">Webcam scanning active. Hover item barcode in alignment frame.</p>
                </div>

                {/* Presets dropdown to easily test scan behavior */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">⚡ Quick Test Presets (Select to Scan):</p>
                  
                  <div className="space-y-2">
                    {/* Exisiting barcode options */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Existing Catalog Items:</p>
                      <div className="flex flex-wrap gap-1">
                        {products.slice(0, 3).map(p => (
                          <button
                            key={p.id}
                            onClick={() => simulateScan(p.barcode)}
                            className="text-[9px] font-bold bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            📷 {p.name} ({p.barcode.substring(0, 5)}...)
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* New unregistered barcode option */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-100">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Unregistered Barcode (Triggers Add Form):</p>
                      <button
                        onClick={() => simulateScan(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`)}
                        className="text-[9px] font-bold bg-indigo-50 border border-indigo-100 hover:border-indigo-500 text-indigo-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        📷 Scan Random Unregistered Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => { setScanModalOpen(false); setCameraActive(false); }}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close Scanner
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: CSV EXCEL IMPORT MODAL */}
      <AnimatePresence>
        {importModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden my-8"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-slate-700" />
                  <h3 className="font-extrabold text-slate-800 text-sm">Bulk CSV/Excel Product Import</h3>
                </div>
                <button
                  onClick={() => { setImportModalOpen(false); setImportFile(null); setParsedRows([]); setImportFeedback(null); }}
                  className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {!importFile ? (
                  // Drag and Drop view
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-500 transition cursor-pointer relative bg-slate-50/50">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-600">Select or Drag CSV catalog file here</p>
                    <p className="text-[10px] text-slate-400 mt-1">Accepts standard comma-separated .csv sheets</p>
                  </div>
                ) : (
                  // Mapper / Preview view
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between">
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-700 truncate">{importFile.name}</p>
                        <p className="text-[10px] text-slate-400">Successfully detected {parsedRows.length} invoice/product lines</p>
                      </div>
                      <button
                        onClick={() => { setImportFile(null); setParsedRows([]); }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700"
                      >
                        Reset File
                      </button>
                    </div>

                    {/* Mapping configuration */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configure Column Mapping:</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {Object.keys(importMapping).map((key) => (
                          <div key={key} className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <select
                              value={importMapping[key]}
                              onChange={(e) => setImportMapping({ ...importMapping, [key]: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px] font-medium outline-none"
                            >
                              <option value="">-- Ignored --</option>
                              {parsedRows.length > 0 && Object.keys(parsedRows[0]).map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview Table */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows Preview:</p>
                      <div className="overflow-x-auto border border-slate-150 rounded-xl max-h-40">
                        <table className="w-full text-left text-[10px] font-medium">
                          <thead className="bg-slate-50 border-b border-slate-150 sticky top-0">
                            <tr>
                              <th className="p-2">Product Name</th>
                              <th className="p-2">Barcode</th>
                              <th className="p-2 text-right">Purchase</th>
                              <th className="p-2 text-right">Selling</th>
                              <th className="p-2 text-center">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedRows.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="bg-white">
                                <td className="p-2 truncate max-w-[140px] font-bold text-slate-700">{row[importMapping.productName] || '—'}</td>
                                <td className="p-2 font-mono text-[9px]">{row[importMapping.barcode] || '—'}</td>
                                <td className="p-2 text-right">₹{row[importMapping.purchasePrice] || 0}</td>
                                <td className="p-2 text-right font-bold text-slate-800">₹{row[importMapping.sellingPrice] || 0}</td>
                                <td className="p-2 text-center">{row[importMapping.stock] || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Import Feedback */}
                    {importFeedback && (
                      <div className="p-4 rounded-xl border space-y-2 text-xs bg-slate-50">
                        <p className="font-extrabold text-slate-700 uppercase tracking-wider">Import Report Results:</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-center">
                            <p className="text-emerald-700 font-extrabold text-sm">{importFeedback.success}</p>
                            <p className="text-[9px] font-medium text-emerald-600">Rows Imported</p>
                          </div>
                          <div className="bg-red-50 p-2.5 rounded-lg border border-red-100 text-center">
                            <p className="text-red-700 font-extrabold text-sm">{importFeedback.failed}</p>
                            <p className="text-[9px] font-medium text-red-600">Rows Skipped</p>
                          </div>
                        </div>

                        {importFeedback.errors.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Errors Logged:</p>
                            <div className="max-h-24 overflow-y-auto text-[9px] text-red-500 font-mono space-y-0.5">
                              {importFeedback.errors.map((err, idx) => (
                                <p key={idx}>• {err}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setImportModalOpen(false); setImportFile(null); setParsedRows([]); setImportFeedback(null); }}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                {importFile && !importFeedback && (
                  <button
                    type="button"
                    onClick={executeCSVImport}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Execute Import
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: PRODUCT DETAILS VIEW MODAL */}
      <AnimatePresence>
        {detailsModalOpen && viewingProduct && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Product Detail Cockpit</h3>
                    <p className="text-[10px] text-slate-400">View real-time commercial analytics, history ledger, and inventory trends</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Product Dashboard Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Visual Overview */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Image Display */}
                  {viewingProduct.image ? (
                    <img 
                      src={viewingProduct.image} 
                      alt={viewingProduct.name || viewingProduct.productName} 
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 object-cover rounded-2xl border border-slate-150 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-3xl shrink-0">
                      {(viewingProduct.name || viewingProduct.productName || 'P').charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Primary labels */}
                  <div className="space-y-1.5 flex-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-extrabold uppercase tracking-widest">
                      {viewingProduct.category}
                    </span>
                    <h2 className="text-base font-extrabold text-slate-800">
                      {viewingProduct.name || viewingProduct.productName}
                    </h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-slate-500">
                      <p>SKU: <span className="font-bold text-slate-700">{viewingProduct.sku || 'No SKU'}</span></p>
                      <p>Barcode: <span className="font-bold text-slate-700">{viewingProduct.barcode || 'No Barcode'}</span></p>
                      <p>Brand: <span className="font-bold text-slate-700">{viewingProduct.brand || 'Generic'}</span></p>
                      <p>Expiry: <span className="font-bold text-slate-700">{viewingProduct.expiryDate || 'No Expiry'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Key Commercial Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Purchase Price</p>
                    <p className="text-sm font-black text-slate-700">₹{Number(viewingProduct.buyingPrice || viewingProduct.purchasePrice || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Selling Price</p>
                    <p className="text-sm font-black text-slate-800">₹{Number(viewingProduct.sellingPrice).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Stock</p>
                    <p className="text-sm font-black text-slate-700">{viewingProduct.quantity} {viewingProduct.unit}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Profit Margin</p>
                    <p className="text-sm font-black text-emerald-600">{viewingProduct.profitMargin || 0}%</p>
                  </div>
                </div>

                {/* Simulated Charts for Sales & Inventory Movements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Graph 1: Sales velocity */}
                  <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                      Monthly Sales Velocity
                    </p>
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getProductChartData(viewingProduct.id).salesData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} />
                          <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                          <Tooltip wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Graph 2: Stock Movement */}
                  <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-500" />
                      Stock Depletion Curve
                    </p>
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getProductChartData(viewingProduct.id).stockData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} />
                          <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                          <Tooltip wrapperStyle={{ fontSize: 10 }} />
                          <Line type="monotone" dataKey="stock" stroke="#6366f1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Additional supplier & insights details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Supplier Box */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2 text-xs">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Details</p>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700">{viewingProduct.supplier || 'No Registered Supplier'}</p>
                      {viewingProduct.supplierContact && (
                        <p className="text-[10px] text-slate-500 font-medium">Contact: {viewingProduct.supplierContact}</p>
                      )}
                    </div>
                  </div>

                  {/* AI Insights Box */}
                  <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 space-y-2 text-xs relative overflow-hidden">
                    <div className="absolute right-2 top-2 text-indigo-500 opacity-10">
                      <Sparkles className="w-12 h-12" />
                    </div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-200" />
                      AI Analytics Recommendation
                    </p>
                    <p className="text-[11px] text-indigo-950 font-medium leading-relaxed">
                      {viewingProduct.quantity <= viewingProduct.minStock 
                        ? `Item depleted past minimum threshold of ${viewingProduct.minStock} ${viewingProduct.unit}. We suggest placing a reorder of ${viewingProduct.minStock * 3} units to satisfy sales velocity before weekend.`
                        : `Stock levels are healthy. This product is generating a healthy ${viewingProduct.profitMargin || 0}% margin. Bundle with complementary slower inventory lines to optimize counter space.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => { setDetailsModalOpen(false); openFormModal(viewingProduct); }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Edit Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
