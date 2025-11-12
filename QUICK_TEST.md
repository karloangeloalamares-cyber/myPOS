# Quick Start Testing - Multi-Store POS 🚀

## Server Status ✅
```
URL: http://localhost:3001
Status: RUNNING
Terminal ID: d428bd82-46f1-47a6-8151-7254d129ffdd
```

---

## Test Flow (5 Minutes)

### 1️⃣ Verify Initial Load (1 min)
```
1. Open http://localhost:3001
2. Check: Page loads without errors
3. Check: Admin menu visible (top-left)
4. Expected: See "Main Branch" store created automatically
```

### 2️⃣ Create Second Store (1 min)
```
1. Click "Admin" in nav
2. Click "Create Store"
3. Fill form:
   - Name: "Branch 2"
   - Code: "BR2"
   - Address: "456 Ayala Blvd"
   - Phone: "+63 2 8765 4321"
   - Email: "branch2@store.com"
4. Click "Create"
5. Expected: Store appears in grid, toast shows "Store created successfully!"
```

### 3️⃣ Test Header Switcher (1 min)
```
1. Go back home (#/)
2. Look at header right side (between "Smart Inventory System" and moon icon)
3. Check: Store dropdown with "Main Branch" and "Branch 2"
4. Select "Branch 2"
5. Expected: Selection changes, currentStoreId updates
```

### 4️⃣ Test POS with Stores (1 min)
```
1. Go to #/pos
2. Verify current store shows in header
3. Add a product to cart (e.g., Adobo)
4. Click "Checkout"
5. Select payment method (Cash)
6. Expected: Success toast "Transaction completed successfully!"
```

### 5️⃣ Test Reports with Store Filter (1 min)
```
1. Go to #/reports
2. Check: Store dropdown appears (between title and date buttons)
3. Store should default to currently selected store
4. See transaction from step 4 in the metrics
5. Select "All Stores" from dropdown
6. Expected: Metrics update to show transactions from all stores
```

---

## Key Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Home | #/ | Menu |
| POS | #/pos | Create sales |
| Inventory | #/inventory | Manage products |
| Reports | #/reports | View sales/expenses |
| Settings | #/settings | App settings |
| Admin | #/admin | Create stores |

---

## Visual Indicators ✅

### Header (Top)
```
[Back button] [App Name]  Smart Inventory System  [Store ▼]  🌙
```

### Store Dropdown (Header Right)
```
Only appears if 2+ stores
Shows all store names
Current store is pre-selected
```

### Store Filter in Reports
```
Above metrics dashboard
Label: "Store:"
Options: "All Stores" + each store name
```

---

## Expected Results

✅ **Scenario 1:** App initializes with "Main Branch"
✅ **Scenario 2:** Create "Branch 2" successfully
✅ **Scenario 3:** Header dropdown switches stores
✅ **Scenario 4:** POS transaction saved to correct store
✅ **Scenario 5:** Reports filter by store correctly

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Page blank | Refresh (Ctrl+R) |
| No store dropdown | Create 2nd store in Admin |
| No transactions | Create transaction in POS, then view Reports |
| Dropdown missing in reports | Check stores exist (Admin) |
| Wrong data in Reports | Verify store filter matches where transaction was created |
| Dark mode broken | Check F12 Console for errors |

---

## Browser Console (F12)

Should see NO errors related to:
- ❌ storeId undefined
- ❌ currentStoreId null
- ❌ Missing props
- ❌ Store initialization failed

Should see messages like:
- ✅ "Store initialized"
- ✅ "Transaction saved"
- ✅ "Expense logged"

---

## Files Changed (Summary)

```
Batch 1: App.tsx + storeService integration
  - Store state management
  - Transaction/expense storeId attribution
  
Batch 2: Header.tsx store selector
  - Dropdown to switch stores
  
Batch 3: Reports.tsx multi-store filtering
  - Store filter dropdown
  - Metric calculations per store
  
Batch 4: ExpenseModal.tsx verification
  - Already compatible (no changes needed)
```

---

## Commands Reference

```powershell
# Start dev server
cd 'c:\Users\user\Downloads\micro-pos-with-smart-inventory (2)'
npm run dev

# Build for production
npm run build

# Check for errors
npm run build

# Stop dev server
Ctrl+C in terminal
```

---

## Test Data

### Sample Transaction
- Store: Main Branch
- Items: Adobo x1 (₱250)
- Subtotal: ₱250
- Tax: ~₱30
- Total: ~₱280
- Payment: Cash

### Sample Expense
- Store: Main Branch
- Description: Cleaning supplies
- Amount: ₱500
- Category: Supplies

### Sample Store
- Name: Branch 2
- Code: BR2
- Address: 456 Ayala Blvd, Makati
- Phone: +63 2 8765 4321

---

## Success Indicators 🎯

When all these are true, testing is complete:

✅ Stores created and switch works
✅ Transactions created with correct storeId
✅ Reports filter by store
✅ Expenses logged to correct store
✅ CSV export respects store filter
✅ No console errors
✅ Dark mode works
✅ All navigation working

---

## Time Estimates

| Task | Time |
|------|------|
| Full test flow | 5-10 min |
| Create multiple stores | 2 min |
| Test all reports features | 5 min |
| Dark mode testing | 2 min |
| **Total** | **~15 min** |

---

## Notes for Testing

- Use realistic store names (helps spot issues)
- Create at least 2 stores (needed for dropdown testing)
- Test both light and dark modes
- Watch toast notifications (they confirm actions)
- Check localStorage if issues (F12 → Application → Local Storage)

---

**Happy Testing! 🧪**

Questions? Check the full guide in `TESTING_GUIDE_MULTI_STORE.md`
