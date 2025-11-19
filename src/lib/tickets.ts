import { supabase } from '@/lib/supabase';

export type TicketStatus = 'waiting' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
export type TicketType = 'laundry' | 'repair' | 'spa' | 'carwash' | 'other';

export interface Ticket {
  id: string;
  store_id: string;
  customer_id?: string | null;
  ticket_number: string;
  ticket_type: TicketType;
  status: TicketStatus;
  priority: number;
  checkin_at: string;
  promised_at?: string | null;
  completed_at?: string | null;
  staff_id?: string | null;
  total_amount?: number | null;
  notes?: string | null;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
}

const TICKET_NUMBER_PREFIX = 'TCK';

function generateTicketNumber(): string {
  const timestamp = new Date().toISOString().replace(/\D/g, '');
  return `${TICKET_NUMBER_PREFIX}-${timestamp}`;
}

interface ListTicketsOptions {
  storeId: string;
  status?: TicketStatus;
  ticketType?: TicketType;
}

interface CreateTicketPayload {
  storeId: string;
  customerId?: string | null;
  ticketType: TicketType;
  staffId?: string | null;
  promisedAt?: string | null;
  totalAmount?: number | null;
  notes?: string | null;
  priority?: number;
}

export async function listTickets({ storeId, status, ticketType }: ListTicketsOptions) {
  const query = supabase
    .from('tickets')
    .select(
      `
      id,
      store_id,
      customer_id,
      ticket_number,
      ticket_type,
      status,
      priority,
      checkin_at,
      promised_at,
      completed_at,
      staff_id,
      total_amount,
      notes,
      created_at,
      customer:customer_id(id,name,phone,email)
    `
    )
    .eq('store_id', storeId)
    .order('checkin_at', { ascending: true });

  if (status) {
    query.eq('status', status);
  }
  if (ticketType) {
    query.eq('ticket_type', ticketType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Ticket[];
}

interface UpdateTicketPayload {
  status?: TicketStatus;
  priority?: number;
  staffId?: string | null;
  notes?: string | null;
  promisedAt?: string | null;
  totalAmount?: number | null;
}

export async function createTicket(payload: CreateTicketPayload) {
  const record = {
    store_id: payload.storeId,
    customer_id: payload.customerId ?? null,
    ticket_type: payload.ticketType,
    status: 'waiting' as TicketStatus,
    ticket_number: generateTicketNumber(),
    staff_id: payload.staffId ?? null,
    promised_at: payload.promisedAt ?? null,
    total_amount: payload.totalAmount ?? null,
    notes: payload.notes ?? null,
    priority: payload.priority ?? 0,
  };

  const { data, error } = await supabase.from('tickets').insert(record).select().single();
  if (error) throw error;
  return data as Ticket;
}

export async function updateTicket(id: string, patch: UpdateTicketPayload) {
  const payload: Record<string, unknown> = {};
  if (patch.status) payload.status = patch.status;
  if (patch.priority !== undefined) payload.priority = patch.priority;
  if (patch.staffId !== undefined) payload.staff_id = patch.staffId;
  if (patch.notes !== undefined) payload.notes = patch.notes;
  if (patch.promisedAt !== undefined) payload.promised_at = patch.promisedAt;
  if (patch.totalAmount !== undefined) payload.total_amount = patch.totalAmount;

  const { data, error } = await supabase.from('tickets').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as Ticket;
}
