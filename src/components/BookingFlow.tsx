import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { PRICES } from '../constants';
import { Calendar, Clock, ArrowRight, ArrowLeft, CheckCircle, ChevronRight, Sparkles, Star } from 'lucide-react';

interface BookingFlowProps {
  initialDoctor?: any;
}

const BOOKING_STEPS = [1, 2, 3, 4, 5, 6];

const parsePriceValue = (price: string) => {
  const digits = price.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
};

export const BookingFlow: React.FC<BookingFlowProps> = ({ initialDoctor }) => {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selection, setSelection] = useState({
    department: initialDoctor?.department || '',
    serviceId: '',
    doctorId: initialDoctor?.id || '',
    date: '',
    time: '',
    patientName: '',
    patientLastName: '',
    patientPhone: '',
    patientNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Record<string, boolean>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const doctorLocked = Boolean(initialDoctor?.id);

  useEffect(() => {
    let mounted = true;

    api.getDoctors()
      .then((docs) => {
        if (!mounted) return;
        setDoctors(docs);
      })
      .catch((err) => {
        console.error('BookingFlow docs error:', err);
      });

    return () => {
      mounted = false;
    };
  }, [initialDoctor]);

  useEffect(() => {
    if (!initialDoctor?.id) return;

    setSelection({
      department: '',
      serviceId: '',
      doctorId: initialDoctor.id,
      date: '',
      time: '',
      patientName: '',
      patientLastName: '',
      patientPhone: '',
      patientNotes: '',
    });
    setAvailableSlots({});
    setStep(2);
  }, [initialDoctor]);

  const bookableServices = useMemo(() => PRICES.filter((item) => item.bookable !== false), []);
  const departments = useMemo(
    () => Array.from(new Set(bookableServices.map((item) => item.department))).sort(),
    [bookableServices]
  );
  const servicesForDepartment = useMemo(
    () =>
      doctorLocked
        ? bookableServices.filter((item) => item.doctorIds?.includes(initialDoctor.id))
        : bookableServices.filter((item) => item.department === selection.department),
    [bookableServices, doctorLocked, initialDoctor, selection.department]
  );
  const selectedService = bookableServices.find((item) => item.id === selection.serviceId);

  const doctorsForService = useMemo(() => {
    if (!selectedService) return [];
    if (selectedService.doctorIds?.length) {
      return doctors.filter((doctor) => selectedService.doctorIds?.includes(doctor.id));
    }
    return doctors.filter((doctor) => doctor.department === selectedService.department);
  }, [doctors, selectedService]);

  const selectedDoctor = doctors.find((doctor) => doctor.id === selection.doctorId);

  const getTimeSlots = () => {
    if (!selectedDoctor) return [];
    const scheduleByDoctorId: Record<string, { start: number; end: number }> = {
      'procedure-room': { start: 8, end: 18 },
      'logoped-room': { start: 9, end: 17 },
      'moldosheva-gulzat-sharshebaevna': { start: 10, end: 16 },
      'kabulova-gulbara-saparalievna': { start: 9, end: 16 },
      'sultangazy-kyzy-nazgul': { start: 8, end: 14 },
      'kabylov-zhyldyzbek-saparovich': { start: 9, end: 17 },
    };
    const { start, end } = scheduleByDoctorId[selectedDoctor.id] || { start: 9, end: 17 };
    const slots: string[] = [];
    for (let hour = start; hour < end; hour += 1) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const isDateAllowedForDoctor = (doctorId: string, date: string) => {
    if (!date) return true;
    if (doctorId === 'moldosheva-gulzat-sharshebaevna') {
      return new Date(`${date}T00:00:00`).getDay() === 6;
    }
    if (doctorId === 'kabulova-gulbara-saparalievna') {
      const day = new Date(`${date}T00:00:00`).getDay();
      return day >= 1 && day <= 5;
    }
    return true;
  };

  const selectedDateAllowed = !selection.doctorId || isDateAllowedForDoctor(selection.doctorId, selection.date);

  useEffect(() => {
    let cancelled = false;

    const loadAvailability = async () => {
      if (!selection.doctorId || !selection.date || !isDateAllowedForDoctor(selection.doctorId, selection.date)) {
        setAvailableSlots({});
        return;
      }

      setLoadingSlots(true);

      try {
        const checks = await Promise.all(
          getTimeSlots().map(async (time) => {
            const result = await api.checkAvailability(selection.doctorId, selection.date, time);
            return [time, result.available] as const;
          })
        );

        if (!cancelled) {
          setAvailableSlots(Object.fromEntries(checks));
        }
      } catch (err) {
        console.error('Availability check failed:', err);
        if (!cancelled) {
          setAvailableSlots({});
        }
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    };

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [selection.doctorId, selection.date, selectedDoctor]);

  const handleSubmit = async () => {
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      const result = await api.createAppointment({
        ...selection,
        serviceName: selectedService.name,
        servicePrice: parsePriceValue(selectedService.price),
        servicePriceLabel: selectedService.price,
      });

      if (result.status === 'success') {
        setStep(7);
      } else {
        alert('Не удалось создать запись. Проверьте введённые данные.');
      }
    } catch (err: any) {
      alert(err?.message || 'Не удалось отправить заявку. Попробуйте выбрать другое время.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((current) => current + 1);
  const prevStep = () => setStep((current) => current - 1);

  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.8rem] border border-blue-50 bg-white p-8 shadow-2xl md:p-12">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[#eff7ff] via-white to-[#eefcf7]" />

      <div className="relative mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf6ff] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#5AACE6]">
            <Sparkles className="h-4 w-4" />
            Онлайн-запись по услугам
          </div>
          <h3 className="mt-4 text-3xl font-black text-[#1A2B3C] md:text-4xl">Выберите услугу и удобное время</h3>
          <p className="mt-2 max-w-2xl font-medium text-slate-400">
            Сначала выбираете направление и точную услугу, затем врача и свободный слот.
          </p>
        </div>

        <div className="flex gap-2">
          {BOOKING_STEPS.map((index) => (
            <div
              key={index}
              className={cn(
                'h-3 w-3 rounded-full transition-all duration-500',
                step === index ? 'w-8 bg-[#5AACE6]' : step > index ? 'bg-green-400' : 'bg-slate-100'
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <p className="font-medium text-slate-500">Выберите направление, которое вас интересует.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {departments.map((department) => {
                const count = bookableServices.filter((item) => item.department === department).length;
                return (
                  <button
                    key={department}
                    onClick={() => {
                      setSelection((current) => ({
                        ...current,
                        department,
                        serviceId: '',
                        doctorId: initialDoctor?.department === department ? initialDoctor.id : '',
                      }));
                      nextStep();
                    }}
                    className="group rounded-[1.8rem] border-2 border-slate-50 p-6 text-left transition-all hover:border-[#B3D9F5] hover:bg-[#F8FCFF]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-[#1A2B3C]">{department}</p>
                        <p className="mt-2 text-sm text-slate-400">{count} услуг доступно для онлайн-записи</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-200 transition-colors group-hover:text-[#5AACE6]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-4 flex items-center gap-4">
              <div>
                {!doctorLocked && (
                  <button onClick={prevStep} className="mb-3 rounded-full p-2 transition-colors hover:bg-slate-50">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <p className="font-medium text-slate-500">
                  {doctorLocked
                    ? `Выберите услугу для врача: ${initialDoctor?.name}`
                    : `Выберите услугу в направлении: ${selection.department}`}
                </p>
                <p className="text-xs text-slate-400">
                  {doctorLocked
                    ? 'Вы увидите только те услуги, которые можно записать именно к этому специалисту.'
                    : 'Цена сразу видна, чтобы пациент понимал, что именно бронирует.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {servicesForDepartment.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    const matchedDoctors = service.doctorIds?.length
                      ? doctors.filter((doctor) => service.doctorIds?.includes(doctor.id))
                      : doctors.filter((doctor) => doctor.department === service.department);
                    const nextDoctorId =
                      doctorLocked && matchedDoctors.some((doctor) => doctor.id === initialDoctor.id)
                        ? initialDoctor.id
                        : matchedDoctors.length === 1
                          ? matchedDoctors[0].id
                          : '';

                    setSelection((current) => ({
                      ...current,
                      serviceId: service.id,
                      doctorId: nextDoctorId,
                      department: service.department,
                    }));

                    setStep(doctorLocked || nextDoctorId ? 4 : 3);
                  }}
                  className="group rounded-[2rem] border-2 border-slate-50 bg-white p-5 text-left transition-all hover:border-[#B3D9F5] hover:bg-[#F8FCFF]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xl font-black text-[#1A2B3C]">{service.name}</p>
                        {service.badge && (
                          <span className="rounded-full bg-[#eaf6ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#5AACE6]">
                            {service.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{service.description}</p>
                    </div>
                    <div className="flex items-center gap-4 lg:shrink-0">
                      <div className="text-left lg:text-right">
                        <p className="text-2xl font-black text-[#1A2B3C]">{service.price}</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{service.duration}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-200 transition-colors group-hover:text-[#5AACE6]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-4 flex items-center gap-4">
              <button onClick={prevStep} className="rounded-full p-2 transition-colors hover:bg-slate-50">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="font-medium text-slate-500">Выберите врача для услуги: {selectedService?.name}</p>
                <p className="text-xs text-slate-400">Показываем только тех специалистов, которые подходят для выбранной услуги.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {doctorsForService.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => {
                    setSelection((current) => ({ ...current, doctorId: doctor.id }));
                    nextStep();
                  }}
                  className="group flex items-center gap-6 rounded-[2rem] border-2 border-slate-50 p-4 transition-all hover:border-[#B3D9F5] hover:bg-[#F8FCFF]"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-lg">
                    <img
                      src={doctor.photoUrl}
                      alt={doctor.name}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                        event.currentTarget.parentElement?.classList.add('doctor-photo-fallback');
                      }}
                    />
                    <div className="hidden h-full w-full items-center justify-center bg-[#E8F4FD] text-2xl font-black text-[#5AACE6]">
                      {doctor.name.slice(0, 1)}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2 text-xl font-bold">
                      {doctor.name}
                      <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-0.5 text-sm text-yellow-600">
                        <Star className="h-3 w-3 fill-current" />
                        {doctor.rating}
                      </div>
                    </div>
                    <div className="text-sm font-bold uppercase text-[#5AACE6]">{doctor.specialty}</div>
                    <div className="mt-1 text-xs text-slate-400">{doctor.schedule}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-200 transition-colors group-hover:text-[#5AACE6]" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="rounded-full p-2 transition-colors hover:bg-slate-50">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xl font-bold">{selectedDoctor?.name}</p>
                <p className="text-xs text-slate-400">
                  {selectedService?.name} · {selectedService?.price} · выберите дату и свободный слот
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-50 bg-[#F8FCFF] p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Выбранная услуга</p>
                  <p className="mt-2 text-xl font-black text-[#1A2B3C]">{selectedService?.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedService?.description}</p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-2xl font-black text-[#1A2B3C]">{selectedService?.price}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{selectedService?.duration}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-bold">
                  <Calendar className="h-5 w-5 text-[#5AACE6]" />
                  Дата приёма
                </h4>
                <input
                  type="date"
                  min={minDate}
                  max={maxDate}
                  className="w-full rounded-2xl border-2 border-slate-50 p-4 text-lg font-bold outline-none transition-all focus:border-[#5AACE6]"
                  value={selection.date}
                  onChange={(event) =>
                    setSelection((current) => ({
                      ...current,
                      date: event.target.value,
                      time: '',
                    }))
                  }
                />
                <p className="text-xs italic text-slate-400">График работы врача: {selectedDoctor?.schedule}</p>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-bold">
                  <Clock className="h-5 w-5 text-[#5AACE6]" />
                  Свободное время
                </h4>
                {!selection.date ? (
                  <div className="flex h-48 items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 font-medium text-slate-300">
                    Сначала выберите дату
                  </div>
                ) : !selectedDateAllowed ? (
                  <div className="flex h-48 items-center justify-center rounded-3xl border-2 border-dashed border-amber-100 bg-amber-50/50 px-6 text-center font-medium text-amber-700">
                    {selectedDoctor?.id === 'moldosheva-gulzat-sharshebaevna'
                      ? 'Этот специалист принимает только по субботам с 10:00 до 16:00. Выберите субботнюю дату.'
                      : 'Этот специалист принимает с понедельника по пятницу. Выберите будний день.'}
                  </div>
                ) : loadingSlots ? (
                  <div className="flex h-48 items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 font-medium text-slate-300">
                    Проверяем доступные слоты...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {getTimeSlots().map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelection((current) => ({ ...current, time }))}
                        disabled={availableSlots[time] === false}
                        className={cn(
                          'rounded-xl border-2 py-3 text-sm font-bold transition-all',
                          selection.time === time
                            ? 'border-[#5AACE6] bg-[#5AACE6] text-white shadow-lg shadow-blue-200'
                            : 'border-slate-50 text-slate-600 hover:border-[#B3D9F5]',
                          availableSlots[time] === false &&
                            'cursor-not-allowed bg-slate-50 text-slate-300 opacity-40 hover:border-slate-50'
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                disabled={!selection.date || !selection.time || !selectedDateAllowed}
                onClick={nextStep}
                className="flex items-center gap-2 rounded-2xl bg-[#1A2B3C] px-8 py-4 font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-[#2A3B4C] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Далее
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="rounded-full p-2 transition-colors hover:bg-slate-50">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="text-xl font-bold">Данные пациента</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-2 text-sm font-bold text-slate-400">Имя</label>
                <input
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 p-4 outline-none transition-all focus:border-[#5AACE6]"
                  placeholder="Иван"
                  value={selection.patientName}
                  onChange={(event) => setSelection((current) => ({ ...current, patientName: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="ml-2 text-sm font-bold text-slate-400">Фамилия</label>
                <input
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 p-4 outline-none transition-all focus:border-[#5AACE6]"
                  placeholder="Иванов"
                  value={selection.patientLastName}
                  onChange={(event) => setSelection((current) => ({ ...current, patientLastName: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="ml-2 text-sm font-bold text-slate-400">Номер телефона</label>
                <input
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 p-4 outline-none transition-all focus:border-[#5AACE6]"
                  placeholder="+996XXXXXXXXX"
                  value={selection.patientPhone}
                  onChange={(event) => setSelection((current) => ({ ...current, patientPhone: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="ml-2 text-sm font-bold text-slate-400">Комментарий</label>
                <textarea
                  className="h-32 w-full resize-none rounded-2xl border-2 border-slate-50 bg-slate-50/50 p-4 outline-none transition-all focus:border-[#5AACE6]"
                  placeholder="Опишите жалобы или важные детали приёма"
                  value={selection.patientNotes}
                  onChange={(event) => setSelection((current) => ({ ...current, patientNotes: event.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={!selection.patientName || !selection.patientLastName || !selection.patientPhone}
                onClick={nextStep}
                className="flex items-center gap-2 rounded-2xl bg-[#1A2B3C] px-10 py-4 font-bold text-white transition-all hover:bg-[#2A3B4C] disabled:opacity-30"
              >
                К подтверждению
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="rounded-full p-2 transition-colors hover:bg-slate-50">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="text-xl font-bold">Проверьте данные</p>
            </div>

            <div className="space-y-6 rounded-3xl border-2 border-white bg-[#F8FCFF] p-8 shadow-lg">
              <div className="flex items-center gap-6 border-b border-blue-50 pb-6">
                <div className="h-24 w-24 overflow-hidden rounded-2xl shadow-md">
                  <img
                    src={selectedDoctor?.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                      event.currentTarget.parentElement?.classList.add('doctor-photo-fallback');
                    }}
                  />
                  <div className="hidden h-full w-full items-center justify-center bg-[#E8F4FD] text-3xl font-black text-[#5AACE6]">
                    {selectedDoctor?.name.slice(0, 1)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#5AACE6]">{selectedDoctor?.specialty}</p>
                  <p className="text-2xl font-black">{selectedDoctor?.name}</p>
                </div>
              </div>

              <div className="rounded-[1.8rem] bg-white p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Услуга</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-black text-[#1A2B3C]">{selectedService?.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{selectedService?.description}</p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-2xl font-black text-[#1A2B3C]">{selectedService?.price}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{selectedService?.duration}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Пациент</p>
                  <p className="font-bold">{selection.patientName} {selection.patientLastName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Контакт</p>
                  <p className="font-bold">{selection.patientPhone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Дата</p>
                  <p className="font-black text-[#5AACE6]">{selection.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Время</p>
                  <p className="font-black text-[#5AACE6]">{selection.time}</p>
                </div>
              </div>

              {selection.patientNotes && (
                <div className="border-t border-blue-50 pt-4">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Комментарий</p>
                  <p className="text-sm italic text-slate-600">"{selection.patientNotes}"</p>
                </div>
              )}
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-[#5AACE6] py-6 text-xl font-black text-white shadow-2xl shadow-blue-100 transition-all hover:bg-[#499BD5]"
            >
              {isSubmitting ? 'Отправляем...' : 'Подтвердить запись'}
              <CheckCircle className="h-6 w-6" />
            </button>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div
            key="step7"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 py-12 text-center"
          >
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-400 animate-bounce">
              <CheckCircle className="h-16 w-16 fill-current" />
            </div>
            <h3 className="text-4xl font-black text-[#1A2B3C]">Запись оформлена</h3>
            <p className="mx-auto max-w-md text-lg text-slate-500">
              Мы получили вашу заявку на услугу «{selectedService?.name}». Администратор свяжется с вами для окончательного подтверждения времени.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-slate-100 px-12 py-4 font-bold transition-all hover:bg-slate-200"
            >
              Вернуться на главную
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
