# Multi-Store System Testing Guide 🧪

## ✅ Server Status

**Dev Server:** Running at `http://localhost:3001`
**Status:** Active and ready for testing
**Build:** All TypeScript compiles without errors

---

## Test Scenario 1: Initial Load & Default Store Creation

### Expected Behavior:
1. Page loads at `http://localhost:3001`
2. App automatically initializes stores
3. If no stores exist, creates "Main Branch" as default
4. Sets currentStoreId to first store's ID
5. Home page displays with POS/Inventory/Reports/Settings options

### How to Test:
1. Open browser to `http://localhost:3001`
2. Check browser console (F12) for any errors
3. Verify page loads without "Loading store..." message
4. Admin should be visible in navigation (top-left)

### What to Look For:
- ✅ No blank page or errors
- ✅ Main menu modal opens
- ✅ Store name visible in header
- ✅ No console errors related to store initialization

---

## Test Scenario 2: Store Switcher in Header

### Expected Behavior:
1. Store dropdown appears in header (right side, next to theme toggle)
2. If only 1 store exists, dropdown is hidden
3. If 2+ stores exist, dropdown shows all stores

### How to Test:
1. Look at header right section (between "Smart Inventory System" and moon/sun icon)
2. If dropdown not visible, go to Admin (#/admin) and create a second store
3. Return to home page, dropdown should appear

### What to Look For:
- ✅ Dropdown with store options
- ✅ Current store selected by default
- ✅ Can switch between stores
- ✅ Selection changes immediately

---

## Test Scenario 3: Create Multiple Stores (Admin Dashboard)

### Expected Behavior:
1. Navigate to #/admin (Admin Dashboard)
2. See existing stores in grid
3. Can create new stores via "Create Store" button
4. New stores appear in grid and in header dropdown

### How to Test:
1. Click "Admin" in navigation (top-left menu)
2. Should see "Main Branch" in grid (created on init)
3. Click "Create Store" button
4. Fill in:
   - Store Name: "Branch 2"
   - Store Code: "BR2"
   - Address: "456 Ayala Blvd, Makati"
   - Phone: "+63 2 8765 4321"
   - Email: "branch2@store.com"
5. Click "Create"
6. Go back to home (#/), check header dropdown

### What to Look For:
- ✅ Create form appears
- ✅ Form validation works (required fields)
- ✅ Store saves successfully
- ✅ New store appears in Admin grid
- ✅ New store appears in header dropdown
- ✅ Toast "Store created successfully!" appears

---

## Test Scenario 4: Store Selection & Navigation

### Expected Behavior:
1. In header, select different store from dropdown
2. currentStoreId updates
3. POS operations scoped to selected store
4. Can switch back and forth

### How to Test:
1. Navigate to home page
2. In header, use store dropdown to select "Branch 2"
3. Go to POS (#/pos)
4. Note the store context (should be "Branch 2")
5. Create a transaction (add item, checkout)
6. Go to Reports (#/reports)
7. Verify transaction shows for Branch 2
8. Switch to "Branch 1" in header
9. Verify Reports show Branch 1 transactions (or none)

### What to Look For:
- ✅ Store switches immediately
- ✅ Transactions created in correct store
- ✅ Reports filtered by selected store
- ✅ Switching stores doesn't break app

---

## Test Scenario 5: POS Checkout - Multi-Store Attribution

### Expected Behavior:
1. Navigate to POS (#/pos)
2. Ensure store is selected (header dropdown)
3. Add product to cart
4. Checkout and pay
5. Transaction saved with correct storeId

### How to Test:
1. Go to #/pos
2. Select a store from header dropdown
3. Click on a product (e.g., "Adobo")
4. Increase quantity
5. Click "Checkout"
6. Select payment method (Cash or Card)
7. Verify success toast
8. Go to Reports (#/reports)
9. Verify transaction appears under that store

### What to Look For:
- ✅ Can add items to cart
- ✅ Checkout works
- ✅ Transaction created
- ✅ Transaction appears in Reports with correct store
- ✅ Stock decreases correctly

---

## Test Scenario 6: Multi-Store Reports

### Expected Behavior:
1. Reports show store selector dropdown
2. Can view sales for specific store
3. Can view "All Stores" combined
4. Metrics update based on selection
5. CSV export includes selected store only

### How to Test:
1. Create transactions in Store A (go POS, select Store A, checkout)
2. Create transactions in Store B (go POS, select Store B, checkout)
3. Go to Reports (#/reports)
4. In "Store:" dropdown, select "Store A"
5. Verify only Store A transactions shown
6. Check metrics: Total Sales, Transactions, Net Profit
7. Switch to "All Stores"
8. Verify combined metrics
9. Click "Download Report" CSV
10. Open CSV in Excel/notepad

### What to Look For:
- ✅ Store dropdown appears
- ✅ Selecting store filters transactions
- ✅ Metrics update correctly
- ✅ CSV contains only filtered data
- ✅ "All Stores" aggregates correctly
- ✅ Date filters still work with store filter

---

## Test Scenario 7: Expense Logging - Multi-Store

### Expected Behavior:
1. Navigate to Reports (#/reports)
2. Click "Log Expense"
3. Fill in expense details
4. Expense saved with correct storeId
5. Expense appears in P&L calculation

### How to Test:
1. Select Store A in header
2. Go to Reports (#/reports)
3. Click "Log Expense"
4. Fill in:
   - Description: "Cleaning supplies"
   - Amount: 500
   - Category: "Supplies"
5. Click "Save Expense"
6. Check P&L summary - should show expense
7. Switch to Store B in header
8. Go to Reports - expense should NOT appear (different store)
9. Switch back to Store A - expense should appear

### What to Look For:
- ✅ Expense modal opens
- ✅ Form validation works
- ✅ Expense saves
- ✅ Toast confirms "Expense logged!"
- ✅ P&L updates with expense
- ✅ Store B doesn't see Store A expenses
- ✅ CSV export includes expense for correct store

---

## Test Scenario 8: Dark Mode with Multi-Store UI

### Expected Behavior:
1. Dark mode toggle works
2. All multi-store UI (header dropdown, report filters) styled correctly
3. Text readable in both light and dark modes

### How to Test:
1. Click moon/sun icon in header
2. Verify all elements visible and readable
3. Click store dropdown in header
4. Check styling
5. Go to Reports, check store dropdown styling
6. Toggle dark mode on/off several times

### What to Look For:
- ✅ Header dropdown readable in both modes
- ✅ Report dropdown readable in both modes
- ✅ No text disappears on dark background
- ✅ Border/contrast visible
- ✅ No layout breaks

---

## Test Scenario 9: Inventory per Store (Future - TODO)

### Expected Behavior (Currently scoped to "TODO"):
1. Inventory view shows products
2. Can manage products (add, edit, delete)
3. Future: Products will be store-scoped

### How to Test:
1. Go to Inventory (#/inventory)
2. Verify can add/edit/delete products
3. Note: Currently shows all products (future enhancement)

### What to Look For:
- ✅ Inventory page loads
- ✅ Can add products
- ✅ Can edit products
- ✅ Can delete products

---

## Test Scenario 10: Error Handling

### Expected Behavior:
1. If storeId not set, POS shows "Loading store..."
2. If add expense without store, logs with current store
3. If API fails, falls back gracefully

### How to Test:
1. Force a store load error (optional - needs console manipulation)
2. Try operations without selecting store (should still work, use default)
3. Check browser console for any error messages

### What to Look For:
- ✅ No unhandled errors
- ✅ App stays stable
- ✅ Loading messages appear when appropriate
- ✅ Operations complete successfully

---

## Browser Console Checks

### What to Check (F12 → Console):

1. **No Red Errors**
   ```
   Should see no error messages about:
   - storeId undefined
   - currentStoreId is null
   - Missing props
   ```

2. **Network Requests**
   - All requests should complete
   - No 404s or 500s

3. **React/TypeScript**
   - No type errors
   - No prop validation warnings

4. **localStorage**
   - Stores saved in browser storage
   - Can inspect: `localStorage.getItem('stores')`

---

## Testing Checklist

### ✅ Batch 1 - Store State Integration
- [ ] App loads and initializes stores
- [ ] Default store created if none exist
- [ ] currentStoreId set to first store
- [ ] POS doesn't render until currentStoreId set
- [ ] Transactions created with storeId
- [ ] Expenses created with storeId

### ✅ Batch 2 - Header Store Switcher
- [ ] Header dropdown appears with 2+ stores
- [ ] Can switch between stores
- [ ] Selection persists in app state
- [ ] Dark mode styling works
- [ ] Dropdown hidden if only 1 store

### ✅ Batch 3 - Multi-Store Reports
- [ ] Reports dropdown appears
- [ ] Can filter by individual store
- [ ] "All Stores" option works
- [ ] Metrics update with filter
- [ ] CSV export respects filter
- [ ] Date filters work with store filter

### ✅ Batch 4 - Expense Modal
- [ ] Expense modal submits correctly
- [ ] Date field included
- [ ] App.tsx enriches with storeId
- [ ] Expenses appear in Reports

### 🔄 Functionality Tests
- [ ] Create Store A, add 3 items, checkout
- [ ] Create Store B, add 2 items, checkout
- [ ] Verify Reports show 5 total transactions
- [ ] Filter Store A - shows 3 transactions
- [ ] Filter Store B - shows 2 transactions
- [ ] Log expense in Store A
- [ ] Switch to Store B - expense not visible
- [ ] Switch to "All Stores" - expense visible

---

## Troubleshooting

### If page doesn't load:
1. Check terminal: `npm run dev` should show "ready in X ms"
2. Check browser: http://localhost:3001 should load
3. Check F12 Console for errors

### If store dropdown doesn't appear:
1. Go to Admin (#/admin)
2. Create a second store
3. Return to home
4. Dropdown should appear

### If transactions not saving:
1. Check browser console for errors
2. Verify currentStoreId is set (check state)
3. Try browser refresh
4. Check localStorage for stores

### If Reports empty:
1. Verify you created transactions (POS checkout)
2. Verify store filter matches where you created transaction
3. Check date filter isn't too narrow
4. Refresh page

---

## Success Criteria ✅

All of the following should be true:

1. ✅ App loads without errors
2. ✅ Stores initialize on first load
3. ✅ Header shows store dropdown (with 2+ stores)
4. ✅ Can create stores in Admin
5. ✅ Can switch stores from header
6. ✅ POS creates transactions in selected store
7. ✅ Expenses logged in selected store
8. ✅ Reports filter by store correctly
9. ✅ CSV export respects store filter
10. ✅ Dark mode works throughout
11. ✅ No console errors
12. ✅ All TypeScript types valid

---

## Next Steps After Testing

If all tests pass:
1. ✅ Multi-store POS system is production-ready
2. ✅ Can be deployed to production
3. ✅ Users can manage multiple stores
4. ✅ All transactions/expenses scoped correctly
5. ✅ Reports provide store-level insights

Future enhancements (not in this batch):
- Store-scoped inventory
- Advanced analytics per store
- Budgeting by store
- Employee assignments per store
- Store performance comparisons

---

## Test Results Template

```
Date: __________
Tester: __________
Browser: __________ Version: __________

Batch 1 - Store Integration: PASS / FAIL
Batch 2 - Header Switcher: PASS / FAIL
Batch 3 - Multi-Store Reports: PASS / FAIL
Batch 4 - Expense Modal: PASS / FAIL

Overall: PASS / FAIL

Issues Found:
1. ________________
2. ________________
3. ________________

Notes:
________________
________________
```

---

## Server Running Status

```
Terminal ID: d428bd82-46f1-47a6-8151-7254d129ffdd
URL: http://localhost:3001
Status: RUNNING ✅
Time Started: [Current session]
```

To stop server: Press Ctrl+C in terminal
To restart: `npm run dev` in project directory
