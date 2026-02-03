import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfileSelect, Dashboard, LogActivity, History, Rewards, GenerateWorkout, Settings } from './pages';
import { WorkoutPage, GeneratedWorkoutPage } from './pages/Workout';
import { BottomNav, SplashScreen } from './components';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    // Check if this is a fresh app load (not a page navigation)
    const hasVisited = sessionStorage.getItem('makifit_visited');
    if (hasVisited) {
      setShowSplash(false);
      setIsFirstVisit(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('makifit_visited', 'true');
  };

  return (
    <BrowserRouter>
      {showSplash && isFirstVisit && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      <div className="max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<ProfileSelect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log-activity" element={<LogActivity />} />
          <Route path="/workout/new" element={<WorkoutPage />} />
          <Route path="/workout/generate" element={<GenerateWorkout />} />
          <Route path="/workout/generated" element={<GeneratedWorkoutPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
