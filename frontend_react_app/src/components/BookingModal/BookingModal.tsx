import React, { useEffect, useRef, useState } from "react";
import "../../styles/theme.css";
import "./BookingModal.scss";

export interface BookingPayload {
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string;   // HH:mm
  doctorId?: string;
  orId?: string;
  patientId?: string;
  notes?: string;
}

interface BookingModalProps {
  open: boolean;
  initial: { date: string; start: string; end: string };
  doctors: Array<{ id: string; name: string }>;
  rooms: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: (payload: BookingPayload) => void;
}

/**
 * PUBLIC_INTERFACE
 * BookingModal: Centered dialog for creating an ICU booking from a selected grid cell.
 */
export default function BookingModal({
  open,
  initial,
  doctors,
  rooms,
  onClose,
  onSave
}: BookingModalProps) {
  const [payload, setPayload] = useState<BookingPayload>({ ...initial });
  const firstFieldRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setPayload({ ...initial });
    const t = setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open, initial]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const onChange = (patch: Partial<BookingPayload>) =>
    setPayload(prev => ({ ...prev, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(payload);
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="bm-overlay" role="dialog" aria-modal="true" aria-labelledby="book-icu-title" onClick={onClose}>
      <section className="bm-card" onClick={stop}>
        <header className="bm-header">
          <h3 id="book-icu-title">Book ICU Slot</h3>
          <button aria-label="Close" className="btn bm-close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={submit} className="bm-grid">
          <div className="bm-field">
            <label>Operating Room</label>
            <select
              ref={firstFieldRef}
              className="input"
              value={payload.orId || ""}
              onChange={(e) => onChange({ orId: e.target.value })}
              required
            >
              <option value="">Select room</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div className="bm-field">
            <label>Doctor</label>
            <select
              className="input"
              value={payload.doctorId || ""}
              onChange={(e) => onChange({ doctorId: e.target.value })}
              required
            >
              <option value="">Select doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="bm-field">
            <label>Patient</label>
            <input
              className="input"
              placeholder="Enter patient name or ID"
              value={payload.patientId || ""}
              onChange={(e) => onChange({ patientId: e.target.value })}
              required
            />
          </div>

          <div className="bm-field">
            <label>Start Date</label>
            <input
              className="input"
              type="date"
              value={payload.date}
              onChange={(e) => onChange({ date: e.target.value })}
              required
            />
          </div>

          <div className="bm-field">
            <label>Start Time</label>
            <input
              className="input"
              type="time"
              value={payload.start}
              onChange={(e) => onChange({ start: e.target.value })}
              required
            />
          </div>

          <div className="bm-field">
            <label>End Time</label>
            <input
              className="input"
              type="time"
              value={payload.end}
              onChange={(e) => onChange({ end: e.target.value })}
              required
            />
          </div>

          <div className="bm-field bm-notes">
            <label>Notes</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Optional"
              value={payload.notes || ""}
              onChange={(e) => onChange({ notes: e.target.value })}
            />
          </div>

          <footer className="bm-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Booking</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
