# Visual Test Flow - Multi-Store POS 🎬

## 🚀 START HERE

### Server Status
```
✅ Dev Server Running
   URL: http://localhost:3001
   Status: Ready for testing
```

---

## Test Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST FLOW OVERVIEW                            │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: INITIALIZATION
┌────────────────────────────────────────────────────────────────┐
│ 1. Open http://localhost:3001                                  │
│    └─ Expected: App loads, Main Branch auto-created           │
│       ✅ No blank page
│       ✅ Navigation visible
│       ✅ No console errors
└────────────────────────────────────────────────────────────────┘
                              ↓
PHASE 2: STORE CREATION
┌────────────────────────────────────────────────────────────────┐
│ 2. Navigate to Admin (#/admin)                                 │
│    └─ Expected: See stores dashboard                          │
│       ✅ Main Branch visible in grid
│       ✅ Create Store button present
│                                                                │
│ 3. Click Create Store                                          │
│    └─ Fill form with Branch 2 details                         │
│       ✅ Form submits successfully
│       ✅ New store appears in grid
│       ✅ Toast: "Store created successfully!"
└────────────────────────────────────────────────────────────────┘
                              ↓
PHASE 3: HEADER SWITCHER
┌────────────────────────────────────────────────────────────────┐
│ 4. Go back to home (#/)                                        │
│    └─ Expected: See store dropdown in header                  │
│       ✅ Dropdown shows "Main Branch" and "Branch 2"
│       ✅ Can click and select different store
│       ✅ Selection changes immediately
│                                                                │
│ 5. Switch to Branch 2                                          │
│    └─ Expected: App context changes to Branch 2              │
│       ✅ currentStoreId updated
│       ✅ All future operations use Branch 2
└────────────────────────────────────────────────────────────────┘
                              ↓
PHASE 4: POS TRANSACTION
┌────────────────────────────────────────────────────────────────┐
│ 6. Navigate to POS (#/pos)                                     │
│    └─ Expected: See product list and cart                     │
│       ✅ Products load
│       ✅ Store shown in header (Branch 2)
│                                                                │
│ 7. Add product to cart                                         │
│    └─ Click on a product (e.g., Adobo)                       │
│       ✅ Product added to cart
│       ✅ Price and quantity calculated
│                                                                │
│ 8. Checkout                                                    │
│    └─ Click Checkout button                                   │
│       ✅ Payment modal appears
│       ✅ Can select Cash or Card
│                                                                │
│ 9. Confirm Payment                                             │
│    └─ Click pay button                                        │
│       ✅ Toast: "Transaction completed successfully!"
│       ✅ Cart cleared
│       ✅ Transaction saved with storeId = Branch 2 ID
└────────────────────────────────────────────────────────────────┘
                              ↓
PHASE 5: REPORTS FILTERING
┌────────────────────────────────────────────────────────────────┐
│ 10. Navigate to Reports (#/reports)                            │
│     └─ Expected: Reports dashboard with store filter          │
│        ✅ Store dropdown appears
│        ✅ Default shows Branch 2
│        ✅ Transaction from step 9 visible
│                                                                │
│ 11. Switch store filter to "All Stores"                        │
│     └─ Select "All Stores" from dropdown                      │
│        ✅ Metrics update
│        ✅ Shows combined transactions
│                                                                │
│ 12. CSV Export                                                 │
│     └─ Click Download Report button                           │
│        ✅ CSV file downloads
│        ✅ Contains transaction from Branch 2
│        ✅ No transactions from Branch 1 (if none made)
└────────────────────────────────────────────────────────────────┘
                              ↓
PHASE 6: EXPENSE LOGGING
┌────────────────────────────────────────────────────────────────┐
│ 13. From Reports, click Log Expense                            │
│     └─ Expense modal appears                                  │
│        ✅ Form shows fields: Description, Amount, Category
│                                                                │
│ 14. Fill and submit expense                                    │
│     └─ Description: "Cleaning"                                │
│        Amount: 500                                            │
│        Category: Supplies                                     │
│        ✅ Toast: "Expense logged!"
│        ✅ Expense saved with storeId = Branch 2 ID
│        ✅ P&L summary updates
└────────────────────────────────────────────────────────────────┘
                              ↓
PHASE 7: VERIFICATION
┌────────────────────────────────────────────────────────────────┐
│ 15. Switch to Branch 1 in header                               │
│     └─ Go back to Reports (#/reports)                         │
│        ✅ Store filter shows Branch 1
│        ✅ Transaction from Branch 2 NOT visible
│        ✅ Expense from Branch 2 NOT visible
│        ✅ Metrics show zero or different data
│                                                                │
│ 16. Switch back to Branch 2                                    │
│     └─ Reports refresh to show Branch 2 data                  │
│        ✅ Transaction visible again
│        ✅ Expense visible again
│        ✅ Correct metrics shown
└────────────────────────────────────────────────────────────────┘
                              ↓
✅ ALL TESTS PASSED - MULTI-STORE POS WORKING!
```

---

## Quick Reference Buttons

### Navigation (Hash URLs)

```
HOME          #/
POS           #/pos
INVENTORY     #/inventory
REPORTS       #/reports
SETTINGS      #/settings
ADMIN         #/admin
```

### Key UI Elements

```
Header Right:    [Store ▼] [🌙]
Reports Top:     [Store ▼] [Today] [7d] [30d] [Custom] [Download] [Log Expense]
Admin:           [Create Store] [Edit] [Delete] [Grid of stores]
```

---

## Test Checklist

### Phase 1: Initialization ⭐
- [ ] Open http://localhost:3001
- [ ] App loads without errors
- [ ] Main Branch created automatically
- [ ] Navigation menu visible
- [ ] No blank pages

### Phase 2: Store Management ⭐
- [ ] Go to Admin (#/admin)
- [ ] See Main Branch in grid
- [ ] Click Create Store
- [ ] Fill form with Branch 2 details
- [ ] Store created successfully
- [ ] Back button returns to home

### Phase 3: Header Switcher ⭐
- [ ] Store dropdown appears in header
- [ ] Shows "Main Branch" and "Branch 2"
- [ ] Can select each store
- [ ] Selection changes immediately
- [ ] Dark mode looks good

### Phase 4: POS Operations ⭐
- [ ] Navigate to #/pos
- [ ] Select Branch 2 in header
- [ ] Add product to cart
- [ ] Verify price and quantity
- [ ] Click Checkout
- [ ] Payment modal appears
- [ ] Select payment method
- [ ] Success message appears
- [ ] Transaction saved with storeId

### Phase 5: Reports Filtering ⭐
- [ ] Navigate to #/reports
- [ ] Store dropdown present
- [ ] Can select different stores
- [ ] Metrics update on store change
- [ ] "All Stores" shows combined data
- [ ] Date filters work with store filter
- [ ] CSV export respects store filter

### Phase 6: Expense Management ⭐
- [ ] From Reports, click Log Expense
- [ ] Modal appears with form
- [ ] Fill in all fields
- [ ] Submit successfully
- [ ] Expense appears in P&L
- [ ] Switching stores hides other store's expenses

### Phase 7: Full Verification ⭐
- [ ] Create transaction in Branch 1
- [ ] Create transaction in Branch 2
- [ ] Create expense in Branch 1
- [ ] View Reports for Branch 1 - see Branch 1 data only
- [ ] View Reports for Branch 2 - see Branch 2 data only
- [ ] View "All Stores" - see combined data
- [ ] Export CSV - verify correct store data

---

## Data to Create During Testing

### Store 1: Main Branch
```
Name: Main Branch
Code: MAIN001
Address: 123 Mabini St, Manila
Phone: +63 2 1234 5678
Email: main@filipinofusion.com
```

### Store 2: Branch 2 (Create via UI)
```
Name: Branch 2
Code: BR2
Address: 456 Ayala Blvd, Makati
Phone: +63 2 8765 4321
Email: branch2@store.com
```

### Sample Transaction (Branch 1)
```
Product: Adobo
Quantity: 1
Subtotal: ₱250
Tax: ~₱30
Total: ~₱280
Payment: Cash
Store: Main Branch
```

### Sample Expense (Branch 1)
```
Description: Cleaning supplies
Amount: ₱500
Category: Supplies
Store: Main Branch
```

---

## Expected Screen Layouts

### Header (With Multiple Stores)
```
┌─────────────────────────────────────────────────────────────┐
│ 🛒 Main Branch  Smart Inventory System  [Branch 2 ▼]  🌙   │
└─────────────────────────────────────────────────────────────┘
```

### Header (Single Store - Dropdown Hidden)
```
┌─────────────────────────────────────────────────────────────┐
│ 🛒 Main Branch  Smart Inventory System               🌙   │
└─────────────────────────────────────────────────────────────┘
```

### Reports with Store Filter
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back  Reports                                             │
│                       [Today] [7d] [30d] [Custom]          │
│                       [Download] [Log Expense]             │
├─────────────────────────────────────────────────────────────┤
│ Store: [Main Branch ▼]                                     │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Today's Summary                                       │  │
│ │ Total Sales: ₱280  Transactions: 1  Items: 1        │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Profit & Loss Summary                                 │  │
│ │ [Gross Profit]  [Total Expenses]  [Net Profit]       │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting During Testing

### Problem: Store dropdown not showing
```
Solution: 
  1. Go to Admin (#/admin)
  2. Create a second store
  3. Return home
  4. Dropdown should appear
```

### Problem: No transactions in Reports
```
Solution:
  1. Go to POS (#/pos)
  2. Make sure store is selected in header
  3. Add product and checkout
  4. Return to Reports
  5. Transaction should appear
```

### Problem: Wrong store data showing
```
Solution:
  1. Check header - verify correct store selected
  2. Check Reports - verify store filter matches header
  3. Try refreshing page (F5)
  4. Check browser console (F12) for errors
```

### Problem: Page looks broken in dark mode
```
Solution:
  1. Toggle dark mode (click moon/sun icon)
  2. Refresh page (Ctrl+R)
  3. Check console for styling errors
  4. Clear browser cache if persists
```

---

## Success Metrics

When you see ALL of these, testing is complete:

✅ Stores create and display correctly
✅ Header dropdown switches stores (2+ only)
✅ POS transactions saved to selected store
✅ Reports filter by store
✅ Expenses logged to correct store
✅ CSV export respects store filter
✅ No console errors
✅ Dark/light mode works
✅ Navigation smooth and fast
✅ All buttons responsive

---

## Time Breakdown

```
Phase 1: Initialization        2 min
Phase 2: Store Creation        2 min
Phase 3: Header Switcher       2 min
Phase 4: POS Transactions      3 min
Phase 5: Reports Filtering     3 min
Phase 6: Expense Logging       2 min
Phase 7: Full Verification     3 min
                              ────
TOTAL:                        17 min
```

---

## Final Verification

After completing all 7 phases:

1. ✅ Multi-store system fully functional
2. ✅ Store data properly isolated
3. ✅ Transactions/expenses correctly attributed
4. ✅ Reports accurately filtered
5. ✅ No data leakage between stores
6. ✅ User experience smooth
7. ✅ Performance acceptable

---

## Next Actions

### ✅ If All Tests Pass
- System ready for production deployment
- Users can be trained on multi-store features
- Data can be imported from old single-store
- Go live!

### ❌ If Tests Fail
- Check TESTING_GUIDE_MULTI_STORE.md for detailed info
- Check browser console (F12) for error messages
- Verify dev server still running
- Try refreshing page or restarting server

---

## Test Environment Info

```
Server URL:   http://localhost:3001
Status:       ✅ RUNNING
Terminal ID:  d428bd82-46f1-47a6-8151-7254d129ffdd
Browser:      Chrome/Edge/Firefox (any modern browser)
Build Tool:   Vite 6.4.1
TypeScript:   Enabled, All checked ✅
```

---

**Ready to test? Start at Phase 1: Initialization!** 🎉

Questions? See IMPLEMENTATION_SUMMARY.md for detailed architecture documentation.
