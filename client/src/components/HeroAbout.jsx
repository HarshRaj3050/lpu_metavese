import React from "react";

const HeroAbout = () => {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center px-10 md:px-20 py-16 relative overflow-hidden">
      
      {/* Background subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(30,60,120,0.3),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-12">

        {/* LEFT SIDE */}
        <div className="flex-1 max-w-xl">
          <p className="text-blue-400 text-sm font-bold tracking-[0.3em] uppercase italic mb-2">
            About
          </p>

          <h1
            className="text-4xl md:text-5xl font-black text-white uppercase mb-6 leading-tight"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.05em" }}
          >
            The Magiccraft
          </h1>

          <p className="text-gray-300 text-sm uppercase leading-relaxed tracking-wide mb-8 font-medium">
            Magiccraft is a PVP war game. Level up with your friends, fight each
            other, earn real money through $MCRT cryptocurrency in the game.
            When you die you can drop real money and items which makes the
            stakes more intense. The first real PVP castle siege play-to-earn
            game.
          </p>

          {/* Primary Buttons */}
          <div className="flex gap-4 mb-5 flex-wrap">
            <button className="px-6 py-2.5 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest clip-btn hover:bg-blue-400 transition-all duration-200"
              style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
              Beta Testing
            </button>
            <button className="px-6 py-2.5 border border-blue-400 text-blue-300 text-xs font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all duration-200"
              style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
              Marketplace
            </button>
          </div>

          {/* Secondary Buttons */}
          <div className="flex gap-3 flex-wrap">
            {["Buy $MCRT", "Whitepaper", "Become a Partner", "Mint NFT"].map((label) => (
              <button
                key={label}
                className="px-4 py-2 border border-blue-500/50 text-blue-300 text-xs font-semibold uppercase tracking-wider hover:border-blue-400 hover:text-white transition-all duration-200"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE — Single Image Box */}
        <div className="flex-shrink-0 w-64 md:w-72">
          <div
            className="relative overflow-hidden group cursor-pointer"
            style={{
              clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
              border: "1px solid rgba(59,130,246,0.6)",
            }}
          >
            {/* Image Placeholder */}
            <div className="w-full h-96 bg-gradient-to-b from-orange-400 via-pink-500 to-yellow-300 flex items-center justify-center">
              <span className="text-white/40 text-sm uppercase tracking-widest">Character Image</span>
            </div>

            {/* Blue corner accent */}
            <div className="absolute top-0 right-0 w-8 h-1 bg-blue-400" />
            <div className="absolute top-0 right-0 w-1 h-8 bg-blue-400" />

            {/* Bottom Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-pink-500/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
              <span className="text-white text-xs font-bold uppercase tracking-widest">
                Mint NFT
              </span>
              <span className="text-white text-lg">→</span>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

      </div>

      {/* Orbitron font import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');`}</style>
    </div>
  );
};

export default HeroAbout;