import { Link } from "react-router-dom";
import {
  Satellite,
  ImageIcon,
  GitCompare,
  BarChart3,
  History,
  ArrowRight,
  Sparkles,
  Map,
} from "lucide-react";

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#020617]/95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
              <Satellite className="w-6 h-6 text-cyan-400" />
            </div>

            <span className="text-xl font-bold">
              Sat<span className="text-cyan-400">Query</span> AI
            </span>
          </Link>

          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/history"
              className="text-slate-400 hover:text-cyan-400 transition"
            >
              History
            </Link>

            <Link
              to="/profile"
              className="text-slate-400 hover:text-cyan-400 transition"
            >
              Profile
            </Link>
          </div>

        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Welcome */}
        <section className="mb-12">

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>

            <span className="text-cyan-400 text-sm font-medium">
              Remote Sensing Intelligence
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-cyan-400">SatQuery AI</span>
          </h1>

          <p className="text-slate-400 max-w-2xl text-lg">
            Analyze satellite imagery, compare images, and explore
            remote-sensing information using AI and satellite data.
          </p>

        </section>

        {/* Main Features */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Image Analysis */}
          <Link
            to="/analyze"
            className="group bg-[#0b1224] border border-slate-800 rounded-2xl p-7 hover:border-cyan-400/40 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6">
              <ImageIcon className="w-6 h-6 text-cyan-400" />
            </div>

            <h2 className="text-xl font-semibold mb-3">
              Image Analysis
            </h2>

            <p className="text-slate-400 text-sm leading-6">
              Upload a satellite image and ask natural-language questions
              about vegetation, water, buildings, roads and land cover.
            </p>

            <div className="mt-6 flex items-center gap-2 text-cyan-400 text-sm font-medium">
              Analyze Image
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Image Comparison */}
          <Link
            to="/compare"
            className="group bg-[#0b1224] border border-slate-800 rounded-2xl p-7 hover:border-purple-400/40 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
              <GitCompare className="w-6 h-6 text-purple-400" />
            </div>

            <h2 className="text-xl font-semibold mb-3">
              Image Comparison
            </h2>

            <p className="text-slate-400 text-sm leading-6">
              Compare two satellite images and identify changes in
              vegetation, water bodies, buildings, roads and urban areas.
            </p>

            <div className="mt-6 flex items-center gap-2 text-purple-400 text-sm font-medium">
              Compare Images
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Remote Sensing */}
          <Link
            to="/remote-sensing"
            className="group bg-[#0b1224] border border-slate-800 rounded-2xl p-7 hover:border-blue-400/40 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>

            <h2 className="text-xl font-semibold mb-3">
              Remote Sensing
            </h2>

            <p className="text-slate-400 text-sm leading-6">
              Explore satellite-derived NDVI, NDWI and NDBI values using
              Google Earth Engine.
            </p>

            <div className="mt-6 flex items-center gap-2 text-blue-400 text-sm font-medium">
              Explore Indices
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

        </section>

        {/* Quick Access */}
        <section className="mt-10">

          <h2 className="text-xl font-semibold mb-5">
            Quick Access
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            {/* History */}
            <Link
              to="/history"
              className="flex items-center justify-between bg-[#0b1224] border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-800">
                  <History className="w-5 h-5 text-slate-300" />
                </div>

                <div>
                  <h3 className="font-medium">
                    Analysis History
                  </h3>

                  <p className="text-sm text-slate-500">
                    View your previous analyses
                  </p>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-500" />
            </Link>

            {/* Satellite Intelligence */}
            <div className="flex items-center justify-between bg-[#0b1224] border border-slate-800 rounded-xl p-5">

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-800">
                  <Map className="w-5 h-5 text-slate-300" />
                </div>

                <div>
                  <h3 className="font-medium">
                    Satellite Intelligence
                  </h3>

                  <p className="text-sm text-slate-500">
                    AI + Earth Engine analysis
                  </p>
                </div>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400">
                Active
              </span>

            </div>

          </div>

        </section>

        {/* Workflow */}
        <section className="mt-12 bg-[#0b1224] border border-slate-800 rounded-2xl p-8">

          <h2 className="text-2xl font-semibold mb-3">
            How SatQuery AI Works
          </h2>

          <p className="text-slate-400 mb-8">
            Turn satellite imagery into understandable insights.
          </p>

          <div className="grid md:grid-cols-4 gap-6">

            <div>
              <div className="text-cyan-400 text-2xl font-bold mb-2">
                01
              </div>

              <h3 className="font-medium mb-2">
                Upload
              </h3>

              <p className="text-sm text-slate-500">
                Upload satellite imagery.
              </p>
            </div>

            <div>
              <div className="text-cyan-400 text-2xl font-bold mb-2">
                02
              </div>

              <h3 className="font-medium mb-2">
                Ask
              </h3>

              <p className="text-sm text-slate-500">
                Ask questions in natural language.
              </p>
            </div>

            <div>
              <div className="text-cyan-400 text-2xl font-bold mb-2">
                03
              </div>

              <h3 className="font-medium mb-2">
                Analyze
              </h3>

              <p className="text-sm text-slate-500">
                AI analyzes the imagery.
              </p>
            </div>

            <div>
              <div className="text-cyan-400 text-2xl font-bold mb-2">
                04
              </div>

              <h3 className="font-medium mb-2">
                Understand
              </h3>

              <p className="text-sm text-slate-500">
                Get meaningful remote-sensing insights.
              </p>
            </div>

          </div>

        </section>

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

export default Dashboard;