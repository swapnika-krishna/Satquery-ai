import { Link } from "react-router-dom";
import {
  Satellite,
  User,
  Mail,
  BarChart3,
  GitCompare,
  Map,
  ArrowLeft,
  LogOut,
} from "lucide-react";

function Profile() {
  const savedUser = localStorage.getItem("satqueryUser");
  const user = savedUser ? JSON.parse(savedUser) : null;

  const name = user?.name || "SatQuery User";
  const email = user?.email || "Not logged in";

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#020617]/95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
              <Satellite className="w-6 h-6 text-cyan-400" />
            </div>

            <span className="text-xl font-bold">
              Sat<span className="text-cyan-400">Query</span> AI
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

        </div>
      </nav>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <section className="mb-10">
          <p className="text-cyan-400 text-sm font-medium mb-2">
            Account
          </p>

          <h1 className="text-4xl font-bold">
            Profile & Settings
          </h1>

          <p className="text-slate-400 mt-3">
            Manage your SatQuery AI account and view your analysis activity.
          </p>
        </section>

        {/* Profile Card */}
        <section className="bg-[#0b1224] border border-slate-800 rounded-2xl p-8 mb-8">

          <div className="flex items-center gap-5">

            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
              <User className="w-8 h-8 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                {name}
              </h2>

              <div className="flex items-center gap-2 text-slate-400 mt-2">
                <Mail size={16} />
                <span>{email}</span>
              </div>
            </div>

          </div>

        </section>

        {/* Statistics */}
        <section className="mb-8">

          <h2 className="text-xl font-semibold mb-5">
            Analysis Statistics
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            {/* Image Analysis */}
            <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-6">

              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>

              <p className="text-slate-400 text-sm">
                Image Analyses
              </p>

              <p className="text-3xl font-bold mt-2">
                0
              </p>

            </div>

            {/* Comparisons */}
            <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-6">

              <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5">
                <GitCompare className="w-5 h-5 text-purple-400" />
              </div>

              <p className="text-slate-400 text-sm">
                Image Comparisons
              </p>

              <p className="text-3xl font-bold mt-2">
                0
              </p>

            </div>

            {/* Remote Sensing */}
            <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-6">

              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
                <Map className="w-5 h-5 text-blue-400" />
              </div>

              <p className="text-slate-400 text-sm">
                Remote Sensing
              </p>

              <p className="text-3xl font-bold mt-2">
                0
              </p>

            </div>

          </div>

        </section>

        {/* Settings */}
        <section className="bg-[#0b1224] border border-slate-800 rounded-2xl p-8">

          <h2 className="text-xl font-semibold mb-6">
            Account Settings
          </h2>

          <div className="space-y-5">

            <div className="flex items-center justify-between border-b border-slate-800 pb-5">

              <div>
                <h3 className="font-medium">
                  Account Information
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Your registered account details.
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400">
                Active
              </span>

            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-5">

              <div>
                <h3 className="font-medium">
                  AI Analysis
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Analyze satellite imagery using AI.
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400">
                Enabled
              </span>

            </div>

            <div className="flex items-center justify-between">

              <div>
                <h3 className="font-medium">
                  Earth Engine
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Access satellite-derived remote-sensing indices.
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400">
                Connected
              </span>

            </div>

          </div>

        </section>

        {/* Logout */}
        <div className="mt-8 flex justify-center">

          <button
            onClick={() => {
              localStorage.removeItem("satqueryUser");
              alert("Logged out successfully.");
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-600">
          © 2026 SatQuery AI · Interactive Remote-Sensing Intelligence
        </div>
      </footer>

    </div>
  );
}

export default Profile;