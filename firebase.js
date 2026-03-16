// firebase.js
// Конфигурация и функции работы с Firestore

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Конфигурация вашего Firebase-проекта
const firebaseConfig = {
  apiKey: "AIzaSyAVbl9GUiWwkZ7Uxt3T-ZiuS7IgIPQ4kto",
  authDomain: "skirentalapp-d62f0.firebaseapp.com",
  projectId: "skirentalapp-d62f0",
  storageBucket: "skirentalapp-d62f0.firebasestorage.app",
  messagingSenderId: "450034600694",
  appId: "1:450034600694:web:ee9f6c41d65918ac4ffad7"
};

// Инициализация приложения
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BOOKING_COLLECTION = "booking";

// Получить все заявки
export async function fetchAllBookings() {
  const snapshot = await getDocs(collection(db, BOOKING_COLLECTION));
  const result = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const rawId = data.id;
    const effectiveId =
      typeof rawId === "string" && rawId.trim() !== "" ? rawId : docSnap.id;

    result.push({ ...data, id: effectiveId });
  });
  return result;
}

// Получить одну заявку по ID
export async function fetchBookingById(id) {
  const ref = doc(db, BOOKING_COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data();
  const rawId = data.id;
  const effectiveId =
    typeof rawId === "string" && rawId.trim() !== "" ? rawId : snapshot.id;

  return { ...data, id: effectiveId };
}

// Обновить статус заявки
export async function updateBookingStatus(id, newStatus) {
  const ref = doc(db, BOOKING_COLLECTION, id);
  await updateDoc(ref, { status: newStatus });
}

