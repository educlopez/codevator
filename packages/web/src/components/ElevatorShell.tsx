"use client";

interface ElevatorShellProps {
  children: React.ReactNode[];
}

export function ElevatorShell({ children }: ElevatorShellProps) {
  return (
    <div>
      {children.map((child, i) => (
        <section
          key={i}
          className="floor-section min-h-screen relative flex items-center justify-center"
        >
          {child}
        </section>
      ))}
    </div>
  );
}
