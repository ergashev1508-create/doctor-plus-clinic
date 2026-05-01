import crypto from "crypto";
import fs from "fs";
import path from "path";

export type DoctorRecord = {
  id: string;
  name: string;
  specialty: string;
  department: string;
  photoUrl: string;
  rating: number;
  schedule: string;
};

export type ReviewRecord = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  source: string;
  doctorId?: string | null;
};

export type BookingRecord = {
  id: string;
  doctorId: string;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  service: string;
  price: number;
  notes: string;
  status: string;
  createdAt: string;
};

export type PatientRecord = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalVisits: number;
  lastVisitDate: string | null;
  totalPaid: number;
  createdAt: string;
};

export type NotificationRecord = {
  id: string;
  bookingId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type AdminUserRecord = {
  id: string;
  username: string;
  passwordHash: string;
  lastLogin: string | null;
};

export type ClinicStore = {
  doctors: DoctorRecord[];
  reviews: ReviewRecord[];
  bookings: BookingRecord[];
  patients: PatientRecord[];
  notifications: NotificationRecord[];
  adminUsers: AdminUserRecord[];
  settings: Record<string, string>;
};

const dbPath = path.resolve(process.env.CLINIC_DATA_PATH || path.join(process.cwd(), "clinic.json"));

const hashPassword = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const seedDoctors: DoctorRecord[] = [
  {
    id: "kabylov-zhyldyzbek-saparovich",
    name: "Кабылов Жылдызбек Сапарович",
    specialty: "УЗИ-диагност",
    department: "УЗИ-диагностика",
    photoUrl: "/doctors/kabylov-zhyldyzbek-saparovich.jpeg",
    rating: 4.9,
    schedule: "Пн-Пт: 09:00 - 17:00",
  },
  {
    id: "sultangazy-kyzy-nazgul",
    name: "Султангазы кызы Назгуль",
    specialty: "Педиатр",
    department: "Педиатрия",
    photoUrl: "https://odoctor.kg/storage/doctors/sultangazy-kyzy-nazgul/sultangazy-kyzy-nazgul.jpg",
    rating: 4.8,
    schedule: "Пн-Пт: 08:00 - 14:00",
  },
  {
    id: "kabulova-gulbara-saparalievna",
    name: "Кабулова Гулбара Сапаралиевна",
    specialty: "Врач УЗИ",
    department: "УЗИ-диагностика",
    photoUrl: "https://odoctor.kg/storage/doctors/kabulova-gulbara-saparalievna/kabulova-gulbara-saparalievna.jpg",
    rating: 4.9,
    schedule: "Вт, Чт, Сб: 09:00 - 16:00",
  },
  {
    id: "moldosheva-gulzat-sharshebaevna",
    name: "Молдошева Гулзат Шаршебаевна",
    specialty: "Терапевт, УЗИ-специалист",
    department: "Терапия",
    photoUrl: "https://odoctor.kg/images/doctors/moldosheva-gulzat-sharshebaevna.jpg",
    rating: 4.9,
    schedule: "Пн-Сб: 10:00 - 18:00",
  },
];

const seedReviews: ReviewRecord[] = [
  {
    id: "2gis-mira-esengulova-2026-02-25",
    author: "Мира Эсенгулова",
    rating: 5,
    text: "В этой клинике очень грамотные доктора. Особенно понравилась Узист Гулбара Сапаралиевна, чувствуется большой опыт и хорошее оборудование.",
    date: "2026-02-25",
    source: "2GIS",
    doctorId: "kabulova-gulbara-saparalievna",
  },
  {
    id: "2gis-adil-kenzhebekov-2026-02-25",
    author: "Адил Кенжебеков",
    rating: 5,
    text: "УЗИ аппарат у них очень классный, врачи вежливые. Честно, хорошо что есть такие клиники.",
    date: "2026-02-25",
    source: "2GIS",
    doctorId: "kabulova-gulbara-saparalievna",
  },
  {
    id: "2gis-nargiza-kaparova-2025-10-14",
    author: "Наргиза Капарова",
    rating: 5,
    text: "Я рада, что нашла эту клинику. Персонал очень вежливый и внимательный, услуги выполняют хорошо.",
    date: "2025-10-14",
    source: "2GIS",
    doctorId: null,
  },
  {
    id: "2gis-luiza-2024-10-03",
    author: "Луиза",
    rating: 5,
    text: "Недавно прошла Check-Up УЗИ, все прошло отлично и быстро. Врачи и персонал вежливые, чисто и стерильно.",
    date: "2024-10-03",
    source: "2GIS",
    doctorId: "kabulova-gulbara-saparalievna",
  },
  {
    id: "2gis-rapkat-baudunov-2024-10-03",
    author: "Rapkat Baudunov",
    rating: 5,
    text: "Поставили капельницу аккуратно и уверенно. Очень приятно, когда работают такие добрые и чуткие специалисты.",
    date: "2024-10-03",
    source: "2GIS",
    doctorId: null,
  },
  {
    id: "2gis-aizhamal-alibaeva-2024-08-19",
    author: "Айжамал Алибаева",
    rating: 5,
    text: "Спасибо медперсоналу за оказанные услуги. Администратор вежливый, врачи грамотные, профессионалы своего дела.",
    date: "2024-08-19",
    source: "2GIS",
    doctorId: null,
  },
  {
    id: "1",
    author: "Айнура",
    rating: 5,
    text: "Очень хорошая клиника. Врачи вежливые и внимательные.",
    date: "2025-03-15",
    source: "odoctor.kg",
    doctorId: "sultangazy-kyzy-nazgul",
  },
  {
    id: "2",
    author: "Максат",
    rating: 5,
    text: "Чисто, уютно, без очередей.",
    date: "2025-02-20",
    source: "2GIS",
    doctorId: "kabulova-gulbara-saparalievna",
  },
];

const createSeedStore = (): ClinicStore => ({
  doctors: seedDoctors,
  reviews: seedReviews,
  bookings: [],
  patients: [],
  notifications: [],
  adminUsers: [
    {
      id: "admin_1",
      username: "doctorplus_admin",
      passwordHash: hashPassword("admin2025"),
      lastLogin: null,
    },
  ],
  settings: {
    online_booking_enabled: "true",
    clinic_name: "Доктор Плюс",
  },
});

const replacementMap = new Map<string, string>([
  ["ÐÐ¾Ð²Ñ‹Ð¹", "Новый"],
  ["ÐÐ¾Ð²Ð°Ñ", "Новая"],
  ["ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð°", "Подтверждена"],
  ["Ð—Ð°Ð²ÐµÑ€ÑˆÐµÐ½Ð°", "Завершена"],
  ["ÐžÑ‚Ð¼ÐµÐ½ÐµÐ½Ð°", "Отменена"],
  ["ÐšÐ¾Ð½ÑÑƒÐ»ÑŒÑ‚Ð°Ñ†Ð¸Ñ", "Консультация"],
  ["Ð”Ð¾ÐºÑ‚Ð¾Ñ€ ÐŸÐ»ÑŽÑ", "Доктор Плюс"],
  ["ÐšÐ°Ð±Ñ‹Ð»Ð¾Ð² Ð–Ñ‹Ð»Ð´Ñ‹Ð·Ð±ÐµÐº Ð¡Ð°Ð¿Ð°Ñ€Ð¾Ð²Ð¸Ñ‡", "Кабылов Жылдызбек Сапарович"],
  ["Ð¡ÑƒÐ»Ñ‚Ð°Ð½Ð³Ð°Ð·Ñ‹ ÐºÑ‹Ð·Ñ‹ ÐÐ°Ð·Ð³ÑƒÐ»", "Султангазы кызы Назгуль"],
  ["ÐšÐ°Ð±ÑƒÐ»Ð¾Ð²Ð° Ð“ÑƒÐ»Ð±Ð°Ñ€Ð° Ð¡Ð°Ð¿Ð°Ñ€Ð°Ð»Ð¸ÐµÐ²Ð½Ð°", "Кабулова Гулбара Сапаралиевна"],
  ["ÐœÐ°ÐºÑÐ°Ñ‚", "Максат"],
  ["ÐÐ¹Ð½ÑƒÑ€Ð°", "Айнура"],
]);

const validStatuses = new Set(["Новая", "Подтверждена", "Завершена", "Отменена"]);

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  let result = value.trim();
  for (const [broken, fixed] of replacementMap.entries()) {
    result = result.split(broken).join(fixed);
  }
  return result;
}

function normalizeDoctorRecord(doctor: DoctorRecord): DoctorRecord {
  return {
    id: cleanString(doctor.id),
    name: cleanString(doctor.name),
    specialty: cleanString(doctor.specialty),
    department: cleanString(doctor.department),
    photoUrl: cleanString(doctor.photoUrl),
    rating: Number.isFinite(doctor.rating) ? doctor.rating : 5,
    schedule: cleanString(doctor.schedule),
  };
}

function normalizeStore(store: ClinicStore): ClinicStore {
  const safeStore: ClinicStore = {
    doctors: Array.isArray(store.doctors) ? store.doctors.map(normalizeDoctorRecord) : [],
    reviews: Array.isArray(store.reviews)
      ? store.reviews.map((review) => ({
          id: cleanString(review.id) || crypto.randomUUID(),
          author: cleanString(review.author),
          rating: Number.isFinite(review.rating) ? Math.min(5, Math.max(1, review.rating)) : 5,
          text: cleanString(review.text),
          date: cleanString(review.date),
          source: cleanString(review.source) || "Новый",
          doctorId: review.doctorId ? cleanString(review.doctorId) : null,
        }))
      : [],
    bookings: Array.isArray(store.bookings)
      ? store.bookings.map((booking) => ({
          ...booking,
          id: cleanString(booking.id) || crypto.randomUUID(),
          doctorId: cleanString(booking.doctorId),
          patientFirstName: cleanString(booking.patientFirstName),
          patientLastName: cleanString(booking.patientLastName),
          patientPhone: cleanString(booking.patientPhone),
          appointmentDate: cleanString(booking.appointmentDate),
          appointmentTime: cleanString(booking.appointmentTime),
          service: cleanString(booking.service) || "Консультация",
          price: Number.isFinite(booking.price) ? booking.price : 1000,
          notes: cleanString(booking.notes),
          status: validStatuses.has(cleanString(booking.status)) ? cleanString(booking.status) : "Новая",
          createdAt: cleanString(booking.createdAt),
        }))
      : [],
    patients: Array.isArray(store.patients)
      ? store.patients.map((patient) => ({
          ...patient,
          id: cleanString(patient.id),
          firstName: cleanString(patient.firstName),
          lastName: cleanString(patient.lastName),
          phone: cleanString(patient.phone),
          totalVisits: Number.isFinite(patient.totalVisits) ? patient.totalVisits : 0,
          lastVisitDate: patient.lastVisitDate ? cleanString(patient.lastVisitDate) : null,
          totalPaid: Number.isFinite(patient.totalPaid) ? patient.totalPaid : 0,
          createdAt: cleanString(patient.createdAt),
        }))
      : [],
    notifications: Array.isArray(store.notifications)
      ? store.notifications.map((notification) => ({
          ...notification,
          id: cleanString(notification.id) || crypto.randomUUID(),
          bookingId: cleanString(notification.bookingId),
          message: cleanString(notification.message),
          isRead: Boolean(notification.isRead),
          createdAt: cleanString(notification.createdAt),
        }))
      : [],
    adminUsers: Array.isArray(store.adminUsers) && store.adminUsers.length
      ? store.adminUsers.map((admin) => ({
          id: cleanString(admin.id) || crypto.randomUUID(),
          username: cleanString(admin.username),
          passwordHash: cleanString(admin.passwordHash),
          lastLogin: admin.lastLogin ? cleanString(admin.lastLogin) : null,
        }))
      : createSeedStore().adminUsers,
    settings: {
      online_booking_enabled:
        cleanString(store.settings?.online_booking_enabled || "true") === "false" ? "false" : "true",
      clinic_name: cleanString(store.settings?.clinic_name || "Доктор Плюс") || "Доктор Плюс",
    },
  };

  const validDoctorIds = new Set(safeStore.doctors.map((doctor) => doctor.id));
  safeStore.reviews = safeStore.reviews.filter((review) => !review.doctorId || validDoctorIds.has(review.doctorId));
  safeStore.bookings = safeStore.bookings.filter((booking) => validDoctorIds.has(booking.doctorId));
  safeStore.notifications = safeStore.notifications.filter((notification) =>
    safeStore.bookings.some((booking) => booking.id === notification.bookingId)
  );

  return safeStore;
}

export function initDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(createSeedStore(), null, 2), "utf8");
    return;
  }

  const current = JSON.parse(fs.readFileSync(dbPath, "utf8")) as ClinicStore;
  const normalized = normalizeStore(current);
  writeStore(normalized);
}

export function readStore(): ClinicStore {
  if (!fs.existsSync(dbPath)) {
    initDb();
  }
  const raw = JSON.parse(fs.readFileSync(dbPath, "utf8")) as ClinicStore;
  return normalizeStore(raw);
}

export function writeStore(store: ClinicStore) {
  const normalized = normalizeStore(store);
  const tempPath = `${dbPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(normalized, null, 2), "utf8");
  fs.renameSync(tempPath, dbPath);
}

export function updateStore<T>(updater: (store: ClinicStore) => T): T {
  const store = readStore();
  const result = updater(store);
  writeStore(store);
  return result;
}

export function verifyAdminCredentials(username: string, password: string): AdminUserRecord | null {
  const store = readStore();
  const admin = store.adminUsers.find((item) => item.username === username);
  if (!admin) {
    return null;
  }
  return admin.passwordHash === hashPassword(password) ? admin : null;
}

export function hashAdminPassword(password: string) {
  return hashPassword(password);
}
