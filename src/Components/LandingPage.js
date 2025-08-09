import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const orbitDuration = 20; // seconds for full rotation

const moods = {
  morning: {
    glowColor: '#3B82F6', // blue
  },
  afternoon: {
    glowColor: '#fceabb', // subtle soft yellow
  },
  evening: {
    glowColor: '#8B5CF6', // purple
  },
  night: {
    glowColor: '#6366F1', // indigo
  },
};

export default function LandingPage() {
  const [rotation, setRotation] = useState(0);
  const [mood, setMood] = useState(moods.morning);

  useEffect(() => {
    // Orbit rotation
    let start;
    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000; // seconds
      const rot = (elapsed / orbitDuration) * 360;
      setRotation(rot % 360);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    // Mood detection based on local hour
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setMood(moods.morning);
    else if (hour >= 12 && hour < 17) setMood(moods.afternoon);
    else if (hour >= 17 && hour < 20) setMood(moods.evening);
    else setMood(moods.night);
  }, []);

  const chips = [
    { label: 'Morning Focus', top: '10%', left: '60%' },
    { label: 'Workout', top: '80%', left: '70%' },
    { label: 'Break', top: '20%', left: '10%' },
    { label: 'Meeting', top: '70%', left: '20%' },
    { label: 'Deep Work', top: '50%', left: '90%' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4">
        <div className="text-2xl font-extrabold select-none">
          Sched
          <span className="text-[#3B82F6] text-3xl align-baseline">ulify</span>
        </div>
        <nav className="hidden md:flex gap-6 text-[#E9ECF5] font-medium">
        </nav>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="bg-[#3B82F6] hover:shadow-[0_0_12px_#3B82F6] hover:scale-105 transform transition px-4 py-2 rounded-full font-semibold text-black"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-[#10B981] hover:bg-[#0e946d] hover:scale-105 transform transition px-4 py-2 rounded-full font-semibold text-black"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col-reverse lg:flex-row items-center justify-between px-8 py-20 max-w-7xl mx-auto gap-12">
        {/* Text Section */}
        <div className="max-w-xl relative">
          {/* Glow behind "Schedulify" in hero */}
          <motion.div
            className="absolute top-[72px] left-0 w-48 h-20 rounded-full -z-10 blur-3xl"
            style={{ backgroundColor: mood.glowColor }}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 0.85, 0.5] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6 relative z-10">
            Build a Smarter Day. <br />
            <span className="text-[#3B82F6] relative z-10">Let AI Plan Your Perfect Routine.</span>
          </h1>
          <p className="text-[#c8cbe7] text-lg mb-8 relative z-10">
            Schedulify learns your priorities, habits, and time to plan the optimal day, so you don’t have to.
          </p>
          <div className="flex flex-wrap gap-4 relative z-10">
            <Link
              to="/signup"
              className="bg-[#3B82F6] text-black px-6 py-3 rounded-full font-semibold hover:shadow-[0_0_16px_#3B82F6] hover:scale-105 transition"
            >
              Try It Now
            </Link>
          </div>
        </div>

        {/* Visual Cluster */}
        <div className="relative w-[400px] h-[400px] mx-auto">
          {/* Center Chip */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3B82F6] text-black px-6 py-3 rounded-full font-bold shadow-[0_0_30px_#3B82F6] z-10 select-none">
            Schedulify
          </div>

          {/* Orbiting Chips Container */}
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '50% 50%',
            }}
          >
            {chips.map(({ label, top, left }, i) => (
              <div
                key={i}
                className="absolute px-3 py-1.5 text-sm rounded-full text-[#E9ECF5] font-semibold backdrop-blur-sm bg-white/10 shadow-[0_0_12px_#10B981] select-none"
                style={{
                  top,
                  left,
                  transform: `rotate(${-rotation}deg)`,
                  transformOrigin: '50% 50%',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}