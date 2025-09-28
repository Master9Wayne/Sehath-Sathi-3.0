import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { X } from 'lucide-react';

const EditMedicationModal = ({ medication, isOpen, onClose, onMedicationUpdated }) => {
    const [name, setName] = useState('');
    const [stock, setStock] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (medication) {
            setName(medication.name || '');
            setStock(medication.stock || 0);
        }
    }, [medication]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await apiClient.put(`/medicines/item/${medication._id}`, { name, stock });
            onMedicationUpdated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update medication.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-brand-card rounded-lg p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-6">Edit Medication</h2>
                {error && <p className="bg-red-500/20 text-red-300 text-center p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Medication Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Stock Quantity</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(Number(e.target.value))}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-md bg-brand-green text-brand-dark font-semibold hover:bg-green-400 disabled:bg-gray-500">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMedicationModal;