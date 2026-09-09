import { Link, useNavigate } from "react-router-dom";
import { Satellite, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Temporary navigation.
    // Real MySQL authentication will be connected later.
    if (email && password) {
      navigate("/dashboard");
    } else {
      alert("Please enter your email and password.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Top Bar */}
      <nav className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2">
              <Satellite className="h-7 w-7 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                SatQuery <span className="text-cyan-400">AI</span>
              </h1>

              <p className="text-xs text-slate-500">
                Remote Sensing Intelligence
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-400"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

        </div>
      </nav>

      {/* Login */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
              <Satellite className="h-8 w-8 text-cyan-400" />
            </div>

            <h2 className="text-3xl font-bold">
              Welcome Back
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to SatQuery AI
            </p>

          </div>

          {/* Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-7 shadow-2xl">

            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="mb-5">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                  />

                </div>

              </div>

              {/* Password */}
              <div className="mb-4">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-400"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Options */}
              <div className="mb-6 flex items-center justify-between">

                <label className="flex items-center gap-2 text-sm text-slate-400">

                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-cyan-500"
                  />

                  Remember me

                </label>

                <button
                  type="button"
                  onClick={() => alert("Password recovery will be added later.")}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Forgot password?
                </button>

              </div>

              {/* Login */}
              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Login
              </button>

            </form>

            {/* Register */}
            <div className="mt-6 border-t border-slate-800 pt-6 text-center">

              <p className="text-sm text-slate-500">
                Don't have an account?
              </p>

              <Link
                to="/register"
                className="mt-2 inline-block text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Create an account
              </Link>

            </div>

          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            SatQuery AI • Intelligent Remote-Sensing Analysis
          </p>

        </div>

      </main>

    </div>
  );
}

export default Login;