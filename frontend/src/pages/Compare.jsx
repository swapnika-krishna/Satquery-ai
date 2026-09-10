import { useState } from "react";
import axios from "axios";
import SatelliteBackground from "./SatelliteBackground";
import {
  Satellite,
  Upload,
  Send,
  ArrowLeft,
  GitCompare,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

function Compare() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);

  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const [latitude, setLatitude] = useState("16.30");
  const [longitude, setLongitude] = useState("80.44");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-02-01");

  const [indices, setIndices] = useState(null);
  const [indicesLoading, setIndicesLoading] = useState(false);
  const [indicesError, setIndicesError] = useState("");

  const handleImage1 = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage1(file);
      setPreview1(URL.createObjectURL(file));
    }
  };

  const handleImage2 = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage2(file);
      setPreview2(URL.createObjectURL(file));
    }
  };

  const handleCompare = async () => {
    if (!image1 || !image2) {
      alert("Please upload both satellite images.");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const formData = new FormData();

      formData.append("image1", image1);
      formData.append("image2", image2);
      formData.append(
        "question",
        question ||
          "Compare these two satellite images and identify the major changes."
      );

      const response = await axios.post(
        "https://satquery-ai-ep5o.onrender.com/api/compare",
        formData
      );

      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Comparison error:", error);

      setAnswer(
        error.response?.data?.error ||
          error.message ||
          "Unable to compare the images. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoteSensing = async () => {
    setIndicesLoading(true);
    setIndices(null);
    setIndicesError("");

    try {
      const response = await axios.get(
        "https://satquery-ai-ep5o.onrender.com/api/indices",
        {
          params: {
            lat: latitude,
            lon: longitude,
            start: startDate,
            end: endDate,
          },
        }
      );

      if (response.data.success) {
        setIndices(response.data.indices);
      } else {
        setIndicesError(
          response.data.error || "Remote sensing analysis failed."
        );
      }
    } catch (error) {
      console.error("Remote sensing error:", error);

      setIndicesError(
        error.response?.data?.error ||
          "Unable to calculate remote-sensing indices."
      );
    } finally {
      setIndicesLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-white">
      <SatelliteBackground video="compare.mp4" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-800 bg-[#020617]/95">
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
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <GitCompare className="w-6 h-6 text-purple-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Image Comparison
              </h1>

              <p className="text-slate-400 mt-1">
                Compare satellite imagery and discover changes over time.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image 1 */}
          <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Image 1
                </h2>

                <p className="text-sm text-slate-500">
                  Earlier / Reference Image
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400">
                Reference
              </span>
            </div>

            <label
              htmlFor="image1"
              className="block cursor-pointer"
            >
              <div className="h-80 border-2 border-dashed border-slate-700 hover:border-cyan-400/50 rounded-xl flex items-center justify-center overflow-hidden transition">
                {preview1 ? (
                  <img
                    src={preview1}
                    alt="First satellite"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-cyan-400" />
                    </div>

                    <h3 className="font-medium">
                      Upload Image 1
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      PNG, JPG or JPEG
                    </p>
                  </div>
                )}
              </div>
            </label>

            <input
              id="image1"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImage1}
              className="hidden"
            />
          </div>

          {/* Image 2 */}
          <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Image 2
                </h2>

                <p className="text-sm text-slate-500">
                  Later / Comparison Image
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400">
                Comparison
              </span>
            </div>

            <label
              htmlFor="image2"
              className="block cursor-pointer"
            >
              <div className="h-80 border-2 border-dashed border-slate-700 hover:border-purple-400/50 rounded-xl flex items-center justify-center overflow-hidden transition">
                {preview2 ? (
                  <img
                    src={preview2}
                    alt="Second satellite"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-purple-400" />
                    </div>

                    <h3 className="font-medium">
                      Upload Image 2
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      PNG, JPG or JPEG
                    </p>
                  </div>
                )}
              </div>
            </label>

            <input
              id="image2"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImage2}
              className="hidden"
            />
          </div>
        </div>

        {/* Question */}
        <div className="mt-8 bg-[#0b1224] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="w-5 h-5 text-cyan-400" />

            <div>
              <h2 className="font-semibold">
                Ask SatQuery AI
              </h2>

              <p className="text-sm text-slate-500">
                Ask what changed between the two images.
              </p>
            </div>
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: What changes occurred in vegetation and urban development?"
            rows={4}
            className="w-full bg-[#020617] border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 outline-none focus:border-cyan-400 resize-none"
          />

          {/* Suggested questions */}
          <div className="mt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
              Try asking
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                "What major changes occurred?",
                "Did vegetation increase or decrease?",
                "Did urban areas expand?",
                "Are there changes in water bodies?",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setQuestion(item)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            disabled={loading}
            className="mt-7 w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              "Comparing Images..."
            ) : (
              <>
                <Send size={19} />
                Compare with SatQuery AI
              </>
            )}
          </button>
        </div>

        {/* Remote Sensing Analysis */}
        <section className="mt-8 bg-[#0b1224] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Remote Sensing Analysis
              </h2>

              <p className="text-sm text-slate-500">
                Analyze vegetation, water and built-up indicators using satellite data.
              </p>
            </div>
          </div>

          {/* Location and Date */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block mb-2 text-sm text-slate-300">
                Latitude
              </label>

              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-slate-300">
                Longitude
              </label>

              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-slate-300">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-slate-300">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleRemoteSensing}
            disabled={indicesLoading}
            className="mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700 text-slate-950 font-semibold transition"
          >
            {indicesLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <BarChart3 size={18} />
                Calculate Remote-Sensing Indices
              </>
            )}
          </button>

          {/* Error */}
          {indicesError && (
            <div className="mt-5 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
              {indicesError}
            </div>
          )}

          {/* Results */}
          {indices && (
            <div className="mt-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Satellite Indicators
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                {/* NDVI */}
                <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5">
                  <p className="text-sm text-slate-400">
                    NDVI
                  </p>

                  <p className="mt-2 text-3xl font-bold text-green-400">
                    {Number(indices.NDVI).toFixed(4)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Vegetation indicator
                  </p>
                </div>

                {/* NDWI */}
                <div className="p-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                  <p className="text-sm text-slate-400">
                    NDWI
                  </p>

                  <p className="mt-2 text-3xl font-bold text-cyan-400">
                    {Number(indices.NDWI).toFixed(4)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Water indicator
                  </p>
                </div>

                {/* NDBI */}
                <div className="p-5 rounded-xl border border-orange-500/20 bg-orange-500/5">
                  <p className="text-sm text-slate-400">
                    NDBI
                  </p>

                  <p className="mt-2 text-3xl font-bold text-orange-400">
                    {Number(indices.NDBI).toFixed(4)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Built-up area indicator
                  </p>
                </div>
              </div>

              {/* Scientific Note */}
              <div className="mt-5 p-4 rounded-xl border border-slate-800 bg-[#020617]/50">
                <p className="text-xs leading-6 text-slate-500">
                  These indicators are calculated from multispectral Sentinel-2
                  satellite data through Google Earth Engine for the selected
                  location and date range. The uploaded RGB images are not
                  directly used to calculate these indices.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Answer */}
        {answer && (
          <div className="mt-8 bg-[#0b1224] border border-cyan-400/20 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  SatQuery AI Analysis
                </h2>

                <p className="text-sm text-slate-500">
                  Comparison results
                </p>
              </div>
            </div>

            <div className="text-slate-300 leading-7 whitespace-pre-wrap">
              {answer}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-600">
          © 2026 SatQuery AI · Interactive Remote-Sensing Intelligence
        </div>
      </footer>
    </div>
  );
}

export default Compare;