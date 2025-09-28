import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { X } from 'lucide-react';

const EditScheduleModal = ({ scheduleItem, isOpen, onClose, onScheduleUpdated }) => {
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await apiClient.get('/schedules');
                setAvailableSchedules(response.data.data);
            } catch (err) {
                console.error("Failed to fetch schedules", err);
            }
        };
        if (isOpen) {
            fetchSchedules();
            setSelectedScheduleId(scheduleItem?.schedule?._id || '');
        }
    }, [isOpen, scheduleItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await apiClient.put(`/med-schedules/${scheduleItem._id}`, { newScheduleId: selectedScheduleId });
            onScheduleUpdated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update schedule.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-brand-card rounded-lg p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-2">Change Schedule</h2>
                <p className="text-gray-400 mb-6">For: <span className="font-bold">{scheduleItem.medicine.name}</span></p>
                {error && <p className="bg-red-500/20 text-red-300 text-center p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">New Day & Time</label>
                        <select
                            value={selectedScheduleId}
                            onChange={(e) => setSelectedScheduleId(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md"
                        >
                            <option value="">Select a new time slot</option>
                            {availableSchedules.map(s => (
                                <option key={s._id} value={s._id}>{s.dayOfWeek} at {s.time}</option>
                            ))}
                        </select>
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
export default EditScheduleModal;