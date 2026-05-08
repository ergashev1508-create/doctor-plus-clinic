import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, OrbitControls, RoundedBox } from '@react-three/drei';
import {
  ArrowRight,
  Calendar,
  Clock3,
  HeartHandshake,
  MapPin,
  Microscope,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Waves,
} from 'lucide-react';
import * as THREE from 'three';

const featureCards = [
  {
    title: 'Точная диагностика',
    text: 'УЗИ, консультации и базовые направления показаны как единый спокойный маршрут, а не как перегруженный каталог.',
    icon: Microscope,
    tone: 'bg-[#eff7f2] text-[#2f7d4d]',
  },
  {
    title: 'Выбор врача по доверию',
    text: 'Пациент может прийти не только по услуге, но и к конкретному специалисту, если уже знает, кому хочет довериться.',
    icon: HeartHandshake,
    tone: 'bg-[#eef3fb] text-[#316da8]',
  },
  {
    title: 'Меньше визуального шума',
    text: 'Сильная типографика, большие отступы и мягкие акценты делают сайт более уверенным и премиальным.',
    icon: ShieldCheck,
    tone: 'bg-[#fff5e9] text-[#b46a15]',
  },
];

const doctorHighlights = [
  {
    name: 'Кабулова Гулбара Сапаралиевна',
    role: 'УЗИ и кардиология',
    note: 'Профиль врача можно подать как отдельную историю доверия с опытом, направлениями и личным стилем приёма.',
  },
  {
    name: 'Султангазы кызы Назгуль',
    role: 'Педиатрия',
    note: 'Для семейного врача акцент можно сместить в сторону заботы, спокойствия родителей и понятного маршрута для ребёнка.',
  },
  {
    name: 'Кабылов Жылдызбек Сапарович',
    role: 'Плазмаферез',
    note: 'Редкое направление получает собственный сильный блок, а не прячется в общем списке процедур.',
  },
];

const serviceBands = [
  { label: 'Педиатрия', icon: HeartHandshake },
  { label: 'УЗИ', icon: Microscope },
  { label: 'Терапия', icon: Stethoscope },
  { label: 'Плазмаферез', icon: Waves },
];

const quickFacts = [
  { label: 'Формат', value: 'Сайт, который продаёт доверие, а не шум' },
  { label: 'Навигация', value: 'Услуга или врач как два равноправных входа' },
  { label: 'Атмосфера', value: 'Мягкая глубина вместо тяжёлых 3D-сцен' },
];

function MedicalHeroModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.22;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.45) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.35} floatIntensity={1.1}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.14, 64, 64]} />
          <meshPhysicalMaterial
            color="#67b9f0"
            roughness={0.1}
            metalness={0.1}
            transmission={0.18}
            thickness={1.4}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>

        <RoundedBox args={[0.52, 2.12, 0.36]} radius={0.11} smoothness={4} position={[0, 0, 1.02]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.18} metalness={0.08} />
        </RoundedBox>
        <RoundedBox args={[2.12, 0.52, 0.36]} radius={0.11} smoothness={4} position={[0, 0, 1.02]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.18} metalness={0.08} />
        </RoundedBox>

        <mesh position={[0, -1.7, -0.4]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[1.55, 0.08, 24, 120]} />
          <meshStandardMaterial color="#d6ecfb" roughness={0.35} metalness={0.15} />
        </mesh>

        <mesh position={[1.55, 0.6, -0.05]} castShadow>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.22} metalness={0.1} />
        </mesh>
        <mesh position={[-1.45, -0.75, 0.15]} castShadow>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color="#cbe8fb" roughness={0.28} metalness={0.08} />
        </mesh>
      </Float>
    </group>
  );
}

export default function AppRedesign() {
  return (
    <div className="min-h-screen bg-[#f4efe7] text-[#1f2e28]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8f1e8_0%,#f0f8ff_48%,#e7f3eb_100%)]" />
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#d7ebdf] blur-3xl" />
          <div className="absolute top-12 right-0 h-80 w-80 rounded-full bg-[#dbe9fb] blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#f4e1ca] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-10 lg:px-12 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4da3df] text-white shadow-lg shadow-[#4da3df]/25">
                <span className="text-3xl font-black">+</span>
              </div>
              <div>
                <p className="text-2xl font-black uppercase tracking-tight text-[#17314c]">Доктор Плюс</p>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#6f87a2]">Redesign Sandbox</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-5 py-3 text-sm font-bold text-[#17314c] shadow-sm backdrop-blur transition-all hover:bg-white"
              >
                Вернуться к текущему сайту
                <ArrowRight className="h-4 w-4 text-[#4da3df]" />
              </a>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#17314c] px-4 py-3 text-sm font-black text-white">
                <Sparkles className="h-4 w-4 text-[#8ed1ff]" />
                /redesign
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-10 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#3c7faf] shadow-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Современный медицинский образ
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-tight text-[#17314c] md:text-7xl">
                Спокойный,
                <br />
                человечный
                <br />
                медицинский сайт.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#536779] md:text-xl">
                Это направление делает ставку на доверие, ясную структуру и мягкий технологичный акцент. Сайт
                ощущается современным, но не холодным.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#concept-flow"
                  className="inline-flex items-center gap-3 rounded-[1.6rem] bg-[#17314c] px-7 py-4 text-lg font-black text-white shadow-xl shadow-[#17314c]/15 transition-all hover:bg-[#234564]"
                >
                  Посмотреть маршрут записи
                  <ArrowRight className="h-5 w-5 text-[#6bc0ff]" />
                </a>
                <a
                  href="#staff-concept"
                  className="inline-flex items-center gap-3 rounded-[1.6rem] border border-white/80 bg-white/80 px-6 py-4 font-bold text-[#536779] backdrop-blur"
                >
                  <Calendar className="h-5 w-5 text-[#4da3df]" />
                  Открыть концепт блока врачей
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {quickFacts.map((fact) => (
                  <div key={fact.label} className="rounded-[1.8rem] border border-white/70 bg-white/65 p-5 shadow-sm backdrop-blur">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d91a2]">{fact.label}</p>
                    <p className="mt-3 text-sm font-bold leading-relaxed text-[#17314c]">{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[560px] md:h-[620px]">
              <div className="absolute inset-0 rounded-[3rem] border border-white/80 bg-[radial-gradient(circle_at_top,#ffffff_0%,#edf7ff_52%,#ddeee5_100%)] shadow-2xl shadow-[#17314c]/10" />
              <div className="absolute inset-x-10 top-10 h-24 rounded-[2rem] bg-white/70 blur-2xl" />

              <div className="absolute left-6 top-24 w-[190px] -rotate-6 rounded-[2rem] border border-white/80 bg-[#17314c] p-5 text-white shadow-2xl md:left-10 md:w-[230px]">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8ed1ff]">3D Accent</p>
                <p className="mt-3 text-xl font-black">Мягкая глубина без тяжёлого WebGL</p>
              </div>

              <div className="absolute right-6 top-8 w-[190px] rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-xl backdrop-blur md:right-10 md:w-[230px]">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d91a2]">Маршрут пациента</p>
                <p className="mt-3 text-2xl font-black text-[#17314c]">2 шага до записи</p>
                <p className="mt-2 text-sm leading-relaxed text-[#627384]">
                  Сначала направление, потом врач. Либо сразу врач, если пациент уже знает специалиста.
                </p>
              </div>

              <div className="absolute inset-x-[8%] top-[21%] bottom-[20%] overflow-hidden rounded-[2.8rem]">
                <Canvas camera={{ position: [0, 0.2, 5.2], fov: 32 }} shadows dpr={[1, 2]}>
                  <fog attach="fog" args={['#edf7ff', 7, 11]} />
                  <ambientLight intensity={1.7} />
                  <directionalLight
                    position={[4, 5, 4]}
                    intensity={2.4}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                  />
                  <pointLight position={[-3, -2, 4]} intensity={1.8} color="#8ed1ff" />
                  <MedicalHeroModel />
                  <Environment preset="city" />
                  <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    minPolarAngle={Math.PI / 2.8}
                    maxPolarAngle={Math.PI / 2.1}
                    autoRotate
                    autoRotateSpeed={0.9}
                  />
                </Canvas>
              </div>
              <div className="absolute left-1/2 top-[76%] h-10 w-[320px] -translate-x-1/2 rounded-full bg-[#8db4cf]/30 blur-2xl" />

              <div className="absolute bottom-8 left-6 right-6 grid gap-4 md:left-10 md:right-10 md:grid-cols-3">
                <div className="rounded-[1.8rem] border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur">
                  <p className="text-sm font-black text-[#3f95d5]">Тон</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#627384]">
                    Более зрелый и уверенный, без ощущения агрессивной рекламы.
                  </p>
                </div>
                <div className="rounded-[1.8rem] border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur">
                  <p className="text-sm font-black text-[#3a7f56]">Структура</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#627384]">
                    Врачи и услуги работают как два равноправных входа в понятный сценарий.
                  </p>
                </div>
                <div className="rounded-[1.8rem] border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur">
                  <p className="text-sm font-black text-[#b46a15]">Эффект</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#627384]">
                    Визуальный акцент собирает внимание, но не мешает чтению и доверию.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e3ded4] bg-[#f8f3ec]">
        <div className="mx-auto max-w-7xl px-6 py-5 md:px-10 lg:px-12">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {serviceBands.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-[1.6rem] border border-[#ece4d8] bg-white px-4 py-4 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f4fd] text-[#4da3df]">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-black text-[#17314c]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="concept-flow" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d91a2]">Что меняем</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#17314c] md:text-5xl">Новые опорные блоки</h2>
          </div>
          <p className="max-w-xl leading-relaxed text-[#627384]">
            Эти секции нужны как каркас. Мы можем менять тексты, детали и фотографии, не ломая общую логику
            дизайна.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <div key={card.title} className="rounded-[2.2rem] border border-white/80 bg-white p-8 shadow-sm">
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${card.tone}`}>
                <card.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-2xl font-black text-[#17314c]">{card.title}</h3>
              <p className="mt-3 leading-relaxed text-[#627384]">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="staff-concept" className="bg-[#17314c] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
          <div className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8eb9d8]">Meet Our Staff</p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Переосмысленные профили врачей</h2>
              <p className="mt-5 leading-relaxed text-[#c7d9e8]">
                В этой версии врач перестаёт быть просто строкой в каталоге. У каждого профиля может быть свой
                характер, сильная сторона, опыт и отдельный вход в запись.
              </p>
            </div>

            <div className="space-y-4">
              {doctorHighlights.map((doctor) => (
                <div key={doctor.name} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-2xl font-black">{doctor.name}</h3>
                      <p className="mt-1 font-bold text-[#8ed1ff]">{doctor.role}</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#17314c] transition-all hover:bg-[#f1f7fb]"
                    >
                      Открыть профиль
                      <ArrowRight className="h-4 w-4 text-[#4da3df]" />
                    </button>
                  </div>
                  <p className="mt-4 leading-relaxed text-[#c7d9e8]">{doctor.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <div className="rounded-[2.5rem] border border-[#e5ddd1] bg-white p-8 shadow-sm md:p-10">
          <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d91a2]">Контакты в концепте</p>
              <h2 className="mt-3 text-4xl font-black text-[#17314c]">Локально и понятно</h2>
              <p className="mt-4 leading-relaxed text-[#627384]">
                Вместо тяжёлой карты можно сделать более полезный блок: адрес, часы работы, 2GIS и быстрый звонок
                как основные действия для пользователя в Кыргызстане.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.8rem] bg-[#f8f3ec] p-5">
                <MapPin className="h-5 w-5 text-[#4da3df]" />
                <p className="mt-4 text-sm font-black text-[#17314c]">Адрес</p>
                <p className="mt-2 text-sm text-[#627384]">ул. Махатмы Ганди, 201, Бишкек</p>
              </div>
              <div className="rounded-[1.8rem] bg-[#f3f8f2] p-5">
                <Clock3 className="h-5 w-5 text-[#3a8a58]" />
                <p className="mt-4 text-sm font-black text-[#17314c]">Режим работы</p>
                <p className="mt-2 text-sm text-[#627384]">Пн-Сб 08:00-18:00, воскресенье выходной</p>
              </div>
              <div className="rounded-[1.8rem] bg-[#eef3fb] p-5">
                <Phone className="h-5 w-5 text-[#316da8]" />
                <p className="mt-4 text-sm font-black text-[#17314c]">Регистратура</p>
                <p className="mt-2 text-sm text-[#627384]">+996 (702) 018-112</p>
              </div>
              <div className="rounded-[1.8rem] bg-[#fff5e9] p-5">
                <Calendar className="h-5 w-5 text-[#b46a15]" />
                <p className="mt-4 text-sm font-black text-[#17314c]">Потенциал</p>
                <p className="mt-2 text-sm text-[#627384]">Запись в 2 шага и отдельные страницы под ключевые направления.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
