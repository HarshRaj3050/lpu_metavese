import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Menu from "../components/Menu";
import homeVideo from "../assets/homeVideo.mp4";
import HeroAbout from "../components/HeroAbout";
import Shuffle from "../components/animation/Shuffle";

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 720);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 720);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isSmallScreen) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-5xl">💻</span>
        <h1 className="text-white text-2xl font-bold">Better on a bigger screen</h1>
        <p className="text-gray-400 text-sm max-w-xs">
          Please open this site on a laptop or desktop for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <Menu onMenuToggle={setMenuOpen} />

      <div
        className={`w-dvw h-screen relative overflow-hidden bg-black transition-all duration-300 ${
          menuOpen ? "blur-md scale-105" : "blur-0 scale-100"
        }`}
      >
        <video
          src={homeVideo}
          autoPlay
          loop
          muted
          className="w-full h-full object-cover absolute opacity-50 top-0 left-0"
        />
        <div className="absolute top-0 left-0 w-full h-full flex items-center flex-col gap-3 justify-center z-100 px-4 text-center">
          <h1 className="text-5xl w-250 md:text-6xl font-bold text-white">
            <Shuffle
              text="Your virtual hangout for college life"
              shuffleDirection="right"
              duration={0.4}
              animationMode="evenodd"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.03}
              threshold={0.1}
              triggerOnce={true}
              triggerOnHover
              respectReducedMotion={true}
              loop
              loopDelay={5}
            />
          </h1>
          <Link
            to="/signup"
            className="bg-amber-200 border-2 border-white px-5 py-1 rounded-lg font-semibold"
          >
            Enter the Virtual Campus
          </Link>
        </div>
      </div>

      <HeroAbout />
    </div>
  );
};

export default Home;