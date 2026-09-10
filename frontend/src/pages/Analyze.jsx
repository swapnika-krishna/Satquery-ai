import React, { useState, useEffect } from "react";
import axios from "axios";
import SatelliteBackground from "./SatelliteBackground";
import {
  Satellite,
  Upload,
  Send,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

function Analyze() {
  const API_URL = "https://satquery-ai-ep5o.onrender.com";

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
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

  const [datasetScenes, setDatasetScenes] = useState([]);
  const [selectedScene, setSelectedScene] = useState("");
  const [datasetResult, setDatasetResult] = useState(null);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [datasetError, setDatasetError] = useState("");

  /* =========================================================
     LOAD DATASET SCENES
  ========================================================= */

  useEffect(() => {
    const loadDatasetScenes = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/dataset/scenes`
        );

        if (response.data.success) {
          setDatasetScenes(response.data.scenes);
        }
      } catch (error) {
        console.error("Dataset loading error:", error);

        setDatasetError(
          error.response?.data?.error ||
            "Unable to load dataset scenes."
        );
      }
    };

    loadDatasetScenes();
  }, []);

  /* =========================================================
     IMAGE CHANGE
  ========================================================= */

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setAnswer("");
    }
  };

  /* =========================================================
     IMAGE ANALYSIS
  ========================================================= */

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
        `${API_URL}/api/analyze`,
        formData
      );

      if (response.data.success) {
        setAnswer(response.data.answer);
      } else {
        setAnswer(
          response.data.error ||
            "Unable to analyze the image."
        );
      }
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

  /* =========================================================
     REMOTE SENSING ANALYSIS
  ========================================================= */

  const handleRemoteSensing = async () => {
    setIndicesLoading(true);
    setIndices(null);
    setIndicesError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/indices`,
        {
          params: {
            lat: Number(latitude),
            lon: Number(longitude),
            start: startDate,
            end: endDate,
          },
        }
      );

      if (response.data.success) {
        setIndices(response.data.indices);
      } else {
        setIndicesError(
          response.data.error ||
            "Remote sensing analysis failed."
        );
      }
    } catch (error) {
      console.error(
        "Remote sensing error:",
        error
      );

      setIndicesError(
        error.response?.data?.error ||
          "Unable to calculate remote-sensing indices."
      );
    } finally {
      setIndicesLoading(false);
    }
  };

  /* =========================================================
     DATASET ANALYSIS
  ========================================================= */

  const handleDatasetAnalysis = async () => {
    if (!selectedScene) {
      setDatasetError(
        "Please select a dataset scene."
      );
      return;
    }

    setDatasetLoading(true);
    setDatasetResult(null);
    setDatasetError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/dataset/analyze/${selectedScene}`
      );

      if (response.data.success) {
        setDatasetResult(response.data);
      } else {
        setDatasetError(
          response.data.error ||
            "Dataset analysis failed."
        );
      }
    } catch (error) {
      console.error(
        "Dataset analysis error:",
        error
      );

      setDatasetError(
        error.response?.data?.error ||
          "Unable to analyze the selected dataset scene."
      );
    } finally {
      setDatasetLoading(false);
    }
  };

  /* =========================================================
     SUGGESTED QUESTIONS
  ========================================================= */

  const suggestedQuestions = [
    "What land cover is visible?",
    "Are there any water bodies?",
    "Identify urban areas.",
    "Where is vegetation present?",
  ];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-white">

      <SatelliteBackground video="analyze.mp4" />

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="relative z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >

            <div className="rounded-xl bg-cyan-500/10 p-2">

              <Satellite className="h-7 w-7 text-cyan-400" />

            </div>

            <div>

              <h1 className="text-xl font-bold tracking-wide">

                SatQuery{" "}

                <span className="text-cyan-400">
                  AI
                </span>

              </h1>

              <p className="text-xs text-slate-500">
                Remote Sensing Intelligence
              </p>

            </div>

          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
          >

            <ArrowLeft size={16} />

            Dashboard

          </Link>

        </div>

      </nav>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <section className="mb-8">

          <div className="mb-3 flex items-center gap-3">

            <div className="rounded-xl bg-cyan-500/10 p-3">

              <Sparkles className="text-cyan-400" />

            </div>

            <div>

              <h2 className="text-3xl font-bold">
                Image Analysis
              </h2>

              <p className="text-sm text-slate-500">
                Ask natural-language questions about satellite imagery.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            IMAGE UPLOAD + QUESTION
        =================================================== */}

        <section className="grid gap-6 lg:grid-cols-2">

          {/* =================================================
              UPLOAD
          ================================================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

            <div className="mb-5 flex items-center gap-3">

              <ImageIcon className="text-cyan-400" />

              <div>

                <h3 className="font-semibold">
                  Satellite Image
                </h3>

                <p className="text-sm text-slate-500">
                  Upload an image for AI analysis
                </p>

              </div>

            </div>


            {!preview ? (

              <label className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 transition hover:border-cyan-500 hover:bg-slate-900">

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
                  className="h-[400px] w-full object-cover"
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


          {/* =================================================
              QUESTION
          ================================================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

            <div className="mb-5 flex items-center gap-3">

              <Sparkles className="text-cyan-400" />

              <div>

                <h3 className="font-semibold">
                  Ask SatQuery AI
                </h3>

                <p className="text-sm text-slate-500">
                  Ask anything about the uploaded image
                </p>

              </div>

            </div>


            {/* QUESTION */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Your Question
              </label>

              <textarea
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                placeholder="Example: What water bodies are visible in this image?"
                className="h-[160px] w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
              />

            </div>


            {/* SUGGESTED QUESTIONS */}

            <div className="mb-6">

              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Try asking
              </p>

              <div className="flex flex-wrap gap-2">

                {suggestedQuestions.map(
                  (item) => (

                    <button
                      key={item}
                      onClick={() =>
                        setQuestion(item)
                      }
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400 transition hover:border-cyan-500 hover:text-cyan-400"
                    >
                      {item}
                    </button>

                  )
                )}

              </div>

            </div>


            {/* ANALYZE BUTTON */}

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


        {/* =====================================================
            REMOTE SENSING ANALYSIS
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-blue-500/10 p-2">

              <BarChart3
                className="text-blue-400"
                size={20}
              />

            </div>

            <div>

              <h3 className="font-semibold">
                Remote Sensing Analysis
              </h3>

              <p className="text-sm text-slate-500">
                Calculate satellite-derived vegetation, water and built-up indicators.
              </p>

            </div>

          </div>


          {/* LOCATION AND DATE */}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* LATITUDE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Latitude
              </label>

              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) =>
                  setLatitude(e.target.value)
                }
                placeholder="16.30"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />

            </div>


            {/* LONGITUDE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Longitude
              </label>

              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) =>
                  setLongitude(e.target.value)
                }
                placeholder="80.44"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />

            </div>


            {/* START DATE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />

            </div>


            {/* END DATE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />

            </div>

          </div>


          {/* =================================================
              LOCAL SATELLITE DATASET
          ================================================= */}

          <div className="mt-8 border-t border-slate-800 pt-6">

            <div className="mb-5">

              <h4 className="text-lg font-semibold text-white">
                Local Satellite Dataset
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Analyze multispectral satellite bands from the SatQuery AI dataset.
              </p>

            </div>


            <div className="grid gap-4 md:grid-cols-[1fr_auto]">

              {/* SCENE SELECTOR */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Select Satellite Scene
                </label>

                <select
                  value={selectedScene}
                  onChange={(e) => {

                    setSelectedScene(
                      e.target.value
                    );

                    setDatasetResult(null);
                    setDatasetError("");

                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                >

                  <option value="">
                    Select a scene
                  </option>

                  {datasetScenes.map(
                    (scene) => (

                      <option
                        key={scene.scene_id}
                        value={scene.scene_id}
                      >
                        {scene.scene_id}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* DATASET ANALYZE BUTTON */}

              <div className="flex items-end">

                <button
                  onClick={handleDatasetAnalysis}
                  disabled={datasetLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                >

                  {datasetLoading ? (

                    <>

                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />

                      Analyzing...

                    </>

                  ) : (

                    <>

                      <BarChart3 size={18} />

                      Analyze Dataset

                    </>

                  )}

                </button>

              </div>

            </div>


            {/* DATASET ERROR */}

            {datasetError && (

              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">

                {datasetError}

              </div>

            )}


            {/* DATASET RESULTS */}

            {datasetResult && (

              <div className="mt-6">

                <div className="mb-4 flex items-center justify-between">

                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Dataset Analysis Results
                  </h4>

                  <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">

                    {datasetResult.scene.id}

                  </span>

                </div>


                <div className="grid gap-4 md:grid-cols-3">

                  {/* NDVI */}

                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">

                    <p className="text-sm text-slate-400">
                      NDVI
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-400">

                      {Number(
                        datasetResult
                          .indices
                          .NDVI
                          .statistics
                          .mean
                      ).toFixed(4)}

                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Vegetation indicator
                    </p>

                    <div className="mt-4 text-xs text-slate-500">

                      Range:{" "}

                      {Number(
                        datasetResult
                          .indices
                          .NDVI
                          .statistics
                          .min
                      ).toFixed(4)}

                      {" "}to{" "}

                      {Number(
                        datasetResult
                          .indices
                          .NDVI
                          .statistics
                          .max
                      ).toFixed(4)}

                    </div>

                  </div>


                  {/* NDWI */}

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">

                    <p className="text-sm text-slate-400">
                      NDWI
                    </p>

                    <p className="mt-2 text-3xl font-bold text-blue-400">

                      {Number(
                        datasetResult
                          .indices
                          .NDWI
                          .statistics
                          .mean
                      ).toFixed(4)}

                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Water indicator
                    </p>

                    <div className="mt-4 text-xs text-slate-500">

                      Range:{" "}

                      {Number(
                        datasetResult
                          .indices
                          .NDWI
                          .statistics
                          .min
                      ).toFixed(4)}

                      {" "}to{" "}

                      {Number(
                        datasetResult
                          .indices
                          .NDWI
                          .statistics
                          .max
                      ).toFixed(4)}

                    </div>

                  </div>


                  {/* NDBI */}

                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">

                    <p className="text-sm text-slate-400">
                      NDBI
                    </p>

                    <p className="mt-2 text-3xl font-bold text-orange-400">

                      {Number(
                        datasetResult
                          .indices
                          .NDBI
                          .statistics
                          .mean
                      ).toFixed(4)}

                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Built-up area indicator
                    </p>

                    <div className="mt-4 text-xs text-slate-500">

                      Range:{" "}

                      {Number(
                        datasetResult
                          .indices
                          .NDBI
                          .statistics
                          .min
                      ).toFixed(4)}

                      {" "}to{" "}

                      {Number(
                        datasetResult
                          .indices
                          .NDBI
                          .statistics
                          .max
                      ).toFixed(4)}

                    </div>

                  </div>

                </div>


                {/* DATASET INFORMATION */}

                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                  <p className="text-xs leading-6 text-slate-500">

                    Indices are calculated dynamically from the scene's
                    B03 (Green), B04 (Red), B08 (NIR), and B11 (SWIR)
                    multispectral bands. The dataset scene is used as the
                    analysis source.

                  </p>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              CALCULATE BUTTON
          ================================================= */}

          <button
            onClick={handleRemoteSensing}
            disabled={indicesLoading}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {indicesLoading ? (

              <>

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />

                Calculating...

              </>

            ) : (

              <>

                <BarChart3 size={18} />

                Calculate Remote-Sensing Indices

              </>

            )}

          </button>


          {/* =================================================
              REMOTE SENSING ERROR
          ================================================= */}

          {indicesError && (

            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">

              {indicesError}

            </div>

          )}


          {/* =================================================
              REMOTE SENSING RESULTS
          ================================================= */}

          {indices && (

            <div className="mt-6">

              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Satellite Indicators
              </h4>


              <div className="grid gap-4 md:grid-cols-3">

                {/* NDVI */}

                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">

                  <p className="text-sm text-slate-400">
                    NDVI
                  </p>

                  <p className="mt-2 text-3xl font-bold text-green-400">

                    {Number(
                      indices.NDVI
                    ).toFixed(4)}

                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Vegetation indicator
                  </p>

                </div>


                {/* NDWI */}

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">

                  <p className="text-sm text-slate-400">
                    NDWI
                  </p>

                  <p className="mt-2 text-3xl font-bold text-cyan-400">

                    {Number(
                      indices.NDWI
                    ).toFixed(4)}

                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Water indicator
                  </p>

                </div>


                {/* NDBI */}

                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">

                  <p className="text-sm text-slate-400">
                    NDBI
                  </p>

                  <p className="mt-2 text-3xl font-bold text-orange-400">

                    {Number(
                      indices.NDBI
                    ).toFixed(4)}

                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Built-up area indicator
                  </p>

                </div>

              </div>


              {/* SCIENTIFIC NOTE */}

              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                <p className="text-xs leading-6 text-slate-500">

                  These indicators are calculated from multispectral Sentinel-2
                  satellite data through Google Earth Engine for the selected
                  location and date range. The uploaded RGB image itself is not
                  used to directly calculate these indices.

                </p>

              </div>

            </div>

          )}

        </section>


        {/* =====================================================
            AI RESPONSE
        ===================================================== */}

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


          {/* EMPTY STATE */}

          {!answer && !loading && (

            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50 text-center">

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


          {/* LOADING */}

          {loading && (

            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50">

              <div className="text-center">

                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

                <p className="text-slate-400">
                  SatQuery AI is analyzing the satellite image...
                </p>

              </div>

            </div>

          )}


          {/* ANSWER */}

          {answer && !loading && (

            <div className="rounded-xl border border-cyan-500/20 bg-slate-950/70 p-5">

              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">

                {answer}

              </div>

            </div>

          )}

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="relative z-10 border-t border-slate-800 py-6 text-center text-sm text-slate-600">

        SatQuery AI • Intelligent Remote-Sensing Image Analysis

      </footer>

    </div>
  );
}

export default Analyze;