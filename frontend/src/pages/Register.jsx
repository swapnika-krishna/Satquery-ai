import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Satellite,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed.");
        return;
      }

      alert("Account created successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6 py-10">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_35%)]" />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
            <Satellite className="w-7 h-7 text-cyan-400" />
          </div>

          <span className="text-2xl font-bold">
            Sat<span className="text-cyan-400">Query</span> AI
          </span>
        </Link>

        {/* Card */}
        <div className="bg-[#0b1224]/90 border border-slate-800 rounded-2xl p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="mx-auto w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-cyan-400" />
            </div>

            <h1 className="text-2xl font-bold">
              Create your account
            </h1>

            <p className="text-slate-400 mt-2 text-sm">
              Start exploring satellite imagery with AI
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 outline-none text-white placeholder-slate-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 outline-none text-white placeholder-slate-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 outline-none text-white placeholder-slate-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 outline-none text-white placeholder-slate-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition"
            >
              Create Account
            </button>

          </form>

          {/* Login */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Login
            </Link>
          </p>

        </div>

        {/* Back */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 hover:text-cyan-400"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Register;