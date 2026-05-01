
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const collections = ['doctors', 'reviews', 'bookings', 'patients', 'admins'];
  for (const coll of collections) {
    const snap = await getDocs(collection(db, coll));
    console.log(`Collection [${coll}]: ${snap.size} documents`);
    if (coll === 'bookings' && snap.size > 0) {
        snap.docs.forEach(d => console.log(` - Booking ID: ${d.id}, Date: ${d.data().appointmentDate}, Status: ${d.data().status}`));
    }
  }
}

check().catch(console.error);
