export function DotPattern() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full select-none">
      <div className="relative h-full w-full opacity-30">
        <div className="absolute h-[30rem] w-[30rem] -translate-y-1/2 translate-x-[-40%] rounded-full bg-gradient-to-r from-primary/40 to-primary/20 blur-3xl" />
        <div className="absolute right-0 h-[20rem] w-[20rem] translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-l from-primary/40 to-primary/20 blur-3xl" />
        <svg
          className="absolute inset-0 h-full w-full"
          style={{
            maskImage: "radial-gradient(circle at center, transparent 0%, black 100%)",
          }}
        >
          <defs>
            <pattern
              id="dotPattern"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <rect width="1" height="1" fill="currentColor" x="0" y="0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>
    </div>
  );
}
