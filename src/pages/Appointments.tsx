import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Appointment = {
  id: string;
  client_name: string | null;
  client_phone: string | null;
  staff_id: string | null;
  service_id: string | null;
  starts_at: string;
  status: string;
};

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    staff_id: "",
    service_id: "",
    starts_at: "",
    status: "pending",
  });

  async function load() {
    const { data, error } = await supabase
      .from("appointments")
      .select("id,client_name,client_phone,staff_id,service_id,starts_at,status")
      .order("starts_at", { ascending: true });
    if (error) throw error;
    setItems(data ?? []);
  }

  async function add() {
    const { error } = await supabase.from("appointments").insert({
      client_name: form.client_name || null,
      client_phone: form.client_phone || null,
      staff_id: form.staff_id || null,
      service_id: form.service_id || null,
      starts_at: new Date(form.starts_at).toISOString(),
      status: form.status,
    });
    if (error) throw error;
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Appointments</h1>

      <div className="grid md:grid-cols-5 gap-2">
        <input className="border p-2 rounded" placeholder="Client name"
          value={form.client_name} onChange={e=>setForm({...form, client_name:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Client phone"
          value={form.client_phone} onChange={e=>setForm({...form, client_phone:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Staff ID"
          value={form.staff_id} onChange={e=>setForm({...form, staff_id:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Service (product) ID"
          value={form.service_id} onChange={e=>setForm({...form, service_id:e.target.value})}/>
        <input className="border p-2 rounded" type="datetime-local"
          value={form.starts_at} onChange={e=>setForm({...form, starts_at:e.target.value})}/>
      </div>
      <button className="px-4 py-2 bg-black text-white rounded" onClick={add}>Add</button>

      <table className="w-full text-sm">
        <thead><tr className="text-left">
          <th>When</th><th>Client</th><th>Staff</th><th>Service</th><th>Status</th>
        </tr></thead>
        <tbody>
          {items.map(a=> (
            <tr key={a.id} className="border-t">
              <td>{new Date(a.starts_at).toLocaleString()}</td>
              <td>{a.client_name} ({a.client_phone})</td>
              <td>{a.staff_id}</td>
              <td>{a.service_id}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

