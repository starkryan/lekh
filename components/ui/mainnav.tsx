import Link from "next/link";
import Image from "next/image";

export function MainNav() {
  return (
    <>
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
        <nav className="px-6 py-2.5 rounded-full border bg-background/80 backdrop-blur-lg shadow-lg hover:shadow-xl hover:bg-background/90 transition-all duration-300">
          <Link 
            href="/" 
            className="flex items-center gap-2.5"
          >
            <div className="relative w-8 h-8 overflow-hidden rounded-full border border-primary/20">
              <Image
                src="/logo.png"
                alt="Likhni Logo"
                fill
                sizes="50px"
                className="object-cover"
                priority
              />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">Likhni</span>
          </Link>
        </nav>
      </header>
      <div className="h-24" aria-hidden="true" />
    </>
  );
}

export default MainNav;