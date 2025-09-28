import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { PlusCircle, User } from 'lucide-react';
import AddPatientModal from '../components/AddPatientModal';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('/patients');
      setPatients(response.data.data);
    } catch (err) {
      setError('Failed to fetch patients.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePatientAdded = () => {
    fetchPatients();
  };

  return (
    <>
      <div className="bg-brand-dark min-h-screen p-8">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-gray-400">Welcome, {user?.fullName || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </header>

        <h2 className="text-2xl font-semibold mb-4">Manage Patients</h2>
        
        {isLoading && <p className="text-center py-8">Loading patients...</p>}
        {error && <p className="text-center py-8 text-red-400">{error}</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Link to={`/patient/${patient._id}`} key={patient._id} className="block">
              <div className="bg-brand-card p-6 rounded-lg hover:ring-2 hover:ring-brand-green transition-all h-full">
                <div className="flex items-center mb-3">
                  <User className="w-8 h-8 text-brand-green mr-4" />
                  <h3 className="text-xl font-bold">{patient.fullName}</h3>
                </div>
                <p className="text-gray-400">Click to view schedule and medications.</p>
              </div>
            </Link>
          ))}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-card p-6 rounded-lg border-2 border-dashed border-gray-600 hover:border-brand-green transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[160px]"
          >
             <PlusCircle className="w-10 h-10 text-gray-500 mb-3" />
             <h3 className="text-xl font-semibold text-gray-400">Add New Patient</h3>
          </button>
        </div>
      </div>
      
      <AddPatientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientAdded={handlePatientAdded}
      />
    </>
  );
};
export default Dashboard;