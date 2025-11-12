# Super Admin Dashboard - Quick Reference Guide

## 🚀 Quick Start

### Step 1: Enable Super Admin (Run in Browser Console - F12)
```javascript
localStorage.setItem('userRole', 'super_admin');
location.reload();
```

### Step 2: Navigate to Admin Dashboard
Click **"Admin"** in the navigation bar at the top

### Step 3: Create Your First Store
Click **"Create Store"** button and fill in:
- Store Name: `Main Branch`
- Address: `123 Mabini Street`
- City: `Manila`
- Phone: `+63 2 1234 5678`
- Email: `manager@store.com`
- Timezone: Select from dropdown

---

## 📊 Admin Dashboard UI

```
┌─────────────────────────────────────────────────────────────────────┐
│ Super Admin Dashboard                      [Create Store Button]    │
│ Manage all stores and locations                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Total Stores: 0  │  Active Stores: 0  │  Disabled Stores: 0       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │ Store Name      │  │ Store Name      │  │ Store Name      │   │
│  │ ✓ Active        │  │ ✓ Active        │  │ ⊘ Inactive      │   │
│  │                 │  │                 │  │                 │   │
│  │ 📍 Address Info │  │ 📍 Address Info │  │ 📍 Address Info │   │
│  │ 📧 Email        │  │ 📧 Email        │  │ 📧 Email        │   │
│  │ 📞 Phone        │  │ 📞 Phone        │  │ 📞 Phone        │   │
│  │ 🕐 Timezone     │  │ 🕐 Timezone     │  │ 🕐 Timezone     │   │
│  │                 │  │                 │  │                 │   │
│  │ Code: STORE1234 │  │ Code: STORE5678 │  │ Code: STORE9012 │   │
│  │ USD 0% Tax      │  │ PHP 12% Tax     │  │ USD 0% Tax      │   │
│  │                 │  │                 │  │                 │   │
│  │ [Edit] [Delete] │  │ [Edit] [Delete] │  │ [Edit] [Delete] │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Create Store Modal

```
┌────────────────────────────────────┐
│ Create New Store              [✕]  │
├────────────────────────────────────┤
│                                    │
│ Store Name *                       │
│ [_________________________]         │
│                                    │
│ Address *                          │
│ [_________________________]         │
│                                    │
│ City *                             │
│ [_________________________]         │
│                                    │
│ Contact Phone *                    │
│ [_________________________]         │
│                                    │
│ Contact Email *                    │
│ [_________________________]         │
│                                    │
│ Timezone                           │
│ [▼ UTC                    ]         │
│                                    │
│ [Cancel] [Create Store]            │
│                                    │
└────────────────────────────────────┘
```

---

## ✏️ Edit Store Modal

```
┌────────────────────────────────────┐
│ Edit Store                    [✕]  │
├────────────────────────────────────┤
│                                    │
│ Store Code                         │
│ [STORE1234                 ] (RO)  │
│ Store codes cannot be changed      │
│                                    │
│ Store Name *                       │
│ [Main Branch________________]       │
│                                    │
│ Address *                          │
│ [123 Mabini St_____________]       │
│                                    │
│ Phone *                            │
│ [+63 2 1234 5678__________]        │
│                                    │
│ Email *                            │
│ [manager@store.com_________]       │
│                                    │
│ Timezone                           │
│ [▼ Asia/Manila             ]       │
│                                    │
│ Currency                           │
│ [▼ PHP                     ]       │
│                                    │
│ Tax Rate (%)                       │
│ [12.00_____________________]        │
│                                    │
│ Low Stock Threshold                │
│ [10_________________________]        │
│                                    │
│ ☑ Store is Active                  │
│                                    │
│ [Cancel] [Save Changes]            │
│                                    │
└────────────────────────────────────┘
```

---

## 🎨 Features

### Store Card Display
- **Status Badge**: Green = Active, Gray = Inactive
- **Color Header Bar**: Visual status indicator
- **Complete Info**: Address, contact, timezone, currency, tax
- **Quick Actions**: Edit and Delete buttons

### Statistics
- **Total Stores**: Count of all stores
- **Active Stores**: Count of enabled stores
- **Disabled Stores**: Count of inactive stores

### Form Validation
- ✅ All required fields must be filled
- ✅ Phone must be valid format
- ✅ Email must be valid format
- ✅ Error messages show immediately
- ✅ Form prevents submission with empty fields

### Data Safety
- ✅ Delete requires confirmation
- ✅ Confirmation dialog before deletion
- ✅ Undo not available (permanent delete)
- ✅ All operations save immediately to localStorage

---

## 🔧 Available Actions

| Action | Location | Result |
|--------|----------|--------|
| **Create Store** | Dashboard → "Create Store" button | Opens form modal |
| **Edit Store** | Store card → "Edit" button | Opens pre-filled edit modal |
| **Delete Store** | Store card → "Delete" button | Confirmation then removal |
| **Toggle Status** | Edit modal → "Store is Active" checkbox | Enable/disable store |
| **Change Settings** | Edit modal → Tax/Currency/Threshold fields | Update store config |

---

## 📱 Responsive Design

```
Mobile (1 column)       Tablet (2 columns)      Desktop (3 columns)
┌──────────┐            ┌──────────┐ ┌──────────┐
│ Store 1  │            │ Store 1  │ │ Store 2  │
├──────────┤            ├──────────┤ ├──────────┤
│ Store 2  │            │ Store 3  │ │ Store 4  │
├──────────┤            ├──────────┤ ├──────────┤
│ Store 3  │            │ Store 5  │ │ Store 6  │
├──────────┤            └──────────┘ └──────────┘
│ Store 4  │
└──────────┘
```

---

## 🔐 Security Features

- **Role-Based Access**: Admin link only visible to super_admin role
- **Confirmation Dialogs**: Required for destructive operations
- **Input Validation**: Prevents invalid data entry
- **localStorage Safety**: Data persists locally, no transmission risk

---

## 💾 Data Persistence

All store data is automatically saved to browser localStorage:

```javascript
// View all stores
console.log(JSON.parse(localStorage.getItem('stores') || '[]'));

// Check current user role
console.log(localStorage.getItem('userRole'));

// Clear all data (for testing)
localStorage.clear();
```

---

## 🌍 Timezone Options

When creating or editing a store, choose from:
- **Americas**: New_York, Chicago, Denver, Los_Angeles, Anchorage, Honolulu
- **Europe**: London, Paris
- **Asia**: Tokyo, Shanghai, Hong_Kong
- **Pacific**: Sydney
- **UTC**: Coordinated Universal Time

---

## 💱 Currency Options

Available currencies for store:
- USD (US Dollar)
- PHP (Philippine Peso) ⭐ Default for Filipino restaurants
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CNY (Chinese Yuan)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- SGD (Singapore Dollar)
- HKD (Hong Kong Dollar)

---

## 🚨 Troubleshooting

### "Admin link doesn't appear"
```javascript
// Run in console:
localStorage.setItem('userRole', 'super_admin');
location.reload();
```

### "Stores not saving"
```javascript
// Check localStorage:
console.log(localStorage.getItem('stores'));
// Should show JSON array of stores
```

### "Form won't submit"
- Check all required fields are filled
- Email must be valid format
- Phone should not be empty
- Check browser console for errors (F12)

### "Delete button not working"
- Confirm dialog should appear
- Click "OK" to confirm deletion
- Store will be removed immediately

---

## 📚 Documentation Files

- **ADMIN_SETUP.md** - Detailed setup instructions
- **SUPER_ADMIN_DASHBOARD.md** - Complete technical documentation
- **QUICK_REFERENCE.md** - This file (quick visual guide)

---

## 🎯 Next Steps

After creating stores:
1. ✅ **Create Store** - Add your first location
2. ⏭️ **Store Selector** - Let users choose their store
3. ⏭️ **User Management** - Assign managers to stores
4. ⏭️ **Multi-Store Reports** - Compare performance across locations
5. ⏭️ **Backend Integration** - Connect to real database

---

## 📞 Support

If you encounter issues:
1. Open browser console (F12)
2. Check for red error messages
3. Verify localStorage has 'userRole' = 'super_admin'
4. Try refreshing the page
5. Clear browser cache if needed: Ctrl+Shift+Delete

---

**Status**: ✅ Ready to Use  
**Dev Server**: http://localhost:3001  
**Admin Route**: http://localhost:3001/#/admin
