import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: "http://localhost:3000/verify-email", // <-- Added this line
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
        },
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Success! Please check your email to confirm your account.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1B1839] flex items-center justify-center px-6 py-12 font-sans text-white">
      <div className="max-w-5xl w-full bg-[#121B2E] rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Side Visual Art */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="hidden md:flex items-center justify-center bg-[#16213E] relative p-16"
        >
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.9, 0.6],
              boxShadow: [
                "0 0 30px 10px rgba(59,130,246,0.6)",
                "0 0 50px 20px rgba(59,130,246,0.9)",
                "0 0 30px 10px rgba(59,130,246,0.6)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute rounded-full w-72 h-72 bg-[#3B82F6]"
          />
          <h2 className="relative text-4xl font-extrabold max-w-xs text-center z-10 leading-tight text-white">
            Welcome to <span className="text-[#3B82F6]">Schedulify</span>
            <br />
            Build better habits, one day at a time.
          </h2>
        </motion.div>

        {/* Right Side - Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="p-12 flex flex-col justify-center gap-6 items-center"
        >
          <h1 className="text-3xl font-extrabold mb-6 text-[#3B82F6] text-center">
            Kickstart your habit tracking!
          </h1>

          <div className="flex gap-4 w-[440px]">
            <input
              required
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              type="text"
              placeholder="First Name"
              className="w-1/2 rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-2 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            <input
              required
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              type="text"
              placeholder="Last Name"
              className="w-1/2 rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-2 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>

          <input
            required
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email"
            className="w-[440px] rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-2 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />

          <input
            required
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="w-[440px] rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-2 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />

          <input
            required
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            type="password"
            placeholder="Confirm Password"
            className="w-[440px] rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-2 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />

          {error && (
            <p className="text-red-500 font-semibold text-center">{error}</p>
          )}

          {success && (
            <p className="text-green-400 font-semibold text-center">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-[440px] bg-[#3B82F6] hover:bg-[#2563EB] transition rounded-full py-3 font-bold text-lg text-black shadow-[0_0_15px_#3B82F6] disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <p className="text-center text-[#9CA3AF] mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-green-500 underline font-semibold">
              Login
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}