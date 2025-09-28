import React from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Use useNavigate
import { ShieldCheck, HeartPulse } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate(); // <-- Get the navigate function

  // Update handlers to navigate to our new routes
  const handleLogin = () => navigate('/login');
  const handleSignUp = () => navigate('/register');

  return (
    <div className="bg-brand-dark min-h-screen text-brand-light font-sans">
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sehath Saathi</h1>
        <nav>
          <button onClick={handleLogin} className="text-base px-4 py-2 mr-2 hover:text-brand-green transition-colors">Login</button>
          <button onClick={handleSignUp} className="bg-brand-green text-brand-dark font-semibold px-4 py-2 rounded-md hover:bg-green-400 transition-colors">
            Signup
          </button>
        </nav>
      </header>
        {/* The rest of your landing page JSX remains the same */}
      <main className="container mx-auto px-6 text-center pt-24 pb-16">
        <h2 className="text-5xl md:text-7xl font-bold mb-4">
          Peace of mind, <span className="text-brand-green">delivered.</span>
        </h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-300 mb-8">
          Sehath Saathi is the bridge across the distance. We provide a simple, reliable way for you to manage your parents' health and medication, no matter how far away you are.
        </p>
        <button onClick={handleSignUp} className="bg-brand-green text-brand-dark font-bold px-8 py-3 rounded-md text-lg hover:bg-green-400 transition-colors">
          Get Started For Free
        </button>
      </main>

      <section className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-8">
        <div className="bg-brand-card p-8 rounded-lg">
          <div className="flex items-center mb-4">
            <ShieldCheck className="w-8 h-8 text-brand-green mr-4" />
            <h3 className="text-2xl font-semibold">Our Vision</h3>
          </div>
          <p className="text-gray-400">
            Connecting parents with their children. Fostering a support system that goes beyond general healthcare, recreating the bond of a joint family, virtually.
          </p>
        </div>
        <div className="bg-brand-card p-8 rounded-lg">
          <div className="flex items-center mb-4">
            <HeartPulse className="w-8 h-8 text-brand-green mr-4" />
            <h3 className="text-2xl font-semibold">Our Mission</h3>
          </div>
          <p className="text-gray-400">
            To make every senior citizen feel secure, connected, and supported. We want to ensure they never feel that they are alone in managing their health.
          </p>
        </div>
      </section>

      <footer className="text-center py-8 mt-16 border-t border-gray-700">
        <p className="text-gray-500">&copy; 2025 Sehath Saathi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
