import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const user = data.user;

    if (!user.email_confirmed_at) {
      setError("Please confirm your email before logging in.");
      await supabase.auth.signOut();
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E2A47] flex items-center justify-center px-6 py-12 font-sans text-white">
      <div className="max-w-5xl w-full bg-[#121B2E] rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Side Visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="hidden md:flex items-center justify-center bg-[#0F172A] relative"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="absolute w-72 h-72 border-8 rounded-full border-green-500/50 blur-sm"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute w-48 h-48 border-4 rounded-full border-green-500/70 blur-sm"
          />
          <h2 className="relative text-4xl font-extrabold max-w-sm text-center z-10">
            Log in to <span className="text-[#3B82F6]">Schedulify</span>
            <br />
            and stay on track.
          </h2>
        </motion.div>

        {/* Right Side - Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-12 flex flex-col justify-center gap-6 items-center"
        >
          <h1 className="text-3xl font-extrabold mb-6 text-[#3B82F6] text-center">
            Welcome back!
          </h1>

          <input
            required
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email"
            className="w-[480px] rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-3 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />

          <input
            required
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="w-[480px] rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-3 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />

          {error && (
            <p className="text-red-500 font-semibold text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-[480px] bg-[#3B82F6] hover:bg-[#2563EB] transition rounded-full py-3 font-bold text-lg text-black shadow-[0_0_15px_#3B82F6]"
          >
            Log In
          </button>

          <p className="text-center text-[#9CA3AF] mt-3">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-green-500 underline font-semibold">
              Sign Up
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}