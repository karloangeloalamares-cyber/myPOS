
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import ConfirmProvider from './components/ConfirmProvider';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import CategoryTabs from './components/CategoryTabs';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import StoreModulesAdmin from '@/pages/admin/StoreModules';
import SuperAdminLogin from './components/SuperAdminLogin';
import StoreLogin from './components/StoreLogin';
import LoginHub from './components/LoginHub';
import CheckoutModal from './components/CheckoutModal';
import DiscountModal from './components/DiscountModal';
import ProductQuickModal from './components/ProductQuickModal';
import HomePage from './components/HomePage';
import { Toast, ToastContainer } from './components/Toast';
import { Product, CartItem, Transaction, Expense, SettingsData, Theme, ToastMessage, Discount, Store, User, Staff } from './types';
// Start with empty products; no test data
import { storeService } from './services/storeService';
import { staffService } from './services/staffService';
import { getCurrentUser as getLocalUser, logout as localLogout } from './services/localAuth';
import { getModules, FREE_PLAN, type ModuleMap } from '@/services/moduleService';
import { recordTipForSale } from '@/lib/tips';
import { isServiceItem, isStockTrackedItem } from '@/lib/stock';
import { ensureDemoData } from './services/demoSeeder';
import AppointmentsPage from '@/pages/Appointments';
import TicketsPage from '@/pages/Tickets';
import TipsPage from '@/pages/Tips';
import ClientsPage from '@/pages/Clients';
import CommissionsPage from '@/pages/Commissions';
import ExportPage from '@/pages/Export';
import RemindersPage from '@/pages/Reminders';
import MultiBranchPage from '@/pages/MultiBranch';
import UtangLedgerModal from './components/UtangLedgerModal';

// A simple local storage hook
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      // If item doesn't exist, return initial value
      if (!item) {
        return initialValue;
      }
      // Reviver function to correctly parse dates
      const parsed = JSON.parse(item, (k, v) => (k === 'timestamp' || k === 'date') ? new Date(v) : v);
      // Use parsed value, but fallback to initial value if parsed is null
      return parsed ?? initialValue;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  return [storedValue, setValue];
}

const App: React.FC = () => {
  // Global State
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [route, setRoute] = useState(window.location.hash || '#/');

  // Data State
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [settings, setSettings] = useLocalStorage<SettingsData>('settings', {
    storeName: 'myPOS',
    storeAddress: '',
    contactInfo: '',
    taxRate: 12,
    lowStockThreshold: 10,
  });

  // Multi-store State
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Ensure product IDs are unique to avoid React key collisions from older saved data
  useEffect(() => {
    if (!products || products.length === 0) return;
    const seen = new Set<string>();
    let changed = false;
    const normalized = products.map(product => {
      let id = product.id;
      if (!id || seen.has(id)) {
        const fallbackId =
          (globalThis.crypto?.randomUUID?.() as string | undefined) ??
          `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        id = fallbackId;
        changed = true;
      }
      seen.add(id);
      return { ...product, id };
    });
    if (changed) {
      setProducts(normalized);
    }
  }, [products, setProducts]);

  const displayedStoreName = useMemo(() => {
    if (currentUser?.role === 'super_admin') return 'myPOS Admin';
    if (currentStoreId) {
      const s = stores.find(st => st.id === currentStoreId);
      if (s) return s.settings?.storeName || s.name;
    }
    return 'myPOS';
  }, [currentUser, currentStoreId, stores]);

  const currentStore = useMemo(() => {
    return stores.find(st => st.id === currentStoreId) || null;
  }, [stores, currentStoreId]);
  
  // UI State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [discount, setDiscount] = useLocalStorage<Discount | null>('discount', null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [modules, setModules] = useState<ModuleMap>(FREE_PLAN);
  

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Initialize current user from local storage
  useEffect(() => {
    const user = getLocalUser();
    setCurrentUser(user);
    if (user && user.storeId) {
      setCurrentStoreId(user.storeId);
    }
  }, []);

  // Load enabled modules when store changes
  useEffect(() => {
    if (!currentStoreId) return;
    getModules(currentStoreId).then(setModules).catch(() => setModules(FREE_PLAN));
  }, [currentStoreId]);

  // Load staff list once
  useEffect(() => {
    try {
      setStaff(staffService.getAll());
    } catch {}
  }, []);

  // Ensure demo data (products, transactions, tips, etc.) exist for the current store
  useEffect(() => {
    if (!currentStore) return;
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const snapshot = await ensureDemoData(currentStore);
        if (cancelled || !snapshot) return;
        if (snapshot.products) setProducts(snapshot.products);
        if (snapshot.transactions) setTransactions(snapshot.transactions);
        if (snapshot.expenses) setExpenses(snapshot.expenses);
        if (snapshot.staff) setStaff(snapshot.staff);
      } catch (error) {
        console.error('Failed to bootstrap store data', error);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [currentStore, setProducts, setTransactions, setExpenses, setStaff]);

  // Initialize stores on mount
  useEffect(() => {
    const initializeStores = async () => {
      try {
        const allStores = await storeService.getAllStores();
        setStores(allStores);
      } catch (error) {
        console.error('Failed to initialize stores:', error);
        
      }
    };
    
    initializeStores();
  }, []);

  // Auto-select a store (demo or first) when none is active
  useEffect(() => {
    if (currentStoreId || stores.length === 0) return;
    const demoStore =
      stores.find(store => store.code === 'DEMO_STORE') || stores[0];
    if (demoStore) {
      setCurrentStoreId(demoStore.id);
    }
  }, [stores, currentStoreId]);

  // Derived State
  const categories = useMemo(() => ['All', ...new Set(products.map(p => {
    // Extract category name from categoryId or fallback to 'Uncategorized'
    const categoryId = (p as any).categoryId || (p as any).category;
    if (categoryId === 'cat_appetizers') return 'Appetizers';
    if (categoryId === 'cat_main_courses') return 'Main Courses';
    if (categoryId === 'cat_desserts') return 'Desserts';
    if (categoryId === 'cat_drinks') return 'Drinks';
    return (p as any).category || 'Other';
  }))], [products]);
  
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(p => {
      const categoryId = (p as any).categoryId || (p as any).category;
      let pCategory = '';
      if (categoryId === 'cat_appetizers') pCategory = 'Appetizers';
      else if (categoryId === 'cat_main_courses') pCategory = 'Main Courses';
      else if (categoryId === 'cat_desserts') pCategory = 'Desserts';
      else if (categoryId === 'cat_drinks') pCategory = 'Drinks';
      else pCategory = (p as any).category || 'Other';
      
      return pCategory === selectedCategory;
    });
  }, [products, selectedCategory]);
  
  const { cartSubtotal, discountAmount, taxAmount, finalTotal } = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    let calculatedDiscount = 0;
    if (discount) {
        if (discount.type === 'percent') {
            calculatedDiscount = subtotal * (discount.value / 100);
        } else {
            calculatedDiscount = discount.value;
        }
    }
    // Ensure discount doesn't exceed subtotal
    calculatedDiscount = Math.min(subtotal, calculatedDiscount);

    const discountedSubtotal = subtotal - calculatedDiscount;
    const tax = discountedSubtotal * (settings.taxRate / 100);
    const total = discountedSubtotal + tax;

    return {
        cartSubtotal: subtotal,
        discountAmount: calculatedDiscount,
        taxAmount: tax,
        finalTotal: total
    }
  }, [cart, discount, settings.taxRate]);


  // Handlers
  const addToast = (message: string, type: 'success' | 'error') => {
    const newToast: ToastMessage = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
  };
  
  const handleAddToCart = useCallback((product: Product, quantity: number) => {
    if (quantity <= 0) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      const newTotalQuantity = (existingItem?.quantity || 0) + quantity;
      const hasStockLimit = isStockTrackedItem(product);

      if (hasStockLimit && newTotalQuantity > product.stock) {
        addToast(`Not enough stock for ${product.name}. Only ${product.stock} available.`, 'error');
        return prevCart;
      }
      
      if (existingItem) {
        addToast(`${quantity} more ${product.name}(s) added to order`, 'success');
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: newTotalQuantity } : item
        );
      }

      addToast(`${quantity} ${product.name}(s) added to order`, 'success');
      return [...prevCart, { ...product, quantity }];
    });
    setSelectedProduct(null); // Close modal after adding to cart
  }, [setCart]);

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, [setCart]);

  const handleClearCart = useCallback(() => {
    setCart([]);
    setDiscount(null);
  }, [setCart, setDiscount]);

  const handleCheckout = () => {
    if (cart.length > 0) {
      setCheckoutModalOpen(true);
    }
  };
  
  const handleApplyDiscount = (appliedDiscount: Discount) => {
    setDiscount(appliedDiscount);
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let calculatedDiscount = 0;
     if (appliedDiscount.type === 'percent') {
        calculatedDiscount = subtotal * (appliedDiscount.value / 100);
    } else {
        calculatedDiscount = appliedDiscount.value;
    }
    calculatedDiscount = Math.min(subtotal, calculatedDiscount);
    addToast(`Discount of ₱${calculatedDiscount.toFixed(2)} applied.`, 'success');
    setDiscountModalOpen(false);
  }

  const handleConfirmCheckout = useCallback(async (payment: {
    paymentMethod: 'Cash' | 'Card';
    tipAmount?: number;
    tipMethod?: 'cash' | 'card' | 'gcash' | 'other';
    allocations?: { staffId: string; amount: number }[];
  }) => {
    if (!currentStoreId || cart.length === 0) return;

    const commissionTotal = cart.reduce((sum, item) => {
      if (item.isCommissionable && item.commissionRate) {
        const lineAmount = item.price * item.quantity;
        return sum + lineAmount * item.commissionRate;
      }
      return sum;
    }, 0);

    const newTransaction: Transaction = {
      id: `TX-${Date.now()}`,
      storeId: currentStoreId,
      cashierId: 'user_default',
      items: cart,
      subtotal: cartSubtotal,
      tax: taxAmount,
      discountAmount: discountAmount,
      discountDetails: discount,
      total: finalTotal,
      timestamp: new Date(),
      paymentMethod: payment.paymentMethod.toLowerCase() as 'cash' | 'card',
      status: 'completed',
      commissionTotal: commissionTotal > 0 ? commissionTotal : 0,
    };
    setTransactions(prev => [...prev, newTransaction]);

    if (commissionTotal > 0) {
      const now = new Date();
      const commissionExpense: Expense = {
        id: `comm-${newTransaction.id}`,
        storeId: currentStoreId,
        recordedBy: currentUser?.id || 'system_auto',
        description: `Auto: Commissions for transaction ${newTransaction.id}`,
        amount: commissionTotal,
        category: 'COMMISSIONS',
        date: now,
        approved: true,
        createdAt: now,
      };
      // Commissions are recorded as operating expenses, not deducted from revenue.
      setExpenses(prev => [...prev, commissionExpense]);
    }
    
    // Update stock
    setProducts(prevProducts => {
        const newProducts = [...prevProducts];
        cart.forEach(cartItem => {
            const itemIsService = isServiceItem(cartItem);

            // 1) Menu: decrement bundle children
            if ((cartItem as any).itemType === 'menu' && Array.isArray((cartItem as any).bundleItems)) {
              const children = (cartItem as any).bundleItems as { itemId: string; qty: number }[];
              children.forEach(child => {
                const idx = newProducts.findIndex(p => p.id === child.itemId);
                if (idx > -1 && isStockTrackedItem(newProducts[idx])) {
                  newProducts[idx].stock -= (child.qty || 1) * cartItem.quantity;
                }
              });
            }

            // 2) Own stock: only products/ingredients/consumables decrement themselves
            if (!itemIsService) {
              const productIndex = newProducts.findIndex(p => p.id === cartItem.id);
              if (productIndex > -1 && isStockTrackedItem(newProducts[productIndex])) {
                  newProducts[productIndex].stock -= cartItem.quantity;
              }
            }

            // 3) Consumed items: for product/service/menu, decrement linked ingredients/consumables
            const consumed = (cartItem as any).consumedItems as { itemId: string; qty: number }[] | undefined;
            if (Array.isArray(consumed)) {
              consumed.forEach(child => {
                const idx = newProducts.findIndex(p => p.id === child.itemId);
                if (idx > -1 && isStockTrackedItem(newProducts[idx])) {
                  newProducts[idx].stock -= (child.qty || 1) * cartItem.quantity;
                }
              });
            }
        });
        return newProducts;
    });

    try {
      if (payment.tipAmount && payment.tipAmount > 0 && currentStoreId) {
        await recordTipForSale({
          storeId: currentStoreId,
          saleId: newTransaction.id,
          totalTip: payment.tipAmount,
          method: payment.tipMethod ?? 'cash',
          allocations: payment.allocations ?? [],
        });
      }
    } catch (tipError) {
      console.error('Failed to record tip', tipError);
    }

    handleClearCart();
    setCheckoutModalOpen(false);
    addToast('Transaction completed successfully!', 'success');
  }, [cart, cartSubtotal, taxAmount, discountAmount, finalTotal, discount, currentStoreId, currentUser, setTransactions, handleClearCart, setProducts, setExpenses]);

  const handleSaveSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
    addToast('Settings saved!', 'success');
  };

  const handleLogout = () => {
    localLogout();
    setCurrentUser(null);
    setCurrentStoreId(null);
    window.location.hash = '#/login-admin';
  };

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: `p${Date.now()}` };
    setProducts(prev => [...prev, newProduct]);
    addToast('Menu item added!', 'success');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    addToast('Menu item updated!', 'success');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    addToast('Menu item deleted!', 'success');
  };

  const handleDeleteMultipleProducts = (productIds: string[]) => {
    setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
    addToast(`${productIds.length} menu item(s) deleted!`, 'success');
  }
  
  const handleAddExpense = (expense: Omit<Expense, 'id' | 'storeId' | 'recordedBy' | 'approved' | 'createdAt'>) => {
    if (!currentStoreId) return;
    
    const newExpense: Expense = {
      ...expense,
      id: `ex-${Date.now()}`,
      storeId: currentStoreId,
      recordedBy: 'cashier_default',
      approved: true,
      createdAt: new Date(),
    };
    setExpenses(prev => [...prev, newExpense]);
    addToast('Expense logged!', 'success');
  };

  // Gemini AI removed — no-op handler removed to clean up code.

  const renderPage = () => {
    // Guard: Prevent POS operations until currentStoreId is set
    if (!currentStoreId && route === '#/pos') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Please login to a store to continue.</p>
            <div className="mt-4">
              <a href="#/login-store" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Owner Login</a>
            </div>
          </div>
        </div>
      );
    }

    switch (route) {
      case '#/login-admin':
        return (
          <div className="flex items-center justify-center h-full">
            <SuperAdminLogin onSuccess={() => { setCurrentUser(getLocalUser()); window.location.hash = '#/admin'; }} />
          </div>
        );
      case '#/login-store':
        return (
          <div className="flex items-center justify-center h-full">
            <StoreLogin stores={stores} onSuccess={(sid) => { setCurrentStoreId(sid); setCurrentUser(getLocalUser()); window.location.hash = '#/'; }} />
          </div>
        );
      case '#/login':
        return (
          <div className="flex items-center justify-center h-full">
            <LoginHub />
          </div>
        );
      case '#/pos':
        return (
          <div className="flex flex-col h-full w-full gap-4">
            <div className="flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { window.history.back(); }}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
                  aria-label="Back to Main Menu"
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Point of Sale</h2>
              </div>
              {/* Business feature chips; click to open demo panels where applicable */}
              <div className="flex items-center gap-3">
                {currentStore?.features?.enableTables && (
                  <div className="px-2 py-1 text-xs rounded-md bg-indigo-100 text-indigo-700">Tables</div>
                )}
                {currentStore?.features?.enableUtangLedger && (
                  <button onClick={() => setShowLedger(true)} className="px-2 py-1 text-xs rounded-md bg-emerald-100 text-emerald-700">Utang Ledger</button>
                )}
                {currentStore?.features?.enableExpiryAlerts && (
                  <div className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-700">Expiry Alerts</div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow min-h-0">
              <div className="lg:col-span-2 flex flex-col min-h-0">
                  <CategoryTabs categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                  <div className="flex-grow overflow-y-auto pr-2 -mr-2 min-h-0">
                  <ProductList products={filteredProducts} onProductClick={setSelectedProduct} lowStockThreshold={settings.lowStockThreshold} showExpiryBadge={!!currentStore?.features?.enableExpiryAlerts} />
                  </div>
              </div>
              <div className="flex flex-col min-h-0">
                  <Cart 
                    items={cart}
                    settings={settings}
                    discount={discountAmount}
                    onUpdateQuantity={handleUpdateQuantity} 
                    onClearCart={handleClearCart} 
                    onCheckout={handleCheckout}
                    onOpenDiscountModal={() => setDiscountModalOpen(true)}
                  />
              </div>
            </div>
          </div>
        );
      case '#/admin':
        if (!currentUser || currentUser.role !== 'super_admin') {
          return (
            <div className="flex items-center justify-center h-full">
              <SuperAdminLogin onSuccess={() => { setCurrentUser(getLocalUser()); window.location.hash = '#/admin'; }} />
            </div>
          );
        }
        return <AdminDashboard />;
      case '#/admin-modules':
        if (!currentUser || currentUser.role !== 'super_admin') {
          return (
            <div className="flex items-center justify-center h-full">
              <SuperAdminLogin onSuccess={() => { setCurrentUser(getLocalUser()); window.location.hash = '#/admin-modules'; }} />
            </div>
          );
        }
        return <StoreModulesAdmin storeId={currentStoreId || ''} />;
      case '#/appointments':
        return <AppointmentsPage />;
      case '#/tickets':
        return <TicketsPage />;
      case '#/tips':
        return <TipsPage />;
      case '#/clients':
        return <ClientsPage />;
      case '#/commissions':
        return (
          <CommissionsPage
            stores={stores}
            transactions={transactions}
            expenses={expenses}
            currentStoreId={currentStoreId}
          />
        );
      case '#/export':
        return <ExportPage />;
      case '#/reminders':
        return <RemindersPage />;
      case '#/multi-branch':
        return <MultiBranchPage />;
      case '#/inventory':
        if (!currentStoreId) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Please login to a store to manage inventory.</p>
                <div className="mt-4">
                  <a href="#/login-store" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Owner Login</a>
                </div>
              </div>
            </div>
          );
        }
        return <Inventory products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onDeleteMultipleProducts={handleDeleteMultipleProducts} lowStockThreshold={settings.lowStockThreshold} hideCategory={currentStore?.businessType === 'SALON'} />;
      case '#/reports':
        if (!currentStoreId) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Please login to a store to view reports.</p>
                <div className="mt-4">
                  <a href="#/login-store" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Owner Login</a>
                </div>
              </div>
            </div>
          );
        }
        return <Reports
          transactions={transactions}
          expenses={expenses}
          onAddExpense={handleAddExpense}
          stores={stores}
          currentStoreId={currentStoreId}
        />;
      case '#/settings':
        if (!currentStore) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Please login to a store to adjust settings.</p>
                <div className="mt-4">
                  <a href="#/login-store" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Owner Login</a>
                </div>
              </div>
            </div>
          );
        }
        return (
          <Settings
            settings={settings}
            store={currentStore}
            modules={modules}
            staff={staff}
            onSave={handleSaveSettings}
            onStaffsChanged={setStaff}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <HomePage storeName={displayedStoreName} modules={modules} features={currentStore?.features} />
          </div>
        );
    }
  };

  return (
    <ConfirmProvider>
    <div className={`flex flex-col min-h-screen w-full bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans overflow-x-hidden`}>
      <Header
        theme={theme}
        setTheme={setTheme}
        storeName={displayedStoreName}
        stores={stores}
        currentStoreId={currentStoreId}
        onStoreChange={setCurrentStoreId}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-grow w-full p-4 lg:p-6 overflow-y-auto">
        {renderPage()}
      </main>

      {isCheckoutModalOpen && (
        <CheckoutModal 
          cartItems={cart}
          subtotal={cartSubtotal}
          tax={taxAmount}
          discount={discountAmount}
          total={finalTotal}
          settings={settings}
          onClose={() => setCheckoutModalOpen(false)}
          onConfirm={handleConfirmCheckout}
          staff={staff}
        />
      )}
      
      {isDiscountModalOpen && (
        <DiscountModal
            onClose={() => setDiscountModalOpen(false)}
            onApply={handleApplyDiscount}
            subtotal={cartSubtotal}
            currentDiscount={discount}
        />
      )}

      {selectedProduct && (
        <ProductQuickModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(quantity) => handleAddToCart(selectedProduct, quantity)}
        />
      )}

      {showLedger && currentStoreId && (
        <UtangLedgerModal storeId={currentStoreId} onClose={() => setShowLedger(false)} />
      )}

      <ToastContainer>
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
          />
        ))}
      </ToastContainer>
    </div>
    </ConfirmProvider>
  );
};

export default App;


