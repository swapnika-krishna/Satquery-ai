import { useState } from "react";
import axios from "axios";
import SatelliteBackground from "./SatelliteBackground";
import {
  Satellite,
  ArrowLeft,
  Send,
  Sparkles,
  Bot,
} from "lucide-react";
import { Link } from "react-router-dom";

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    // Get logged-in user information
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      alert("Please login to use the AI Assistant.");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      alert("Please login again.");
      return;
    }

    if (!user.id) {
      alert("User information is missing. Please login again.");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const response = await axios.post(
        "https://satquery-ai-ep5o.onrender.com/api/chat",
        {
          question: question.trim(),
          userId: user.id,
        }
      );

      setAnswer(response.data.answer);

      // Clear question after successful request
      setQuestion("");

    } catch (error) {
      console.error("AI Assistant error:", error);

      setAnswer(
        error.response?.data?.error ||
          "Unable to get a response. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-white">

      {/* Satellite Background */}
      <SatelliteBackground video="ai-assistant.mp4" />

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
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">

          <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 mb-5">
            <Bot className="w-8 h-8 text-cyan-400" />
          </div>

          <h1 className="text-4xl font-bold">
            SatQuery AI Assistant
          </h1>

          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Ask questions about remote sensing, satellite technology,
            Earth observation, AI, and general topics without uploading an image.
          </p>

        </div>

        {/* Question Box */}
        <section className="bg-[#0b1224]/95 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2 rounded-lg bg-purple-500/10">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>

            <div>
              <h2 className="font-semibold">
                Ask the AI
              </h2>

              <p className="text-sm text-slate-500">
                No image is required for this mode.
              </p>
            </div>

          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Example: What is NDVI and why is it useful?"
            rows={6}
            className="w-full bg-[#020617] border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 outline-none focus:border-cyan-400 resize-none"
          />

          <button
            onClick={handleAsk}
            disabled={loading}
            className="mt-5 w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send size={19} />
                Ask SatQuery AI
              </>
            )}
          </button>

        </section>

        {/* AI Response */}
        {answer && (
          <section className="relative z-10 mt-8 bg-[#0b1224]/95 border border-cyan-400/20 rounded-2xl p-7">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  SatQuery AI
                </h2>

                <p className="text-sm text-slate-500">
                  AI Assistant response
                </p>
              </div>

            </div>

            <div className="text-slate-300 leading-7 whitespace-pre-wrap">
              {answer}
            </div>

          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 mt-10 bg-[#020617]/80">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-600">
          © 2026 SatQuery AI · Interactive Remote-Sensing Intelligence
        </div>
      </footer>

    </div>
  );
}

export default AIAssistant;