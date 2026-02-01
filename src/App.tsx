import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfileSelect, Dashboard, LogActivity } from './pages';

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<ProfileSelect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log-activity" element={<LogActivity />} />
          {/* À venir */}
          <Route path="/workout/new" element={<ComingSoon title="Nouvelle séance" />} />
          <Route path="/history" element={<ComingSoon title="Historique" />} />
          <Route path="/rewards" element={<ComingSoon title="Récompenses" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-6">🚧</div>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-text-muted">Cette page arrive bientôt !</p>
      <a
        href="/dashboard"
        className="mt-6 text-primary font-medium"
      >
        ← Retour au dashboard
      </a>
    </div>
  );
}

export default App;
