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
        <p>ICU Availability & Scheduling System - Ocean Professional Theme</p>
      </footer>
    </div>
  );
}
