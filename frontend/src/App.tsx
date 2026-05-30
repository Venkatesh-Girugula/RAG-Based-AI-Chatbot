import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

export const App: React.FC = () => {
  const { isAuthenticated, sessions, createNewSession } = useStore();

  // On mount or auth, auto-create a default chat session if the conversation queue is empty
  useEffect(() => {
    if (isAuthenticated && sessions.length === 0) {
      createNewSession('Global Grounding Console');
    }
  }, [isAuthenticated, sessions, createNewSession]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased overflow-x-hidden font-sans select-none relative">
      {isAuthenticated ? (
        <DashboardPage />
      ) : (
        <AuthPage />
      )}
    </div>
  );
};
export default App;
