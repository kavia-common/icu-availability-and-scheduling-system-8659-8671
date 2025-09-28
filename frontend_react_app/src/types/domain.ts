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
