import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import "./App.css"; // updated for flex-centered layout

export default function App() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("patients");
    if (saved) setPatients(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  const handleAddOrUpdatePatient = () => {
    if (!name) return;

    if (editingId) {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name,
                notes,
                file: file ? URL.createObjectURL(file) : p.file
              }
            : p
        )
      );
      setEditingId(null);
    } else {
      const newPatient = {
        id: Date.now(),
        name,
        notes,
        file: file ? URL.createObjectURL(file) : null
      };
      setPatients([...patients, newPatient]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setName("");
    setNotes("");
    setFile(null);
  };

  const handleDelete = (id) => {
    setPatients(patients.filter((p) => p.id !== id));
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
        <h1 className="title">מערכת ניהול מטופלים NLP</h1>

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

          <div className="input-group">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <button onClick={handleAddOrUpdatePatient} className="primary-btn">
            {editingId ? "עדכן מטופל" : "שמור מטופל"}
          </button>
        </div>

        <div className="card">
          <div className="input-group">
            <input
              type="text"
              placeholder="חיפוש מטופל..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(patient)}
                >
                  ערוך
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(patient.id)}
                >
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
