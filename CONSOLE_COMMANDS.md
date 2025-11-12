# Console Commands Reference

## 🚀 Getting Started

### Enable Super Admin Access (REQUIRED)
```javascript
localStorage.setItem('userRole', 'super_admin');
location.reload();
```
*Run this in browser console (F12) to see Admin link*

---

## 📊 Viewing Data

### Get All Stores
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
console.table(stores);
```
*Shows all stores in a formatted table*

### Get Specific Store
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
const myStore = stores.find(s => s.id === 'store_1699512345678');
console.log(myStore);
```
*Replace the ID with your actual store ID*

### Get Store Count
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
console.log('Total stores:', stores.length);
console.log('Active stores:', stores.filter(s => s.enabled).length);
console.log('Inactive stores:', stores.filter(s => !s.enabled).length);
```

### Get Current User Role
```javascript
console.log('User role:', localStorage.getItem('userRole'));
```

### Get Last Created Store
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
if (stores.length > 0) {
  const latest = stores[stores.length - 1];
  console.log('Latest store:', latest.name, latest.id);
}
```

### Search Stores by Name
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
const searchTerm = 'Manila'; // Change this
const results = stores.filter(s => s.name.includes(searchTerm));
console.table(results);
```

### List All Store Names and Codes
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
stores.forEach((store, index) => {
  console.log(`${index + 1}. ${store.name} (${store.code})`);
});
```

---

## 🔧 Creating Data

### Create Store via Console
```javascript
const newStore = {
  id: `store_${Date.now()}`,
  name: 'Console Test Store',
  code: `STORE${Date.now().toString().slice(-4)}`,
  address: '456 Test Street',
  phone: '+63 2 9999 9999',
  email: 'test@store.com',
  settings: {
    storeName: 'Console Test Store',
    storeAddress: '456 Test Street',
    contactInfo: 'Test City',
    phone: '+63 2 9999 9999',
    email: 'test@store.com',
    taxRate: 12,
    lowStockThreshold: 10,
    currency: 'PHP',
    timezone: 'Asia/Manila'
  },
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const stores = JSON.parse(localStorage.getItem('stores') || '[]');
stores.push(newStore);
localStorage.setItem('stores', JSON.stringify(stores));
console.log('Store created:', newStore.name);
location.reload(); // Refresh to see in UI
```

---

## ✏️ Updating Data

### Update Store via Console
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
const storeToUpdate = stores.find(s => s.name === 'Filipino Fusion Manila');

if (storeToUpdate) {
  storeToUpdate.settings.taxRate = 15;
  storeToUpdate.settings.currency = 'USD';
  storeToUpdate.updatedAt = new Date();
  localStorage.setItem('stores', JSON.stringify(stores));
  console.log('Store updated');
  location.reload();
}
```

### Disable All Stores
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
stores.forEach(store => {
  store.enabled = false;
  store.updatedAt = new Date();
});
localStorage.setItem('stores', JSON.stringify(stores));
console.log('All stores disabled');
location.reload();
```

### Enable All Stores
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
stores.forEach(store => {
  store.enabled = true;
  store.updatedAt = new Date();
});
localStorage.setItem('stores', JSON.stringify(stores));
console.log('All stores enabled');
location.reload();
```

### Update All Tax Rates
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
const newTaxRate = 15; // Change this

stores.forEach(store => {
  store.settings.taxRate = newTaxRate;
  store.updatedAt = new Date();
});
localStorage.setItem('stores', JSON.stringify(stores));
console.log(`Tax rate updated to ${newTaxRate}% for all stores`);
location.reload();
```

---

## 🗑️ Deleting Data

### Delete Specific Store by Name
```javascript
const storeName = 'Store to Delete'; // Change this
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
const filtered = stores.filter(s => s.name !== storeName);

if (filtered.length < stores.length) {
  localStorage.setItem('stores', JSON.stringify(filtered));
  console.log(`Deleted: ${storeName}`);
  location.reload();
} else {
  console.log('Store not found');
}
```

### Delete All Stores
```javascript
if (confirm('Delete ALL stores? This cannot be undone!')) {
  localStorage.setItem('stores', JSON.stringify([]));
  console.log('All stores deleted');
  location.reload();
}
```

### Clear All Data
```javascript
if (confirm('Clear ALL localStorage data? This affects the entire app!')) {
  localStorage.clear();
  console.log('All data cleared');
  location.reload();
}
```

---

## 🔐 Role Management

### Set Role to Super Admin
```javascript
localStorage.setItem('userRole', 'super_admin');
console.log('Role changed to: super_admin');
location.reload();
```

### Set Role to Store Manager
```javascript
localStorage.setItem('userRole', 'store_manager');
console.log('Role changed to: store_manager');
location.reload();
```

### Set Role to Cashier
```javascript
localStorage.setItem('userRole', 'cashier');
console.log('Role changed to: cashier');
location.reload();
```

### Set Role to Inventory Manager
```javascript
localStorage.setItem('userRole', 'inventory_manager');
console.log('Role changed to: inventory_manager');
location.reload();
```

### Get Current Role
```javascript
console.log('Current role:', localStorage.getItem('userRole'));
```

---

## 📋 Data Analysis

### Store Statistics
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
console.log(`
Store Statistics:
- Total Stores: ${stores.length}
- Active: ${stores.filter(s => s.enabled).length}
- Inactive: ${stores.filter(s => !s.enabled).length}
- Average Tax Rate: ${(stores.reduce((sum, s) => sum + s.settings.taxRate, 0) / stores.length || 0).toFixed(2)}%
- Currencies Used: ${[...new Set(stores.map(s => s.settings.currency))].join(', ')}
- Timezones: ${[...new Set(stores.map(s => s.settings.timezone))].join(', ')}
`);
```

### Find Stores by Currency
```javascript
const currency = 'PHP'; // Change this
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
const result = stores.filter(s => s.settings.currency === currency);
console.table(result);
```

### Find Stores by Timezone
```javascript
const timezone = 'Asia/Manila'; // Change this
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
const result = stores.filter(s => s.settings.timezone === timezone);
console.table(result);
```

### Stores with High Tax Rate
```javascript
const taxThreshold = 15; // Change this
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
const result = stores.filter(s => s.settings.taxRate > taxThreshold);
console.log(`Stores with tax rate > ${taxThreshold}%:`);
console.table(result);
```

### Export All Data as JSON
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
const userData = {
  role: localStorage.getItem('userRole'),
  stores: stores,
  exportDate: new Date().toISOString()
};

// Copy to clipboard
const json = JSON.stringify(userData, null, 2);
copy(json);
console.log('Data copied to clipboard');
console.log(json);
```

---

## 🔄 Data Migration

### Backup All Data
```javascript
// Store your data somewhere safe
const backup = {
  userRole: localStorage.getItem('userRole'),
  stores: localStorage.getItem('stores'),
  timestamp: new Date().toISOString()
};
console.log('Save this data:', JSON.stringify(backup, null, 2));
```

### Restore from Backup
```javascript
// Use previously saved backup data
const backup = {
  "userRole": "super_admin",
  "stores": "[...]", // Your JSON data here
  "timestamp": "2024-11-11T10:00:00.000Z"
};

localStorage.setItem('userRole', backup.userRole);
localStorage.setItem('stores', backup.stores);
console.log('Data restored');
location.reload();
```

### Import Stores from Array
```javascript
const importedStores = [
  // Add your store objects here
  {
    id: 'store_1',
    name: 'Store 1',
    code: 'STORE0001',
    // ... other fields
  }
];

const currentStores = JSON.parse(localStorage.getItem('stores') || '[]');
const merged = [...currentStores, ...importedStores];
localStorage.setItem('stores', JSON.stringify(merged));
console.log(`Imported ${importedStores.length} stores`);
location.reload();
```

---

## 🧪 Testing Commands

### Create 5 Test Stores
```javascript
const testStores = [
  { name: 'Manila Branch', city: 'Manila', currency: 'PHP', taxRate: 12 },
  { name: 'Cebu Branch', city: 'Cebu', currency: 'PHP', taxRate: 12 },
  { name: 'New York Branch', city: 'New York', currency: 'USD', taxRate: 8 },
  { name: 'Bangkok Branch', city: 'Bangkok', currency: 'THB', taxRate: 7 },
  { name: 'Singapore Branch', city: 'Singapore', currency: 'SGD', taxRate: 8 }
];

const stores = JSON.parse(localStorage.getItem('stores') || '[]');

testStores.forEach(test => {
  const store = {
    id: `store_${Date.now()}_${Math.random()}`,
    name: test.name,
    code: `STORE${Math.floor(Math.random() * 10000)}`,
    address: `123 Main St, ${test.city}`,
    phone: '+63 2 1234 5678',
    email: `manager@${test.name.toLowerCase().replace(' ', '')}.com`,
    settings: {
      storeName: test.name,
      storeAddress: `123 Main St, ${test.city}`,
      contactInfo: test.city,
      phone: '+63 2 1234 5678',
      email: `manager@${test.name.toLowerCase().replace(' ', '')}.com`,
      taxRate: test.taxRate,
      lowStockThreshold: 10,
      currency: test.currency,
      timezone: 'Asia/Manila'
    },
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  stores.push(store);
});

localStorage.setItem('stores', JSON.stringify(stores));
console.log('Created 5 test stores');
location.reload();
```

### Verify Data Integrity
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
let errors = [];

stores.forEach((store, index) => {
  if (!store.id) errors.push(`Store ${index}: Missing id`);
  if (!store.name) errors.push(`Store ${index}: Missing name`);
  if (!store.code) errors.push(`Store ${index}: Missing code`);
  if (!store.settings) errors.push(`Store ${index}: Missing settings`);
  if (!store.settings.currency) errors.push(`Store ${index}: Missing currency`);
});

if (errors.length === 0) {
  console.log('✅ All stores are valid');
} else {
  console.log('❌ Data integrity issues found:');
  errors.forEach(error => console.log(`  - ${error}`));
}
```

---

## 📱 Browser Navigation

### Navigate to Admin Dashboard
```javascript
window.location.hash = '#/admin';
```

### Navigate to POS
```javascript
window.location.hash = '#/pos';
```

### Navigate to Inventory
```javascript
window.location.hash = '#/inventory';
```

### Navigate to Reports
```javascript
window.location.hash = '#/reports';
```

### Navigate to Settings
```javascript
window.location.hash = '#/settings';
```

### Navigate to Home
```javascript
window.location.hash = '#/';
```

---

## 🐛 Debugging

### Check Browser Console for Errors
```javascript
// This shows all errors in the console
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
});
```

### Test localStorage Availability
```javascript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('✅ localStorage is available');
} catch (e) {
  console.error('❌ localStorage is not available:', e);
}
```

### Monitor localStorage Changes
```javascript
window.addEventListener('storage', (e) => {
  console.log('localStorage changed:', e.key, e.newValue);
});
```

### Performance Monitoring
```javascript
console.time('Store Load');
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
console.timeEnd('Store Load');
console.log(`Loaded ${stores.length} stores`);
```

---

## 💡 Pro Tips

### Copy Data to Share
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
copy(JSON.stringify(stores, null, 2)); // Copies to clipboard
console.log('Data copied to clipboard - paste anywhere');
```

### Quick Store Search
```javascript
const search = (name) => {
  const stores = JSON.parse(localStorage.getItem('stores') || '[]');
  return stores.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
};
search('Manila'); // Returns matching stores
```

### One-Liner to Clear and Start Over
```javascript
localStorage.clear(); location.reload();
```

### Set Multiple Items at Once
```javascript
Object.entries({
  'userRole': 'super_admin',
  'theme': 'light'
}).forEach(([key, value]) => localStorage.setItem(key, value));
```

---

## 📞 Common Issues

### Issue: Admin link not showing
**Solution**:
```javascript
localStorage.setItem('userRole', 'super_admin');
location.reload();
```

### Issue: Stores not saving
**Solution**:
```javascript
// Check if localStorage is working
console.log(localStorage.getItem('stores'));
// If empty, check browser storage limits
```

### Issue: Dates appear as strings
**Solution**: This is normal - localStorage stores everything as strings. Use `new Date(dateString)` to convert when needed.

### Issue: Can't find a specific store
**Solution**:
```javascript
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
console.table(stores); // View all stores in table format
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Enable Admin | `localStorage.setItem('userRole', 'super_admin'); location.reload();` |
| View Stores | `console.table(JSON.parse(localStorage.getItem('stores') \|\| '[]'));` |
| Store Count | `JSON.parse(localStorage.getItem('stores') \|\| '[]').length` |
| Delete All | `localStorage.clear(); location.reload();` |
| Export Data | `copy(JSON.stringify(JSON.parse(localStorage.getItem('stores') \|\| '[]'), null, 2))` |
| Navigate Admin | `window.location.hash = '#/admin';` |

---

**Last Updated**: November 11, 2024  
**Status**: ✅ Complete  
**Version**: 1.0.0
