import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfileSelect, Dashboard, LogActivity, History, Rewards, GenerateWorkout } from './pages';
import { WorkoutPage, GeneratedWorkoutPage } from './pages/Workout';
import { BottomNav } from './components';

function App() {
  return (
    <BrowserRouter>
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
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
