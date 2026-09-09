import { useState } from "react";
import axios from "axios";
import {
  Satellite,
  ArrowLeft,
  MapPin,
  Calendar,
  Leaf,
  Waves,
  Building2,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

function RemoteSensing() {
  const [latitude, setLatitude] = useState("16.30");
  const [longitude, setLongitude] = useState("80.44");

  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-02-01");

  const [indices, setIndices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getIndices = async () => {
    setLoading(true);
    setError("");
    setIndices(null);

    try {
      const response = await axios.get(
        "http://localhost:5000/api/indices",
        {
          params: {
            lat: latitude,
            lon: longitude,
            start: startDate,
            end: endDate,
          },
        }
      );

      setIndices(response.data.indices);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          "Unable to retrieve satellite indices."
      );
    } finally {
      setLoading(false);
    }
  };

  const getInterpretation = (name, value) => {
    if (value === undefined || value === null) return "";

    if (name === "NDVI") {
      if (value > 0.5) return "High vegetation";
      if (value > 0.2) return "Moderate vegetation";
      if (value > 0) return "Low vegetation";
      return "Little or no vegetation";
    }

    if (name === "NDWI") {
      if (value > 0.3) return "Strong water presence";
      if (value > 0) return "Possible water presence";
      return "Low water signal";
    }

    if (name === "NDBI") {
      if (value > 0.2) return "Higher built-up signal";
      if (value > 0) return "Some built-up signal";
      return "Low built-up signal";
    }

    return "";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
              <Satellite className="w-6 h-6 text-cyan-400" />
            </div>

            <span className="text-xl font-bold">
              Sat<span className="text-cyan-400">Query</span> AI
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition text-sm"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <section className="mb-10">

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Satellite className="w-6 h-6 text-blue-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Remote Sensing Analysis
              </h1>

              <p className="text-slate-400 mt-1">
                Explore satellite-derived vegetation, water and built-up
                area indicators.
              </p>
            </div>
          </div>

        </section>

        {/* Input Card */}
        <section className="bg-[#0b1224] border border-slate-800 rounded-2xl p-7">

          <div className="flex items-center gap-3 mb-6">
            <Search className="w-5 h-5 text-cyan-400" />

            <div>
              <h2 className="text-xl font-semibold">
                Satellite Data Query
              </h2>

              <p className="text-sm text-slate-500">
                Select a location and date range.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Latitude */}
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                <MapPin size={15} />
                Latitude
              </label>

              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                <MapPin size={15} />
                Longitude
              </label>

              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                <Calendar size={15} />
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                <Calendar size={15} />
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 outline-none"
              />
            </div>

          </div>

          <button
            onClick={getIndices}
            disabled={loading}
            className="mt-7 px-7 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-semibold flex items-center gap-2 transition"
          >
            {loading ? (
              "Analyzing Satellite Data..."
            ) : (
              <>
                <Search size={18} />
                Calculate Indices
              </>
            )}
          </button>

        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-5">
            {error}
          </div>
        )}

        {/* Results */}
        {indices && (
          <section className="mt-8">

            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-cyan-400" />

              <div>
                <h2 className="text-2xl font-semibold">
                  Satellite Analysis Results
                </h2>

                <p className="text-sm text-slate-500">
                  Derived using Google Earth Engine
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

              {/* NDVI */}
              <div className="bg-[#0b1224] border border-green-400/20 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <Leaf className="w-6 h-6 text-green-400" />
                  </div>

                  <span className="text-xs text-green-400">
                    Vegetation
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  NDVI
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Normalized Difference Vegetation Index
                </p>

                <div className="text-4xl font-bold mt-5">
                  {Number(indices.NDVI).toFixed(3)}
                </div>

                <div className="mt-4 text-sm text-green-400">
                  {getInterpretation("NDVI", indices.NDVI)}
                </div>

              </div>

              {/* NDWI */}
              <div className="bg-[#0b1224] border border-blue-400/20 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Waves className="w-6 h-6 text-blue-400" />
                  </div>

                  <span className="text-xs text-blue-400">
                    Water
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  NDWI
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Normalized Difference Water Index
                </p>

                <div className="text-4xl font-bold mt-5">
                  {Number(indices.NDWI).toFixed(3)}
                </div>

                <div className="mt-4 text-sm text-blue-400">
                  {getInterpretation("NDWI", indices.NDWI)}
                </div>

              </div>

              {/* NDBI */}
              <div className="bg-[#0b1224] border border-purple-400/20 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>

                  <span className="text-xs text-purple-400">
                    Built-up
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  NDBI
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Normalized Difference Built-up Index
                </p>

                <div className="text-4xl font-bold mt-5">
                  {Number(indices.NDBI).toFixed(3)}
                </div>

                <div className="mt-4 text-sm text-purple-400">
                  {getInterpretation("NDBI", indices.NDBI)}
                </div>

              </div>

            </div>

            {/* Location Information */}
            <div className="mt-8 bg-[#0b1224] border border-slate-800 rounded-2xl p-6">

              <h3 className="font-semibold mb-4">
                Analysis Parameters
              </h3>

              <div className="grid md:grid-cols-3 gap-4 text-sm">

                <div>
                  <p className="text-slate-500">Latitude</p>
                  <p className="mt-1 text-slate-200">
                    {latitude}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Longitude</p>
                  <p className="mt-1 text-slate-200">
                    {longitude}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Date Range</p>
                  <p className="mt-1 text-slate-200">
                    {startDate} → {endDate}
                  </p>
                </div>

              </div>

            </div>

            {/* Scientific Note */}
            <div className="mt-6 p-5 rounded-xl bg-cyan-500/5 border border-cyan-400/10">

              <p className="text-sm text-slate-400 leading-6">
                <span className="text-cyan-400 font-medium">
                  Note:
                </span>{" "}
                These values are calculated from multispectral satellite
                data using Google Earth Engine. NDVI represents vegetation
                signal, NDWI represents water-related signal, and NDBI
                represents built-up area signal. Interpretation should
                consider location, season and image conditions.
              </p>

            </div>

          </section>
        )}

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

export default RemoteSensing;