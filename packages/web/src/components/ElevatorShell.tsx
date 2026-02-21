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
          className={i === children.length - 1 ? "pt-16 pb-0" : "py-16"}
        >
          {child}
        </section>
      ))}
    </div>
  );
}
