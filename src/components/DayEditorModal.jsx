// src/components/DayEditorModal.jsx
// מודל עורך פריט: הוספה/עריכה עם תמונה + Crop (scale/x/y), כיתוב ≤50, שנה אופציונלית.
// הכל נשמר רק בסשן (CalendarSessionContext). לא מודפס (print-hidden).

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCalendarSession } from "../session/CalendarSessionContext";

export default function DayEditorModal() {
  const {
    editorTarget, setEditorTarget,
    itemsByDate, addItem, updateItem, deleteItem
  } = useCalendarSession();

  const isOpen = !!editorTarget?.iso;
  const iso = editorTarget?.iso || null;
  const editId = editorTarget?.id || null;

  const existing = useMemo(() => {
    if (!iso || !editId) return null;
    const arr = itemsByDate.get(iso) || [];
    return arr.find(x => x.id === editId) || null;
  }, [iso, editId, itemsByDate]);

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [imageURL, setImageURL] = useState(null);     // string (File blob URL) או URL חיצוני
  const [imageFile, setImageFile] = useState(null);   // File לסגירת URL
  const [crop, setCrop] = useState({ scale: 1, xPercent: 50, yPercent: 50 });

  // טען ערכים קיימים בעת עריכה
  useEffect(() => {
    if (!isOpen) return;
    if (existing) {
      setTitle(existing.title || "");
      setYear(existing.year || "");
      setImageURL(existing.image || null);
      setCrop(existing.crop || { scale: 1, xPercent: 50, yPercent: 50 });
    } else {
      setTitle("");
      setYear("");
      setImageURL(null);
      setCrop({ scale: 1, xPercent: 50, yPercent: 50 });
    }
  }, [isOpen, existing]);

  // ניהול blob URL
  useEffect(() => {
    return () => { if (imageFile && imageURL) URL.revokeObjectURL(imageURL); };
  }, [imageFile, imageURL]);

  if (!isOpen) return null;

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imageFile && imageURL) URL.revokeObjectURL(imageURL);
    const url = URL.createObjectURL(f);
    setImageFile(f);
    setImageURL(url);
  };

  const onSave = () => {
    const payload = {
      title: title.trim(),
      year: year ? Number(year) : null,
      image: imageURL || null,
      crop: { ...crop }
    };
    if (editId) {
      updateItem(iso, editId, payload);
    } else {
      addItem(iso, payload);
    }
    setEditorTarget(null);
  };

  const onDelete = () => {
    if (!editId) return;
    deleteItem(iso, editId);
    setEditorTarget(null);
  };

  return (
    <div className="print-hidden modal-backdrop" onClick={() => setEditorTarget(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong>{editId ? "עריכת פריט" : "הוספת פריט"} — {iso}</strong>
          <button className="icon-btn" onClick={() => setEditorTarget(null)} aria-label="סגירה">✕</button>
        </div>

        <div className="modal-body" style={{ display: "grid", gap: 12 }}>
          <label className="block">
            כיתוב (עד 50 תווים):
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 50))}
              placeholder="למשל: יום הולדת לאבא"
            />
          </label>

          <div className="grid-2" style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label className="block">
              שנה (לא חובה):
              <input
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="למשל 1966"
              />
            </label>

            <label className="block">
              תמונה:
              <input type="file" accept="image/*" onChange={onPickFile} />
            </label>
          </div>

          {/* אזור תצוגה/חיתוך */}
          <div>
            <div className="crop-frame">
              {imageURL ? (
                <img
                  src={imageURL}
                  alt="preview"
                  className="crop-img"
                  style={{
                    transformOrigin: `${crop.xPercent}% ${crop.yPercent}%`,
                    transform: `translate(0,0) scale(${crop.scale})`,
                    objectPosition: `${crop.xPercent}% ${crop.yPercent}%`
                  }}
                />
              ) : (
                <div className="empty-preview">אין תמונה</div>
              )}
            </div>

            <div className="crop-controls" style={{ display: "grid", gap: 6, marginTop: 8 }}>
              <label>
                Zoom (scale): {crop.scale.toFixed(2)}
                <input
                  type="range" min="0.5" max="3" step="0.01"
                  value={crop.scale}
                  onChange={(e) => setCrop(c => ({ ...c, scale: parseFloat(e.target.value) }))}
                />
              </label>
              <label>
                X%: {crop.xPercent}
                <input
                  type="range" min="0" max="100" step="1"
                  value={crop.xPercent}
                  onChange={(e) => setCrop(c => ({ ...c, xPercent: parseInt(e.target.value, 10) }))}
                />
              </label>
              <label>
                Y%: {crop.yPercent}
                <input
                  type="range" min="0" max="100" step="1"
                  value={crop.yPercent}
                  onChange={(e) => setCrop(c => ({ ...c, yPercent: parseInt(e.target.value, 10) }))}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          {editId && (
            <button className="danger" onClick={onDelete}>מחיקה</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={() => setEditorTarget(null)}>בטל</button>
          <button
            className="primary"
            disabled={!title.trim() && !imageURL}
            onClick={onSave}
          >
            שמירה
          </button>
        </div>
      </div>
    </div>
  );
}
