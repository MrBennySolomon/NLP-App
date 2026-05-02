import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import "./App.css";

// 🔥 Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// 👉 תכניס כאן את הפרטים שלך מ-Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export default function App() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  // 🔄 טעינה מ-Firebase
  const loadPatients = async () => {
    const querySnapshot = await getDocs(collection(db, "patients"));
    const list = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPatients(list);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleAddOrUpdatePatient = async () => {
    if (!name) return;

    let fileURL = null;

    if (file) {
      const fileRef = ref(storage, `patients/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      fileURL = await getDownloadURL(fileRef);
    }

    if (editingId) {
      const patientRef = doc(db, "patients", editingId);
      await updateDoc(patientRef, {
        name,
        notes,
        ...(fileURL && { file: fileURL }),
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, "patients"), {
        name,
        notes,
        file: fileURL,
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setName("");
    setNotes("");
    setFile(null);

    loadPatients();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "patients", id));
    loadPatients();
  };

  const handleEdit = (patient) => {
    setName(patient.name);
    setNotes(patient.notes);
    setEditingId(patient.id);
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container">
      {showConfetti && <Confetti />}

      <div className="main-wrapper">
        <h1 className="title">מערכת ניהול מטופלים (Firebase)</h1>

        <div className="card">
          <h2>{editingId ? "עריכת מטופל" : "הוספת מטופל"}</h2>

          <div className="input-group">
            <input
              type="text"
              placeholder="שם מטופל"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <textarea
              placeholder="הערות"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <button onClick={handleAddOrUpdatePatient} className="primary-btn">
            {editingId ? "עדכן מטופל" : "שמור מטופל"}
          </button>
        </div>

        <div className="card">
          <input
            type="text"
            placeholder="חיפוש מטופל..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid">
          {filteredPatients.map((patient) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3>{patient.name}</h3>
              <p>{patient.notes}</p>

              {patient.file && (
                <a href={patient.file} target="_blank" rel="noreferrer">
                  צפייה בקובץ
                </a>
              )}

              <div className="actions">
                <button className="edit-btn" onClick={() => handleEdit(patient)}>
                  ערוך
                </button>
                <button className="delete-btn" onClick={() => handleDelete(patient.id)}>
                  מחק
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
