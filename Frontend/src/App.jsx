import React, { useState } from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import { TrustBar } from "../components/landing/TrustBar";
import { Pipeline } from "../components/landing/Pipeline";
import { HomeDashboard } from "../components/landing/HomeDashboard";
import { Footer } from "../components/landing/Footer";

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <Hero />

      <TrustBar />

      <Pipeline />

      <HomeDashboard />

      <Footer />
    </div>
  );
};

export default App;
