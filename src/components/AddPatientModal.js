import React, { useState } from 'react';
import apiClient from '../services/api';
import { X } from 'lucide-react';

const AddPatientModal = ({ isOpen, onClose, onPatientAdded }) => {
    const [fullName, setFullName] = useState('');
    const [phonenumber, setPhonenumber] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fullName) {
            setError('Patient name is required.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await apiClient.post('/patients', { fullName, phonenumber });
            onPatientAdded();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add patient.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFullName('');
        setPhonenumber('');
        setError('');
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-brand-card rounded-lg p-8 w-full max-w-md relative">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6">Add a New Patient</h2>
                {error && <p className="bg-red-500/20 text-red-300 text-center p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Patient's Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-brand-green focus:border-brand-green"
                                placeholder="e.g., Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Patient's Phone Number (Optional)</label>
                            <input
                                type="tel"
                                value={phonenumber}
                                onChange={(e) => setPhonenumber(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-brand-green focus:border-brand-green"
                                placeholder="e.g., +919876543210"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-600">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-md bg-brand-green text-brand-dark font-semibold hover:bg-green-400 disabled:bg-gray-500">
                            {isSubmitting ? 'Adding...' : 'Add Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientModal;