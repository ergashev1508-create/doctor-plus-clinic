type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    method: options.method || "GET",
    credentials: "same-origin",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // Ignore JSON parsing failures and keep the default message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDoctors: async () => request<any[]>("/api/doctors"),

  getReviews: async () => request<any[]>("/api/reviews"),

  submitReview: async (data: any) =>
    request<{ id: string }>("/api/reviews", {
      method: "POST",
      body: data,
    }),

  checkAvailability: async (doctorId: string, date: string, time: string) => {
    const params = new URLSearchParams({ doctorId, date, time });
    return request<{ available: boolean }>(`/api/availability?${params.toString()}`);
  },

  createAppointment: async (data: any) =>
    request<{ id: string; status: string }>("/api/appointments", {
      method: "POST",
      body: data,
    }),

  login: async (credentials?: { username?: string; password?: string }) => {
    if (!credentials?.username || !credentials?.password) {
      throw new Error("Username and password are required.");
    }

    return request<{ success: boolean; user: { username?: string; email?: string }; isAdmin: boolean }>(
      "/api/auth/login",
      {
        method: "POST",
        body: credentials,
      }
    );
  },

  logout: async () => request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),

  getMe: async () =>
    request<{ user: { username?: string | null; email?: string | null }; isAdmin: boolean } | null>(
      "/api/auth/me"
    ),

  getStats: async () => request<any>("/api/admin/stats"),

  getAppointments: async () => request<any[]>("/api/admin/appointments"),

  getLogs: async () => request<any[]>("/api/admin/logs"),

  getPatients: async () => request<any[]>("/api/admin/patients"),

  getRevenue: async () => request<any[]>("/api/admin/revenue"),

  markAllNotificationsRead: async () =>
    request<{ success: boolean }>("/api/admin/notifications/read-all", {
      method: "PATCH",
    }),

  updateAppointmentStatus: async (id: string, status: string) =>
    request<{ success: boolean }>(`/api/admin/appointments/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  deleteAppointment: async (id: string) =>
    request<{ success: boolean }>(`/api/admin/appointments/${id}`, {
      method: "DELETE",
    }),

  changePassword: async (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>("/api/admin/password", {
      method: "POST",
      body: { currentPassword, newPassword },
    }),

  downloadBackup: async () => {
    const response = await fetch("/api/admin/backup", {
      credentials: "same-origin",
    });

    if (!response.ok) {
      let message = `Backup failed (${response.status})`;
      try {
        const data = await response.json();
        if (data?.error) {
          message = data.error;
        }
      } catch {
        // Ignore parsing errors.
      }
      throw new Error(message);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clinic-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  seedData: async (onProgress?: (msg: string) => void) => {
    onProgress?.("Initializing local database...");
    const result = await request<{ success: boolean }>("/api/admin/seed", { method: "POST" });
    onProgress?.("Local database ready.");
    return result;
  },
};
