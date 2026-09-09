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

  const [indices, setIndices] = useState(null);

  const [latitude, setLatitude] = useState("16.30");
  const [longitude, setLongitude] = useState("80.44");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-02-01");
  const [compareImage1, setCompareImage1] = useState(null);
const [compareImage2, setCompareImage2] = useState(null);

const [comparePreview1, setComparePreview1] = useState(null);
const [comparePreview2, setComparePreview2] = useState(null);

const [compareQuestion, setCompareQuestion] = useState("");
const [compareAnswer, setCompareAnswer] = useState("");
const [compareLoading, setCompareLoading] = useState(false);

  const getIndices = async () => {
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

      console.log("Earth Engine Results:", response.data);

      setIndices(response.data.indices);
    } catch (error) {
      console.error("Earth Engine error:", error);
    }
  };
  const getIndexInterpretation = (type, value) => {
  if (value === undefined || value === null) {
    return "No data available";
  }

  if (type === "NDVI") {
    if (value < 0) return "Very low vegetation";
    if (value < 0.2) return "Low vegetation";
    if (value < 0.5) return "Moderate vegetation";
    return "High vegetation";
  }

  if (type === "NDWI") {
    if (value < 0) return "Low water presence";
    if (value < 0.3) return "Moderate water presence";
    return "High water presence";
  }

  if (type === "NDBI") {
    if (value < 0) return "Low built-up signal";
    if (value < 0.2) return "Moderate built-up signal";
    return "High built-up signal";
  }

  return "Analysis available";
};

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
        console.error("Analysis error:", error);

        setAnswer(
        error.response?.data?.error ||
        error.message ||
        "Unable to analyze the image."
        );
      
    } finally {
      setLoading(false);
    }
  };
  const handleCompare = async () => {
  if (!compareImage1 || !compareImage2) {
    alert("Please upload both images.");
    return;
  }

  setCompareLoading(true);
  setCompareAnswer("");

  const formData = new FormData();

  formData.append("image1", compareImage1);
  formData.append("image2", compareImage2);
  formData.append("question", compareQuestion);

  try {
    const response = await axios.post(
      "http://localhost:5000/api/compare",
      formData
    );

    setCompareAnswer(response.data.answer);
  } catch (error) {
    console.error("Comparison error:", error);

    setCompareAnswer(
      error.response?.data?.error ||
      error.message ||
      "Unable to compare images."
    );
  } finally {
    setCompareLoading(false);
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
            <span className="text-cyan-400">
              {" "}Satellite Images
            </span>
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
                <h3 className="font-semibold">
                  Satellite Image
                </h3>

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
                <h3 className="font-semibold">
                  Ask SatQuery AI
                </h3>

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

            {/* Gemini Analyze Button */}
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

            {/* Remote Sensing Inputs */}
            <div className="mt-4">

              <div className="mb-3">
                <h3 className="font-semibold text-white">
                  Remote Sensing Analysis
                </h3>

                <p className="text-sm text-slate-500">
                  Select a location and date range for satellite analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* Latitude */}
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 16.30"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 80.44"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

              </div>

            </div>

            {/* Remote Sensing Button */}
            <button
              onClick={getIndices}
              className="mt-4 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-500"
            >
              Analyze Remote Sensing
            </button>

            {/* Index Results */}
            {indices && (

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                {/* NDVI */}
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    NDVI
                  </p>

                  <p className="mt-2 text-2xl font-bold text-green-400">
                    {indices.NDVI?.toFixed(4)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
  {getIndexInterpretation("NDVI", indices.NDVI)}
</p>


                </div>

                {/* NDWI */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    NDWI
                  </p>

                  <p className="mt-2 text-2xl font-bold text-blue-400">
                    {indices.NDWI?.toFixed(4)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
  {getIndexInterpretation("NDWI", indices.NDWI)}
</p>

                </div>

                {/* NDBI */}
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    NDBI
                  </p>

                  <p className="mt-2 text-2xl font-bold text-orange-400">
                    {indices.NDBI?.toFixed(4)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
  {getIndexInterpretation("NDBI", indices.NDBI)}
</p>

                </div>

              </div>

            )}

          </div>

        </section>

        {/* AI Response */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

          <div className="mb-5 flex items-center gap-3">

            <div className="rounded-lg bg-cyan-500/10 p-2">
              <Sparkles
                className="text-cyan-400"
                size={20}
              />
            </div>

            <div>

              <h3 className="font-semibold">
                AI Analysis
              </h3>

              <p className="text-sm text-slate-500">
                SatQuery AI's interpretation of your satellite image
              </p>

            </div>

          </div>

          {/* Empty State */}
          {!answer && !loading && (

            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50 text-center">

              <div>

                <Satellite
                  className="mx-auto mb-3 text-slate-700"
                  size={40}
                />

                <p className="text-slate-500">
                  Upload an image and ask a question to begin analysis.
                </p>

              </div>

            </div>

          )}

          {/* Loading State */}
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

          {/* Answer */}
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

            <h4 className="font-semibold">
              Multimodal AI
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Understand satellite imagery using vision-language AI.
            </p>

          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

            <Map className="mb-3 text-cyan-400" />

            <h4 className="font-semibold">
              Remote Sensing
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Analyze vegetation, water, buildings, roads and land cover.
            </p>

          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

            <Activity className="mb-3 text-cyan-400" />

            <h4 className="font-semibold">
              Natural Language Queries
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Ask questions naturally instead of using complex GIS tools.
            </p>

          </div>

        </section>
{/* Multiple Image Comparison */}
<div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-6">

  <div className="mb-6">
    <h2 className="text-xl font-semibold text-white">
      Compare Satellite Images
    </h2>

    <p className="mt-1 text-sm text-slate-400">
      Upload two satellite images to identify changes between them.
    </p>
  </div>

  {/* Image Uploads */}
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

    {/* Image 1 */}
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        Image 1
      </label>

      <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600 bg-slate-950/50 p-4 transition hover:border-cyan-400">

        {comparePreview1 ? (
          <img
            src={comparePreview1}
            alt="Image 1 preview"
            className="max-h-48 w-full rounded-lg object-contain"
          />
        ) : (
          <>
            <span className="text-4xl">🛰️</span>
            <p className="mt-3 text-sm text-slate-300">
              Click to upload Image 1
            </p>
            <p className="mt-1 text-xs text-slate-500">
              PNG, JPG or JPEG
            </p>
          </>
        )}

        <input
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              setCompareImage1(file);
              setComparePreview1(URL.createObjectURL(file));
            }
          }}
        />
      </label>
    </div>

    {/* Image 2 */}
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        Image 2
      </label>

      <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600 bg-slate-950/50 p-4 transition hover:border-cyan-400">

        {comparePreview2 ? (
          <img
            src={comparePreview2}
            alt="Image 2 preview"
            className="max-h-48 w-full rounded-lg object-contain"
          />
        ) : (
          <>
            <span className="text-4xl">🛰️</span>
            <p className="mt-3 text-sm text-slate-300">
              Click to upload Image 2
            </p>
            <p className="mt-1 text-xs text-slate-500">
              PNG, JPG or JPEG
            </p>
          </>
        )}

        <input
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              setCompareImage2(file);
              setComparePreview2(URL.createObjectURL(file));
            }
          }}
        />
      </label>
    </div>

  </div>

  {/* Question */}
  <div className="mt-6">
    <label className="mb-2 block text-sm font-medium text-slate-300">
      Ask about the changes
    </label>

    <input
      type="text"
      value={compareQuestion}
      onChange={(e) => setCompareQuestion(e.target.value)}
      placeholder="Example: What changed in vegetation and buildings?"
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
    />
  </div>

  {/* Compare Button */}
  <button
    onClick={handleCompare}
    disabled={compareLoading}
    className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {compareLoading ? "Comparing..." : "Compare Images"}
  </button>

  {/* Result */}
  {compareAnswer && (
    <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-5">

      <h3 className="mb-3 font-semibold text-cyan-400">
        Comparison Result
      </h3>

      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
        {compareAnswer}
      </p>

    </div>
  )}

</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-600">
        SatQuery AI • Intelligent Remote-Sensing Image Analysis
      </footer>

    </div>
  );
}

export default App;