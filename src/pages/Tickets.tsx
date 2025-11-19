import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ModuleBackButton from '../../components/ModuleBackButton';
import { listTickets, createTicket, updateTicket, Ticket, TicketStatus, TicketType } from '@/lib/tickets';
import { staffService } from '../../services/staffService';

const STATUS_OPTIONS: Array<TicketStatus | 'all'> = ['all', 'waiting', 'in_progress', 'ready', 'completed', 'cancelled'];
const TYPE_OPTIONS: Array<TicketType | 'all'> = ['all', 'laundry', 'repair', 'spa', 'carwash', 'other'];

export default function TicketsPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('myPOS');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TicketType | 'all'>('all');
  const [customers, setCustomers] = useState<{ id: string; name: string; phone?: string | null }[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const staffList = useMemo(() => staffService.getAll(), []);
  const [form, setForm] = useState({
    customer_id: '',
    client_name: '',
    client_phone: '',
    ticket_type: 'laundry' as TicketType,
    staff_id: '',
    promised_at: '',
    total_amount: '',
    notes: '',
  });

  const hasSelectedCustomer = !!form.customer_id;
  const hasAnyCustomers = customers.length > 0;

  const loadStore = async () => {
    try {
      const { data } = await supabase.from('stores').select('id,name').eq('code', 'DEMO_STORE').maybeSingle();
      if (data) {
        setStoreId(data.id);
        setStoreName(data.name);
      }
    } catch (error) {
      console.error('failed to load store', error);
    }
  };

  const fetchTickets = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const tickets = await listTickets({
        storeId,
        status: statusFilter === 'all' ? undefined : statusFilter,
        ticketType: typeFilter === 'all' ? undefined : typeFilter,
      });
      setTickets(tickets);
    } catch (error) {
      console.error('ticket load error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id,name,phone')
        .order('name', { ascending: true });
      if (error) throw error;
      setCustomers(data ?? []);
    } catch (error) {
      console.error('customers load error', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [storeId, statusFilter, typeFilter]);

  const handleStatusTransition = async (ticket: Ticket, targetStatus: TicketStatus) => {
    try {
      await updateTicket(ticket.id, { status: targetStatus });
      fetchTickets();
    } catch (error) {
      console.error('status update failed', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!storeId) return;
    setCreateLoading(true);
    setModalError(null);
    try {
      const payload = {
        storeId,
        customerId: form.customer_id || undefined,
        ticketType: form.ticket_type,
        staffId: form.staff_id || undefined,
        promisedAt: form.promised_at || undefined,
        totalAmount: form.total_amount ? Number(form.total_amount) : undefined,
        notes: form.notes || undefined,
      };
      if (!form.customer_id && (form.client_name || form.client_phone)) {
        payload.notes = `${payload.notes ?? ''} Client: ${form.client_name}, Mobile: ${form.client_phone}`.trim();
      }
      await createTicket(payload);
      setModalOpen(false);
      setForm({
        customer_id: '',
        client_name: '',
        client_phone: '',
        ticket_type: 'laundry',
        staff_id: '',
        promised_at: '',
        total_amount: '',
        notes: '',
      });
      fetchTickets();
    } catch (error) {
      console.error('create ticket failed', error);
      setModalError('Unable to create ticket. Try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const statusBadge = (status: TicketStatus) => {
    const mappings: Record<TicketStatus, string> = {
      waiting: 'text-amber-600 bg-amber-100',
      in_progress: 'text-sky-600 bg-sky-100',
      ready: 'text-lime-700 bg-lime-100',
      completed: 'text-green-700 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
    };
    return mappings[status];
  };

  return (
    <div className="p-4 lg:p-6 w-full max-w-6xl mx-auto space-y-5">
      <ModuleBackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tickets & Queue</h1>
          <p className="text-xs text-slate-500">Track service tickets or laundry loads.</p>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm shadow-sm hover:bg-indigo-500"
          onClick={() => setModalOpen(true)}
        >
          Create Ticket
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap gap-3">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                statusFilter === option ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
              }`}
              onClick={() => setStatusFilter(option)}
            >
              {option === 'all' ? 'All' : option.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-xs text-slate-500">Service type</label>
          <select
            className="border border-slate-200 bg-white text-sm px-3 py-1 rounded dark:bg-slate-900 dark:border-slate-700"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as TicketType | 'all')}
          >
            {TYPE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All types' : option}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 ml-auto">{storeName}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500 tracking-wide">
              <tr>
                <th className="px-2 py-2">Ticket #</th>
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Check-in</th>
                <th className="px-2 py-2">Promised</th>
                <th className="px-2 py-2">Staff</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-xs text-slate-500">
                    Loading tickets…
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-xs text-slate-500">
                    No tickets yet.
                  </td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-2 py-2 font-mono text-xs text-slate-600">{ticket.ticket_number}</td>
                    <td className="px-2 py-2">
                      {ticket.customer ? (
                        <div>
                          <div className="font-semibold">{ticket.customer.name}</div>
                          {ticket.customer.phone && <div className="text-[11px] text-slate-500">{ticket.customer.phone}</div>}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Walk-in</span>
                      )}
                    </td>
                    <td className="px-2 py-2 capitalize">{ticket.ticket_type}</td>
                    <td className="px-2 py-2">
                      <span className={`text-[11px] px-2 py-1 rounded-full ${statusBadge(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-2 py-2">{new Date(ticket.checkin_at).toLocaleString()}</td>
                    <td className="px-2 py-2">{ticket.promised_at ? new Date(ticket.promised_at).toLocaleString() : '—'}</td>
                    <td className="px-2 py-2">{ticket.staff_id || '—'}</td>
                    <td className="px-2 py-2 space-x-1">
                      {ticket.status === 'waiting' && (
                        <button className="text-xs text-blue-600" onClick={() => handleStatusTransition(ticket, 'in_progress')}>
                          Start
                        </button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <button className="text-xs text-amber-600" onClick={() => handleStatusTransition(ticket, 'ready')}>
                          Ready
                        </button>
                      )}
                      {ticket.status === 'ready' && (
                        <button className="text-xs text-green-600" onClick={() => handleStatusTransition(ticket, 'completed')}>
                          Complete
                        </button>
                      )}
                      {ticket.status !== 'cancelled' && ticket.status !== 'completed' && (
                        <button className="text-xs text-red-600" onClick={() => handleStatusTransition(ticket, 'cancelled')}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden mt-6">
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Create Ticket</h2>
                <button type="button" className="text-slate-500" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
              </div>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Existing customer (optional)</span>
                <select
                  className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                  value={form.customer_id}
                  onChange={e => setForm(prev => ({ ...prev, customer_id: e.target.value }))}
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone ? `(${customer.phone})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              {!customersLoading && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
                  <p className="text-xs text-indigo-700">
                    {customers.length === 0
                      ? "No CRM customers yet. Create one to reuse profiles."
                      : "Reuse CRM customers for faster ticket intake."}
                  </p>
                  <button
                    type="button"
                    className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/40"
                    onClick={() => {
                      setModalOpen(false);
                      window.location.hash = "#/clients";
                    }}
                  >
                    Create customer
                  </button>
                </div>
              )}
              {!hasSelectedCustomer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">Client name</span>
                    <input
                      className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                      placeholder="Client name"
                      value={form.client_name}
                      onChange={e => setForm(prev => ({ ...prev, client_name: e.target.value }))}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">Mobile number</span>
                    <input
                      className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                      placeholder="Mobile number"
                      value={form.client_phone}
                      onChange={e => setForm(prev => ({ ...prev, client_phone: e.target.value }))}
                    />
                  </label>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Ticket type</span>
                  <select
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                    value={form.ticket_type}
                    onChange={e => setForm(prev => ({ ...prev, ticket_type: e.target.value as TicketType }))}
                  >
                    {TYPE_OPTIONS.filter(option => option !== 'all').map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Assign staff</span>
                  <select
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                    value={form.staff_id}
                    onChange={e => setForm(prev => ({ ...prev, staff_id: e.target.value }))}
                  >
                    <option value="">Not assigned</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Promised at</span>
                  <input
                    type="datetime-local"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                    value={form.promised_at}
                    onChange={e => setForm(prev => ({ ...prev, promised_at: e.target.value }))}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Estimated total</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                    value={form.total_amount}
                    onChange={e => setForm(prev => ({ ...prev, total_amount: e.target.value }))}
                  />
                </label>
              </div>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Notes</span>
                <textarea
                  rows={3}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </label>
              {modalError && <p className="text-xs text-red-600">{modalError}</p>}
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-end gap-3">
              <button type="button" className="text-slate-600" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
                onClick={handleCreateTicket}
                disabled={createLoading}
              >
                {createLoading ? 'Creating…' : 'Create ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
