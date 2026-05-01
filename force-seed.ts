
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./src/firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  console.log("Seeding doctors...");
  const doctors = [
    { id: 'kabylov-zhyldyzbek-saparovich', name: 'Кабылов Жылдызбек Сапарович', specialty: 'УЗИ-диагност (Общий профиль)', department: 'УЗИ-диагностика', photoUrl: 'https://odoctor.kg/storage/doctors/kabylov-zhyldyzbek-saparovich/kabylov-zhyldyzbek-saparovich-1.jpg', rating: 4.9, schedule: 'Пн-Пт: 09:00 - 17:00' },
    { id: 'sultangazy-kyzy-nazgul', name: 'Султангазы кызы Назгул', specialty: 'Педиатр', department: 'Педиатрия', photoUrl: 'https://odoctor.kg/storage/doctors/sultangazy-kyzy-nazgul/sultangazy-kyzy-nazgul.jpg', rating: 4.8, schedule: 'Пн-Пт: 08:00 - 14:00' },
    { id: 'kabulova-gulbara-saparalievna', name: 'Кабулова Гулбара Сапаралиевна', specialty: 'Врач УЗИ', department: 'УЗИ-диагностика', photoUrl: 'https://odoctor.kg/storage/doctors/kabulova-gulbara-saparalievna/kabulova-gulbara-saparalievna.jpg', rating: 4.9, schedule: 'Вт, Чт, Сб: 09:00 - 16:00' },
    { id: 'isaeva-zhanyl-kydyrbaevna', name: 'Исаева Жаныл Кыдырбаевна', specialty: 'Педиатр', department: 'Педиатрия', photoUrl: 'https://odoctor.kg/storage/doctors/isaeva-zhanyl-kydyrbaevna/isaeva-zhanyl-kydyrbaevna.jpg', rating: 4.7, schedule: 'Пн-Сб: 10:00 - 18:00' },
    { id: 'kim-tamara-veniaminovna', name: 'Ким Тамара Вениаминовна', specialty: 'Кардиолог', department: 'Кардиология', photoUrl: 'https://odoctor.kg/storage/doctors/kim-tamara-veniaminovna/kim-tamara-veniaminovna.jpg', rating: 5.0, schedule: 'Вт, Чт: 12:00 - 20:00' }
  ];

  for (const d of doctors) {
    const { id, ...data } = d;
    await setDoc(doc(db, 'doctors', id), data);
    console.log(` - Doctor ${id} seeded.`);
  }

  console.log("Seeding admin...");
  await setDoc(doc(db, 'admins', 'bootstrap_admin'), {
      email: 'ergashev.1508@gmail.com',
      username: 'Main Admin'
  });

  console.log("Done.");
}

seed().catch(console.error);
