"use client";

import { TextAnimate } from "./text-animate";
import { useState, useEffect } from "react";

const taglines = [
  "Your Digital Assistant",
  "Smart Email Writer",
  "YouTube Script Generator",
  "Content Creation Made Easy"
];

export function BlurText() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % taglines.length);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <TextAnimate 
      animation="blurInUp" 
      by="character" 
      as="span" 
      className="text-muted-foreground"
      duration={0.5}
      key={currentIndex}
    >
      {taglines[currentIndex]}
    </TextAnimate>
  );    
}

export default BlurText;
