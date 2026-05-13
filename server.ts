import cors from "cors";
import express from "express";
import session from "express-session";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import crypto from "crypto";
import {
  type BookingRecord,
  type DoctorRecord,
  type NotificationRecord,
  type PatientRecord,
} from "./src/lib/db.ts";
import {
  hashAdminPassword,
  initStorage,
  readStorage,
  updateStorage,
  verifyAdminCredentialsStorage,
} from "./src/lib/storage.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AdminSession = session.Session & {
  adminUserId?: string;
  adminUsername?: string;
};

type AdminRequest = express.Request & {
  session: AdminSession;
};

const BOOKING_STATUS = {
  NEW: "Новая",
  CONFIRMED: "Подтверждена",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
} as const;

const ACTIVE_STATUSES = new Set<string>([BOOKING_STATUS.NEW, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED]);
const ALLOWED_BOOKING_STATUSES = new Set<string>(Object.values(BOOKING_STATUS));
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function getClientKey(req: express.Request) {
  return `${req.ip}:${String(req.headers["user-agent"] || "unknown")}`;
}

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function normalizePhone(value: string) {
  const trimmed = cleanText(value);
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):(00|30)$/.test(value);
}

function isBookingDateAllowed(date: string) {
  if (!isValidDate(date)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${date}T00:00:00`);
  const latest = new Date(today);
  latest.setDate(latest.getDate() + 30);
  return selected >= today && selected <= latest;
}

async function ensureDoctorExists(doctorId: string) {
  return (await readStorage()).doctors.find((doctor) => doctor.id === doctorId) || null;
}

function recordFailedLogin(key: string) {
  const current = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  const nextCount = current.count + 1;
  const lockedUntil = nextCount >= 5 ? Date.now() + 15 * 60 * 1000 : 0;
  loginAttempts.set(key, {
    count: lockedUntil ? 0 : nextCount,
    lockedUntil,
  });
}

function clearFailedLogin(key: string) {
  loginAttempts.delete(key);
}

function requireAdmin(req: AdminRequest, res: express.Response, next: express.NextFunction) {
  if (!req.session.adminUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function validateDoctorPayload(payload: unknown, existingId?: string): { ok: true; value: DoctorRecord } | { ok: false; error: string } {
  const body = (payload || {}) as Partial<DoctorRecord>;
  const id = cleanText(body.id || existingId || "").toLowerCase();
  const name = cleanText(body.name);
  const specialty = cleanText(body.specialty);
  const department = cleanText(body.department);
  const photoUrl = cleanText(body.photoUrl);
  const schedule = cleanText(body.schedule);
  const rating = Number(body.rating);

  if (!id || !/^[a-z0-9-]+$/.test(id)) {
    return { ok: false, error: "Doctor id must contain only lowercase latin letters, numbers, and dashes." };
  }
  if (name.length < 5 || specialty.length < 3 || department.length < 3) {
    return { ok: false, error: "Doctor name, specialty, and department are required." };
  }
  if (!photoUrl) {
    return { ok: false, error: "Doctor photo URL is required." };
  }
  if (!schedule) {
    return { ok: false, error: "Doctor schedule is required." };
  }
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return { ok: false, error: "Doctor rating must be between 0 and 5." };
  }

  return {
    ok: true,
    value: {
      id,
      name,
      specialty,
      department,
      photoUrl,
      rating,
      schedule,
    },
  };
}

async function startServer() {
  await initStorage();

  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());
  app.set("trust proxy", 1);
  app.use(cors());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "doctor-plus-dev-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 12,
      },
    })
  );

  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/doctors", async (_req, res) => {
    const doctors = (await readStorage()).doctors
      .slice()
      .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
    res.json(doctors);
  });

  app.get("/api/reviews", async (_req, res) => {
    const store = await readStorage();
    const reviews = store.reviews
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 50)
      .map((review) => ({
        ...review,
        doctorName: store.doctors.find((doctor) => doctor.id === review.doctorId)?.name,
      }));
    res.json(reviews);
  });

  app.post("/api/reviews", async (req, res) => {
    const author = cleanText(req.body?.author);
    const text = cleanText(req.body?.text);
    const rating = Number(req.body?.rating || 0);
    const doctorId = req.body?.doctorId ? cleanText(req.body.doctorId) : null;

    if (author.length < 2 || author.length > 80) {
      res.status(400).json({ error: "Author name must be between 2 and 80 characters." });
      return;
    }

    if (text.length < 10 || text.length > 1200) {
      res.status(400).json({ error: "Review text must be between 10 and 1200 characters." });
      return;
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Review rating must be between 1 and 5." });
      return;
    }

    if (doctorId && !(await ensureDoctorExists(doctorId))) {
      res.status(400).json({ error: "Selected doctor for the review was not found." });
      return;
    }

    const review = await updateStorage((store) => {
      const item = {
        id: crypto.randomUUID(),
        author,
        rating,
        text,
        date: new Date().toISOString().split("T")[0],
        source: "Новый",
        doctorId,
      };
      store.reviews.push(item);
      return item;
    });

    res.status(201).json(review);
  });

  app.get("/api/availability", async (req, res) => {
    const doctorId = cleanText(req.query.doctorId);
    const date = cleanText(req.query.date);
    const time = cleanText(req.query.time);

    if (!doctorId || !date || !time) {
      res.status(400).json({ error: "Missing availability parameters" });
      return;
    }

    if (!(await ensureDoctorExists(doctorId)) || !isValidDate(date) || !isValidTime(time)) {
      res.status(400).json({ error: "Invalid availability parameters" });
      return;
    }

    const taken = (await readStorage()).bookings.some(
      (booking) =>
        booking.doctorId === doctorId &&
        booking.appointmentDate === date &&
        booking.appointmentTime === time &&
        ACTIVE_STATUSES.has(booking.status)
    );

    res.json({ available: !taken });
  });

  app.post("/api/appointments", async (req, res) => {
    const doctorId = cleanText(req.body?.doctorId);
    const patientName = cleanText(req.body?.patientName);
    const patientLastName = cleanText(req.body?.patientLastName);
    const patientPhone = normalizePhone(req.body?.patientPhone);
    const patientNotes = cleanText(req.body?.patientNotes);
    const date = cleanText(req.body?.date);
    const time = cleanText(req.body?.time);
    const serviceName = cleanText(req.body?.serviceName) || "Консультация";
    const rawServicePrice = Number(req.body?.servicePrice);
    const servicePrice = Number.isFinite(rawServicePrice) && rawServicePrice >= 0 ? rawServicePrice : 0;

    if (!doctorId || !patientName || !patientLastName || !patientPhone || !date || !time) {
      res.status(400).json({ error: "Please fill in all required appointment fields." });
      return;
    }

    if (patientName.length < 2 || patientLastName.length < 2) {
      res.status(400).json({ error: "Patient first and last name must be at least 2 characters long." });
      return;
    }

    if (!/^\+?\d{10,15}$/.test(patientPhone)) {
      res.status(400).json({ error: "Phone number must contain 10 to 15 digits." });
      return;
    }

    if (!isBookingDateAllowed(date)) {
      res.status(400).json({ error: "Appointment date must be between today and the next 30 days." });
      return;
    }

    if (!isValidTime(time)) {
      res.status(400).json({ error: "Appointment time must use 30-minute slots." });
      return;
    }

    if (patientNotes.length > 1000) {
      res.status(400).json({ error: "Appointment notes are too long." });
      return;
    }

    const store = await readStorage();
    const doctor = store.doctors.find((item) => item.id === doctorId);
    if (!doctor) {
      res.status(404).json({ error: "Selected doctor was not found." });
      return;
    }

    const conflict = store.bookings.some(
      (booking) =>
        booking.doctorId === doctorId &&
        booking.appointmentDate === date &&
        booking.appointmentTime === time &&
        ACTIVE_STATUSES.has(booking.status)
    );

    if (conflict) {
      res.status(409).json({ error: "This time slot is already taken." });
      return;
    }

    const now = new Date().toISOString();
    const bookingId = crypto.randomUUID();
    const patientId = `p_${patientPhone.replace(/\D/g, "")}`;

    await updateStorage((draft) => {
      const booking: BookingRecord = {
        id: bookingId,
        doctorId,
        patientFirstName: patientName,
        patientLastName: patientLastName,
        patientPhone,
        appointmentDate: date,
        appointmentTime: time,
        service: serviceName,
        price: servicePrice,
        notes: patientNotes,
        status: BOOKING_STATUS.NEW,
        createdAt: now,
      };
      draft.bookings.push(booking);

      const patient = draft.patients.find((item) => item.id === patientId);
      if (patient) {
        patient.totalVisits += 1;
        patient.lastVisitDate = date;
        patient.totalPaid += booking.price;
      } else {
        const newPatient: PatientRecord = {
          id: patientId,
          firstName: patientName,
          lastName: patientLastName,
          phone: patientPhone,
          totalVisits: 1,
          lastVisitDate: date,
          totalPaid: booking.price,
          createdAt: now,
        };
        draft.patients.push(newPatient);
      }

      const notification: NotificationRecord = {
        id: crypto.randomUUID(),
        bookingId,
        message: `Новая запись: ${patientName} ${patientLastName} — ${serviceName} на ${date} ${time}`,
        isRead: false,
        createdAt: now,
      };
      draft.notifications.push(notification);
    });

    res.status(201).json({ id: bookingId, status: "success" });
  });

  app.post("/api/auth/login", async (req: AdminRequest, res) => {
    const username = cleanText(req.body?.username);
    const password = String(req.body?.password || "");
    const clientKey = getClientKey(req);
    const attempt = loginAttempts.get(clientKey);

    if (attempt?.lockedUntil && attempt.lockedUntil > Date.now()) {
      res.status(429).json({ error: "Too many failed login attempts. Please wait 15 minutes and try again." });
      return;
    }

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required." });
      return;
    }

    const admin = await verifyAdminCredentialsStorage(username, password);
    if (!admin) {
      recordFailedLogin(clientKey);
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }

    clearFailedLogin(clientKey);

    req.session.adminUserId = admin.id;
    req.session.adminUsername = admin.username;

    await updateStorage((store) => {
      const existing = store.adminUsers.find((item) => item.id === admin.id);
      if (existing) {
        existing.lastLogin = new Date().toISOString();
      }
    });

    res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.username,
      },
      isAdmin: true,
    });
  });

  app.get("/api/auth/me", (req: AdminRequest, res) => {
    if (!req.session.adminUserId || !req.session.adminUsername) {
      res.json(null);
      return;
    }

    res.json({
      user: {
        username: req.session.adminUsername,
        email: req.session.adminUsername,
      },
      isAdmin: true,
    });
  });

  app.post("/api/auth/logout", (req: AdminRequest, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.post("/api/admin/password", requireAdmin, async (req: AdminRequest, res) => {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current and new passwords are required." });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters long." });
      return;
    }

    const admin = await verifyAdminCredentialsStorage(req.session.adminUsername || "", currentPassword);
    if (!admin) {
      res.status(401).json({ error: "Current password is incorrect." });
      return;
    }

    await updateStorage((store) => {
      const existing = store.adminUsers.find((item) => item.id === req.session.adminUserId);
      if (existing) {
        existing.passwordHash = hashAdminPassword(newPassword);
      }
    });

    res.json({ success: true });
  });

  app.get("/api/admin/backup", requireAdmin, async (_req, res) => {
    const store = await readStorage();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=\"clinic-backup-${new Date().toISOString().slice(0, 10)}.json\"`);
    res.send(JSON.stringify(store, null, 2));
  });

  app.post("/api/admin/seed", requireAdmin, async (_req, res) => {
    await initStorage();
    res.json({ success: true });
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    const store = await readStorage();
    const today = new Date().toISOString().split("T")[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const todayCount = store.bookings.filter((booking) => booking.appointmentDate === today).length;
    const weekCount = store.bookings.filter((booking) => booking.appointmentDate >= weekStartStr).length;
    const revenueToday = store.bookings
      .filter((booking) => booking.appointmentDate === today && booking.status !== BOOKING_STATUS.CANCELLED)
      .reduce((sum, booking) => sum + booking.price, 0);
    const newCount = store.bookings.filter((booking) => booking.status === BOOKING_STATUS.NEW).length;

    res.json({
      todayCount,
      weekCount,
      revenueToday,
      newCount,
      activeDoctors: store.doctors.length,
    });
  });

  app.get("/api/admin/doctors", requireAdmin, async (_req, res) => {
    res.json((await readStorage()).doctors);
  });

  app.post("/api/admin/doctors", requireAdmin, async (req, res) => {
    const parsed = validateDoctorPayload(req.body);
    if (parsed.ok === false) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const existing = await ensureDoctorExists(parsed.value.id);
    if (existing) {
      res.status(409).json({ error: "A doctor with this id already exists." });
      return;
    }

    await updateStorage((store) => {
      store.doctors.push(parsed.value);
    });

    res.status(201).json(parsed.value);
  });

  app.patch("/api/admin/doctors/:id", requireAdmin, async (req, res) => {
    const id = cleanText(req.params.id);
    const existing = await ensureDoctorExists(id);
    if (!existing) {
      res.status(404).json({ error: "Doctor not found." });
      return;
    }

    const parsed = validateDoctorPayload({ ...existing, ...req.body }, id);
    if (parsed.ok === false) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    await updateStorage((store) => {
      const doctor = store.doctors.find((item) => item.id === id);
      if (doctor) {
        Object.assign(doctor, parsed.value);
      }
    });

    res.json(parsed.value);
  });

  app.delete("/api/admin/doctors/:id", requireAdmin, async (req, res) => {
    const id = cleanText(req.params.id);
    const store = await readStorage();
    const doctor = store.doctors.find((item) => item.id === id);
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found." });
      return;
    }

    const hasLinkedBookings = store.bookings.some((booking) => booking.doctorId === id);
    if (hasLinkedBookings) {
      res.status(409).json({ error: "Cannot delete a doctor with existing appointments." });
      return;
    }

    await updateStorage((draft) => {
      draft.doctors = draft.doctors.filter((item) => item.id !== id);
      draft.reviews = draft.reviews.filter((review) => review.doctorId !== id);
    });

    res.json({ success: true });
  });

  app.get("/api/admin/appointments", requireAdmin, async (_req, res) => {
    const appointments = (await readStorage()).bookings
      .slice()
      .sort((a, b) => {
        const dateSort = b.appointmentDate.localeCompare(a.appointmentDate);
        return dateSort || b.appointmentTime.localeCompare(a.appointmentTime);
      });
    res.json(appointments);
  });

  app.get("/api/admin/logs", requireAdmin, async (_req, res) => {
    const logs = (await readStorage()).notifications
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 100);
    res.json(logs);
  });

  app.get("/api/admin/patients", requireAdmin, async (_req, res) => {
    const patients = (await readStorage()).patients
      .slice()
      .sort((a, b) => (b.lastVisitDate || "").localeCompare(a.lastVisitDate || ""));
    res.json(patients);
  });

  app.get("/api/admin/revenue", requireAdmin, async (_req, res) => {
    const revenueByDate = new Map<string, number>();
    for (const booking of (await readStorage()).bookings) {
      if (booking.status === BOOKING_STATUS.CANCELLED) continue;
      revenueByDate.set(booking.appointmentDate, (revenueByDate.get(booking.appointmentDate) || 0) + booking.price);
    }

    const rows = Array.from(revenueByDate.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    res.json(rows);
  });

  app.patch("/api/admin/notifications/read-all", requireAdmin, async (_req, res) => {
    await updateStorage((store) => {
      for (const notification of store.notifications) {
        notification.isRead = true;
      }
    });
    res.json({ success: true });
  });

  app.patch("/api/admin/appointments/:id/status", requireAdmin, async (req, res) => {
    const id = cleanText(req.params.id);
    const status = cleanText(req.body?.status);

    if (!id || !ALLOWED_BOOKING_STATUSES.has(status)) {
      res.status(400).json({ error: "Invalid appointment status update." });
      return;
    }

    let updated = false;
    await updateStorage((store) => {
      const booking = store.bookings.find((item) => item.id === id);
      if (booking) {
        booking.status = status;
        updated = true;
      }
    });

    if (!updated) {
      res.status(404).json({ error: "Appointment not found." });
      return;
    }

    res.json({ success: true });
  });

  app.delete("/api/admin/appointments/:id", requireAdmin, async (req, res) => {
    const id = cleanText(req.params.id);
    const store = await readStorage();
    const exists = store.bookings.some((item) => item.id === id);

    if (!exists) {
      res.status(404).json({ error: "Appointment not found." });
      return;
    }

    await updateStorage((draft) => {
      draft.bookings = draft.bookings.filter((item) => item.id !== id);
      draft.notifications = draft.notifications.filter((item) => item.bookingId !== id);
    });

    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
