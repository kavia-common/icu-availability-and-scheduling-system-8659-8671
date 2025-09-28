import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './styles/theme.css';
import Header from './components/Header';
import TabLayout from './components/TabLayout';
import AvailabilityManager from './components/AvailabilityManager';
import ScheduleICU from './components/ScheduleICU';
import ScheduleManager from './components/ScheduleManager';

// Simple internal router using hash for no extra deps
const useHashRoute = () => {
  const [route, setRoute] = useState(window.location.hash.replace('#', '') || '/');

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash.replace('#', '') || '/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (to) => {
    window.location.hash = to;
  };

  return { route, navigate };
};

// PUBLIC_INTERFACE
function App() {
  /** This component is the application root. It wires theme, header, routing and the two-tab layout. */
  const { route, navigate } = useHashRoute();

  // Theme handling: Ocean Professional by default (light base)
  const [theme, setTheme] = useState('ocean'); // 'ocean' or 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'ocean');
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'ocean' : 'dark'));

  // Tabs
  const tabs = useMemo(
    () => [
      { id: 'availability', label: 'Manage Availability' },
      { id: 'schedule', label: 'Schedule ICU' },
    ],
    []
  );
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Simple navigation for "Schedule Manager" from hamburger menu
  useEffect(() => {
    if (route === '/schedule-manager') {
      // no-op; separate page/modal view
    } else {
      // Default main page
    }
  }, [route]);

  const renderMainContent = () => {
    if (route === '/schedule-manager') {
      return (
        <div className="container">
          <ScheduleManager onBack={() => navigate('/')} />
        </div>
      );
    }

    return (
      <div className="container">
        <TabLayout
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {activeTab === 'availability' ? (
            <AvailabilityManager />
          ) : (
            <ScheduleICU />
          )}
        </TabLayout>
      </div>
    );
  };

  return (
    <div className="app-root">
      <Header
        onToggleTheme={toggleTheme}
        theme={theme}
        onOpenScheduleManager={() => navigate('/schedule-manager')}
        onGoHome={() => navigate('/')}
      />
      {renderMainContent()}
      <footer className="footer">
        <p>ICU Availability & Scheduling System · Ocean Professional Theme</p>
      </footer>
    </div>
  );
}

export default App;
