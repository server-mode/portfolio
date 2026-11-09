"use client";

import Hero from "./hero";
import About from "./about";
import Skills from "./skills";
import Projects from "./projects";
import Research from "./research";
import Journey from "./journey";
import Contact from "./contact";

function WaveDivider() {
  return (
    <div aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="strip strip--wave"
        src="/gifs/strip-wave.gif"
        alt=""
        width={1600}
        height={130}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <WaveDivider />
      <About />
      <Skills />
      <Projects />
      <Research />
      <Journey />
      <Contact />
    </>
  );
}
