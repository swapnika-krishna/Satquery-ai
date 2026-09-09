import { useState } from "react";
import axios from "axios";
import {
  Satellite,
  Upload,
  Send,
  Image as ImageIcon,
  Sparkles,
  Map,
  Activity,
  ShieldCheck,
} from "lucide-react";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setAnswer("");
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      alert("Please upload a satellite image.");
      return;
    }

    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    setLoading(true);
    setAnswer("");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("question", question);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/analyze",
        formData
      );

      setAnswer(response.data.answer);
    } catch (error) {
      console.error(error);

      setAnswer(
        "Unable to analyze the image. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2">
              <Satellite className="h-7 w-7 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">
                SatQuery <span className="text-cyan-400">AI</span>
              </h1>

              <p className="text-xs text-slate-500">
                Remote Sensing Intelligence
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <span className="flex items-center gap-2">
              <Map size={16} />
              Satellite Analysis
            </span>

            <span className="flex items-center gap-2">
              <Activity size={16} />
              AI Powered
            </span>

            <span className="flex items-center gap-2">
              <ShieldCheck size={16} />
              Intelligent Vision
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        
        <section className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            <Sparkles size={16} />
            Vision-Language Remote Sensing Assistant
          </div>

          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Ask Questions About
            <span className="text-cyan-400"> Satellite Images</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Upload a remote-sensing image, ask a natural-language question,
            and let SatQuery AI analyze the scene using multimodal AI.
          </p>
        </section>

        {/* Main Grid */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* Upload Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            
            <div className="mb-5 flex items-center gap-3">
              <ImageIcon className="text-cyan-400" />

              <div>
                <h3 className="font-semibold">Satellite Image</h3>
                <p className="text-sm text-slate-500">
                  Upload an image for analysis
                </p>
              </div>
            </div>

            {!preview ? (
              <label className="flex min-h-[350px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 transition hover:border-cyan-500 hover:bg-slate-900">
                
                <div className="mb-4 rounded-full bg-cyan-500/10 p-5">
                  <Upload className="h-10 w-10 text-cyan-400" />
                </div>

                <p className="font-medium">
                  Upload Satellite Image
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  PNG, JPG or JPEG
                </p>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-slate-700">
                
                <img
                  src={preview}
                  alt="Satellite preview"
                  className="h-[350px] w-full object-cover"
                />

                <label className="absolute bottom-4 right-4 cursor-pointer rounded-lg bg-slate-950/90 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-cyan-500">
                  Change Image

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Query Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            
            <div className="mb-5 flex items-center gap-3">
              <Sparkles className="text-cyan-400" />

              <div>
                <h3 className="font-semibold">Ask SatQuery AI</h3>

                <p className="text-sm text-slate-500">
                  Ask anything about the image
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Your Question
              </label>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Example: What water bodies are visible in this image?"
                className="h-[150px] w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
              />
            </div>

            {/* Example Questions */}
            <div className="mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Try asking
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "What land cover is visible?",
                  "Are there any water bodies?",
                  "Identify urban areas.",
                  "Where is vegetation present?",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuestion(item)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400 transition hover:border-cyan-500 hover:text-cyan-400"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Analyze with SatQuery AI
                </>
              )}
            </button>
          </div>
        </section>

        {/* AI Response */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2">
              <Sparkles className="text-cyan-400" size={20} />
            </div>

            <div>
              <h3 className="font-semibold">AI Analysis</h3>

              <p className="text-sm text-slate-500">
                SatQuery AI's interpretation of your satellite image
              </p>
            </div>
          </div>

          {!answer && !loading && (
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50 text-center">
              <div>
                <Satellite className="mx-auto mb-3 text-slate-700" size={40} />

                <p className="text-slate-500">
                  Upload an image and ask a question to begin analysis.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

                <p className="text-slate-400">
                  SatQuery AI is analyzing the satellite image...
                </p>
              </div>
            </div>
          )}

          {answer && !loading && (
            <div className="rounded-xl border border-cyan-500/20 bg-slate-950/70 p-5">
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {answer}
              </div>
            </div>
          )}
        </section>

        {/* Feature Cards */}
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <Satellite className="mb-3 text-cyan-400" />
            <h4 className="font-semibold">Multimodal AI</h4>
            <p className="mt-2 text-sm text-slate-500">
              Understand satellite imagery using vision-language AI.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <Map className="mb-3 text-cyan-400" />
            <h4 className="font-semibold">Remote Sensing</h4>
            <p className="mt-2 text-sm text-slate-500">
              Analyze vegetation, water, buildings, roads and land cover.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <Activity className="mb-3 text-cyan-400" />
            <h4 className="font-semibold">Natural Language Queries</h4>
            <p className="mt-2 text-sm text-slate-500">
              Ask questions naturally instead of using complex GIS tools.
            </p>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-600">
        SatQuery AI • Intelligent Remote-Sensing Image Analysis
      </footer>
    </div>
  );
}

export default App;