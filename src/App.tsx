import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  MessageSquare,
  Instagram,
  ChevronRight,
  Menu,
  X,
  Heart,
  Stethoscope,
  Activity,
  Microscope,
  Ear,
  Venus,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

import { CLINIC_INFO, PRICES } from './constants';
import { api } from './lib/api';
import AppRedesign from './App.redesign';
import { BookingFlow } from './components/BookingFlow';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { cn } from './lib/utils';
import type { Doctor, Review } from './types';

const CATEGORY_ORDER = ['Консультации', 'УЗИ', 'Гинекология', 'ЛОР', 'Эфферентология', 'Логопед-дефектолог', 'Процедурный кабинет', 'ЭКГ'];
const CLINIC_MAP_URL =
  'https://2gis.kg/bishkek/search/%D1%83%D0%BB.%20%D0%9C%D0%B0%D1%85%D0%B0%D1%82%D0%BC%D1%8B%20%D0%93%D0%B0%D0%BD%D0%B4%D0%B8%2C%20201';
const INSTAGRAM_URL = 'https://www.instagram.com/doctorplusclinic.kg/';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        const result = await api.getMe();
        if (!mounted) return;
        setIsAdmin(!!result?.isAdmin);
        setLoading(false);
        if (result?.isAdmin) {
          localStorage.setItem('admin_auth', 'true');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        if (!mounted) return;
        setLoading(false);
        setIsAdmin(false);
      }
    };

    checkStatus();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#09090b]">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-200 rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-mono text-sm animate-pulse tracking-widest">ПРОВЕРКА ДОСТУПА...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full bg-[#121214] border border-zinc-800 p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700" />
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-zinc-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Доступ ограничен</h2>
              <p className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">Требуется вход администратора</p>
            </div>
          </div>

          <div className="space-y-6 text-zinc-400 font-mono text-sm">
            <div className="bg-zinc-950 p-6 space-y-4 border border-zinc-900">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 text-zinc-300">
                <p className="font-black text-white text-[10px] uppercase mb-2">Что сделать:</p>
                <p className="text-[10px]">Войдите под локальной учётной записью администратора, чтобы открыть панель управления.</p>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.href = '/admin/login';
              }}
              className="bg-zinc-100 text-zinc-900 px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-white transition-all transform active:scale-95"
            >
              Перейти ко входу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const Navbar = ({ onScroll }: { onScroll: (id: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { id: 'hero', label: 'Главная' },
    { id: 'doctors', label: 'Врачи' },
    { id: 'prices', label: 'Услуги' },
    { id: 'booking', label: 'Запись' },
    { id: 'reviews', label: 'Отзывы' },
    { id: 'contacts', label: 'Контакты' },
  ];

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleMobileNav = (id: string) => {
    setIsMenuOpen(false);
    window.setTimeout(() => onScroll(id), 120);
  };

  return (
    <nav className="sticky top-0 z-50 h-20 bg-white/90 backdrop-blur-md border-b border-[#B3D9F5] flex items-center shrink-0">
      <div className="max-w-7xl mx-auto px-8 w-full flex justify-between items-center h-full">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#5AACE6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-2xl">+</span>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter text-[#1A2B3C] leading-none uppercase">{CLINIC_INFO.name}</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1 uppercase">МЕДЦЕНТР БИШКЕК</p>
          </div>
        </Link>

        <div className="hidden lg:flex gap-8 text-sm font-black uppercase tracking-widest text-[#1A2B3C]">
          {links.map((link) => (
            <button key={link.id} onClick={() => onScroll(link.id)} className="hover:text-[#5AACE6] transition-colors">
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <Link to="/admin/login" className="text-[10px] font-black uppercase text-slate-300 hover:text-[#5AACE6] transition-colors">
            Войти
          </Link>
          <div className="h-8 w-[1px] bg-slate-100" />
          <a href={`tel:${CLINIC_INFO.phone.replace(/\D/g, '')}`} className="flex flex-col items-end group">
            <span className="text-[9px] font-black text-slate-400 group-hover:text-[#5AACE6] transition-colors uppercase tracking-widest leading-none">
              Позвоните нам
            </span>
            <span className="font-black text-[#1A2B3C] text-lg leading-none">{CLINIC_INFO.phone}</span>
          </a>
        </div>

        <button onClick={() => setIsMenuOpen((value) => !value)} className="lg:hidden p-2 text-[#1A2B3C]">
          {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed inset-0 z-[100] bg-white lg:hidden"
          >
            <div className="flex h-dvh flex-col overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f1f8ff_100%)]">
              <div className="flex h-20 shrink-0 items-center justify-between border-b border-[#DDEDFC] px-6">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5AACE6] text-2xl font-black text-white shadow-lg shadow-blue-100">
                    +
                  </div>
                  <div>
                    <p className="text-xl font-black uppercase leading-none tracking-tighter text-[#1A2B3C]">{CLINIC_INFO.name}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">Медцентр Бишкек</p>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl bg-[#F0F8FF] p-3 text-[#1A2B3C]"
                  aria-label="Закрыть меню"
                >
                  <X className="h-7 w-7" />
                </button>
              </div>

              <div className="flex-1 px-6 py-8">
                <p className="mb-5 text-[10px] font-black uppercase tracking-[0.3em] text-[#5AACE6]">Навигация</p>
                <div className="space-y-3">
                  {links.map((link, index) => (
                    <button
                      key={link.id}
                      onClick={() => handleMobileNav(link.id)}
                      className="flex w-full items-center justify-between rounded-[1.4rem] border border-[#E3EEF9] bg-white px-5 py-4 text-left shadow-[0_12px_30px_rgba(20,45,75,0.04)]"
                    >
                      <span className="text-[11px] font-black text-slate-300">0{index + 1}</span>
                      <span className="text-xl font-black uppercase tracking-tight text-[#1A2B3C]">{link.label}</span>
                      <ChevronRight className="h-5 w-5 text-[#5AACE6]" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#DDEDFC] bg-white px-6 py-6">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Личный кабинет</p>
                <Link
                  to="/admin/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between rounded-[1.4rem] bg-[#1A2B3C] px-5 py-4 text-base font-black text-white"
                >
                  Вход для персонала
                  <ChevronRight className="h-5 w-5 text-[#5AACE6]" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const PublicSite = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('Все');
  const [activePriceCategory, setActivePriceCategory] = useState(CATEGORY_ORDER[0]);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasRealDoctorPhoto = (doctor: Doctor) => !doctor.photoUrl.endsWith('.svg');

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const [doctorData, reviewData] = await Promise.all([api.getDoctors(), api.getReviews()]);
        setDoctors(doctorData);
        setReviews(reviewData);
      } catch (err: any) {
        console.error('Initialization error', err);
        setError(err.message || 'Не удалось загрузить данные клиники.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const scrollSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    window.scrollTo({
      top: element.offsetTop - 80,
      behavior: 'smooth',
    });
  };

  const startDoctorBooking = (doctor: Doctor) => {
    setBookingDoctor({ ...doctor });
    scrollSection('booking');
  };

  const extraDoctorDepartments: Record<string, string[]> = {
    'moldosheva-gulzat-sharshebaevna': ['УЗИ-диагностика'],
  };
  const serviceProfileIds = new Set(['procedure-room']);
  const doctorDepartments = (doctor: Doctor) => [doctor.department, ...(extraDoctorDepartments[doctor.id] || [])];
  const sortSpecialists = (items: Doctor[]) =>
    items.slice().sort((a, b) => {
      const serviceProfileScore = Number(serviceProfileIds.has(a.id)) - Number(serviceProfileIds.has(b.id));
      return serviceProfileScore || b.rating - a.rating || a.name.localeCompare(b.name);
    });
  const doctorTabs = ['Все', ...Array.from(new Set(doctors.flatMap(doctorDepartments)))];
  const filteredDoctors = activeTab === 'Все'
    ? sortSpecialists(doctors)
    : sortSpecialists(doctors.filter((doctor) => doctorDepartments(doctor).includes(activeTab)));
  const plasmaDoctor = doctors.find((doctor) => doctor.id === 'kabylov-zhyldyzbek-saparovich');
  const priceCategories = CATEGORY_ORDER.filter((category) => PRICES.some((price) => price.category === category));
  const activePriceItems = PRICES.filter((price) => price.category === activePriceCategory);
  const featuredBookableServices = PRICES.filter((price) => price.bookable !== false).slice(0, 4);
  const displayedReviews = reviews
    .slice()
    .sort((a, b) => {
      const sourceScore = (b.source === '2GIS' ? 1 : 0) - (a.source === '2GIS' ? 1 : 0);
      return sourceScore || b.rating - a.rating || b.date.localeCompare(a.date);
    })
    .slice(0, 6);

  return (
    <div className="bg-[#F8FCFF] text-[#1A2B3C]">
      <Navbar onScroll={scrollSection} />

      {error && (
        <div className="bg-red-500 text-white p-4 text-center font-bold sticky top-20 z-50 animate-pulse">
          {error} Пожалуйста, обновите страницу или свяжитесь с клиникой.
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#5AACE6] border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-[#1A2B3C] uppercase tracking-widest text-xs">Загрузка данных...</p>
          </div>
        </div>
      )}

      <section id="hero" className="relative min-h-[92vh] bg-[#E8F4FD] overflow-hidden flex items-center py-16 pb-28 lg:py-24 lg:pb-36">
        <div className="absolute inset-0 z-0">
          <img
            src="https://odoctor.kg/storage/clinics/bishkek/doktor-plyus/doktor-plyus-1.jpg"
            alt=""
            className="w-full h-full object-cover opacity-10 grayscale"
          />
        </div>
        <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          <div className="lg:col-span-8 flex flex-col justify-center items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-xl shadow-blue-900/5 mb-8"
            >
              <span className="text-xl">+</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#5AACE6]">Медицинский центр для всей семьи</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
            >
              Ваше здоровье
              <br />
              <span className="text-[#5AACE6]">наш приоритет.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-slate-500 font-medium max-w-xl mb-12 leading-relaxed"
            >
              Современная диагностика, опытные специалисты и удобная онлайн-запись в одном месте.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => scrollSection('booking')}
                className="bg-[#1A2B3C] text-white px-10 py-6 rounded-3xl font-black text-xl hover:bg-[#2A3B4C] transition-all shadow-2xl shadow-slate-900/10 flex items-center gap-3"
              >
                Записаться на приём
                <ArrowRight className="w-6 h-6 text-[#5AACE6]" />
              </button>
              <button
                onClick={() => scrollSection('doctors')}
                className="bg-white text-[#1A2B3C] px-10 py-6 rounded-3xl font-black text-xl hover:bg-slate-50 transition-all border-2 border-slate-50 shadow-xl shadow-blue-900/5"
              >
                Наши специалисты
              </button>
            </motion.div>
          </div>

          <div className="hidden lg:flex lg:col-span-4 flex-col justify-center">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-white">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-[#5AACE6] shadow-sm">
                    <Star className="w-8 h-8 fill-current" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#1A2B3C]">{CLINIC_INFO.rating}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Средняя оценка</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-[#5AACE6] shadow-sm">
                    <MessageSquare className="w-8 h-8 fill-current" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#1A2B3C]">{CLINIC_INFO.reviewsCount}+</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Отзывов пациентов</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-[#5AACE6] shadow-sm">
                    <CheckCircle className="w-8 h-8 fill-current" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#1A2B3C]">{PRICES.length}+</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Медицинских услуг</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-b from-transparent via-[#eef8fe]/70 to-[#F8FCFF]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 220"
            preserveAspectRatio="none"
            className="block h-28 w-full md:h-36 lg:h-44"
            aria-hidden="true"
          >
            <path
              d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,133.3C672,117,768,107,864,122.7C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,220L1392,220C1344,220,1248,220,1152,220C1056,220,960,220,864,220C768,220,672,220,576,220C480,220,384,220,288,220C192,220,96,220,48,220L0,220Z"
              fill="#ffffff"
              fillOpacity="0.96"
            />
            <path
              d="M0,160L48,154.7C96,149,192,139,288,144C384,149,480,171,576,181.3C672,192,768,192,864,176C960,160,1056,128,1152,122.7C1248,117,1344,139,1392,149.3L1440,160L1440,220L1392,220C1344,220,1248,220,1152,220C1056,220,960,220,864,220C768,220,672,220,576,220C480,220,384,220,288,220C192,220,96,220,48,220L0,220Z"
              fill="#f8fcff"
            />
          </svg>
        </div>
      </section>

      <div className="relative z-30 -mt-8 sm:-mt-10 lg:-mt-14">
        <div className="max-w-7xl mx-auto px-8 relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { label: 'Терапия', icon: Stethoscope },
            { label: 'УЗИ', icon: Microscope },
            { label: 'Педиатрия', icon: Heart },
            { label: 'Плазмаферез', icon: Activity },
            { label: 'Гинекология', icon: Venus },
            { label: 'Логопед', icon: MessageSquare },
            { label: 'ЛОР', icon: Ear },
          ].map((item) => (
            <div
              key={item.label}
              className="group flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-[#B3D9F5]/30 bg-white/85 p-4 text-center shadow-lg shadow-slate-200/50 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#5AACE6]/50 hover:bg-white"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5AACE6] text-white shadow-lg shadow-blue-100 transition-transform group-hover:scale-110">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-black uppercase leading-tight tracking-tight text-[#1A2B3C]">{item.label}</span>
            </div>
          ))}
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/plasmapheresis';
            }}
            className="mt-5 group w-full overflow-hidden rounded-[2rem] border border-[#B3D9F5]/40 bg-white/90 p-6 text-left shadow-xl shadow-slate-200/60 transition-all hover:-translate-y-1 hover:border-[#5AACE6]/60 hover:shadow-2xl"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1A2B3C] text-white">
                  <Activity className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#5AACE6]">Hemofenix</p>
                  <h3 className="mt-1 text-2xl font-black uppercase tracking-tighter text-[#1A2B3C]">Плазмаферез</h3>
                  <p className="mt-1 max-w-2xl text-sm font-bold leading-relaxed text-slate-500">
                    Отдельная страница с описанием процедуры, показаниями и записью к специалисту.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-[#1A2B3C]">
                Узнать подробнее
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F4FD] text-[#5AACE6] transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <section id="doctors" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8 mb-16">
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Наши специалисты</h2>
          <div className="w-12 h-1 bg-[#5AACE6] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-8 overflow-x-auto pb-8">
          <div className="flex gap-4 min-w-max">
            {doctorTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-8 py-4 rounded-[1.5rem] font-black text-base transition-all',
                  activeTab === tab ? 'bg-[#1A2B3C] text-white' : 'bg-[#F8FCFF] text-slate-500 hover:text-[#1A2B3C]'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                layout
                className="bg-[#F8FCFF] rounded-[2.4rem] p-6 border-2 border-slate-50 hover:border-[#B3D9F5]/30 transition-all shadow-sm flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-[1.65rem] overflow-hidden shadow-lg shrink-0">
                    <img
                      src={doctor.photoUrl}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                        event.currentTarget.parentElement?.classList.add('doctor-photo-fallback');
                      }}
                    />
                    <div className="hidden h-full w-full items-center justify-center bg-[#E8F4FD] text-2xl font-black text-[#5AACE6]">
                      {doctor.name.slice(0, 1)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-black uppercase text-[#5AACE6] tracking-[0.18em]">{doctor.department}</span>
                      {hasRealDoctorPhoto(doctor) && (
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-lg">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-black">{doctor.rating}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-black leading-tight mb-2">{doctor.name}</h3>
                    <p className="text-sm font-bold text-slate-500 mb-1.5">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4 text-[#5AACE6]" />
                      <span className="text-xs font-bold">{doctor.schedule}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-5 line-clamp-3">{doctor.education}</p>
                <button
                  onClick={() => startDoctorBooking(doctor)}
                  className="mt-auto w-full py-3.5 rounded-2xl bg-white border-2 border-slate-100 font-bold hover:bg-[#1A2B3C] hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Записаться
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-[#DDEDFC] bg-[linear-gradient(135deg,#10243a_0%,#1A2B3C_46%,#eaf8f4_46%,#ffffff_100%)] shadow-[0_30px_80px_rgba(26,43,60,0.14)]">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 p-8 md:p-12 text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#B3D9F5]">
                  <Activity className="w-4 h-4" />
                  Плазмаферез
                </div>
                <h2 className="mt-6 text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                  Мембранный плазмаферез на Hemofenix
                </h2>
                <p className="mt-6 text-base md:text-lg font-medium leading-relaxed text-slate-200">
                  В клинике используется аппарат Hemofenix — современная система для мембранного плазмафереза. По информации клиники, это единственный такой аппарат в городе.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Аппаратная очистка плазмы', 'По назначению специалиста', 'Контроль врача', 'Комфортная запись онлайн'].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white">
                      <CheckCircle className="h-4 w-4 shrink-0 text-[#5AACE6]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 p-6 md:p-10">
                <div className="grid h-full grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-[2rem] bg-white p-7 shadow-[0_18px_45px_rgba(20,45,75,0.08)] border border-[#E3EEF9]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5AACE6]">Курс процедуры</p>
                    <h3 className="mt-3 text-2xl font-black text-[#1A2B3C]">Плазмаферез</h3>
                    <p className="mt-3 text-sm font-bold leading-relaxed text-slate-500">
                      Эфферентная процедура по назначению специалиста.
                    </p>
                    <div className="mt-6 rounded-2xl bg-[#F0F8FF] px-5 py-4">
                      <p className="text-3xl font-black text-[#1A2B3C]">5000 сом</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5AACE6]">60-90 мин</p>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-[#F8FCFF] p-7 shadow-[0_18px_45px_rgba(20,45,75,0.08)] border-2 border-[#B3D9F5]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5AACE6]">Hemofenix</p>
                    <h3 className="mt-3 text-2xl font-black text-[#1A2B3C]">Мембранный плазмаферез</h3>
                    <p className="mt-3 text-sm font-bold leading-relaxed text-slate-500">
                      Более технологичный вариант процедуры на аппарате Hemofenix.
                    </p>
                    <div className="mt-6 rounded-2xl bg-white px-5 py-4 ring-1 ring-[#DDEDFC]">
                      <p className="text-3xl font-black text-[#1A2B3C]">20000 сом</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5AACE6]">90-120 мин</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-4 rounded-[2rem] bg-white/80 p-6 border border-[#E3EEF9] md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Специалист</p>
                      <p className="mt-1 text-xl font-black text-[#1A2B3C]">Кабылов Жылдызбек Сапарович</p>
                    </div>
                    <button
                      onClick={() => {
                        if (plasmaDoctor) {
                          startDoctorBooking(plasmaDoctor);
                        } else {
                          scrollSection('booking');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#1A2B3C] px-7 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-[#2A3B4C]"
                    >
                      Записаться
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="booking" className="py-32 bg-[#E8F4FD]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#5AACE6] text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <ShieldCheck className="w-4 h-4" />
              Безопасная онлайн-запись
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">Записаться к врачу</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto italic">
              Выберите удобное время прямо сейчас. Все данные обрабатываются конфиденциально.
            </p>
          </div>
          <BookingFlow initialDoctor={bookingDoctor} />
        </div>
      </section>

      <section id="prices" className="py-20 md:py-32 bg-[linear-gradient(180deg,#ffffff_0%,#f8fcff_100%)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
          <div className="md:col-span-4 md:translate-y-10 group">
            <div className="sticky top-32 space-y-5 md:space-y-6">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">Прайс-лист</h2>
              <p className="text-slate-500 font-medium">Все цены остались на месте: выберите категорию, чтобы быстро посмотреть нужный раздел.</p>
              <div className="p-6 md:p-8 bg-[linear-gradient(135deg,#eff7ff_0%,#ffffff_100%)] rounded-[2rem] md:rounded-[2.2rem] border border-[#DDEDFC] shadow-[0_20px_50px_rgba(90,172,230,0.08)]">
                <p className="text-xs font-black uppercase text-[#5AACE6] tracking-widest mb-4">Уточнение стоимости</p>
                <p className="text-base md:text-lg font-bold text-slate-600 italic">Если нужна точная сумма по редким процедурам, позвоните в регистратуру.</p>
              </div>
              <a
                href={`tel:${CLINIC_INFO.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-4 text-2xl sm:text-xl font-black hover:text-[#5AACE6] transition-colors rounded-[1.6rem] border border-transparent hover:border-[#DDEDFC] hover:bg-white px-3 py-3"
              >
                <div className="w-12 h-12 bg-[#B3D9F5] rounded-2xl flex items-center justify-center text-[#5AACE6]">
                  <Phone className="w-6 h-6" />
                </div>
                Уточнить цены по телефону
              </a>
            </div>
          </div>

          <div className="md:col-span-8 space-y-5">
            <div className="rounded-[1.7rem] md:rounded-[2rem] border border-[#E3EEF9] bg-white/80 p-2.5 md:p-3 shadow-[0_18px_45px_rgba(20,45,75,0.04)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                {priceCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActivePriceCategory(category)}
                    className={cn(
                      'rounded-[1.1rem] px-3 py-3 text-left text-[10px] sm:text-[11px] font-black uppercase tracking-[0.08em] sm:tracking-[0.12em] transition-all',
                      activePriceCategory === category
                        ? 'bg-[#1A2B3C] text-white shadow-[0_12px_30px_rgba(26,43,60,0.18)]'
                        : 'bg-[#F8FCFF] text-slate-400 hover:bg-[#EEF7FF] hover:text-[#1A2B3C]'
                    )}
                  >
                    {category}
                    <span className={cn('ml-1.5 rounded-full px-1.5 py-0.5 text-[9px]', activePriceCategory === category ? 'bg-white/15 text-white' : 'bg-white text-[#5AACE6]')}>
                      {PRICES.filter((price) => price.category === category).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 md:p-7 rounded-[2rem] md:rounded-[2.4rem] bg-white border border-[#E3EEF9] transition-all shadow-[0_18px_45px_rgba(20,45,75,0.05)]">
              <h4 className="text-3xl md:text-2xl font-black mb-5 md:mb-6 border-b border-slate-100 pb-4 flex justify-between items-center gap-4">
                {activePriceCategory}
                <span className="shrink-0 rounded-full bg-[#F0F8FF] px-3 md:px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#5AACE6]">{activePriceItems.length} услуг</span>
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {activePriceItems.map((price) => (
                  <div key={price.name} className="rounded-[1.45rem] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-4 transition-all hover:-translate-y-0.5 hover:border-[#DDEDFC] hover:bg-white hover:shadow-[0_16px_35px_rgba(20,45,75,0.06)]">
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-[14px] sm:text-[13px] font-black uppercase text-[#1A2B3C] tracking-[0.04em] sm:tracking-[0.08em] leading-snug">{price.name}</p>
                        <p className="mt-2 text-[12px] sm:text-[11px] font-bold leading-relaxed text-slate-400">{price.description}</p>
                      </div>
                      <div className="w-full sm:w-auto sm:min-w-[112px] rounded-2xl bg-[#F0F8FF] px-4 py-3 text-left sm:text-right ring-1 ring-[#DDEDFC]">
                        <p className="text-2xl sm:text-lg font-black leading-none text-[#1A2B3C]">{price.price}</p>
                        <p className="mt-1 text-[10px] sm:text-[9px] font-black uppercase tracking-widest text-[#5AACE6]">{price.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-32 bg-[#1A2B3C] text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <h2 className="text-6xl font-black tracking-tighter uppercase mb-4">
                Отзывы
                <br />
                <span className="text-[#5AACE6]">наших пациентов</span>
              </h2>
              <p className="text-slate-400 font-medium max-w-md">Нам важно мнение каждого пациента. Отзывы помогают улучшать сервис каждый день.</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-5xl font-black">{CLINIC_INFO.rating}</p>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Средняя оценка</p>
              </div>
              <div className="h-12 w-[1px] bg-slate-700" />
              <div className="text-center">
                <p className="text-5xl font-black">{reviews.length > 0 ? reviews.length : CLINIC_INFO.reviewsCount}+</p>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Опубликованных отзывов</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReviews.map((review, index) => (
              <div key={review.id || index} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#5AACE6] flex items-center justify-center font-black">
                      {review.author[0]}
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-none mb-1">{review.author}</p>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{review.date}</p>
                    </div>
                  </div>
                  <div className="text-[9px] font-black uppercase px-2 py-1 rounded bg-[#5AACE6]/20 text-[#5AACE6] tracking-widest">
                    {review.source}
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star key={starIndex} className={cn('w-3 h-3', starIndex < review.rating ? 'fill-current' : 'opacity-20')} />
                  ))}
                </div>
                <p className="text-slate-400 font-medium leading-relaxed italic">"{review.text}"</p>
                {review.doctorName && (
                  <p className="text-[10px] font-black uppercase text-[#5AACE6] tracking-widest mt-auto">Врач: {review.doctorName}</p>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      <section id="contacts" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-5 bg-[#F8FCFF] rounded-[3rem] p-12 border-2 border-slate-50 border-dashed space-y-12">
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-8">Контакты</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-[#5AACE6] shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Адрес клиники</p>
                  <p className="text-xl font-bold">{CLINIC_INFO.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-[#5AACE6] shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Телефон регистратуры</p>
                  <p className="text-xl font-bold">{CLINIC_INFO.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-[#5AACE6] shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">График работы</p>
                  <p className="text-xl font-bold">{CLINIC_INFO.hours}</p>
                </div>
              </div>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-6 group"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-[#5AACE6] shrink-0 group-hover:border-[#B3D9F5] transition-all">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Instagram</p>
                  <p className="text-xl font-bold group-hover:text-[#5AACE6] transition-colors">@doctorplusclinic.kg</p>
                </div>
              </a>
            </div>

            <div className="bg-[#B3D9F5]/20 p-8 rounded-[2rem] space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-[#1A2B3C]">Награда</p>
              <p className="text-2xl font-black italic">{CLINIC_INFO.awards[0]}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Спасибо пациентам за доверие</p>
            </div>
          </div>

          <div className="lg:col-span-7 min-h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-[#F8FCFF] bg-gradient-to-br from-[#D9EEFB] via-white to-[#EDF7FD] relative">
            <div className="absolute inset-0 opacity-60">
              <div className="absolute top-12 left-12 w-32 h-32 rounded-full bg-[#B3D9F5]" />
              <div className="absolute bottom-16 right-16 w-40 h-40 rounded-full bg-[#D9EEFB]" />
              <div className="absolute inset-x-10 top-24 bottom-24 rounded-[2.5rem] border border-white/70 bg-white/40 backdrop-blur-sm" />
            </div>
            <div className="relative h-full p-10 md:p-14 flex flex-col justify-between gap-10">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 bg-white text-[#5AACE6] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
                  <MapPin className="w-4 h-4" />
                  Как нас найти
                </div>
                <h3 className="text-5xl font-black tracking-tighter uppercase leading-none mb-6">
                  Мы рядом
                  <br />
                  с вами
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Если встроенная карта не открывается в браузере, используйте кнопку ниже. Она сразу откроет адрес клиники в 2GIS.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="bg-white/85 backdrop-blur-sm rounded-[2rem] p-8 shadow-lg border border-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Адрес</p>
                  <p className="text-2xl font-black text-[#1A2B3C] mb-4">{CLINIC_INFO.address}</p>
                  <p className="text-sm text-slate-500 font-medium">
                    Ориентир: медицинский центр «Доктор Плюс», удобный подъезд и быстрая навигация с телефона.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = CLINIC_MAP_URL;
                    }}
                    className="bg-[#1A2B3C] text-white px-8 py-5 rounded-[1.75rem] font-black text-lg hover:bg-[#2A3B4C] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                  >
                    Открыть в 2GIS
                    <ArrowRight className="w-5 h-5 text-[#5AACE6]" />
                  </button>
                  <a
                    href={`tel:${CLINIC_INFO.phone.replace(/\D/g, '')}`}
                    className="bg-white text-[#1A2B3C] px-8 py-5 rounded-[1.75rem] font-black text-lg border-2 border-slate-100 hover:border-[#B3D9F5] transition-all flex items-center justify-center gap-3"
                  >
                    Позвонить в клинику
                    <Phone className="w-5 h-5 text-[#5AACE6]" />
                  </a>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-[#1A2B3C] px-8 py-5 rounded-[1.75rem] font-black text-lg border-2 border-slate-100 hover:border-[#B3D9F5] transition-all flex items-center justify-center gap-3"
                  >
                    Instagram
                    <Instagram className="w-5 h-5 text-[#5AACE6]" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-[#F8FCFF] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#5AACE6] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <span className="text-white font-black text-2xl">+</span>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-[#1A2B3C] uppercase leading-none">{CLINIC_INFO.name}</h2>
              <p className="text-[10px] font-black text-slate-400 tracking-widest mt-1 uppercase">Лицензия {CLINIC_INFO.license}</p>
            </div>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <button onClick={() => scrollSection('hero')} className="hover:text-[#5AACE6] transition-colors">Главная</button>
            <button onClick={() => scrollSection('doctors')} className="hover:text-[#5AACE6] transition-colors">Врачи</button>
            <button onClick={() => scrollSection('prices')} className="hover:text-[#5AACE6] transition-colors">Цены</button>
            <button onClick={() => scrollSection('reviews')} className="hover:text-[#5AACE6] transition-colors">Отзывы</button>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© 2026 Доктор Плюс</p>
            <p className="text-xs font-bold text-slate-400 mt-1 italic">Имеются противопоказания. Нужна консультация специалиста.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const PlasmapheresisPage = () => {
  const [plasmaDoctor, setPlasmaDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    api.getDoctors()
      .then((items) => {
        setPlasmaDoctor(items.find((doctor) => doctor.id === 'kabylov-zhyldyzbek-saparovich') || null);
      })
      .catch((error) => console.error('Failed to load plasmapheresis doctor', error));
  }, []);

  const benefits = [
    'Современный способ аппаратной очистки крови',
    'Проводится по назначению и после консультации специалиста',
    'В центре доступны мембранный и дискретный плазмаферез',
    'Также проводятся ВЛОК и УФО крови',
  ];

  const mechanisms = [
    {
      title: 'Поддержка иммунной системы',
      text: 'Процедура помогает снизить нагрузку факторов, которые поддерживают хроническое воспаление.',
    },
    {
      title: 'Выведение токсических веществ',
      text: 'С удаляемой плазмой выводятся токсины и нежелательные биологически активные вещества.',
    },
    {
      title: 'Улучшение текучести крови',
      text: 'После фильтрации кровь становится менее вязкой, что помогает микроциркуляции.',
    },
  ];

  const indications = [
    'аллергология и дерматология',
    'эндокринология',
    'ревматология',
    'гастроэнтерология',
    'неврология',
    'нефрология',
    'акушерство и гинекология',
    'токсикология и другие направления',
  ];

  const detailedIndications = [
    {
      title: 'Дерматология',
      text: 'Острые и хронические дерматиты, дерматозы, хроническая экзема, псориаз и другие кожные заболевания.',
    },
    {
      title: 'Аллергология',
      text: 'Поллинозы, аллергический дерматит, крапивница и другие аллергические состояния.',
    },
    {
      title: 'Эндокринология',
      text: 'Сахарный диабет и его осложнения, заболевания щитовидной железы, аутоиммунный тиреоидит, тиреотоксикоз.',
    },
    {
      title: 'Хирургия',
      text: 'Гнойно-септические состояния, сепсис, желтуха, острый панкреатит, перитонит, ДВС-синдром и ожоговая болезнь.',
    },
    {
      title: 'Акушерство и гинекология',
      text: 'Хронические воспалительные заболевания, подготовка к ЭКО, резус-конфликты при беременности, генитальный герпес, цитомегаловирус.',
    },
    {
      title: 'Ревматология',
      text: 'Ревматоидный артрит, системная красная волчанка, склеродермия и узелковый периартериит.',
    },
    {
      title: 'Пульмонология',
      text: 'Тяжелые формы бронхиальной астмы и фиброзирующий альвеолит.',
    },
    {
      title: 'Гастроэнтерология',
      text: 'Хронические гепатиты, циррозы печени, хронический панкреатит, неспецифический язвенный колит.',
    },
    {
      title: 'Неврология',
      text: 'Синдром Гийена-Барре, миастения, демиелинизирующие заболевания и рассеянный склероз.',
    },
    {
      title: 'Нефрология',
      text: 'Острый гломерулонефрит, уремический зуд, состояния после пересадки органов.',
    },
  ];

  const sessionSteps = [
    'На первом сеансе из крови удаляется часть токсинов.',
    'На втором сеансе удаляются токсины, которые переходят в кровь из межклеточной жидкости.',
    'Во время третьего сеанса очищение затрагивает более глубокий уровень обменных процессов.',
  ];

  return (
    <div className="min-h-screen bg-[#F8FCFF] text-[#1A2B3C]">
      <header className="border-b border-[#DDEDFC] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5AACE6] text-2xl font-black text-white">+</div>
            <div>
              <p className="text-xl font-black uppercase leading-none tracking-tighter">{CLINIC_INFO.name}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">Медцентр Бишкек</p>
            </div>
          </Link>
          <Link to="/" className="rounded-2xl border border-[#DDEDFC] bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#1A2B3C] hover:border-[#5AACE6]">
            На главную
          </Link>
        </div>
      </header>

      <main>
        <section className="overflow-hidden bg-[linear-gradient(135deg,#10243a_0%,#1A2B3C_58%,#dff2ee_58%,#ffffff_100%)]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:py-24 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#B3D9F5]">
                <Activity className="h-4 w-4" />
                Плазмаферез
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-7xl">
                Что такое плазмаферез?
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-relaxed text-slate-200">
                Плазмаферез это современный метод аппаратной очистки крови. Врач-эфферентолог помогает организму избавиться от вредных веществ и снизить токсическую нагрузку.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {benefits.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#263b51] px-4 py-3 text-sm font-bold text-white shadow-sm ring-1 ring-white/10">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#5AACE6]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[2.5rem] border border-white/70 bg-white p-7 shadow-[0_30px_80px_rgba(26,43,60,0.18)]">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#5AACE6]">Аппарат</p>
                <h2 className="mt-3 text-4xl font-black uppercase tracking-tighter">Hemofenix</h2>
                <p className="mt-4 text-base font-bold leading-relaxed text-slate-500">
                В клинике используется аппарат Hemofenix для мембранного плазмафереза. Это единственный такой аппарат в городе и один из лучших вариантов оборудования для проведения процедуры.
                </p>
                <div className="mt-6 rounded-3xl bg-[#F0F8FF] p-5">
                  <p className="text-sm font-black uppercase tracking-widest text-slate-400">Мембранный плазмаферез</p>
                  <p className="mt-2 text-4xl font-black">20000 сом</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#5AACE6]">90-120 мин</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hidden">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#5AACE6]">Подробно</p>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-tighter">Показания и курс процедур</h2>
              <p className="mt-5 text-lg font-medium leading-relaxed text-slate-500">
                Ниже собраны расширенные направления из материалов клиники. Они не заменяют консультацию: точное решение принимает врач после осмотра.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {detailedIndications.map((item) => (
                <details key={item.title} className="group rounded-[1.7rem] border border-[#E3EEF9] bg-white p-5 shadow-[0_16px_35px_rgba(20,45,75,0.04)]">
                  <summary className="cursor-pointer list-none text-lg font-black text-[#1A2B3C]">
                    <span className="inline-flex w-full items-center justify-between gap-4">
                      {item.title}
                      <span className="rounded-full bg-[#F0F8FF] px-3 py-1 text-xs text-[#5AACE6] group-open:rotate-180">⌄</span>
                    </span>
                  </summary>
                  <p className="mt-4 font-medium leading-relaxed text-slate-500">{item.text}</p>
                </details>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-[#DDEDFC] bg-white p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5AACE6]">Курс</p>
                <h3 className="mt-3 text-2xl font-black">Обычно требуется 3-5 сеансов</h3>
                <div className="mt-5 space-y-3">
                  {sessionSteps.map((step, index) => (
                    <div key={step} className="flex gap-4 rounded-2xl bg-[#F8FCFF] p-4">
                      <span className="font-black text-[#5AACE6]">0{index + 1}</span>
                      <p className="font-bold leading-relaxed text-slate-600">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#DDEDFC] bg-[#1A2B3C] p-7 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B3D9F5]">Перед процедурой</p>
                <h3 className="mt-3 text-2xl font-black">Бесплатная консультация</h3>
                <p className="mt-4 font-medium leading-relaxed text-slate-200">
                  Перед плазмаферезом проводится консультация, где пациент может задать вопросы, обсудить показания, противопоказания и подходящий вариант процедуры.
                </p>
                <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm font-bold text-white">
                  Также в клинике проводятся ВЛОК и УФО крови.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Как работает процедура</h2>
              <p className="mt-5 text-lg font-medium leading-relaxed text-slate-500">
                Лечебное и профилактическое действие плазмафереза связано с тремя основными механизмами: поддержкой иммунной системы, выведением токсинов и улучшением текучести крови.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 gap-4">
              {mechanisms.map((item, index) => (
                <div key={item.title} className="rounded-[2rem] border border-[#E3EEF9] bg-white p-6 shadow-[0_18px_45px_rgba(20,45,75,0.04)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5AACE6]">0{index + 1}</p>
                  <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
                  <p className="mt-3 font-medium leading-relaxed text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-[2.5rem] border border-[#DDEDFC] bg-[#F8FCFF] p-6 md:p-8">
              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1.1fr)] lg:items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#5AACE6]">Связь с лечением</p>
                  <h2 className="mt-3 text-4xl font-black uppercase tracking-tighter">Показания к плазмаферезу</h2>
                  <p className="mt-5 text-lg font-medium leading-relaxed text-slate-500">
                    Плазмаферез рассматривают как дополнительный метод лечения в разных направлениях медицины. Ниже показаны области, где врач может назначить процедуру после консультации.
                  </p>
                </div>
                <div className="hidden h-24 w-24 items-center justify-center rounded-full bg-white text-[#5AACE6] shadow-sm lg:flex">
                  <ArrowRight className="h-8 w-8" />
                </div>
                <div className="rounded-[2rem] bg-white p-5 shadow-[0_16px_35px_rgba(20,45,75,0.04)]">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Врач оценивает</p>
                  <p className="mt-2 text-2xl font-black leading-tight">жалобы, диагноз, анализы и противопоказания</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {detailedIndications.map((item, index) => (
                  <details key={item.title} className="group rounded-[1.7rem] border border-[#E3EEF9] bg-white p-5 shadow-[0_16px_35px_rgba(20,45,75,0.04)]">
                    <summary className="cursor-pointer list-none">
                      <span className="flex items-center gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F8FF] text-xs font-black text-[#5AACE6]">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-lg font-black leading-tight text-[#1A2B3C]">{item.title}</span>
                          <span className="mt-1 block text-xs font-bold text-slate-400">Нажмите, чтобы посмотреть примеры показаний</span>
                        </span>
                        <span className="rounded-full bg-[#F0F8FF] px-3 py-1 text-xs text-[#5AACE6] group-open:rotate-180">⌄</span>
                      </span>
                    </summary>
                    <p className="mt-4 rounded-2xl bg-[#F8FCFF] p-4 font-medium leading-relaxed text-slate-500">{item.text}</p>
                  </details>
                ))}
              </div>

              <div>
                <div className="mt-8 rounded-[2rem] border border-rose-100 bg-rose-50 p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-500">Важно</p>
                  <p className="mt-3 font-bold leading-relaxed text-rose-900">
                    У процедуры есть противопоказания, включая высокий риск кровотечений, острый инфаркт миокарда, декомпенсацию сердечно-сосудистой системы и другие состояния. Решение принимает только специалист после консультации.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-[2.5rem] border border-[#DDEDFC] bg-white p-6 shadow-[0_24px_70px_rgba(20,45,75,0.08)] md:p-10">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#5AACE6]">Онлайн-запись</p>
                  <h2 className="mt-2 text-4xl font-black uppercase tracking-tighter">Записаться на плазмаферез</h2>
                </div>
                <a href={`tel:${CLINIC_INFO.phone.replace(/\D/g, '')}`} className="inline-flex items-center gap-3 rounded-2xl bg-[#1A2B3C] px-6 py-4 text-sm font-black uppercase tracking-widest text-white">
                  <Phone className="h-4 w-4 text-[#5AACE6]" />
                  {CLINIC_INFO.phone}
                </a>
              </div>
              <BookingFlow initialDoctor={plasmaDoctor} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/plasmapheresis" element={<PlasmapheresisPage />} />
        <Route path="/redesign" element={<AppRedesign />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
