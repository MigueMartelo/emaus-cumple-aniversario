import { useEffect, useState } from 'react';
import { ADMIN_TOKEN_KEY, adminNavigation, navigation } from './constants.ts';
import { getInitialView } from './utils.ts';
import { TopBar } from './components/TopBar.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { JoinForm } from './components/JoinForm.tsx';
import { RegisteredByMonth } from './components/RegisteredByMonth.tsx';

function App() {
  const [view, setView] = useState<string>(getInitialView);
  const [adminToken, setAdminToken] = useState<string>(() => window.localStorage.getItem(ADMIN_TOKEN_KEY) ?? '');
  const [adminLoginError, setAdminLoginError] = useState('');

  useEffect(() => {
    const onPopState = () => setView(getInitialView());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(nextView: string) {
    const item = [...navigation, ...adminNavigation].find((entry) => entry.id === nextView);
    if (!item) return;
    window.history.pushState({}, '', item.path);
    setView(nextView);
  }

  function handleLogin(token: string) {
    setAdminLoginError('');
    window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setAdminToken(token);
    navigate('dashboard');
  }

  function handleLogout() {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken('');
    setAdminLoginError('');
    navigate('join');
  }

  // Called when the API rejects the token — stays on the login view with an error.
  function handleUnauthorized() {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken('');
    setAdminLoginError('Token inválido. Verifica tu token e intenta de nuevo.');
    navigate('dashboard');
  }

  function renderContent() {
    if (view === 'join') return <JoinForm />;
    if (!adminToken) return <AdminLogin onLogin={handleLogin} loginError={adminLoginError} />;
    if (view === 'dashboard') return <Dashboard adminToken={adminToken} onUnauthorized={handleUnauthorized} />;
    if (view === 'list') return <RegisteredByMonth adminToken={adminToken} onUnauthorized={handleUnauthorized} />;
    return <JoinForm />;
  }

  return (
    <div className="min-h-screen bg-[#fffaf2] text-zinc-950">
      <TopBar activeView={view} adminToken={adminToken} onNavigate={navigate} onLogout={handleLogout} />
      <main className="mx-auto flex w-full max-w-6xl flex-col px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
