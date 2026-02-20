"use client";

interface FloorIndicatorProps {
  currentFloor: number;
  floors: string[];
}

export function FloorIndicator({ currentFloor, floors }: FloorIndicatorProps) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-center">
      <div className="w-14 h-10 bg-olive-950 rounded-sm flex items-center justify-center mb-2 border border-olive-700">
        <span className="font-mono text-xl text-olive-300 tracking-wider">
          {floors[currentFloor]}
        </span>
      </div>
      {floors.map((floor, i) => (
        <button
          key={floor}
          className={`w-10 h-10 rounded-full border-2 transition-all duration-500 flex items-center justify-center text-sm font-medium
            ${
              i === currentFloor
                ? "bg-olive-300 border-olive-950 text-olive-950 shadow-[0_0_12px_rgba(0,0,0,0.2)]"
                : "bg-olive-950/80 border-olive-600 text-olive-400 hover:border-olive-300"
            }`}
          aria-label={`Floor ${floor}`}
        >
          {floor}
        </button>
      ))}
    </div>
  );
}
