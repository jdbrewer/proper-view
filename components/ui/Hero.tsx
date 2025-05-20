"use client";

export default function Hero() {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src="/images/hero_home.jpg"
        alt="Modern home exterior"
        className="absolute inset-0 w-full h-full object-cover object-[center_60%] z-0"
        draggable={false}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-blue-900/30 z-10" />
      {/* Text Content */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-center">
        <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg mb-2">
          The Proper View.
        </h1>
        <h2 className="text-white text-3xl md:text-5xl font-extrabold drop-shadow-lg">
          Your Home Awaits.
        </h2>
      </div>
    </section>
  );
} 