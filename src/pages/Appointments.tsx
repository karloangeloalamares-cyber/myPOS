import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ModuleBackButton from "../../components/ModuleBackButton";

type Appointment = {
  id: string;
  client_name: string | null;
  client_phone: string | null;
  staff_id: string | null;
  service_id: string | null;
  starts_at: string;
  status: string;
  customer_id?: string | null;
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
};

type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
};
const SERVICE_OPTIONS = [
  { value: "haircut", label: "Haircut & Styling" },
  { value: "spa", label: "Relaxing Spa" },
  { value: "massage", label: "Therapeutic Massage" },
];

const STAFF_OPTIONS = [
  { value: "staff_1", label: "Mara – Stylist" },
  { value: "staff_2", label: "Jonah – Technician" },
  { value: "staff_3", label: "Aleli – Therapist" },
];

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerLoadError, setCustomerLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    staff_id: "",
    service_id: "",
    date: "",
    time: "",
    notes: "",
    customer_id: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const hasSelectedCustomer = !!form.customer_id;

  const hasAnyCustomers = (customers?.length ?? 0) > 0;

  const isFormValid = useMemo(() => {
    return (
      form.client_name.trim() &&
      form.client_phone.trim() &&
      form.service_id &&
      form.date &&
      form.time
    );
  }, [form]);

  async function load() {
    try {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "id,client_name,client_phone,staff_id,service_id,starts_at,status,customer_id,customer:customer_id(id,name,phone,email)"
      )
      .order("starts_at", { ascending: true }); // include CRM customer join for the UI
      if (error) throw error;
      setItems(data ?? []);
      setLoadError(null);
    } catch (error) {
      console.error(error);
      setLoadError((error as Error)?.message ?? "Unable to load appointments");
    }
  }

  async function loadCustomers() {
    setCustomersLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id,name,phone,email")
        .order("name", { ascending: true });
      if (error) throw error;
      setCustomers(data ?? []);
      setCustomerLoadError(null);
    } catch (error) {
      console.error(error);
      setCustomerLoadError((error as Error)?.message ?? "Unable to load CRM customers");
    } finally {
      setCustomersLoading(false);
    }
  }

  async function handleSave() {
    setAttemptedSubmit(true);
    if (!isFormValid) {
      setSubmitError("Please complete all required fields before saving.");
      setSuccessMessage(null);
      return;
    }

    const startsAt = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(startsAt.getTime())) {
      setSubmitError("The selected date/time is invalid.");
      setSuccessMessage(null);
      return;
    }

    setIsAdding(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.from("appointments").insert({
        client_name: form.client_name || null,
        client_phone: form.client_phone || null,
        staff_id: form.staff_id || null,
        customer_id: form.customer_id || null, // link to CRM customer when selected
        service_id: form.service_id || null,
        starts_at: startsAt.toISOString(),
        status: "pending",
      });

      if (error) throw error;

      await load();
      setSuccessMessage("Appointment created.");
      setForm({
        client_name: "",
        client_phone: "",
        staff_id: "",
        service_id: "",
        date: "",
        time: "",
        notes: "",
        customer_id: "",
      });
      setAttemptedSubmit(false);
    } catch (error) {
      console.error(error);
      setSubmitError("Something went wrong while saving. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  const resetForm = () => {
    setForm({
      client_name: "",
      client_phone: "",
      staff_id: "",
      service_id: "",
      date: "",
      time: "",
      notes: "",
      customer_id: "",
    });
    setAttemptedSubmit(false);
    setSubmitError(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    load();
    loadCustomers();
  }, []);

  return (
    <div className="p-4 lg:p-6 w-full max-w-6xl mx-auto space-y-6">
      <ModuleBackButton />
      <h1 className="text-xl font-semibold">Appointments</h1>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Create New Appointment</h2>
          <p className="text-sm text-slate-500">Book a client with a staff member and service.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-500">
              Existing customer (optional)
            </span>
            <select
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
              value={form.customer_id}
              onChange={e => {
                const selected = customers.find(customer => customer.id === e.target.value);
                setForm(prev => ({
                  ...prev,
                  customer_id: e.target.value,
                  client_name: selected?.name ?? prev.client_name,
                  client_phone: selected?.phone ?? prev.client_phone,
                }));
              }}
            >
              <option value="">Select a CRM customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                </option>
              ))}
            </select>
            {customerLoadError && (
              <p className="text-xs text-red-600">{customerLoadError}</p>
            )}
            {!customersLoading && customers.length === 0 ? (
              <p className="text-xs text-slate-500">
                No customers found. Please add a customer in CRM first.
              </p>
            ) : null}
            {!customersLoading && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-2">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Need to register someone new? Create a CRM customer first.
                </p>
                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/40 rounded px-2 py-1"
                  onClick={() => {
                    window.location.hash = '#/clients';
                  }}
                >
                  Create customer
                </button>
              </div>
            )}
          </label>
          {!hasSelectedCustomer && (
            <>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Client name</span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                  placeholder="Juan Dela Cruz"
                  value={form.client_name}
                  onChange={e => setForm({ ...form, client_name: e.target.value })}
                />
                {attemptedSubmit && !form.client_name.trim() && (
                  <p className="text-xs text-red-600">Client name is required.</p>
                )}
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Mobile number</span>
                <input
                  className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
                  placeholder="09XXXXXXXXX"
                  value={form.client_phone}
                  onChange={e => setForm({ ...form, client_phone: e.target.value })}
                />
                {attemptedSubmit && !form.client_phone.trim() && (
                  <p className="text-xs text-red-600">Mobile number is required.</p>
                )}
              </label>
            </>
          )}
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Service</span>
            <select
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
              value={form.service_id}
              onChange={e => setForm({ ...form, service_id: e.target.value })}
            >
              <option value="">Select a service</option>
              {SERVICE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {attemptedSubmit && !form.service_id && (
              <p className="text-xs text-red-600">Please pick a service.</p>
            )}
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Staff (optional)</span>
            <select
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
              value={form.staff_id}
              onChange={e => setForm({ ...form, staff_id: e.target.value })}
            >
              <option value="">Not assigned</option>
              {STAFF_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Date</span>
            <input
              type="date"
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
            {attemptedSubmit && !form.date && (
              <p className="text-xs text-red-600">Please pick a date.</p>
            )}
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Time</span>
            <input
              type="time"
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
              value={form.time}
              onChange={e => setForm({ ...form, time: e.target.value })}
            />
            {attemptedSubmit && !form.time && (
              <p className="text-xs text-red-600">Please pick a time.</p>
            )}
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Notes (optional)</span>
          <textarea
            rows={3}
            className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-900"
            placeholder="Add internal notes (not stored yet)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              onClick={resetForm}
            >
              Clear form
            </button>
            <button
              type="button"
              disabled={isAdding || !isFormValid}
              onClick={handleSave}
              className="px-4 py-2 bg-black text-white rounded text-sm disabled:opacity-40"
            >
              {isAdding ? "Saving…" : "Save appointment"}
            </button>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="text-red-600 text-sm">
          Unable to load appointments: {loadError}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center text-sm text-slate-500">No appointments yet. New bookings will appear here.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>When</th>
              <th>Client</th>
              <th>Staff</th>
              <th>Service</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id} className="border-t">
                <td>{new Date(a.starts_at).toLocaleString()}</td>
                <td>
                  {a.customer?.name ? (
                    <div className="space-y-1">
                      <div>{a.customer.name}</div>
                      {a.customer.phone && (
                        <div className="text-[11px] text-slate-500">{a.customer.phone}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">
                      {a.client_name || "No customer selected"}
                    </span>
                  )}
                </td>
                <td>{a.staff_id || "—"}</td>
                <td>{a.service_id || "—"}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
