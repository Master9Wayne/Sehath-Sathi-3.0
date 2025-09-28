

// import React, { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
// import apiClient from '../services/api'; 
// import { ArrowLeft, Clock, Package, CheckCircle, CalendarPlus, XCircle, Trash2, Edit, UserX } from 'lucide-react'; // Added UserX

// const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// const PatientMedicationSchedule = () => {
//   const { patientId } = useParams();
//   const navigate = useNavigate(); // Hook for navigation after deletion
//   const [patientName, setPatientName] = useState('Loading Patient...'); // State for display name
//   const [medicationSchedule, setMedicationSchedule] = useState([]);
//   const [availableMedicines, setAvailableMedicines] = useState([]);
//   const [scheduleTemplates, setScheduleTemplates] = useState([]);
//   const [loadingState, setLoadingState] = useState('loading');
//   const [isRegistered, setIsRegistered] = useState(false);
  
//   // State for the new Medicine/Schedule creation form
//   const [addForm, setAddForm] = useState({ 
//     newMedicineName: '', 
//     initialStock: 0,
//     newTime: '', 
//     newDayOfWeek: '' 
//   });

//   const fetchPatientDetails = async () => {
//       try {
//           const response = await apiClient.get(`/patients/detail/${patientId}`);
//           setPatientName(response.data.data.fullName);
//       } catch (error) {
//           console.error("Failed to fetch patient details:", error);
//           setPatientName('Error loading name');
//       }
//   };

//   const fetchSchedules = () => {
//     if (!patientId) {
//         setLoadingState('error');
//         return;
//     }
//     setLoadingState('loading');
    
//     apiClient.get(`/med-schedules/${patientId}`) 
//       .then(response => {
//         const data = response.data.data; 
//         if (data && Array.isArray(data)) {
//             setMedicationSchedule(data);
//             setLoadingState('success');
//         } else {
//             setMedicationSchedule([]);
//             setLoadingState('success'); 
//         }
//         fetchDependencies(); 
//       })
//       .catch(err => {
//         console.error("API call failed:", err.response?.data?.message || err.message);
//         setLoadingState('error'); 
//       });
//   };

//   const fetchDependencies = async () => {
//     try {
//         const medResponse = await apiClient.get(`/medicine/${patientId}`);
//         setAvailableMedicines(medResponse.data.data || []);

//         const scheduleResponse = await apiClient.get('/schedule');
//         setScheduleTemplates(scheduleResponse.data.data || []);
//     } catch (error) {
//         console.error("Failed to fetch dependencies:", error);
//     }
//   };

//   useEffect(() => {
//     fetchPatientDetails(); // Fetch name on load
//     fetchSchedules();
//     setIsRegistered(false);
//   }, [patientId]);

//   const handleRegisterCheckup = () => {
//     setIsRegistered(true);
//   };

//   const handleChange = (e) => {
//     setAddForm({ ...addForm, [e.target.name]: e.target.value });
//   };
  
//   // --- DELETE PATIENT HANDLER (NEW) ---
//   const handleDeletePatient = async () => {
//       if (!window.confirm(`WARNING! This action will PERMANENTLY delete the patient '${patientName}' and all associated medication schedules and medicine records. Are you sure you want to proceed?`)) {
//           return;
//       }
//       try {
//           // The delete route uses /:id, where id is the patientId
//           await apiClient.delete(`/patients/${patientId}`);
//           alert(`Patient '${patientName}' deleted successfully.`);
//           navigate('/dashboard'); // Redirect to dashboard after deletion
//       } catch (error) {
//           console.error("Delete Patient failed:", error);
//           alert('Failed to delete patient: ' + (error.response?.data?.message || error.message));
//       }
//   };

//   // --- ADD MEDICINE AND ASSIGN SCHEDULE HANDLER (Unchanged) ---
//   const handleAddMedicineAndSchedule = async (e) => {
//     e.preventDefault();
//     const { newMedicineName, initialStock, newTime, newDayOfWeek } = addForm;

//     if (!newMedicineName || !newTime || !newDayOfWeek || initialStock === undefined) {
//         alert('Please fill out all medicine, stock, time, and day fields.');
//         return;
//     }

//     try {
//         let medicineId = null;
//         let scheduleId = null;

//         // 1. GET OR CREATE SCHEDULE TEMPLATE 
//         const normalizedTime = newTime.trim(); 
//         const existingSchedule = scheduleTemplates.find(
//             sched => sched.time === normalizedTime && sched.dayOfWeek === newDayOfWeek
//         );

//         if (existingSchedule) {
//             scheduleId = existingSchedule._id;
//         } else {
//             const createScheduleResponse = await apiClient.post(`/schedule`, {
//                 time: normalizedTime,
//                 dayOfWeek: newDayOfWeek
//             });
//             scheduleId = createScheduleResponse.data.data._id;
//             alert(`New schedule time created: ${normalizedTime} on ${newDayOfWeek}`);
//         }

//         // 2. GET OR CREATE MEDICINE 
//         const existingMed = availableMedicines.find(med => med.name.toLowerCase() === newMedicineName.toLowerCase());

//         if (existingMed) {
//             medicineId = existingMed._id;
//             if (existingMed.stock !== parseInt(initialStock)) {
//                 await apiClient.put(`/medicine/item/${medicineId}`, { stock: parseInt(initialStock) });
//             }
//         } else {
//             const createMedResponse = await apiClient.post(`/medicine/${patientId}`, {
//                 name: newMedicineName,
//                 stock: parseInt(initialStock)
//             });
//             medicineId = createMedResponse.data.data._id;
//         }

//         // 3. ASSIGN SCHEDULE 
//         await apiClient.post(`/med-schedules`, {
//             medicineId: medicineId,
//             scheduleId: scheduleId
//         });

//         alert('Medication schedule assigned successfully!');
//         setAddForm({ newMedicineName: '', initialStock: 0, newTime: '', newDayOfWeek: '' });
//         fetchSchedules(); 

//     } catch (error) {
//         console.error("Operation failed:", error);
//         alert('Operation failed: ' + (error.response?.data?.message || error.message));
//     }
//   };

//   // --- UPDATE STOCK HANDLER (Unchanged) ---
//   const handleUpdateStock = async (medicationId, currentName) => {
//       const newStock = prompt(`Enter new stock level for ${currentName} (Current: ${medicationSchedule.find(m => m.id === medicationId)?.stock} units):`);
//       if (newStock === null || isNaN(parseInt(newStock)) || parseInt(newStock) < 0) {
//           if (newStock !== null) alert("Invalid stock value. Please enter a positive number.");
//           return;
//       }

//       try {
//           await apiClient.put(`/medicine/item/${medicationId}`, { stock: parseInt(newStock) });
//           alert('Stock updated successfully!');
//           fetchSchedules(); 
//       } catch (error) {
//           alert('Failed to update stock: ' + (error.response?.data?.message || error.message));
//       }
//   };

//   // --- DELETE SCHEDULE HANDLER (Unchanged) ---
//   const handleDeleteSchedule = async (medScheduleId, medicineName) => {
//       if (!window.confirm(`Are you sure you want to delete this specific schedule entry for '${medicineName}'? This action might delete the medicine itself if it is the last associated schedule.`)) {
//           return;
//       }
//       try {
//           await apiClient.delete(`/med-schedules/${medScheduleId}`);
//           alert('Schedule entry deleted successfully!');
//           fetchSchedules(); 
//       } catch (error) {
//           alert('Failed to delete schedule: ' + (error.response?.data?.message || error.message));
//       }
//   };

//   // --- Render logic ---
//   if (loadingState === 'loading') {
//     return (
//       <div className="min-h-screen p-8 flex items-center justify-center bg-gray-900 text-gray-300">
//         <div className="text-xl">Loading medication schedule...</div>
//       </div>
//     );
//   }

//   if (loadingState === 'error') {
//     return (
//       <div className="min-h-screen p-8 bg-gray-900">
//         <Link to="/dashboard" className="inline-flex items-center text-blue-400 mb-8 hover:underline">
//           <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
//         </Link>
//         <div className="p-10 text-center text-xl bg-red-900 border border-red-700 text-red-300 rounded-lg">
//           <XCircle className="inline w-6 h-6 mr-2" />
//           Failed to load medication data. Please check your backend.
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-900 min-h-screen p-4 sm:p-8 text-gray-100">
//       <div className="flex justify-between items-center mb-6">
//         <Link to="/dashboard" className="inline-flex items-center text-blue-400 hover:underline">
//           <ArrowLeft className="w-5 h-5 mr-2" />
//           Back to Dashboard
//         </Link>
//         {/* DELETE PATIENT BUTTON (NEW) */}
//         <button
//             onClick={handleDeletePatient}
//             className="flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition duration-150"
//         >
//             <UserX className="w-4 h-4 mr-2" />
//             Delete Patient
//         </button>
//       </div>

//       <div className="max-w-6xl mx-auto space-y-8">
//         <h1 className="text-3xl font-bold text-white border-b border-gray-700 pb-3">
//           Medication & Care Plan for Patient: {patientName}
//         </h1>

//         {/* --- ADD NEW MEDICINE & ASSIGN SCHEDULE FORM (Unchanged) --- */}
//         <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
//             <h2 className="text-2xl font-semibold mb-4 text-purple-400">Add New Medicine & Assign Schedule</h2>
//             <form onSubmit={handleAddMedicineAndSchedule} className="space-y-4">
//                 <div className="flex flex-wrap -mx-2">
//                     {/* Medicine Name (Input field) */}
//                     <div className="px-2 w-full sm:w-1/4">
//                         <label htmlFor="newMedicineName" className="block text-sm font-medium text-gray-300">Medicine Name</label>
//                         <input
//                             type="text"
//                             id="newMedicineName"
//                             name="newMedicineName"
//                             value={addForm.newMedicineName}
//                             onChange={handleChange}
//                             required
//                             placeholder="Type new or existing medicine name"
//                             className="mt-1 block w-full px-3 py-2 text-base bg-gray-700 border border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
//                         />
//                     </div>
//                     {/* Initial Stock */}
//                     <div className="px-2 w-full sm:w-1/4 mt-4 sm:mt-0">
//                         <label htmlFor="initialStock" className="block text-sm font-medium text-gray-300">Initial Stock (Units)</label>
//                         <input
//                             type="number"
//                             id="initialStock"
//                             name="initialStock"
//                             value={addForm.initialStock}
//                             onChange={handleChange}
//                             min="0"
//                             required
//                             className="mt-1 block w-full px-3 py-2 text-base bg-gray-700 border border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
//                         />
//                     </div>
//                     {/* Day of Week (Dropdown) - NEW */}
//                     <div className="px-2 w-full sm:w-1/4 mt-4 sm:mt-0">
//                         <label htmlFor="newDayOfWeek" className="block text-sm font-medium text-gray-300">Day of Week</label>
//                         <select
//                             id="newDayOfWeek"
//                             name="newDayOfWeek"
//                             value={addForm.newDayOfWeek}
//                             onChange={handleChange}
//                             required
//                             className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
//                         >
//                             <option value="">Select Day</option>
//                             {daysOfWeek.map(day => (
//                                 <option key={day} value={day}>{day}</option>
//                             ))}
//                         </select>
//                     </div>
//                     {/* Time (Input field HH:MM) - NEW */}
//                     <div className="px-2 w-full sm:w-1/4 mt-4 sm:mt-0">
//                         <label htmlFor="newTime" className="block text-sm font-medium text-gray-300">Time (HH:MM)</label>
//                         <input
//                             type="time"
//                             id="newTime"
//                             name="newTime"
//                             value={addForm.newTime}
//                             onChange={handleChange}
//                             required
//                             placeholder="08:00"
//                             className="mt-1 block w-full px-3 py-2 text-base bg-gray-700 border border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
//                         />
//                     </div>
//                 </div>
//                 <button
//                     type="submit"
//                     className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800"
//                 >
//                     <CalendarPlus className="w-5 h-5 mr-2" />
//                     Add Medicine & Assign Schedule
//                 </button>
//             </form>
//         </div>

//         {/* --- MEDICATION SCHEDULE TABLE (Unchanged) --- */}
//         <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
//           <h2 className="text-2xl font-semibold mb-4 text-green-400">Daily Medication Schedule & Stock Management</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-700">
//               <thead className="bg-gray-700">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"><Package className="inline w-4 h-4 mr-1 align-sub" /> Medicine Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"><Clock className="inline w-4 h-4 mr-1 align-sub" /> Daily Schedule (Times)</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Stock Left</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Stock Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-700">
//                 {medicationSchedule.length > 0 ? (
//                   medicationSchedule.map((med, index) => (
//                     <tr key={med.id || index} className={med.stock < 30 ? 'bg-yellow-900/30' : 'hover:bg-gray-700 transition duration-150'}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{med.name}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
//                         {med.schedule || 'N/A'}
//                         <div className="flex flex-wrap gap-2 mt-2">
//                            {/* Display delete buttons for each schedule ID */}
//                            {med.scheduleIds?.map((id, i) => (
//                                 <button
//                                     key={i}
//                                     onClick={() => handleDeleteSchedule(id, med.name)}
//                                     title={`Delete this specific schedule entry (ID: ${id})`}
//                                     className="p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition duration-150"
//                                 >
//                                     <Trash2 className="w-3 h-3" />
//                                 </button>
//                            ))}
//                         </div>
//                       </td>
//                       <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
//                         med.stock < 15 ? 'text-red-400' : med.stock < 30 ? 'text-yellow-400' : 'text-green-400'
//                       }`}>{med.stock !== undefined ? `${med.stock} units` : 'N/A'}</td>
                      
//                       <td className="px-6 py-4 whitespace-nowrap text-right">
//                           <button
//                               onClick={() => handleUpdateStock(med.id, med.name)}
//                               className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
//                           >
//                               <Edit className="w-4 h-4 mr-1" />
//                               Update Stock
//                           </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="4" className="px-6 py-4 text-center text-gray-400 italic">No medication schedule found for this patient.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Checkup Registration Option (Unchanged) */}
//         <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
//             <h2 className="text-2xl font-semibold mb-4 text-white">Monthly Checkup Registration</h2>
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                 <p className="text-gray-400 max-w-lg">
//                     Register for the mandatory monthly health checkup to ensure continuity of care and proactive health monitoring.
//                 </p>
//                 {isRegistered ? (
//                     <div className="flex items-center p-3 text-lg font-bold text-green-400 bg-green-900/50 rounded-lg min-w-[250px] justify-center">
//                         <CheckCircle className="w-6 h-6 mr-2" />
//                         Registered! (Confirmation Sent)
//                     </div>
//                 ) : (
//                     <button
//                         onClick={handleRegisterCheckup}
//                         className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 min-w-[250px] justify-center"
//                     >
//                         <CalendarPlus className="w-5 h-5 mr-2" />
//                         Register Now
//                     </button>
//                 )}
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PatientMedicationSchedule;

// fileName: src/pages/PatientMedicationSchedule.jsx

// fileName: src/pages/PatientMedicationSchedule.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api'; 
import { ArrowLeft, Clock, Package, CheckCircle, CalendarPlus, XCircle, Trash2, Edit, UserX } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PatientMedicationSchedule = () => {
  const { patientId } = useParams();
  const navigate = useNavigate(); 
  const [patientName, setPatientName] = useState('Loading Patient...'); 
  const [medicationSchedule, setMedicationSchedule] = useState([]);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [scheduleTemplates, setScheduleTemplates] = useState([]);
  const [loadingState, setLoadingState] = useState('loading');
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [addForm, setAddForm] = useState({ 
    newMedicineName: '', 
    initialStock: 0,
    newTime: '', 
    newDayOfWeek: '' 
  });

  const fetchPatientDetails = async () => {
      try {
          const response = await apiClient.get(`/patient/detail/${patientId}`);
          setPatientName(response.data.data.fullName);
      } catch (error) {
          console.error("Failed to fetch patient details:", error);
          setPatientName('Error loading name');
      }
  };

  const fetchSchedules = () => {
    if (!patientId) {
        setLoadingState('error');
        return;
    }
    setLoadingState('loading');
    
    apiClient.get(`/med-schedules/${patientId}`) 
      .then(response => {
        const data = response.data.data; 
        if (data && Array.isArray(data)) {
            setMedicationSchedule(data);
            setLoadingState('success');
        } else {
            setMedicationSchedule([]);
            setLoadingState('success'); 
        }
        fetchDependencies(); 
      })
      .catch(err => {
        console.error("API call failed:", err.response?.data?.message || err.message);
        setLoadingState('error'); 
      });
  };

  const fetchDependencies = async () => {
    try {
        const medResponse = await apiClient.get(`/medicine/${patientId}`);
        setAvailableMedicines(medResponse.data.data || []);

        const scheduleResponse = await apiClient.get('/schedule');
        setScheduleTemplates(scheduleResponse.data.data || []);
    } catch (error) {
        console.error("Failed to fetch dependencies:", error);
    }
  };

  useEffect(() => {
    fetchPatientDetails(); 
    fetchSchedules();
    setIsRegistered(false);
  }, [patientId]);

  const handleRegisterCheckup = () => {
    setIsRegistered(true);
  };

  const handleChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };
  
  // --- DELETE PATIENT HANDLER ---
  const handleDeletePatient = async () => {
      if (!window.confirm(`WARNING! This action will PERMANENTLY delete the patient '${patientName}' and all associated medication schedules and medicine records. Are you sure you want to proceed?`)) {
          return;
      }
      try {
          await apiClient.delete(`/patient/${patientId}`);
          alert(`Patient '${patientName}' deleted successfully.`);
          navigate('/dashboard'); 
      } catch (error) {
          console.error("Delete Patient failed:", error);
          alert('Failed to delete patient: ' + (error.response?.data?.message || error.message));
      }
  };

  // --- ADD MEDICINE AND ASSIGN SCHEDULE HANDLER (Unchanged logic) ---
  const handleAddMedicineAndSchedule = async (e) => {
    e.preventDefault();
    const { newMedicineName, initialStock, newTime, newDayOfWeek } = addForm;

    if (!newMedicineName || !newTime || !newDayOfWeek || initialStock === undefined) {
        alert('Please fill out all medicine, stock, time, and day fields.');
        return;
    }

    try {
        let medicineId = null;
        let scheduleId = null;

        // 1. GET OR CREATE SCHEDULE TEMPLATE 
        const normalizedTime = newTime.trim(); 
        const existingSchedule = scheduleTemplates.find(
            sched => sched.time === normalizedTime && sched.dayOfWeek === newDayOfWeek
        );

        if (existingSchedule) {
            scheduleId = existingSchedule._id;
        } else {
            const createScheduleResponse = await apiClient.post(`/schedule`, {
                time: normalizedTime,
                dayOfWeek: newDayOfWeek
            });
            scheduleId = createScheduleResponse.data.data._id;
            alert(`New schedule time created: ${normalizedTime} on ${newDayOfWeek}`);
        }

        // 2. GET OR CREATE MEDICINE 
        const existingMed = availableMedicines.find(med => med.name.toLowerCase() === newMedicineName.toLowerCase());

        if (existingMed) {
            medicineId = existingMed._id;
            if (existingMed.stock !== parseInt(initialStock)) {
                await apiClient.put(`/medicine/item/${medicineId}`, { stock: parseInt(initialStock) });
            }
        } else {
            const createMedResponse = await apiClient.post(`/medicine/${patientId}`, {
                name: newMedicineName,
                stock: parseInt(initialStock)
            });
            medicineId = createMedResponse.data.data._id;
            alert(`New medicine '${newMedicineName}' created successfully!`);
        }

        // 3. ASSIGN SCHEDULE 
        await apiClient.post(`/med-schedules`, {
            medicineId: medicineId,
            scheduleId: scheduleId
        });

        alert('Medication schedule assigned successfully!');
        setAddForm({ newMedicineName: '', initialStock: 0, newTime: '', newDayOfWeek: '' });
        fetchSchedules(); 

    } catch (error) {
        console.error("Operation failed:", error);
        alert('Operation failed: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- UPDATE STOCK HANDLER (Unchanged) ---
  const handleUpdateStock = async (medicationId, currentName) => {
      const newStock = prompt(`Enter new stock level for ${currentName} (Current: ${medicationSchedule.find(m => m.id === medicationId)?.stock} units):`);
      if (newStock === null || isNaN(parseInt(newStock)) || parseInt(newStock) < 0) {
          if (newStock !== null) alert("Invalid stock value. Please enter a positive number.");
          return;
      }

      try {
          await apiClient.put(`/medicine/item/${medicationId}`, { stock: parseInt(newStock) });
          alert('Stock updated successfully!');
          fetchSchedules(); 
      } catch (error) {
          alert('Failed to update stock: ' + (error.response?.data?.message || error.message));
      }
  };

  // --- DELETE SCHEDULE HANDLER (Unchanged, relies on backend fix) ---
  const handleDeleteSchedule = async (medScheduleId, medicineName) => {
      if (!window.confirm(`Are you sure you want to delete this specific schedule entry for '${medicineName}'? This action might delete the medicine itself if it is the last associated schedule.`)) {
          return;
      }
      try {
          // This call must succeed based on the backend fix (uncommenting the delete logic)
          await apiClient.delete(`/med-schedules/${medScheduleId}`); 
          alert('Schedule entry deleted successfully!');
          fetchSchedules(); 
      } catch (error) {
          alert('Failed to delete schedule: ' + (error.response?.data?.message || error.message));
      }
  };

  // --- Render logic ---
  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gray-900 text-gray-300">
        <div className="text-xl">Loading medication schedule...</div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="min-h-screen p-8 bg-gray-900">
        <Link to="/dashboard" className="inline-flex items-center text-blue-400 mb-8 hover:underline">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </Link>
        <div className="p-10 text-center text-xl bg-red-900 border border-red-700 text-red-300 rounded-lg">
          <XCircle className="inline w-6 h-6 mr-2" />
          Failed to load medication data. Please check your backend.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-8 text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-blue-400 hover:underline">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        {/* DELETE PATIENT BUTTON */}
        <button
            onClick={handleDeletePatient}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition duration-150"
        >
            <UserX className="w-4 h-4 mr-2" />
            Delete Patient
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white border-b border-gray-700 pb-3">
          Medication & Care Plan for Patient: {patientName}
        </h1>

        {/* --- ADD NEW MEDICINE & ASSIGN SCHEDULE FORM --- */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Add New Medicine & Assign Schedule</h2>
            <form onSubmit={handleAddMedicineAndSchedule} className="space-y-4">
                <div className="flex flex-wrap -mx-2">
                    {/* Medicine Name (Input field) */}
                    <div className="px-2 w-full sm:w-1/4">
                        <label htmlFor="newMedicineName" className="block text-sm font-medium text-gray-300">Medicine Name</label>
                        <input
                            type="text"
                            id="newMedicineName"
                            name="newMedicineName"
                            value={addForm.newMedicineName}
                            onChange={handleChange}
                            required
                            placeholder="Type new or existing medicine name"
                            className="mt-1 block w-full px-3 py-2 text-base bg-gray-700 border border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        />
                    </div>
                    {/* Initial Stock */}
                    <div className="px-2 w-full sm:w-1/4 mt-4 sm:mt-0">
                        <label htmlFor="initialStock" className="block text-sm font-medium text-gray-300">Initial Stock (Units)</label>
                        <input
                            type="number"
                            id="initialStock"
                            name="initialStock"
                            value={addForm.initialStock}
                            onChange={handleChange}
                            min="0"
                            required
                            className="mt-1 block w-full px-3 py-2 text-base bg-gray-700 border border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        />
                    </div>
                    {/* Day of Week (Dropdown) - NEW */}
                    <div className="px-2 w-full sm:w-1/4 mt-4 sm:mt-0">
                        <label htmlFor="newDayOfWeek" className="block text-sm font-medium text-gray-300">Day of Week</label>
                        <select
                            id="newDayOfWeek"
                            name="newDayOfWeek"
                            value={addForm.newDayOfWeek}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        >
                            <option value="">Select Day</option>
                            {daysOfWeek.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    {/* Time (Input field HH:MM) - NEW */}
                    <div className="px-2 w-full sm:w-1/4 mt-4 sm:mt-0">
                        <label htmlFor="newTime" className="block text-sm font-medium text-gray-300">Time (HH:MM)</label>
                        <input
                            type="time"
                            id="newTime"
                            name="newTime"
                            value={addForm.newTime}
                            onChange={handleChange}
                            required
                            placeholder="08:00"
                            className="mt-1 block w-full px-3 py-2 text-base bg-gray-700 border border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800"
                >
                    <CalendarPlus className="w-5 h-5 mr-2" />
                    Add Medicine & Assign Schedule
                </button>
            </form>
        </div>

        {/* --- MEDICATION SCHEDULE TABLE (Unchanged) --- */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Daily Medication Schedule & Stock Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"><Package className="inline w-4 h-4 mr-1 align-sub" /> Medicine Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"><Clock className="inline w-4 h-4 mr-1 align-sub" /> Daily Schedule (Times)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Stock Left</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {medicationSchedule.length > 0 ? (
                  medicationSchedule.map((med, index) => (
                    <tr key={med.id || index} className={med.stock < 30 ? 'bg-yellow-900/30' : 'hover:bg-gray-700 transition duration-150'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{med.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {med.schedule || 'N/A'}
                        <div className="flex flex-wrap gap-2 mt-2">
                           {/* Display delete buttons for each schedule ID */}
                           {med.scheduleIds?.map((id, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleDeleteSchedule(id, med.name)}
                                    title={`Delete this specific schedule entry (ID: ${id})`}
                                    className="p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition duration-150"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                           ))}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                        med.stock < 15 ? 'text-red-400' : med.stock < 30 ? 'text-yellow-400' : 'text-green-400'
                      }`}>{med.stock !== undefined ? `${med.stock} units` : 'N/A'}</td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                              onClick={() => handleUpdateStock(med.id, med.name)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
                          >
                              <Edit className="w-4 h-4 mr-1" />
                              Update Stock
                          </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-400 italic">No medication schedule found for this patient.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Checkup Registration Option (Unchanged) */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-white">Monthly Checkup Registration</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-gray-400 max-w-lg">
                    Register for the mandatory monthly health checkup to ensure continuity of care and proactive health monitoring.
                </p>
                {isRegistered ? (
                    <div className="flex items-center p-3 text-lg font-bold text-green-400 bg-green-900/50 rounded-lg min-w-[250px] justify-center">
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Registered! (Confirmation Sent)
                    </div>
                ) : (
                    <button
                        onClick={handleRegisterCheckup}
                        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 min-w-[250px] justify-center"
                    >
                        <CalendarPlus className="w-5 h-5 mr-2" />
                        Register Now
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMedicationSchedule;