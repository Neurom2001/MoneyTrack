import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Check if user was previously logged in (optional persistence)
    const savedUser = localStorage.getItem('money_tracker_current_user');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (username: string) => {
    setUser(username);
    localStorage.setItem('money_tracker_current_user', username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('money_tracker_current_user');
  };

  return (
    <>
      {user ? (
        <Dashboard currentUser={user} onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </>
  );
};

export default App;
