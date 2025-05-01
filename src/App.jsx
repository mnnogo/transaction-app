import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Добавили Navigate в импорт
import AuthPage from './assets/pages/AuthPage/Authpage';
import DashboardPage from './assets/pages/DashboardPage/DashboardPage';
import ProfilePage from './assets/pages/ProfilePage/ProfilePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<AuthPage setIsAuthenticated={setIsAuthenticated} />} />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated 
            ? <DashboardPage setIsAuthenticated={setIsAuthenticated} /> 
            : <Navigate to="/" replace />
        } 
      />
       <Route 
        path="/profile" 
        element={
          isAuthenticated 
            ? <ProfilePage setIsAuthenticated={setIsAuthenticated} /> 
            : <Navigate to="/" replace />
        } 
      />
    </Routes>
  );
}

export default App;