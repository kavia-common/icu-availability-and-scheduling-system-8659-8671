import React, { useEffect, useMemo, useState } from "react";
import "./styles/theme.css";
import Header from "./components/Header";
import TabLayout from "./components/TabLayout";
import AvailabilityManager from "./components/AvailabilityManager";
import ScheduleICU from "./components/ScheduleICU";
import ScheduleManager from "./components/ScheduleManager";

type Route = "/" | "/schedule";

function useHashRoute() {
  const getHash = (): Route => {
    const h = window.location.hash.replace("#", "") || "/";
    return (h === "/schedule" ? "/schedule" : "/") as Route;
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
  /** Root component: theme management, header, hash-based nav, and tabbed schedule screen. */
  const { route, navigate } = useHashRoute();

  const [theme, setTheme] = useState<"ocean" | "dark">("ocean");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "ocean");
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(t => (t === "dark" ? "ocean" : "dark"));

  // Tabs for combined Schedule view
  const tabs = useMemo(() => ([
    { id: "availability", label: "Manage Availability" },
    { id: "schedule", label: "Schedule ICU" },
  ]), []);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  const renderMainContent = () => {
    if (route === "/") {
      // Home: header only, blank body as per requirement
      return <main aria-label="Home main content" />;
    }

    // "/schedule": Combined sections (tabs or panels)
    return (
      <main className="container" aria-label="Schedule main content">
        <TabLayout tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "availability" ? <AvailabilityManager /> : <ScheduleICU />}
        </TabLayout>
      </main>
    );
  };

  return (
    <div className="app-root">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSchedule={() => navigate("/schedule")}
        onGoHome={() => navigate("/")}
      />
      {renderMainContent()}
    </div>
  );
}
