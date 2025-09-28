import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phonenumber, setPhonenumber] = useState(''); // <-- 1. Add state for phone number
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 3. Pass the phone number to the register function
            await register(fullName, email, password, phonenumber);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        }
    };

    return (
        <div className="bg-brand-dark min-h-screen flex items-center justify-center">
            <div className="bg-brand-card p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6">Create an Account</h2>
                {error && <p className="bg-red-500/20 text-red-300 text-center p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-brand-green focus:border-brand-green"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-brand-green focus:border-brand-green"
                            required
                        />
                    </div>
                    {/* 2. Add the phone number input field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Phone Number</label>
                        <input
                            type="tel"
                            value={phonenumber}
                            onChange={(e) => setPhonenumber(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-brand-green focus:border-brand-green"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-brand-green focus:border-brand-green"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-green text-brand-dark font-semibold py-3 rounded-md hover:bg-green-400 transition-colors">
                        Register
                    </button>
                </form>
                 <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account? <Link to="/login" className="text-brand-green hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;