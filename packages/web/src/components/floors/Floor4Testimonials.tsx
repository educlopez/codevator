const TESTIMONIALS = [
  {
    quote:
      "I didn't know I needed elevator music until my agent started working in silence. Now I can't go back.",
    name: "M. Scout",
    title: "Macrodata Refinement",
  },
  {
    quote:
      "The retro mode makes refactoring feel like a game. Productivity is its own reward.",
    name: "B. Goodman",
    title: "Optics & Design",
  },
  {
    quote:
      "I'm not superstitious, but I am a little stitious about coding in silence.",
    name: "M. Scott",
    title: "Regional Manager",
  },
  {
    quote:
      "I have been playing elevator mode for three hours. I do not plan to stop. That is all.",
    name: "D. Schrute",
    title: "Assistant to the Regional Manager",
  },
];

export function Floor4Testimonials() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 md:max-w-3xl lg:max-w-7xl lg:px-10">
      <div className="flex flex-col gap-10 sm:gap-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm/7 font-semibold text-olive-700">
            What People Say
          </p>
          <h2 className="font-display text-[2rem]/10 sm:text-5xl/14 text-olive-950 tracking-tight text-pretty">
            Voluntarily provided. With enthusiasm.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col justify-between gap-10 rounded-lg bg-olive-950/[0.025] p-6"
            >
              <blockquote className="font-display text-lg text-olive-950 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=1a1a1a&textColor=d4d4a8`}
                  alt={`${t.name} avatar`}
                  width={40}
                  height={40}
                  className="size-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold text-olive-950">
                    {t.name}
                  </p>
                  <p className="text-xs text-olive-600">{t.title}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
