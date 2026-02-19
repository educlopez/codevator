"use client";

interface FloorIndicatorProps {
  currentFloor: number;
  floors: string[];
}

export function FloorIndicator({ currentFloor, floors }: FloorIndicatorProps) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-center">
      <div className="w-14 h-10 bg-lumon-dark rounded-sm flex items-center justify-center mb-2 border border-lumon-green/30">
        <span className="font-mono text-xl text-lumon-mint tracking-wider">
          {floors[currentFloor]}
        </span>
      </div>
      {floors.map((floor, i) => (
        <button
          key={floor}
          className={`w-10 h-10 rounded-full border-2 transition-all duration-500 flex items-center justify-center font-mono text-sm
            ${
              i === currentFloor
                ? "bg-lumon-mint border-lumon-green text-lumon-dark shadow-[0_0_12px_rgba(10,61,42,0.5)]"
                : "bg-lumon-dark/80 border-lumon-gray/40 text-lumon-gray hover:border-lumon-mint/60"
            }`}
          aria-label={`Floor ${floor}`}
        >
          {floor}
        </button>
      ))}
    </div>
  );
}
