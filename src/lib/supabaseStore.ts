import {
  createSeedStore,
  normalizeStore,
  type AdminUserRecord,
  type BookingRecord,
  type ClinicStore,
  type DoctorRecord,
  type NotificationRecord,
  type PatientRecord,
  type ReviewRecord,
} from "./db.ts";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseServiceKey);

type SupabaseRow = Record<string, unknown>;

async function supabaseRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: supabaseServiceKey!,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase error ${response.status}: ${message}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

const fromDoctorRow = (row: SupabaseRow): DoctorRecord => ({
  id: String(row.id || ""),
  name: String(row.name || ""),
  specialty: String(row.specialty || ""),
  department: String(row.department || ""),
  photoUrl: String(row.photo_url || ""),
  rating: Number(row.rating || 0),
  schedule: String(row.schedule || ""),
});

const toDoctorRow = (doctor: DoctorRecord) => ({
  id: doctor.id,
  name: doctor.name,
  specialty: doctor.specialty,
  department: doctor.department,
  photo_url: doctor.photoUrl,
  rating: doctor.rating,
  schedule: doctor.schedule,
});

const fromReviewRow = (row: SupabaseRow): ReviewRecord => ({
  id: String(row.id || ""),
  author: String(row.author || ""),
  rating: Number(row.rating || 0),
  text: String(row.text || ""),
  date: String(row.date || ""),
  source: String(row.source || ""),
  doctorId: row.doctor_id ? String(row.doctor_id) : null,
});

const toReviewRow = (review: ReviewRecord) => ({
  id: review.id,
  author: review.author,
  rating: review.rating,
  text: review.text,
  date: review.date,
  source: review.source,
  doctor_id: review.doctorId || null,
});

const fromBookingRow = (row: SupabaseRow): BookingRecord => ({
  id: String(row.id || ""),
  doctorId: String(row.doctor_id || ""),
  patientFirstName: String(row.patient_first_name || ""),
  patientLastName: String(row.patient_last_name || ""),
  patientPhone: String(row.patient_phone || ""),
  appointmentDate: String(row.appointment_date || ""),
  appointmentTime: String(row.appointment_time || "").slice(0, 5),
  service: String(row.service || ""),
  price: Number(row.price || 0),
  notes: String(row.notes || ""),
  status: String(row.status || ""),
  createdAt: String(row.created_at || ""),
});

const toBookingRow = (booking: BookingRecord) => ({
  id: booking.id,
  doctor_id: booking.doctorId,
  patient_first_name: booking.patientFirstName,
  patient_last_name: booking.patientLastName,
  patient_phone: booking.patientPhone,
  appointment_date: booking.appointmentDate,
  appointment_time: booking.appointmentTime,
  service: booking.service,
  price: booking.price,
  notes: booking.notes,
  status: booking.status,
  created_at: booking.createdAt,
});

const fromPatientRow = (row: SupabaseRow): PatientRecord => ({
  id: String(row.id || ""),
  firstName: String(row.first_name || ""),
  lastName: String(row.last_name || ""),
  phone: String(row.phone || ""),
  totalVisits: Number(row.total_visits || 0),
  lastVisitDate: row.last_visit_date ? String(row.last_visit_date) : null,
  totalPaid: Number(row.total_paid || 0),
  createdAt: String(row.created_at || ""),
});

const toPatientRow = (patient: PatientRecord) => ({
  id: patient.id,
  first_name: patient.firstName,
  last_name: patient.lastName,
  phone: patient.phone,
  total_visits: patient.totalVisits,
  last_visit_date: patient.lastVisitDate,
  total_paid: patient.totalPaid,
  created_at: patient.createdAt,
});

const fromNotificationRow = (row: SupabaseRow): NotificationRecord => ({
  id: String(row.id || ""),
  bookingId: String(row.booking_id || ""),
  message: String(row.message || ""),
  isRead: Boolean(row.is_read),
  createdAt: String(row.created_at || ""),
});

const toNotificationRow = (notification: NotificationRecord) => ({
  id: notification.id,
  booking_id: notification.bookingId,
  message: notification.message,
  is_read: notification.isRead,
  created_at: notification.createdAt,
});

const fromAdminUserRow = (row: SupabaseRow): AdminUserRecord => ({
  id: String(row.id || ""),
  username: String(row.username || ""),
  passwordHash: String(row.password_hash || ""),
  lastLogin: row.last_login ? String(row.last_login) : null,
});

const toAdminUserRow = (admin: AdminUserRecord) => ({
  id: admin.id,
  username: admin.username,
  password_hash: admin.passwordHash,
  last_login: admin.lastLogin,
});

async function deleteTable(table: string, column = "id") {
  await supabaseRequest(`${table}?${column}=not.is.null`, { method: "DELETE" });
}

async function insertRows(table: string, rows: unknown[]) {
  if (rows.length > 0) {
    await supabaseRequest(table, {
      method: "POST",
      body: JSON.stringify(rows),
    });
  }
}

export async function readSupabaseStore(): Promise<ClinicStore> {
  const [doctors, reviews, bookings, patients, notifications, adminUsers, settings] = await Promise.all([
    supabaseRequest<SupabaseRow[]>("doctors?select=*"),
    supabaseRequest<SupabaseRow[]>("reviews?select=*"),
    supabaseRequest<SupabaseRow[]>("bookings?select=*"),
    supabaseRequest<SupabaseRow[]>("patients?select=*"),
    supabaseRequest<SupabaseRow[]>("notifications?select=*"),
    supabaseRequest<SupabaseRow[]>("admin_users?select=*"),
    supabaseRequest<SupabaseRow[]>("settings?select=*"),
  ]);

  return normalizeStore({
    doctors: doctors.map(fromDoctorRow),
    reviews: reviews.map(fromReviewRow),
    bookings: bookings.map(fromBookingRow),
    patients: patients.map(fromPatientRow),
    notifications: notifications.map(fromNotificationRow),
    adminUsers: adminUsers.map(fromAdminUserRow),
    settings: Object.fromEntries(settings.map((row) => [String(row.key), String(row.value)])),
  });
}

export async function writeSupabaseStore(store: ClinicStore) {
  const normalized = normalizeStore(store);

  await deleteTable("notifications");
  await deleteTable("bookings");
  await deleteTable("patients");
  await deleteTable("reviews");
  await deleteTable("doctors");
  await deleteTable("admin_users");
  await deleteTable("settings", "key");

  await insertRows("doctors", normalized.doctors.map(toDoctorRow));
  await insertRows("reviews", normalized.reviews.map(toReviewRow));
  await insertRows("patients", normalized.patients.map(toPatientRow));
  await insertRows("bookings", normalized.bookings.map(toBookingRow));
  await insertRows("notifications", normalized.notifications.map(toNotificationRow));
  await insertRows("admin_users", normalized.adminUsers.map(toAdminUserRow));
  await insertRows(
    "settings",
    Object.entries(normalized.settings).map(([key, value]) => ({ key, value }))
  );
}

export async function initSupabaseStore() {
  const store = await readSupabaseStore();
  if (store.doctors.length === 0 || store.adminUsers.length === 0) {
    await writeSupabaseStore(createSeedStore());
  }
}
