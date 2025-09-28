export type ID = string;

export interface Doctor {
  id: ID;
  name: string;
  specialty?: string;
}

export interface ICU {
  id: ID;
  name: string;
  location?: string;
  capacity?: number;
}

export type Weekday =
  | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface TimeRange {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface Availability {
  id: ID;
  entityType: "doctor" | "icu";
  entityId: ID;
  day: Weekday;
  range: TimeRange;
}

export interface BookingRequest {
  id: ID;
  doctorId: ID;
  icuId: ID;
  date: string; // YYYY-MM-DD
  time: TimeRange;
  notes?: string;
}

export interface ScheduleEntry {
  id: ID;
  doctor: Doctor;
  icu: ICU;
  date: string;
  time: TimeRange;
  status: "confirmed" | "pending" | "cancelled";
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
```

Explanation: Mock HTTP API layer simulating backend calls with delays and in-memory data; fully typed.
````write file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/services/api.ts"
import { ApiResponse, Availability, BookingRequest, Doctor, ICU, ID, ScheduleEntry } from "../types/domain";

// Simple in-memory mock DB
const doctors: Doctor[] = [
  { id: "d1", name: "Dr. Alice Chen", specialty: "Cardiology" },
  { id: "d2", name: "Dr. Rafael Singh", specialty: "Neurology" },
];
const icus: ICU[] = [
  { id: "i1", name: "ICU Room A", location: "Floor 2", capacity: 2 },
  { id: "i2", name: "ICU Room B", location: "Floor 3", capacity: 1 },
];

let availabilities: Availability[] = [
  { id: "a1", entityType: "doctor", entityId: "d1", day: "Mon", range: { start: "09:00", end: "13:00" } },
  { id: "a2", entityType: "icu", entityId: "i1", day: "Mon", range: { start: "08:00", end: "16:00" } },
];

let schedules: ScheduleEntry[] = [];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const ok = <T,>(data: T): ApiResponse<T> => ({ ok: true, data });
const fail = <T,>(msg: string): ApiResponse<T> => ({ ok: false, error: msg });

// PUBLIC_INTERFACE
export async function listDoctors(): Promise<ApiResponse<Doctor[]>> {
  /** Returns all doctors. Mocked with in-memory data. */
  await delay(250);
  return ok(doctors);
}

// PUBLIC_INTERFACE
export async function listICUs(): Promise<ApiResponse<ICU[]>> {
  /** Returns all ICU rooms. Mocked with in-memory data. */
  await delay(250);
  return ok(icus);
}

// PUBLIC_INTERFACE
export async function listAvailabilities(entityType?: "doctor" | "icu", entityId?: ID): Promise<ApiResponse<Availability[]>> {
  /** Lists availabilities, optionally filtered by entity type and ID. */
  await delay(250);
  let data = [...availabilities];
  if (entityType) data = data.filter(a => a.entityType === entityType);
  if (entityId) data = data.filter(a => a.entityId === entityId);
  return ok(data);
}

// PUBLIC_INTERFACE
export async function createAvailability(payload: Omit<Availability, "id">): Promise<ApiResponse<Availability>> {
  /** Creates a new availability for a doctor or ICU. */
  await delay(300);
  const id = `a_${Date.now()}`;
  const record: Availability = { ...payload, id };
  availabilities.push(record);
  return ok(record);
}

// PUBLIC_INTERFACE
export async function deleteAvailability(id: ID): Promise<ApiResponse<boolean>> {
  /** Deletes an availability by ID. */
  await delay(250);
  const before = availabilities.length;
  availabilities = availabilities.filter(a => a.id !== id);
  return before !== availabilities.length ? ok(true) : fail("Availability not found");
}

// PUBLIC_INTERFACE
export async function createBooking(payload: Omit<BookingRequest, "id">): Promise<ApiResponse<ScheduleEntry>> {
  /** Creates a schedule booking and returns the schedule entry. */
  await delay(400);
  const doctor = doctors.find(d => d.id === payload.doctorId);
  const icu = icus.find(i => i.id === payload.icuId);
  if (!doctor || !icu) return fail("Invalid doctor or ICU ID");

  const entry: ScheduleEntry = {
    id: `s_${Date.now()}`,
    doctor,
    icu,
    date: payload.date,
    time: payload.time,
    status: "confirmed"
  };
  schedules.push(entry);
  return ok(entry);
}

// PUBLIC_INTERFACE
export async function listSchedules(): Promise<ApiResponse<ScheduleEntry[]>> {
  /** Lists all schedules (booked entries). */
  await delay(300);
  return ok([...schedules]);
}

// PUBLIC_INTERFACE
export async function cancelSchedule(id: ID): Promise<ApiResponse<boolean>> {
  /** Cancels (removes) a schedule entry by ID. */
  await delay(250);
  const before = schedules.length;
  schedules = schedules.filter(s => s.id !== id);
  return before !== schedules.length ? ok(true) : fail("Schedule not found");
}
```

Explanation: Reusable Header component with hamburger, title, and theme toggle.
````write file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/components/Header.tsx"
import React, { useState } from "react";

interface HeaderProps {
  theme: "ocean" | "dark";
  onToggleTheme: () => void;
  onOpenScheduleManager: () => void;
  onGoHome: () => void;
}

// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme, onOpenScheduleManager, onGoHome }: HeaderProps) {
  /** Header with hamburger menu, brand, quick navigation, and theme toggle. */
  const [open, setOpen] = useState(false);

  return (
    <header aria-label="App header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(1.2) blur(6px)"
      }}
    >
      <div
        className="surface"
        style={{
          borderRadius: "0 0 16px 16px",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="container" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button
              aria-label="Open menu"
              className="btn"
              onClick={() => setOpen(v => !v)}
              style={{
                background: "#fff",
                borderColor: "var(--color-border)",
                color: "var(--color-text)"
              }}
            >
              ☰
            </button>

            <div
              onClick={onGoHome}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onGoHome()}
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, rgba(37,99,235,.25), rgba(245,158,11,.25))",
                display: "grid",
                placeItems: "center",
                color: "var(--color-primary)",
                fontWeight: 800
              }}>ICU</div>
              <div>
                <div style={{ fontWeight: 800, letterSpacing: .2 }}>ICU Scheduling</div>
                <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Ocean Professional</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="btn btn-amber" onClick={onOpenScheduleManager}>
                Schedule Manager
              </button>
              <button className="btn btn-primary" onClick={onToggleTheme}>
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </div>

          {open && (
            <nav aria-label="Navigation" style={{ marginTop: 12, paddingBottom: 8 }}>
              <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button className="btn" onClick={onGoHome} style={{ borderColor: "var(--color-border)" }}>
                    Home
                  </button>
                  <button className="btn" onClick={onOpenScheduleManager} style={{ borderColor: "var(--color-border)" }}>
                    Schedule Manager
                  </button>
                </div>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
```

Explanation: Reusable TabLayout component.
````write file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/components/TabLayout.tsx"
import React from "react";

export interface Tab {
  id: string;
  label: string;
}

interface TabLayoutProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

// PUBLIC_INTERFACE
export default function TabLayout({ tabs, activeTab, onTabChange, children }: TabLayoutProps) {
  /** Presents a tab bar and renders current tab children. */
  return (
    <div className="surface" style={{ padding: 12 }}>
      <div
        role="tablist"
        aria-label="Main tabs"
        style={{
          display: "flex",
          gap: 10,
          padding: 6,
          borderRadius: 12,
          background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(243,244,246,0.5))",
          border: "1px solid var(--color-border)",
        }}
      >
        {tabs.map(t => {
          const selected = t.id === activeTab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              className="btn"
              onClick={() => onTabChange(t.id)}
              style={{
                background: selected ? "var(--color-surface)" : "#fff",
                borderColor: selected ? "var(--color-primary-500)" : "var(--color-border)",
                color: selected ? "var(--color-primary)" : "var(--color-text)"
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div id={`panel-${activeTab}`} role="tabpanel" style={{ marginTop: 16 }}>
        {children}
      </div>
    </div>
  );
}
```

Explanation: AvailabilityManager with form to add availability and list to remove; fully typed and responsive.
````write file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/components/AvailabilityManager.tsx"
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

  const onChange = (patch: Partial<NewAvailabilityState>) => {
    setForm(prev => ({ ...prev, ...patch }));
  };

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
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setError(res.error || "Failed to delete.");
    }
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
                {"name" in ent ? ent.name : (ent as any).name}
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
```

Explanation: ScheduleICU tab to create bookings and list current schedules; typed and using mock API.
````write file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/components/ScheduleICU.tsx"
import React, { useEffect, useState } from "react";
import { Doctor, ICU, ScheduleEntry, TimeRange } from "../types/domain";
import { createBooking, listDoctors, listICUs, listSchedules, cancelSchedule } from "../services/api";

// PUBLIC_INTERFACE
export default function ScheduleICU() {
  /** Book ICU for a doctor with date and time; shows current schedules. */
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [icus, setICUs] = useState<ICU[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [doctorId, setDoctorId] = useState("");
  const [icuId, setICUId] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("11:00");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [drRes, icuRes, scRes] = await Promise.all([listDoctors(), listICUs(), listSchedules()]);
      if (!mounted) return;
      if (drRes.ok && icuRes.ok && scRes.ok) {
        setDoctors(drRes.data || []);
        setICUs(icuRes.data || []);
        setSchedules(scRes.data || []);
      } else {
        setError(drRes.error || icuRes.error || scRes.error || "Failed to load data.");
      }
      setLoading(false);
    })();
    return () => { mounted = false; }
  }, []);

  const onBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!doctorId || !icuId) {
      setError("Please select both a doctor and ICU room.");
      return;
    }
    if (start >= end) {
      setError("End time must be later than start time.");
      return;
    }
    setSubmitting(true);
    const res = await createBooking({
      doctorId, icuId, date, time: { start, end } as TimeRange
    });
    if (res.ok && res.data) {
      setSchedules(prev => [res.data!, ...prev]);
    } else {
      setError(res.error || "Unable to create booking.");
    }
    setSubmitting(false);
  };

  const onCancel = async (id: string) => {
    const res = await cancelSchedule(id);
    if (res.ok) setSchedules(prev => prev.filter(s => s.id !== id));
    else setError(res.error || "Failed to cancel schedule.");
  }

  return (
    <div className="surface" style={{ padding: 16 }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>Schedule ICU</h2>
      <p style={{ color: "var(--color-muted)", marginTop: 0, marginBottom: 16 }}>
        Create a booking by selecting a doctor, ICU room, date, and time.
      </p>

      <form onSubmit={onBook} className="grid grid-3" style={{ marginBottom: 16 }}>
        <div>
          <label style={label}>Doctor</label>
          <select className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">Select...</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>ICU Room</label>
          <select className="select" value={icuId} onChange={(e) => setICUId(e.target.value)}>
            <option value="">Select...</option>
            {icus.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label style={label}>Start</label>
          <input className="input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label style={label}>End</label>
          <input className="input" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div style={{ display: "flex", alignItems: "end" }}>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Booking..." : "Book"}
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
              <th style={th}>Doctor</th>
              <th style={th}>ICU Room</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 12 }}>Loading...</td></tr>
            ) : schedules.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 12, color: "var(--color-muted)" }}>No schedules yet.</td></tr>
            ) : (
              schedules.map(s => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={td}>{s.doctor.name}</td>
                  <td style={td}>{s.icu.name}</td>
                  <td style={td}>{s.date}</td>
                  <td style={td}>{s.time.start} - {s.time.end}</td>
                  <td style={td}><span style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: s.status === "confirmed" ? "rgba(16,185,129,.15)" : "rgba(107,114,128,.15)",
                    color: s.status === "confirmed" ? "#065F46" : "#374151",
                    fontWeight: 700,
                    fontSize: 12
                  }}>{s.status}</span></td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <button className="btn" onClick={() => onCancel(s.id)} style={{ borderColor: "var(--color-border)" }}>
                      Cancel
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

const label: React.CSSProperties = { display: "block", fontSize: 12, marginBottom: 6, color: "var(--color-muted)" };
const th: React.CSSProperties = { textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: 12, fontSize: 14 };
```

Explanation: ScheduleManager page for dedicated route accessible via header; uses the same mock API.
````write file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/components/ScheduleManager.tsx"
import React, { useEffect, useState } from "react";
import { ScheduleEntry } from "../types/domain";
import { cancelSchedule, listSchedules } from "../services/api";

interface ScheduleManagerProps {
  onBack: () => void;
}

// PUBLIC_INTERFACE
export default function ScheduleManager({ onBack }: ScheduleManagerProps) {
  /** Standalone schedule manager page with list and quick actions. */
  const [items, setItems] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await listSchedules();
      if (!mounted) return;
      if (res.ok) setItems(res.data || []);
      else setError(res.error || "Failed to load schedules.");
      setLoading(false);
    })();
    return () => { mounted = false; }
  }, []);

  const onCancel = async (id: string) => {
    const res = await cancelSchedule(id);
    if (res.ok) setItems(prev => prev.filter(s => s.id !== id));
    else setError(res.error || "Failed to cancel schedule.");
  }

  return (
    <div className="surface" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 6 }}>Schedule Manager</h2>
          <p style={{ color: "var(--color-muted)", marginTop: 0 }}>Review and manage all bookings.</p>
        </div>
        <button className="btn" onClick={onBack} style={{ borderColor: "var(--color-border)" }}>Back</button>
      </div>

      {error && (
        <div className="surface" style={{ padding: 12, borderLeft: "4px solid var(--color-error)", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="surface" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(59,130,246,0.06)" }}>
            <tr>
              <th style={th}>Doctor</th>
              <th style={th}>ICU</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 12 }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 12, color: "var(--color-muted)" }}>No scheduled entries.</td></tr>
            ) : (
              items.map(s => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={td}>{s.doctor.name}</td>
                  <td style={td}>{s.icu.name}</td>
                  <td style={td}>{s.date}</td>
                  <td style={td}>{s.time.start} - {s.time.end}</td>
                  <td style={td}><span style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: s.status === "confirmed" ? "rgba(16,185,129,.15)" : "rgba(107,114,128,.15)",
                    color: s.status === "confirmed" ? "#065F46" : "#374151",
                    fontWeight: 700,
                    fontSize: 12
                  }}>{s.status}</span></td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <button className="btn" onClick={() => onCancel(s.id)} style={{ borderColor: "var(--color-border)" }}>
                      Cancel
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

const th: React.CSSProperties = { textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: 12, fontSize: 14 };
```

Explanation: Convert App to TypeScript, keep hash navigation and integrate components.
````write file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/App.tsx"
import React, { useEffect, useMemo, useState } from "react";
import "./styles/theme.css";
import Header from "./components/Header";
import TabLayout from "./components/TabLayout";
import AvailabilityManager from "./components/AvailabilityManager";
import ScheduleICU from "./components/ScheduleICU";
import ScheduleManager from "./components/ScheduleManager";

type Route = "/" | "/schedule-manager";

function useHashRoute() {
  const getHash = (): Route => {
    const h = window.location.hash.replace("#", "") || "/";
    return (h === "/schedule-manager" ? "/schedule-manager" : "/") as Route;
  };
  const [route, setRoute] = useState<Route>(getHash());

  useEffect(() => {
    const onHashChange = () => setRoute(getHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // PUBLIC_INTERFACE
  const navigate = (to: Route) => {
    window.location.hash = to;
  };

  return { route, navigate };
}

// PUBLIC_INTERFACE
export default function App() {
  /** Root component: theme management, header, hash-based nav, and tabbed main screen. */
  const { route, navigate } = useHashRoute();

  const [theme, setTheme] = useState<"ocean" | "dark">("ocean");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "ocean");
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(t => (t === "dark" ? "ocean" : "dark"));

  const tabs = useMemo(() => ([
    { id: "availability", label: "Manage Availability" },
    { id: "schedule", label: "Schedule ICU" },
  ]), []);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  const renderMainContent = () => {
    if (route === "/schedule-manager") {
      return (
        <div className="container">
          <ScheduleManager onBack={() => navigate("/")} />
        </div>
      );
    }

    return (
      <div className="container">
        <TabLayout tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "availability" ? <AvailabilityManager /> : <ScheduleICU />}
        </TabLayout>
      </div>
    );
  };

  return (
    <div className="app-root">
      <Header
        onToggleTheme={toggleTheme}
        theme={theme}
        onOpenScheduleManager={() => navigate("/schedule-manager")}
        onGoHome={() => navigate("/")}
      />
      {renderMainContent()}
      <footer className="footer">
        <p>ICU Availability & Scheduling System · Ocean Professional Theme</p>
      </footer>
    </div>
  );
}
```

Explanation: Update index entry to TypeScript.
````write file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/index.tsx"
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/theme.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Explanation: Clean up JS files to TSX equivalents by removing outdated JS App/index files that would conflict. Keeping setupTests as-is.
````delete file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/App.js"````
Explanation: Remove old JS index to ensure TSX entry is used.
````delete file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/index.js"````
Explanation: Remove unused CSS files from the previous template to avoid conflicts; theme.css is used.
````delete file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/App.css"````
Explanation: Remove test referencing old content that no longer applies.
````delete file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/App.test.js"````
Explanation: Remove old base index.css not used anymore.
````delete file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/src/index.css"````
Explanation: Update README to reflect new TypeScript app usage and Ocean Professional styling.
````edit file="icu-availability-and-scheduling-system-8659-8671/frontend_react_app/README.md"
<<<<<<< SEARCH
# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
# ICU Availability and Scheduling System (Frontend)

React + TypeScript single-page app implementing:
- Ocean Professional theme (blue & amber accents, subtle gradients, rounded corners)
- Header with hamburger menu and Schedule Manager navigation
- Two-tab layout: Manage Availability, Schedule ICU
- Responsive, reusable components
- Mock HTTP API (in-memory) with full TypeScript typing

## Getting Started

Install and run:
- npm install
- npm start

Build:
- npm run build

## Structure
- src/App.tsx — hash-based routing, header + tabs
- src/components/Header.tsx — header with hamburger + theme toggle
- src/components/TabLayout.tsx — reusable tab container
- src/components/AvailabilityManager.tsx — CRUD for availability
- src/components/ScheduleICU.tsx — booking workflow
- src/components/ScheduleManager.tsx — separate manager route
- src/services/api.ts — mock typed API
- src/types/domain.ts — shared domain types
- src/styles/theme.css — Ocean Professional theme tokens & utilities

## Notes
- No backend required; API calls are mocked.
- Hash routing (no additional dependencies).
- Full TypeScript types for props, state, and API.
>>>>>>> REPLACE
