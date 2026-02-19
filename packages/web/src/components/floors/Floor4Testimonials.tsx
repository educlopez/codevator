const TESTIMONIALS = [
  {
    quote:
      "I turned it on as a joke. Now I can't code without it. The elevator mode is genuinely calming while waiting for refactors.",
    name: "Mark S.",
    title: "Full-stack Developer",
  },
  {
    quote:
      "The retro mode turns a 30-second tool call into a mini arcade experience. My agent works harder when it has a soundtrack.",
    name: "Dylan G.",
    title: "DevOps Engineer",
  },
  {
    quote:
      "I didn't think I needed this. Turns out silence during AI code generation is weirdly stressful. Rain mode fixed that.",
    name: "Helly R.",
    title: "Senior Engineer",
  },
  {
    quote: "Please try to enjoy each sound equally.",
    name: "The Management",
    title: "Codevator Industries",
  },
];

export function Floor4Testimonials() {
  return (
    <div className="w-full max-w-4xl mx-auto px-8 space-y-10">
      <div className="text-center">
        <p className="font-mono text-xs text-lumon-gray uppercase tracking-[0.3em] mb-4">
          What People Say
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-lumon-green">
          Voluntarily provided. With enthusiasm.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="border border-lumon-green/15 rounded-lg p-6 bg-lumon-cream/50 space-y-4"
          >
            <p className="font-serif text-lg text-lumon-dark leading-relaxed italic">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="border-t border-lumon-green/10 pt-3">
              <p className="font-mono text-sm font-semibold text-lumon-green">
                {t.name}
              </p>
              <p className="font-mono text-xs text-lumon-gray">{t.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
