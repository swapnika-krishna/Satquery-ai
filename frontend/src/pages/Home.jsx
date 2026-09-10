import {
  Satellite,
  Sparkles,
  Map,
  Activity,
  ArrowRight,
  ImageIcon,
  Brain,
  Globe2,
} from "lucide-react";
import { Link } from "react-router-dom";
import SatelliteBackground from "./SatelliteBackground";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
<SatelliteBackground video="Home.mp4" />
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
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
          </Link>

          {/* Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-slate-400 transition hover:text-cyan-400"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm text-slate-400 transition hover:text-cyan-400"
            >
              How It Works
            </a>

            <a
              href="#applications"
              className="text-sm text-slate-400 transition hover:text-cyan-400"
            >
              Applications
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:text-white sm:block"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Get Started
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <main>

        <section className="relative overflow-hidden">

          {/* Background glow */}
          <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">

            <div className="mx-auto max-w-4xl text-center">

              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                <Sparkles size={16} />
                Vision-Language AI for Remote Sensing
              </div>

              {/* Heading */}
              <h2 className="text-5xl font-bold tracking-tight md:text-7xl">
                Ask Questions.
                <br />

                <span className="text-cyan-400">
                  Understand Satellite Imagery.
                </span>
              </h2>

              {/* Description */}
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
                SatQuery AI combines multimodal Vision-Language AI with
                satellite data analysis to help you understand remote-sensing
                imagery using natural language.
              </p>

              {/* Buttons */}
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">

                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Start Analyzing
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/analyze"
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-cyan-400"
                >
                  Try Image Analysis
                </Link>

              </div>

            </div>

            {/* Hero Visual */}
            <div className="mx-auto mt-16 max-w-5xl">

              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-3 shadow-2xl">

                <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">

                  <div className="text-center">

                    <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
                      <Globe2 className="h-12 w-12 text-cyan-400" />
                    </div>

                    <h3 className="text-xl font-semibold">
                      Satellite Intelligence
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Image understanding • Remote sensing • Natural language
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-slate-800 bg-slate-900/30"
        >

          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                Core Capabilities
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                Intelligent Satellite Analysis
              </h3>

              <p className="mt-4 text-slate-400">
                Analyze satellite imagery through AI-powered visual
                understanding and quantitative remote-sensing techniques.
              </p>

            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">

              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-cyan-500/40">

                <div className="mb-5 inline-flex rounded-xl bg-cyan-500/10 p-3">
                  <Brain className="text-cyan-400" />
                </div>

                <h4 className="text-lg font-semibold">
                  Vision-Language AI
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Upload satellite imagery and ask questions using natural
                  language. The AI interprets visible land-cover features.
                </p>

              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-cyan-500/40">

                <div className="mb-5 inline-flex rounded-xl bg-cyan-500/10 p-3">
                  <Map className="text-cyan-400" />
                </div>

                <h4 className="text-lg font-semibold">
                  Remote Sensing
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Calculate NDVI, NDWI and NDBI using multispectral satellite
                  data through Google Earth Engine.
                </p>

              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-cyan-500/40">

                <div className="mb-5 inline-flex rounded-xl bg-cyan-500/10 p-3">
                  <Activity className="text-cyan-400" />
                </div>

                <h4 className="text-lg font-semibold">
                  Image Comparison
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Compare two satellite images and identify visible changes
                  in vegetation, water, buildings and land use.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* Workflow */}
        <section id="workflow">

          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                Simple Workflow
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                From Image to Intelligence
              </h3>

            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                  <ImageIcon />
                </div>

                <h4 className="mt-4 font-semibold">
                  1. Upload
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  Upload a satellite or remote-sensing image.
                </p>

              </div>

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                  <Sparkles />
                </div>

                <h4 className="mt-4 font-semibold">
                  2. Ask
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  Ask questions about the scene using natural language.
                </p>

              </div>

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                  <Activity />
                </div>

                <h4 className="mt-4 font-semibold">
                  3. Analyze
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  Receive AI insights and quantitative remote-sensing results.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* Applications */}
        <section
          id="applications"
          className="border-t border-slate-800 bg-slate-900/30"
        >

          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                Applications
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                Built for Real-World Remote Sensing
              </h3>

            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">

              {[
                "Agriculture Monitoring",
                "Urban Development",
                "Water Resources",
                "Disaster Management",
                "Forest Monitoring",
                "Land-Cover Analysis",
                "Environmental Monitoring",
                "Infrastructure Mapping",
              ].map((item) => (

                <div
                  key={item}
                  className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm text-slate-300"
                >
                  {item}
                </div>

              ))}

            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">

          <div className="flex items-center gap-2">

            <Satellite className="text-cyan-400" size={20} />

            <span className="font-semibold">
              SatQuery <span className="text-cyan-400">AI</span>
            </span>

          </div>

          <p className="text-sm text-slate-600">
            Intelligent Remote-Sensing Image Analysis
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;