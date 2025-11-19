from pathlib import Path
path = Path('src/pages/Tickets.tsx')
lines = path.read_text().splitlines()
start = next(i for i,l in enumerate(lines) if 'Existing customer (optional)' in l)
end = next(i for i in range(start, len(lines)) if 'Create customer' in lines[i])
end = end + 4
new_block = [
    '            <label className="space-y-1">',
    '              <span className="text-xs font-medium text-slate-500">Existing customer (optional)</span>',
    '              <select',
    '                className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"',
    '                value={form.customer_id}',
    '                onChange={e => setForm(prev => ({ ...prev, customer_id: e.target.value }))}',
    '              >',
    '                <option value="">Select a customer</option>',
    '                {customers.map(customer => (',
    '                  <option key={customer.id} value={customer.id}>',
    '                    {customer.name} {customer.phone ? `({customer.phone})` : ""}',
    '                  </option>',
    '                ))}',
    '              </select>',
    '            </label>',
    '            {!customersLoading && (',
    '              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">',
    '                <p className="text-xs text-indigo-700">',
    '                  {customers.length === 0',
    '                    ? "No CRM customers yet. Create one to reuse profiles."',
    '                    : "Reuse CRM customers for faster ticket intake."}',
    '                </p>',
    '                <button',
    '                  type="button"',
    '                  className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/40"',
    '                  onClick={() => {',
    '                    setModalOpen(false);',
    '                    window.location.hash = "#/clients";',
    '                  }}',
    '                >',
    '                  Create customer',
    '                </button>',
    '              </div>',
    '            )}',
]
new_lines = lines[:start-1] + new_block + lines[end:]
path.write_text('\n'.join(new_lines))
