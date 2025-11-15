import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ModuleBackButton from '../../components/ModuleBackButton';

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
};

type AppointmentInfo = {
  client_name: string | null;
  starts_at: string;
  status: string;
};

const MODULE_OVERVIEW = [
  { key: 'pos', label: 'POS Terminal' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'reports', label: 'Reports' },
  { key: 'staff', label: 'Staff' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'commissions', label: 'Commissions' },
  { key: 'clients', label: 'CRM' },
  { key: 'tips', label: 'Tips' },
  { key: 'multi_branch', label: 'Multi-Branch' },
  { key: 'export', label: 'Export' },
  { key: 'reminders', label: 'Reminders' },
  { key: 'loyalty', label: 'Loyalty' },
];

type ClientForm = {
  name: string;
  phone: string;
  email: string;
  tags: string;
  notes: string;
};

const CLIENT_FORM_FIELDS: Array<{ label: string; key: keyof ClientForm; placeholder: string; required: boolean }> = [
  { label: 'Client name', key: 'name', placeholder: 'Juan Dela Cruz', required: true },
  { label: 'Mobile number', key: 'phone', placeholder: '09171234567', required: true },
  { label: 'Email', key: 'email', placeholder: 'juan@sample.com', required: true },
  { label: 'Tags (comma separated)', key: 'tags', placeholder: 'VIP,referral', required: false },
];

const initialFormState: ClientForm = {
  name: '',
  phone: '',
  email: '',
  tags: '',
  notes: '',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<AppointmentInfo[]>([]);
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ClientForm>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 

  const stats = useMemo(() => {
    const total = clients.length;
    const last30 = clients.filter(client => {
      const createdAt = new Date(client.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const upcoming = appointments.filter(appt => {
      const start = new Date(appt.starts_at);
      return start >= new Date() && appt.status === 'pending';
    }).length;

    return { total, last30, upcoming };
  }, [clients, appointments]);

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(term)
      || (client.phone ?? '').toLowerCase().includes(term)
      || (client.email ?? '').toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const storeResult = await supabase
        .from('stores')
        .select('id')
        .eq('code', 'DEMO_STORE')
        .maybeSingle();
      const currentStoreId = storeResult.data?.id ?? null;
      setStoreId(currentStoreId);

      const clientsPromise = supabase
        .from('clients')
        .select('id,name,phone,email,tags,notes,created_at')
        .order('created_at', { ascending: false });
      const appointmentsPromise = supabase
        .from('appointments')
        .select('client_name,starts_at,status');
      const modulePromise = currentStoreId
        ? supabase
            .from('store_modules')
            .select('module_name,is_enabled')
            .eq('store_id', currentStoreId)
        : Promise.resolve({ data: [] as { module_name: string; is_enabled: boolean }[] });

      const [
        { data: clientRows, error: clientError },
        { data: appointmentRows, error: appointmentError },
        modulesResponse,
      ] = await Promise.all([clientsPromise, appointmentsPromise, modulePromise]);

      if (clientError) throw clientError;
      if (appointmentError) throw appointmentError;

      setClients(clientRows ?? []);
      setAppointments(appointmentRows ?? []);
      if (modulesResponse?.data) {
        const moduleMap: Record<string, boolean> = {};
        modulesResponse.data.forEach(({ module_name, is_enabled }: { module_name: string; is_enabled: boolean }) => {
          moduleMap[module_name] = is_enabled;
        });
        setModules(moduleMap);
      }
    } catch (error) {
      console.error('CRM load error', error);
      setSubmitError('Unable to load CRM data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setAttemptedSubmit(true);
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setSubmitError('Name, phone, and email are required.');
      setSuccessMessage(null);
      return;
    }

    setIsSaving(true);
    setSubmitError(null);
    setSuccessMessage(null);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      tags: form.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      notes: form.notes.trim() || null,
      store_id: storeId,
    };

    try {
      const { error } = await supabase.from('clients').insert(payload);
      if (error) throw error;
      setSuccessMessage('Client saved.');
      setForm(initialFormState);
      setAttemptedSubmit(false);
      await loadData();
    } catch (error) {
      console.error('CRM save error', error);
      setSubmitError('Something went wrong while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setAttemptedSubmit(false);
    setSubmitError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="p-4 lg:p-6 w-full max-w-6xl mx-auto space-y-5">
      <ModuleBackButton />
      <div className="space-y-2">
        <p className="text-lg font-semibold">Clients & CRM</p>
        <p className="text-sm text-slate-500">Track your clients, appointments, and loyalty data in one place.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 space-y-1">
          <p className="text-xs text-slate-500">Total clients</p>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-slate-400">New in 30 days: {stats.last30}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 space-y-1">
          <p className="text-xs text-slate-500">Upcoming appointments</p>
          <p className="text-2xl font-bold">{stats.upcoming}</p>
          <p className="text-xs text-slate-400">Pending bookings to confirm</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 space-y-1">
          <p className="text-xs text-slate-500">CRM modules</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {MODULE_OVERVIEW.map(module => (
              <span
                key={module.key}
                className={`px-2 py-1 rounded-full border text-[10px] uppercase tracking-wide ${
                  modules[module.key]
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-800/40 dark:border-emerald-700'
                    : 'border-slate-300 text-slate-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-600'
                }`}
              >
                {module.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Add a client</h2>
          <p className="text-sm text-slate-500">Every client you save here can be linked to appointments, purchases, and loyalty.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {CLIENT_FORM_FIELDS.map(field => (
            <label key={field.key} className="space-y-1">
              <span className="text-xs font-medium text-slate-500">
                {field.label} {field.required && <span className="text-pink-600">*</span>}
              </span>
              <input
                className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
              />
              {attemptedSubmit && field.required && !form[field.key]?.trim() && (
                <p className="text-xs text-red-600">{field.label} is required.</p>
              )}
            </label>
          ))}
        </div>

        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Notes</span>
          <textarea
            rows={3}
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
            placeholder="Add any notes about this client..."
            value={form.notes}
            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button type="button" onClick={resetForm} className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
              Clear form
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded text-sm disabled:opacity-40"
            >
              {isSaving ? 'Saving…' : 'Save client'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Client list</p>
            <p className="text-xs text-slate-500">{clients.length} clients stored</p>
          </div>
          <input
            className="border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
            placeholder="Search clients"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading clients…</div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center text-sm text-slate-500">
            No clients yet. Customers synced here from POS, bookings, and loyalty will appear as soon as you add them.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">Client</th>
                  <th className="px-2 py-2">Phone</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Tags</th>
                  <th className="px-2 py-2">Last activity</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => {
                  const lastAppointment = appointments.find(appt =>
                    appt.client_name?.toLowerCase().includes(client.name.toLowerCase())
                  );
                  return (
                    <tr key={client.id} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="px-2 py-3">
                        <div className="font-semibold">{client.name}</div>
                        <div className="text-xs text-slate-500">Added {new Date(client.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-2 py-3">{client.phone || '—'}</td>
                      <td className="px-2 py-3">{client.email || '—'}</td>
                      <td className="px-2 py-3 space-x-1">
                        {(client.tags ?? []).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {(client.tags ?? []).length === 0 && <span className="text-xs text-slate-400">none</span>}
                      </td>
                      <td className="px-2 py-3">
                        {lastAppointment ? (
                          <span className="text-xs text-slate-500">
                            {new Date(lastAppointment.starts_at).toLocaleString()} • {lastAppointment.status}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">No appointments yet</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <a
                          className="text-slate-600 text-xs underline hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                          href="#/appointments"
                        >
                          Schedule appointment
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
