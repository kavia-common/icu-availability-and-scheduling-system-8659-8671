import React, { useEffect, useMemo, useState } from "react";
import { Availability, Doctor, ICU, TimeRange, Weekday } from "../types/domain";
import { createAvailability, deleteAvailability, listAvailabilities, listDoctors, listICUs } from "../services/api";
import "./AvailabilityManager.scss";

type EntityType = "doctor" | "icu";
const weekdays: Weekday[] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

interface NewAvailabilityState {
  entityType: EntityType;
  entityId: string;
  day: Weekday;
  start: string;
  end: string;
}

const initialState: NewAvailabilityState = {
  entityType: "doctor",
  entityId: "",
  day: "Mon",
  start: "09:00",
  end: "17:00"
};

// PUBLIC_INTERFACE
export default function AvailabilityManager() {
  /** Manage doctor/ICU availabilities: add and remove with a typed form. */
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [icus, setICUs] = useState<ICU[]>([]);
  const [items, setItems] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<NewAvailabilityState>(initialState);

  const entities = useMemo(() => form.entityType === "doctor" ? doctors : icus, [form.entityType, doctors, icus]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [drRes, icuRes, avRes] = await Promise.all([listDoctors(), listICUs(), listAvailabilities()]);
      if (!mounted) return;
      if (drRes.ok && icuRes.ok && avRes.ok) {
        setDoctors(drRes.data || []);
        setICUs(icuRes.data || []);
        setItems(avRes.data || []);
      } else {
        setError(drRes.error || icuRes.error || avRes.error || "Failed to load data.");
      }
      setLoading(false);
    })();
    return () => { mounted = false; }
  }, []);

  const onChange = (patch: Partial<NewAvailabilityState>) => setForm(prev => ({ ...prev, ...patch }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.entityId) {
      setError("Please select an entity.");
      return;
    }
    if (form.start >= form.end) {
      setError("End time must be later than start time.");
      return;
    }
    setSubmitting(true);
    const payload = {
      entityType: form.entityType,
      entityId: form.entityId,
      day: form.day,
      range: { start: form.start, end: form.end } as TimeRange
    };
    const res = await createAvailability(payload);
    if (res.ok && res.data) {
      setItems(prev => [res.data!, ...prev]);
      setForm(f => ({ ...f, entityId: "" }));
    } else {
      setError(res.error || "Unable to create availability.");
    }
    setSubmitting(false);
  };

  const onRemove = async (id: string) => {
    const res = await deleteAvailability(id);
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
    else setError(res.error || "Failed to delete.");
  };

  return (
    <section className="avail">
      <h2 className="avail__title">Manage Availability</h2>
      <p className="avail__desc">Add or remove availability windows for doctors and ICU rooms.</p>

      <form onSubmit={onSubmit} className="avail__grid">
        <div className="avail__field">
          <label>Entity Type</label>
          <select
            className="select"
            value={form.entityType}
            onChange={(e) => onChange({ entityType: e.target.value as EntityType, entityId: "" })}
          >
            <option value="doctor">Doctor</option>
            <option value="icu">ICU Room</option>
          </select>
        </div>

        <div className="avail__field">
          <label>{form.entityType === "doctor" ? "Doctor" : "ICU Room"}</label>
          <select
            className="select"
            value={form.entityId}
            onChange={(e) => onChange({ entityId: e.target.value })}
          >
            <option value="">Select...</option>
            {entities.map(ent => (
              <option key={ent.id} value={ent.id}>
                {"name" in ent ? (ent as Doctor).name : (ent as ICU).name}
              </option>
            ))}
          </select>
        </div>

        <div className="avail__field">
          <label>Weekday</label>
          <select
            className="select"
            value={form.day}
            onChange={(e) => onChange({ day: e.target.value as Weekday })}
          >
            {weekdays.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="avail__field">
          <label>Start</label>
          <input className="input" type="time" value={form.start} onChange={(e) => onChange({ start: e.target.value })} />
        </div>

        <div className="avail__field">
          <label>End</label>
          <input className="input" type="time" value={form.end} onChange={(e) => onChange({ end: e.target.value })} />
        </div>

        <div className="avail__actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Availability"}
          </button>
        </div>
      </form>

      {error && (
        <div className="avail__error">
          {error}
        </div>
      )}

      <div className="avail__table">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Entity</th>
              <th>Day</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="cell--pad">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="cell--pad text-muted">No availability defined yet.</td></tr>
            ) : (
              items.map(a => (
                <tr key={a.id}>
                  <td>{a.entityType.toUpperCase()}</td>
                  <td>
                    {a.entityType === "doctor"
                      ? doctors.find(d => d.id === a.entityId)?.name || a.entityId
                      : icus.find(i => i.id === a.entityId)?.name || a.entityId}
                  </td>
                  <td>{a.day}</td>
                  <td>{a.range.start} - {a.range.end}</td>
                  <td className="right">
                    <button className="btn" onClick={() => onRemove(a.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
