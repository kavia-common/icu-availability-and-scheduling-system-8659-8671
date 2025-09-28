import React, { useEffect, useMemo, useState } from "react";
import { Availability, Doctor, ICU, TimeRange, Weekday } from "../types/domain";
import { createAvailability, deleteAvailability, listAvailabilities, listDoctors, listICUs } from "../services/api";

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
    <div className="surface" style={{ padding: 16 }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>Manage Availability</h2>
      <p style={{ color: "var(--color-muted)", marginTop: 0, marginBottom: 16 }}>
        Add or remove availability windows for doctors and ICU rooms.
      </p>

      <form onSubmit={onSubmit} className="grid grid-3" style={{ marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--color-muted)" }}>Entity Type</label>
          <select
            className="select"
            value={form.entityType}
            onChange={(e) => onChange({ entityType: e.target.value as EntityType, entityId: "" })}
          >
            <option value="doctor">Doctor</option>
            <option value="icu">ICU Room</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--color-muted)" }}>
            {form.entityType === "doctor" ? "Doctor" : "ICU Room"}
          </label>
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

        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--color-muted)" }}>Weekday</label>
          <select
            className="select"
            value={form.day}
            onChange={(e) => onChange({ day: e.target.value as Weekday })}
          >
            {weekdays.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--color-muted)" }}>Start</label>
          <input className="input" type="time" value={form.start} onChange={(e) => onChange({ start: e.target.value })} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--color-muted)" }}>End</label>
          <input className="input" type="time" value={form.end} onChange={(e) => onChange({ end: e.target.value })} />
        </div>

        <div style={{ display: "flex", alignItems: "end" }}>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Availability"}
          </button>
        </div>
      </form>

      {error && (
        <div className="surface" style={{ padding: 12, borderLeft: "4px solid var(--color-error)", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="surface" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(59,130,246,0.06)" }}>
            <tr>
              <th style={th}>Type</th>
              <th style={th}>Entity</th>
              <th style={th}>Day</th>
              <th style={th}>Time</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 12 }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 12, color: "var(--color-muted)" }}>No availability defined yet.</td></tr>
            ) : (
              items.map(a => (
                <tr key={a.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={td}>{a.entityType.toUpperCase()}</td>
                  <td style={td}>
                    {a.entityType === "doctor"
                      ? doctors.find(d => d.id === a.entityId)?.name || a.entityId
                      : icus.find(i => i.id === a.entityId)?.name || a.entityId}
                  </td>
                  <td style={td}>{a.day}</td>
                  <td style={td}>{a.range.start} - {a.range.end}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <button className="btn" onClick={() => onRemove(a.id)} style={{ borderColor: "var(--color-border)" }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  fontSize: 12,
  color: "var(--color-muted)",
  fontWeight: 600
};
const td: React.CSSProperties = {
  padding: 12,
  fontSize: 14
};
