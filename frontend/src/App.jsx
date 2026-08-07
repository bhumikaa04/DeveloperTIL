import { useState, useEffect } from 'react';
import Login from '../src/public/Login';
import Register from '../src/public/Register';
import NotesPage from '../src/private/main';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [initializing, setInitializing] = useState(true);

  // 1. Check localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse stored user data:", err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setInitializing(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setAuthView('login');
  };

  // 3. Show loading screen while reading localStorage
  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
        Loading session...
      </div>
    );
  }

  // 4. IF NO USER: Render Login or Register Component
  if (!currentUser) {
    return authView === 'login' ? (
      <Login
        onSwitchToRegister={() => setAuthView('register')}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    ) : (
      <Register
        onSwitchToLogin={() => setAuthView('login')}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    );
  }

  // 5. IF USER EXISTS: Render Main Notes Component
  return <NotesPage currentUser={currentUser} onLogout={handleLogout} />;
}

export default App;