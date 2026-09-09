import { Link } from "react-router-dom";
import {
  Satellite,
  ArrowLeft,
  Search,
  Image,
  GitCompare,
  Leaf,
  Clock,
  Database,
} from "lucide-react";

function History() {
  // MySQL history will be connected later.
  const history = [];

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#070b1f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
              <Satellite className="text-cyan-400" size={24} />
            </div>

            <div>
              <h1 className="font-bold text-lg">SatQuery AI</h1>
              <p className="text-xs text-gray-500">
                Satellite Intelligence
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>

        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-cyan-400 text-sm font-medium mb-2">
            ANALYSIS RECORDS
          </p>

          <h2 className="text-4xl font-bold mb-3">
            Analysis History
          </h2>

          <p className="text-gray-400 max-w-2xl">
            View your previous satellite image analyses, comparisons,
            and remote-sensing calculations in one place.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">

          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={19}
            />

            <input
              type="text"
              placeholder="Search your analysis history..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-cyan-400/50"
            />
          </div>

          <select className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-gray-300 outline-none">
            <option className="bg-[#080d20]">All analyses</option>
            <option className="bg-[#080d20]">Image Analysis</option>
            <option className="bg-[#080d20]">Image Comparison</option>
            <option className="bg-[#080d20]">Remote Sensing</option>
          </select>

        </div>

        {/* Analysis Types */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="p-3 w-fit rounded-xl bg-cyan-500/10 mb-4">
              <Image className="text-cyan-400" size={24} />
            </div>

            <h3 className="font-semibold text-lg">
              Image Analysis
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              AI-powered satellite image questions and answers.
            </p>

            <div className="text-2xl font-bold mt-5">0</div>
            <p className="text-xs text-gray-500">Analyses</p>
          </div>


          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 mb-4">
              <GitCompare className="text-purple-400" size={24} />
            </div>

            <h3 className="font-semibold text-lg">
              Image Comparisons
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Compare satellite images and identify changes.
            </p>

            <div className="text-2xl font-bold mt-5">0</div>
            <p className="text-xs text-gray-500">Comparisons</p>
          </div>


          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="p-3 w-fit rounded-xl bg-green-500/10 mb-4">
              <Leaf className="text-green-400" size={24} />
            </div>

            <h3 className="font-semibold text-lg">
              Remote Sensing
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              NDVI, NDWI and NDBI satellite calculations.
            </p>

            <div className="text-2xl font-bold mt-5">0</div>
            <p className="text-xs text-gray-500">Calculations</p>
          </div>

        </div>

        {/* History Area */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl">

          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Clock className="text-cyan-400" size={21} />

            <div>
              <h3 className="font-semibold text-lg">
                Recent Activity
              </h3>

              <p className="text-sm text-gray-500">
                Your previous SatQuery AI activities
              </p>
            </div>
          </div>

          {history.length === 0 ? (

            <div className="py-20 px-6 text-center">

              <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mb-5">
                <Database
                  className="text-cyan-400"
                  size={28}
                />
              </div>

              <h3 className="text-xl font-semibold mb-2">
                No analysis history yet
              </h3>

              <p className="text-gray-500 max-w-md mx-auto mb-7">
                Your analysis results will appear here once
                history storage is connected to MySQL.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">

                <Link
                  to="/analyze"
                  className="px-5 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
                >
                  Analyze Image
                </Link>

                <Link
                  to="/compare"
                  className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  Compare Images
                </Link>

              </div>

            </div>

          ) : (

            <div className="p-6">
              {/* History records will be displayed here */}
            </div>

          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-8 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 SatQuery AI — Intelligent Remote-Sensing Analysis
        </p>
      </footer>

    </div>
  );
}

export default History;