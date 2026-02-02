import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfileSelect, Dashboard, LogActivity, History } from './pages';
import { WorkoutPage } from './pages/Workout';
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
          <Route path="/history" element={<History />} />
          <Route path="/rewards" element={<ComingSoon title="Récompenses" />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center pb-24">
      <div className="text-6xl mb-6">🚧</div>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-text-muted">Cette page arrive bientôt !</p>
    </div>
  );
}

export default App;
