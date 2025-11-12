# Super Admin Dashboard Setup

## Quick Start to Test Admin Dashboard

### Step 1: Enable Super Admin Role
Open the browser console (F12) while on the app and run:
```javascript
localStorage.setItem('userRole', 'super_admin');
location.reload();
```

### Step 2: Navigate to Admin
You should now see an "Admin" link in the navigation bar at the top. Click it to access the Super Admin Dashboard.

### Step 3: Create a Store
1. Click the "Create Store" button in the top right
2. Fill in the form:
   - **Store Name**: e.g., "Main Branch"
   - **Address**: e.g., "123 Mabini St"
   - **City**: e.g., "Manila"
   - **Contact Phone**: e.g., "+63 2 1234 5678"
   - **Contact Email**: e.g., "manager@store.com"
   - **Timezone**: Select your timezone
3. Click "Create Store"

### Step 4: Edit a Store
1. Click the "Edit" button on any store card
2. Modify the details as needed
3. Click "Save Changes"

### Step 5: Delete a Store
1. Click the "Delete" button on any store card
2. Confirm the deletion

## Features Included

✅ **Store Management**
- Create new stores with name, address, contact info
- Edit existing store details
- Delete stores with confirmation
- Enable/disable stores
- View store metrics (active stores, disabled stores)

✅ **Store Information Display**
- Store name and status badge
- Complete address and contact information
- Timezone settings
- Currency and tax rate configuration
- Store code (auto-generated, cannot be changed)

✅ **Data Persistence**
- All stores are saved to localStorage
- Data persists across page refreshes
- Stores are organized by storeId

## File Structure

```
components/
├── AdminDashboard.tsx       # Main admin dashboard view
├── CreateStoreModal.tsx     # Modal for creating new stores
└── EditStoreModal.tsx       # Modal for editing stores
```

## Component Details

### AdminDashboard
- **Props**: None (standalone component)
- **Features**:
  - Grid display of all stores
  - Statistics cards (total, active, inactive)
  - Create/Edit/Delete functionality
  - Empty state when no stores exist

### CreateStoreModal
- **Props**:
  - `onClose`: () => void
  - `onStoreCreated`: (store: Store) => void
- **Features**:
  - Form validation
  - Timezone selection
  - Auto-generated store code
  - Success feedback

### EditStoreModal
- **Props**:
  - `store`: Store (selected store to edit)
  - `onClose`: () => void
  - `onStoreUpdated`: (store: Store) => void
- **Features**:
  - Pre-populated form fields
  - Tax rate and currency configuration
  - Low stock threshold setting
  - Toggle active/inactive status
  - Read-only store code display

## Navigation Integration

The "Admin" link appears in the navigation only when:
- User role is set to 'super_admin' in localStorage
- Route shows as active when currently viewing #/admin

```javascript
// Check current role
const userRole = localStorage.getItem('userRole');
console.log(userRole); // Should be 'super_admin'

// View all stored stores
const stores = localStorage.getItem('stores');
console.log(JSON.parse(stores || '[]')); // Shows all stores
```

## Testing Checklist

- [ ] Admin link appears in navigation
- [ ] Can create a store with all fields
- [ ] Created store appears in grid
- [ ] Store data persists after page refresh
- [ ] Can edit store details
- [ ] Can disable/enable store
- [ ] Can delete store with confirmation
- [ ] Can't create store without required fields
- [ ] Timezone dropdown works
- [ ] Statistics update correctly (total, active, disabled)

## Next Steps

Once basic store management is working:
1. Create Store Selector UI (for non-admin users to select their store)
2. Create User Management UI (manage store managers, cashiers)
3. Implement authentication with login screen
4. Connect to backend API for persistence
5. Add multi-store reporting and analytics

## localStorage Keys

The admin dashboard uses these localStorage keys:
- `userRole`: Currently logged-in user's role ('super_admin', 'store_manager', etc.)
- `stores`: Array of all stores managed by the system

Example:
```javascript
// Set super admin role
localStorage.setItem('userRole', 'super_admin');

// View all stores
const stores = JSON.parse(localStorage.getItem('stores') || '[]');
stores.forEach(store => {
  console.log(`${store.name} (${store.code})`);
});
```

## URL Routes

- `http://localhost:3001/#/admin` - Super Admin Dashboard
- `http://localhost:3001/#/pos` - Point of Sale
- `http://localhost:3001/#/inventory` - Inventory Management
- `http://localhost:3001/#/reports` - Reports
- `http://localhost:3001/#/settings` - Settings
- `http://localhost:3001/#/` - Home (Filipino Fusion Restaurant Info)

## Troubleshooting

**Admin link doesn't appear?**
- Check browser console: `localStorage.getItem('userRole')`
- Should return 'super_admin'
- If not, run: `localStorage.setItem('userRole', 'super_admin')`

**Stores not persisting?**
- Check if localStorage is enabled in browser
- Try creating a store and checking: `localStorage.getItem('stores')`
- Should see JSON array with store objects

**Modals not opening?**
- Check browser console for errors (F12)
- Ensure the store object has all required fields

**Edit/Delete buttons not working?**
- Verify store object has an `id` field
- Check browser console for error messages
