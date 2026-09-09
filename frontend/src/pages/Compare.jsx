import { useState } from "react";
import axios from "axios";
import {
  Satellite,
  Upload,
  Send,
  ArrowLeft,
  GitCompare,
  Sparkles,
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
        "http://localhost:5000/api/compare",
        formData
      );

      setAnswer(response.data.answer);
    } catch (error) {
      console.error(error);

      setAnswer(
        error.response?.data?.error ||
          "Unable to compare the images. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
      <footer className="border-t border-slate-800 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-600">
          © 2026 SatQuery AI · Interactive Remote-Sensing Intelligence
        </div>
      </footer>

    </div>
  );
}

export default Compare;