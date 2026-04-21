import React, { useState } from "react";
import { Link } from "react-router-dom";
import Menu from "../components/Menu";
import homeVideo from "../assets/homeVideo.mp4";
import HeroAbout from "../components/HeroAbout";
import Shuffle from "../components/animation/Shuffle";

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="overflow-x-hidden">
      {/* Menu - no more full-screen click wrapper */}
      <Menu onMenuToggle={setMenuOpen} />

      {/* Hero Section */}
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
        <div className="absolute top-0 left-0 w-full h-full flex items-center flex-col gap-2 justify-center z-100 px-4 text-center">
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
          <Link to="/signup" className="bg-amber-200" >Enter the Virtual World</Link>
        </div>
      </div>

      <HeroAbout />
    </div>
  );
};

export default Home;