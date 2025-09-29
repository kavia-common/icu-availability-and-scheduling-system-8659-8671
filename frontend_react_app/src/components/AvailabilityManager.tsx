import React, { useEffect, useMemo, useState } from "react";
import { Availability, Doctor, ICU, TimeRange, Weekday } from "../types/domain";
import "./AvailabilityManager.scss";

/**
 * PUBLIC_INTERFACE
 * AvailabilityManager shows and manages availability windows for doctors and ICU rooms.
 * Refactored: All data is loaded from backend via HTTP. No static/mock data remains.
 *
 * Backend endpoints expected:
 * - GET  /api/doctors                -> Doctor[]
 * - GET  /api/icus                   -> ICU[]
 * - GET  /api/availability           -> Availability[] | ApiAvailability[]
 * - POST /api/availability           -> created availability
 * - PUT  /api/availability/:id       -> updated availability
 * - DELETE /api/availability/:id     -> { success: boolean }
 *
 * Note: Configure a proxy or ensure same-origin API is available. No env is hardcoded here.
 */

type EntityType = "doctor" | "icu";
type ApiAvailability = Availability & { date?: string };

const weekdays: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Minimal JSON fetch helper */
import { apiBase } from "../services/apiBase";

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: text || `Request failed: ${res.status}` };
    }
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? ((await res.json()) as T) : (undefined as unknown as T);
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error" };
  }
}

async function fetchDoctors() {
  return api<Doctor[]>(apiBase("/api/doctors"));
}
async function fetchICUs() {
  return api<ICU[]>(apiBase("/api/icus"));
}
async function fetchAvailabilities() {
  return api<ApiAvailability[]>(apiBase("/api/availability"));
}
async function createAvailabilityApi(payload: {
  entityType: EntityType;
  entityId: string;
  day: Weekday;
  date?: string | null;
  range: TimeRange;
}) {
  return api<ApiAvailability>(apiBase("/api/availability"), { method: "POST", body: JSON.stringify(payload) });
}
async function updateAvailabilityApi(
  id: string,
  payload: Partial<{ entityType: EntityType; entityId: string; day: Weekday; date?: string | null; range: TimeRange }>
) {
  return api<ApiAvailability>(apiBase(`/api/availability/${id}`), { method: "PUT", body: JSON.stringify(payload) });
}
async function deleteAvailabilityApi(id: string) {
  return api<{ success: boolean }>(apiBase(`/api/availability/${id}`), { method: "DELETE" });
}

interface NewAvailabilityState {
  entityType: EntityType;
  entityId: string;
  day: Weekday;
  date?: string;
  start: string;
  end: string;
}

const initialState: NewAvailabilityState = {
  entityType: "doctor",
  entityId: "",
  day: "Mon",
  date: "",
  start: "09:00",
  end: "17:00",
};

// PUBLIC_INTERFACE
export default function AvailabilityManager() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [icus, setICUs] = useState<ICU[]>([]);
  const [items, setItems] = useState<ApiAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<NewAvailabilityState>(initialState);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const entities = useMemo(
    () => (form.entityType === "doctor" ? doctors : icus),
    [form.entityType, doctors, icus]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [drRes, icuRes, avRes] = await Promise.all([fetchDoctors(), fetchICUs(), fetchAvailabilities()]);
      if (!mounted) return;
      if (!drRes.ok || !icuRes.ok || !avRes.ok) {
        setError(drRes.error || icuRes.error || avRes.error || "Failed to load data.");
        setDoctors([]);
        setICUs([]);
        setItems([]);
      } else {
        setDoctors(drRes.data || []);
        setICUs(icuRes.data || []);
        setItems(avRes.data || []);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (patch: Partial<NewAvailabilityState>) => setForm((prev) => ({ ...prev, ...patch }));

  const validateForm = () => {
    if (!form.entityId) return "Please select an entity.";
    if (!form.day) return "Please select a weekday.";
    if (!form.start || !form.end) return "Please select a start and end time.";
    if (form.start >= form.end) return "End time must be later than start time.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validateForm();
    if (err) {
      setError(err);
      return;
    }
    setSubmitting(true);
    const payload = {
      entityType: form.entityType,
      entityId: form.entityId,
      day: form.day,
      date: form.date || null,
      range: { start: form.start, end: form.end } as TimeRange,
    };
    const res = await createAvailabilityApi(payload);
    if (res.ok && res.data) {
      setItems((prev) => [res.data!, ...prev]);
      setForm((f) => ({ ...f, entityId: "" }));
    } else {
      setError(res.error || "Unable to create availability.");
    }
    setSubmitting(false);
  };

  const onRemove = async (id: string) => {
    setError(null);
    const res = await deleteAvailabilityApi(id);
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setError(res.error || "Failed to delete.");
    }
  };

  const onInlineChange = (id: string, patch: Partial<{ date?: string; range?: TimeRange }>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch, range: patch.range ? { ...patch.range } : it.range } : it))
    );
  };

  const onInlineSave = async (id: string) => {
    setError(null);
    const current = items.find((i) => i.id === id);
    if (!current) return;
    if (current.range.start >= current.range.end) {
      setError("End time must be later than start time.");
      return;
    }
    setUpdatingId(id);
    const res = await updateAvailabilityApi(id, {
      date: current.date ?? null,
      range: current.range,
    });
    if (!res.ok) {
      setError(res.error || "Failed to update availability.");
    } else if (res.data) {
      setItems((prev) => prev.map((i) => (i.id === id ? res.data! : i)));
    }
    setUpdatingId(null);
  };

  return (
    <section className="avail">
      <h2 className="avail__title">Manage Availability</h2>
      <p className="avail__desc">Add or remove availability windows for doctors and ICU rooms.</p>

      <form onSubmit={onSubmit} className="avail__grid" aria-label="Create availability form">
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
            {entities.map((ent) => (
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
            {weekdays.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="avail__field">
          <label>Date (optional)</label>
          <input
            className="input"
            type="date"
            value={form.date || ""}
            onChange={(e) => onChange({ date: e.target.value || "" })}
          />
        </div>

        <div className="avail__field">
          <label>Start</label>
          <input
            className="input"
            type="time"
            value={form.start}
            onChange={(e) => onChange({ start: e.target.value })}
          />
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

      {error && <div className="avail__error">{error}</div>}

      <div className="avail__table">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Entity</th>
              <th>Day</th>
              <th>Date</th>
              <th>Time</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="cell--pad">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="cell--pad text-muted">
                  No availability defined yet.
                </td>
              </tr>
            ) : (
              items.map((a) => {
                const entityName =
                  a.entityType === "doctor"
                    ? doctors.find((d) => d.id === a.entityId)?.name || a.entityId
                    : icus.find((i) => i.id === a.entityId)?.name || a.entityId;
                return (
                  <tr key={a.id}>
                    <td>{a.entityType.toUpperCase()}</td>
                    <td>{entityName}</td>
                    <td>{a.day}</td>
                    <td>
                      <input
                        className="input"
                        type="date"
                        value={a.date || ""}
                        onChange={(e) => onInlineChange(a.id, { date: e.target.value || "" })}
                        onBlur={() => onInlineSave(a.id)}
                      />
                    </td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <input
                        className="input"
                        type="time"
                        value={a.range.start}
                        onChange={(e) => onInlineChange(a.id, { range: { ...a.range, start: e.target.value } })}
                        onBlur={() => onInlineSave(a.id)}
                        aria-label="Start time"
                      />
                      <span style={{ alignSelf: "center" }}>-</span>
                      <input
                        className="input"
                        type="time"
                        value={a.range.end}
                        onChange={(e) => onInlineChange(a.id, { range: { ...a.range, end: e.target.value } })}
                        onBlur={() => onInlineSave(a.id)}
                        aria-label="End time"
                      />
                    </td>
                    <td className="right">
                      <button className="btn" onClick={() => onRemove(a.id)} disabled={updatingId === a.id}>
                        {updatingId === a.id ? "Saving..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
