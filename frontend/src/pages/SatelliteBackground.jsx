function SatelliteBackground({ video }) {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src={`${import.meta.env.BASE_URL}satellitevideos/${video}`}
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}

export default SatelliteBackground;