"use client";

interface ElevatorShellProps {
  children: React.ReactNode[];
}

export function ElevatorShell({ children }: ElevatorShellProps) {
  return (
    <div className="flex flex-col">
      {children.map((child, i) => (
        <section
          key={i}
          className="py-16"
        >
          {child}
        </section>
      ))}
    </div>
  );
}
