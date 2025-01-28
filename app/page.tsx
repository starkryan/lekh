"use client";

import { useState, useEffect } from "react";
import Content from "@/components/ui/content";
import { MainNav } from "@/components/ui/mainnav";
import { Footer } from "@/components/ui/footer";
import { SplashScreen } from "@/components/ui/splash-screen";
// import TextAnimateDemo from "@/components/animate-text";

export default function Page() {
  const [splashComplete, setSplashComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle initial mount to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash of content before splash screen
  if (!mounted) {
    return null;
  }

  return (
    <>
      {!splashComplete ? (
        <SplashScreen onComplete={() => setSplashComplete(true)} />
      ) : (
        <div className="min-h-screen flex flex-col">
          <MainNav />
          {/* <TextAnimateDemo /> */}
          <main className="flex-1 container mx-auto px-4 py-8">
            <Content />
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}