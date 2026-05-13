import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import {
  AlertCircle,
  Bell,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Download,
  Filter,
  LogOut,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_STYLES: Record<string, string> = {
  'Новая': 'bg-blue-50 text-blue-700 border-blue-200',
  'Подтверждена': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Завершена': 'bg-zinc-100 text-zinc-700 border-zinc-200',
  'Отменена': 'bg-rose-50 text-rose-700 border-rose-200',
};

const TAB_META = [
  { id: 'appointments', label: 'Записи', icon: Calendar, description: 'Онлайн-записи и подтверждение приёмов' },
  { id: 'schedule', label: 'Расписание', icon: Clock, description: 'Нагрузка врачей на сегодня' },
  { id: 'patients', label: 'Пациенты', icon: Users, description: 'База пациентов и история обращений' },
  { id: 'revenue', label: 'Финансы', icon: TrendingUp, description: 'Доход и динамика оплат' },
  { id: 'notifications', label: 'Уведомления', icon: Bell, description: 'Последние системные события' },
  { id: 'settings', label: 'Настройки', icon: Filter, description: 'Безопасность и сервисные действия' },
] as const;

const ADMIN_PAGE_SIZE = 20;

export const AdminDashboard: React.FC = () => {
  const scheduleScrollRef = useRef<HTMLDivElement | null>(null);
  const scheduleTableScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState('appointments');
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedProgress, setSeedProgress] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [seedLog, setSeedLog] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [patientsPage, setPatientsPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        api.getStats(),
        api.getAppointments(),
        api.getLogs(),
        api.getPatients(),
        api.getRevenue(),
        api.getDoctors(),
      ]);

      const [statsResult, appointmentsResult, logsResult, patientsResult, revenueResult, doctorsResult] =
        results.map((result) => (result.status === 'fulfilled' ? result.value : null));

      if (statsResult) setStats(statsResult);
      if (appointmentsResult) setAppointments(appointmentsResult);
      if (logsResult) setLogs(logsResult);
      if (patientsResult) setPatients(patientsResult);
      if (revenueResult) setRevenueData(revenueResult);
      if (doctorsResult) setDoctors(doctorsResult);

      if (results.every((result) => result.status === 'rejected')) {
        setError('Не удалось загрузить данные администратора.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const doctorNameById = (doctorId: string) =>
    doctors.find((doctor) => doctor.id === doctorId)?.name || 'Врач не найден';

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const fullName = `${appointment.patientFirstName} ${appointment.patientLastName}`.toLowerCase();
      const query = searchTerm.toLowerCase();
      const matchesQuery = fullName.includes(query) || appointment.patientPhone.includes(searchTerm);
      const matchesDoctor = doctorFilter === 'all' || appointment.doctorId === doctorFilter;
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      const matchesDate = !dateFilter || appointment.appointmentDate === dateFilter;
      return matchesQuery && matchesDoctor && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, doctorFilter, statusFilter, dateFilter]);

  const filteredPatients = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return fullName.includes(query) || patient.phone.includes(searchTerm);
    });
  }, [patients, searchTerm]);

  useEffect(() => {
    setAppointmentsPage(1);
  }, [searchTerm, doctorFilter, statusFilter, dateFilter]);

  useEffect(() => {
    setPatientsPage(1);
  }, [searchTerm]);

  const appointmentsPageCount = Math.max(1, Math.ceil(filteredAppointments.length / ADMIN_PAGE_SIZE));
  const patientsPageCount = Math.max(1, Math.ceil(filteredPatients.length / ADMIN_PAGE_SIZE));
  const paginatedAppointments = filteredAppointments.slice(
    (appointmentsPage - 1) * ADMIN_PAGE_SIZE,
    appointmentsPage * ADMIN_PAGE_SIZE
  );
  const paginatedPatients = filteredPatients.slice(
    (patientsPage - 1) * ADMIN_PAGE_SIZE,
    patientsPage * ADMIN_PAGE_SIZE
  );

  const scheduleTimes = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
  ];
  const todayDateKey = new Date().toISOString().split('T')[0];
  const scheduleGridWidth = Math.max(1020, 120 + doctors.length * 200);
  const getAppointmentsForScheduleSlot = (doctorId: string, time: string) => {
    return appointments
      .filter(
        (appointment) =>
          appointment.doctorId === doctorId &&
          appointment.appointmentDate === todayDateKey &&
          appointment.appointmentTime === time &&
          appointment.status !== 'ÐžÑ‚Ð¼ÐµÐ½ÐµÐ½Ð°'
      )
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  };

  const syncScheduleScroll = (
    event: React.UIEvent<HTMLDivElement>,
    targetRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (targetRef.current) {
      targetRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  };

  const activeTabMeta = TAB_META.find((tab) => tab.id === activeTab) || TAB_META[0];
  const unreadCount = logs.filter((log) => !log.isRead).length;
  const renderPagination = (
    totalItems: number,
    currentPage: number,
    pageCount: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalItems <= ADMIN_PAGE_SIZE) return null;

    const firstItem = (currentPage - 1) * ADMIN_PAGE_SIZE + 1;
    const lastItem = Math.min(currentPage * ADMIN_PAGE_SIZE, totalItems);

    return (
      <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <span className="font-semibold">
          Показано {firstItem}-{lastItem} из {totalItems}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 transition-all hover:border-[#5AACE6] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Назад
          </button>
          <span className="rounded-xl bg-slate-50 px-4 py-2 font-black text-slate-700">
            {currentPage} / {pageCount}
          </span>
          <button
            onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage === pageCount}
            className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 transition-all hover:border-[#5AACE6] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Вперёд
          </button>
        </div>
      </div>
    );
  };

  const updateStatus = async (id: string, status: string) => {
    await api.updateAppointmentStatus(id, status);
    fetchData();
  };

  const deleteAppointment = async (id: string) => {
    if (confirm('Удалить эту запись безвозвратно?')) {
      await api.deleteAppointment(id);
      fetchData();
    }
  };

  const markAllAsRead = async () => {
    await api.markAllNotificationsRead();
    fetchData();
  };

  const exportToCSV = () => {
    const headers = ['Дата', 'Время', 'Пациент', 'Телефон', 'Врач', 'Цена', 'Статус'];
    const rows = appointments.map((appointment) => [
      appointment.appointmentDate,
      appointment.appointmentTime,
      `${appointment.patientFirstName} ${appointment.patientLastName}`,
      appointment.patientPhone,
      doctorNameById(appointment.doctorId),
      appointment.price,
      appointment.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows.map((row) => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = async () => {
    await api.logout();
    localStorage.removeItem('admin_auth');
    window.location.href = '/admin/login';
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordError('Введите текущий и новый пароль.');
      setPasswordMessage(null);
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);
    setPasswordMessage(null);

    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('Пароль успешно обновлён.');
    } catch (err: any) {
      setPasswordError(err.message || 'Не удалось обновить пароль.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleBackupDownload = async () => {
    try {
      await api.downloadBackup();
    } catch (err: any) {
      alert(err.message || 'Не удалось скачать резервную копию.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f4f8fc]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1f6fb2] rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-semibold tracking-wide">Загружаем панель администратора...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f4f8fc] p-6 text-center">
        <div className="bg-white border border-red-100 rounded-[2rem] shadow-xl p-10 max-w-xl w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-5" />
          <h2 className="text-2xl font-black text-slate-900 mb-3">Ошибка подключения</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={fetchData}
              className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all"
            >
              Повторить
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef5fb] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-[#102236] text-white px-6 py-8 flex flex-col border-r border-white/10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-[#5AACE6] flex items-center justify-center shadow-lg shadow-[#5AACE6]/30">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight">Doctor Plus</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">Admin Workspace</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-5 mb-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300 mb-2">Смена активна</p>
            <p className="text-2xl font-black">{stats?.todayCount ?? 0}</p>
            <p className="text-sm text-slate-300">записей на сегодня</p>
          </div>

          <nav className="space-y-2">
            {TAB_META.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full rounded-2xl px-4 py-4 text-left transition-all border',
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 border-white shadow-xl'
                    : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <tab.icon className={cn('w-5 h-5', activeTab === tab.id ? 'text-[#1f6fb2]' : 'text-slate-300')} />
                    <span className="font-bold">{tab.label}</span>
                  </div>
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="min-w-6 h-6 px-2 rounded-full bg-[#5AACE6] text-white text-[11px] font-black flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className={cn('mt-2 text-xs leading-relaxed', activeTab === tab.id ? 'text-slate-500' : 'text-slate-300')}>
                  {tab.description}
                </p>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 space-y-4">
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-bold hover:bg-white/10 transition-all"
            >
              Вернуться на сайт
            </button>
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl bg-rose-500/10 border border-rose-400/20 px-4 py-3 text-sm font-bold text-rose-100 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Выйти из панели
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="px-6 md:px-8 py-6 md:py-8">
            <header className="rounded-[2rem] bg-white shadow-sm border border-slate-100 p-6 md:p-8 mb-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f4fd] text-[#1f6fb2] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] mb-4">
                    <ShieldCheck className="w-4 h-4" />
                    Панель администратора
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{activeTabMeta.label}</h1>
                  <p className="text-slate-500 max-w-2xl">{activeTabMeta.description}</p>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 border border-slate-100 px-5 py-4 min-w-[240px]">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-1">Администратор</p>
                  <p className="font-black text-slate-900">{localStorage.getItem('admin_email') || 'doctorplus_admin'}</p>
                  <p className="text-sm text-slate-500 mt-1">Локальная защищённая сессия активна</p>
                </div>
              </div>
            </header>

            {doctors.length === 0 && !loading && seedProgress !== 'success' && (
              <div className="mb-8 rounded-[2rem] bg-slate-900 text-white p-8 shadow-2xl">
                <h2 className="text-2xl font-black mb-2">База ещё не заполнена</h2>
                <p className="text-slate-300 mb-6">Загрузите стартовые данные, чтобы активировать панель управления.</p>

                {seedProgress === 'idle' ? (
                  <button
                    onClick={async () => {
                      setSeedProgress('running');
                      setSeedLog(['Запуск инициализации...']);
                      try {
                        await api.seedData((message) => setSeedLog((current) => [...current, message]));
                        setSeedProgress('success');
                        setSeedLog((current) => [...current, 'Готово. Обновляем интерфейс...']);
                        setTimeout(() => window.location.reload(), 1500);
                      } catch (err: any) {
                        setSeedProgress('error');
                        setSeedLog((current) => [...current, `Ошибка: ${err.message}`]);
                      }
                    }}
                    className="rounded-2xl bg-white text-slate-900 px-6 py-4 font-black hover:bg-slate-100 transition-all"
                  >
                    Загрузить стартовые данные
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 font-mono text-sm max-h-48 overflow-y-auto space-y-2">
                      {seedLog.map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                    {seedProgress === 'error' && (
                      <button
                        onClick={() => {
                          setSeedProgress('idle');
                          setSeedLog([]);
                        }}
                        className="rounded-2xl bg-rose-500 px-6 py-3 font-black"
                      >
                        Попробовать снова
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Сегодня', value: stats?.todayCount ?? 0, note: 'назначений', color: 'bg-[#e8f4fd] text-[#1f6fb2]' },
                { label: 'Неделя', value: stats?.weekCount ?? 0, note: 'всех записей', color: 'bg-[#eef8ec] text-[#2d8a4c]' },
                { label: 'Доход сегодня', value: `${stats?.revenueToday ?? 0} сом`, note: 'подтверждённые и новые', color: 'bg-[#fff4e8] text-[#c2741c]' },
                { label: 'Новые', value: stats?.newCount ?? 0, note: 'ждут обработки', color: 'bg-[#f1efff] text-[#5c48d3]' },
              ].map((card) => (
                <div key={card.label} className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6">
                  <div className={cn('inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] mb-5', card.color)}>
                    {card.label}
                  </div>
                  <p className="text-3xl font-black tracking-tight">{card.value}</p>
                  <p className="text-sm text-slate-500 mt-2">{card.note}</p>
                </div>
              ))}
            </section>

            {activeTab === 'appointments' && (
              <section className="space-y-6">
                <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <h2 className="text-2xl font-black mb-2">Управление записями</h2>
                      <p className="text-slate-500">Фильтруйте, подтверждайте и удаляйте заявки пациентов.</p>
                    </div>
                    <button
                      onClick={exportToCSV}
                      className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Экспорт CSV
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Имя или телефон"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 outline-none focus:border-[#5AACE6] focus:bg-white transition-all"
                      />
                    </div>

                    <select
                      value={doctorFilter}
                      onChange={(event) => setDoctorFilter(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#5AACE6] focus:bg-white transition-all"
                    >
                      <option value="all">Все врачи</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#5AACE6] focus:bg-white transition-all"
                    >
                      <option value="all">Все статусы</option>
                      {Object.keys(STATUS_STYLES).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(event) => setDateFilter(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#5AACE6] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px]">
                      <thead className="bg-slate-900 text-white">
                        <tr className="text-left text-[11px] uppercase tracking-[0.2em]">
                          <th className="px-6 py-5">Дата и время</th>
                          <th className="px-6 py-5">Пациент</th>
                          <th className="px-6 py-5">Контакты</th>
                          <th className="px-6 py-5">Специалист</th>
                          <th className="px-6 py-5">Статус</th>
                          <th className="px-6 py-5 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAppointments.map((appointment) => (
                          <tr key={appointment.id} className="border-t border-slate-100 align-top hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-5">
                              <p className="font-black">{appointment.appointmentDate}</p>
                              <p className="text-sm text-slate-500 mt-1">{appointment.appointmentTime}</p>
                            </td>
                            <td className="px-6 py-5">
                              <p className="font-black uppercase">{appointment.patientFirstName} {appointment.patientLastName}</p>
                              <p className="text-sm text-slate-500 mt-2 max-w-xs">{appointment.notes || 'Без комментария'}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                                {appointment.patientPhone}
                              </span>
                            </td>
                            <td className="px-6 py-5 font-semibold text-slate-700">{doctorNameById(appointment.doctorId)}</td>
                            <td className="px-6 py-5">
                              <span
                                className={cn(
                                  'inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em]',
                                  STATUS_STYLES[appointment.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                                )}
                              >
                                {appointment.status}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => updateStatus(appointment.id, 'Подтверждена')}
                                  className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-all"
                                  title="Подтвердить"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteAppointment(appointment.id)}
                                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredAppointments.length === 0 && (
                    <div className="px-6 py-16 text-center text-slate-400 font-semibold">По заданным фильтрам ничего не найдено.</div>
                  )}
                  {renderPagination(filteredAppointments.length, appointmentsPage, appointmentsPageCount, setAppointmentsPage)}
                </div>
              </section>
            )}

            {activeTab === 'schedule' && (
              <section className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-black mb-2">Расписание на сегодня</h2>
                  <p className="text-slate-500">Быстрый обзор занятых слотов по каждому врачу.</p>
                </div>

                <div
                  ref={scheduleScrollRef}
                  onScroll={(event) => syncScheduleScroll(event, scheduleTableScrollRef)}
                  className="mb-4 h-5 overflow-x-scroll overflow-y-hidden rounded-full bg-[#edf7ff] [scrollbar-color:#5AACE6_#e8f4fd] [scrollbar-width:thin]"
                  aria-label="Horizontal schedule scroll"
                >
                  <div style={{ width: scheduleGridWidth, height: 1 }} />
                </div>

                <div
                  ref={scheduleTableScrollRef}
                  onScroll={(event) => syncScheduleScroll(event, scheduleScrollRef)}
                  className="overflow-x-auto pb-4 [scrollbar-color:#5AACE6_#e8f4fd] [scrollbar-width:thin]"
                >
                  <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden" style={{ minWidth: scheduleGridWidth }}>
                    <div
                      className="grid bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.18em]"
                      style={{ gridTemplateColumns: `120px repeat(${doctors.length}, minmax(180px, 1fr))` }}
                    >
                      <div className="px-4 py-4 border-r border-white/10">Время</div>
                      {doctors.map((doctor) => (
                        <div key={doctor.id} className="px-4 py-4 border-r last:border-r-0 border-white/10 text-center truncate">
                          {doctor.name}
                        </div>
                      ))}
                    </div>

                    {scheduleTimes.map((time) => (
                      <div
                        key={time}
                        className="grid border-t border-slate-100"
                        style={{ gridTemplateColumns: `120px repeat(${doctors.length}, minmax(180px, 1fr))` }}
                      >
                        <div className="px-4 py-4 bg-slate-50 border-r border-slate-100 text-sm font-bold text-slate-500">{time}</div>
                        {doctors.map((doctor) => {
                          const booked = appointments.find(
                            (appointment) =>
                              appointment.doctorId === doctor.id &&
                              appointment.appointmentTime === time &&
                              appointment.appointmentDate === todayDateKey &&
                              appointment.status !== 'Отменена'
                          );

                          return (
                            <div key={`${doctor.id}-${time}`} className="p-2 border-r last:border-r-0 border-slate-100 min-h-[78px]">
                              {booked ? (
                                <div className="h-full rounded-2xl bg-[#eef5fb] border border-[#d4e8f8] p-3">
                                  <p className="font-black text-sm truncate">{booked.patientFirstName} {booked.patientLastName}</p>
                                  <p className="text-xs text-slate-500 mt-2">{booked.appointmentTime} · {booked.service}</p>
                                </div>
                              ) : (
                                <div className="h-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/70" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    </div>
                </div>
              </section>
            )}

            {activeTab === 'patients' && (
              <section className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black mb-2">Пациенты</h2>
                    <p className="text-slate-500">История обращений и общая сумма оплат по пациентам.</p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Поиск по имени или телефону"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 outline-none focus:border-[#5AACE6] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        <th className="pb-4">Пациент</th>
                        <th className="pb-4">Телефон</th>
                        <th className="pb-4 text-center">Визиты</th>
                        <th className="pb-4">Последний визит</th>
                        <th className="pb-4 text-right">Оплачено</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedPatients.map((patient) => (
                          <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-5 font-black">{patient.firstName} {patient.lastName}</td>
                            <td className="py-5 text-slate-500">{patient.phone}</td>
                            <td className="py-5 text-center font-bold">{patient.totalVisits}</td>
                            <td className="py-5 text-slate-500">{patient.lastVisitDate || 'Нет данных'}</td>
                            <td className="py-5 text-right font-black">{patient.totalPaid?.toLocaleString()} сом</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {filteredPatients.length === 0 && (
                  <div className="px-6 py-16 text-center text-slate-400 font-semibold">Пациенты не найдены.</div>
                )}
                {renderPagination(filteredPatients.length, patientsPage, patientsPageCount, setPatientsPage)}
              </section>
            )}

            {activeTab === 'revenue' && (
              <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
                <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 md:p-8">
                  <h2 className="text-2xl font-black mb-2">Доход за последние 14 дней</h2>
                  <p className="text-slate-500 mb-8">График собирается по всем активным записям, кроме отменённых.</p>
                  <div className="h-[360px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} />
                        <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff', borderRadius: '16px' }} />
                        <Bar dataKey="total" fill="#1f6fb2" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 md:p-8">
                  <h2 className="text-2xl font-black mb-2">Краткая сводка</h2>
                  <p className="text-slate-500 mb-8">Текущее состояние приёмов и команды.</p>
                  <div className="space-y-4">
                    {[
                      { label: 'Активных врачей', value: stats?.activeDoctors ?? doctors.length },
                      { label: 'Новых заявок', value: stats?.newCount ?? 0 },
                      { label: 'Записей за неделю', value: stats?.weekCount ?? 0 },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[1.5rem] bg-slate-50 border border-slate-100 px-5 py-4 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">{item.label}</span>
                        <span className="text-2xl font-black">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'notifications' && (
              <section className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black mb-2">Уведомления</h2>
                    <p className="text-slate-500">Системные события и новые записи пациентов.</p>
                  </div>
                  <button
                    onClick={markAllAsRead}
                    className="rounded-2xl bg-slate-100 text-slate-700 px-5 py-3 font-bold hover:bg-slate-200 transition-all"
                  >
                    Отметить всё прочитанным
                  </button>
                </div>

                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        'rounded-[1.5rem] border px-5 py-4 flex gap-4 items-start transition-all',
                        log.isRead ? 'bg-slate-50 border-slate-100' : 'bg-[#eef5fb] border-[#d4e8f8]'
                      )}
                    >
                      <div className={cn('w-3 h-3 rounded-full mt-1.5 shrink-0', log.isRead ? 'bg-slate-300' : 'bg-[#5AACE6]')} />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold break-words">{log.message}</p>
                        <p className="text-sm text-slate-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'settings' && (
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 md:p-8">
                  <h2 className="text-2xl font-black mb-2">Безопасность</h2>
                  <p className="text-slate-500 mb-8">Управление паролем администратора.</p>
                  <div className="space-y-4">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      placeholder="Текущий пароль"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#5AACE6] focus:bg-white transition-all"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Новый пароль"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#5AACE6] focus:bg-white transition-all"
                    />
                    {passwordError && <p className="text-sm font-bold text-rose-600">{passwordError}</p>}
                    {passwordMessage && <p className="text-sm font-bold text-emerald-600">{passwordMessage}</p>}
                    <button
                      onClick={handlePasswordChange}
                      disabled={savingPassword}
                      className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {savingPassword ? 'Сохраняем...' : 'Обновить пароль'}
                    </button>
                  </div>
                </div>

                <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 md:p-8">
                  <h2 className="text-2xl font-black mb-2">Сервисные действия</h2>
                  <p className="text-slate-500 mb-8">Резервная копия данных и повторная инициализация.</p>
                  <div className="space-y-4">
                    <button
                      onClick={handleBackupDownload}
                      className="w-full rounded-2xl bg-[#e8f4fd] text-[#1f6fb2] px-5 py-4 font-bold hover:bg-[#d9ecfb] transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Скачать резервную копию
                    </button>

                    <button
                      disabled={seedProgress === 'running'}
                      onClick={async () => {
                        setSeedProgress('running');
                        try {
                          await api.seedData?.();
                          fetchData();
                          setSeedProgress('success');
                          setTimeout(() => setSeedProgress('idle'), 3000);
                        } catch (err: any) {
                          setSeedProgress('error');
                          alert(err.message || 'Не удалось переинициализировать данные.');
                        }
                      }}
                      className="w-full rounded-2xl bg-slate-900 text-white px-5 py-4 font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {seedProgress === 'running' ? 'Переинициализация...' : seedProgress === 'success' ? 'Готово' : 'Повторная инициализация'}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
