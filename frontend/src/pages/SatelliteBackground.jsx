function SatelliteBackground({ video }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
  src={`/satellitevideos/${video}`}
  type="video/mp4"
/>
      </video>

      {/* Very subtle dark overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Subtle atmospheric gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/10 via-transparent to-purple-950/15" />
    </div>
  );
}

export default SatelliteBackground;