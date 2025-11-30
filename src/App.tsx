import { useState, useEffect } from 'react';
import { useStore } from './store';
import { Sidebar, TopBar } from './components/layout';
import { GeneralMode, HyperMode } from './components/views';
import { LongRunForm } from './components/forms/LongRunForm';
import './App.css';

function App() {
  const { currentMode, initializeUser, user } = useStore();
  const [isLongRunFormOpen, setIsLongRunFormOpen] = useState(false);

  useEffect(() => {
    initializeUser();

    // Apply theme on mount
    if (user?.settings.theme) {
      document.documentElement.setAttribute('data-theme', user.settings.theme);
    }
  }, [initializeUser, user?.settings.theme]);

  return (
    <div className="app">
      <Sidebar onCreateLongRun={() => setIsLongRunFormOpen(true)} />

      <div className="app-main">
        <TopBar />

        <div className="app-content">
          {currentMode === 'general' ? <GeneralMode /> : <HyperMode />}
        </div>
      </div>

      <LongRunForm
        isOpen={isLongRunFormOpen}
        onClose={() => setIsLongRunFormOpen(false)}
      />
    </div>
  );
}

export default App;
