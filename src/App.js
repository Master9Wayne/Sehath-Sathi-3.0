// fileName: src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page Imports
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PatientMedicationSchedule from './pages/PatientMedicationSchedule'; // CRITICAL FIX
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Component Imports
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patient/:patientId" 
        element={
          <ProtectedRoute>
            <PatientMedicationSchedule /> 
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;