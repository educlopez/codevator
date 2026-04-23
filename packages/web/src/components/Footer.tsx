import Link from "next/link";
import cliPkg from "../../../cli/package.json";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const navigateColumn: FooterColumn = {
  title: "Navigate",
  links: [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Sounds", href: "/sounds" },
    { label: "Roadmap", href: "/roadmap" },
  ],
};

const developColumn: FooterColumn = {
  title: "Develop",
  links: [
    { label: "Install guide", href: "/docs#install" },
    { label: "Menubar app", href: "/docs#menubar" },
    {
      label: "GitHub",
      href: "https://github.com/educlopez/codevator",
      external: true,
    },
    {
      label: "npm package",
      href: "https://www.npmjs.com/package/codevator",
      external: true,
    },
    {
      label: "Changelog",
      href: "https://github.com/educlopez/codevator/releases",
      external: true,
    },
  ],
};

const byEduardoColumn: FooterColumn = {
  title: "By Eduardo",
  links: [
    {
      label: "smoothui.dev",
      href: "https://smoothui.dev",
      external: true,
      description: "React components with smooth animations",
    },
    {
      label: "sparkbites.dev",
      href: "https://sparkbites.dev",
      external: true,
      description: "Daily design & dev inspiration",
    },
    {
      label: "thegridcn.com",
      href: "https://thegridcn.com",
      external: true,
      description: "shadcn/ui themes with Tron DNA",
    },
    {
      label: "ui-craft",
      href: "https://skills.smoothui.dev",
      external: true,
      description: "Claude skill for crafting UI",
    },
    {
      label: "@educalvolpz",
      href: "https://x.com/educalvolpz",
      external: true,
      description: "Follow on X / Twitter",
    },
  ],
};

const DEFAULT_VERSION = cliPkg.version;

type Tone = "light" | "dark";

type ToneTokens = {
  brand: string;
  tagline: string;
  header: string;
  link: string;
  linkDescription: string;
  dividerImage: string;
  copyright: string;
  copyrightAccent: string;
  pillBorder: string;
  pillBg: string;
  pillText: string;
  dot: string;
  dotPing: string;
};

const TONE: Record<Tone, ToneTokens> = {
  light: {
    brand: "text-olive-950",
    tagline: "text-olive-700",
    header: "text-olive-950",
    link: "text-olive-600 hover:text-olive-950",
    linkDescription:
      "text-olive-500 transition-colors group-hover:text-olive-700",
    dividerImage:
      "[background-image:linear-gradient(90deg,var(--color-olive-950)_1px,transparent_1px)]",
    copyright: "text-olive-600",
    copyrightAccent: "text-olive-950 hover:text-olive-700",
    pillBorder: "border-olive-950/10",
    pillBg: "bg-olive-50",
    pillText: "text-olive-950",
    dot: "bg-olive-600",
    dotPing: "bg-olive-600/60",
  },
  dark: {
    brand: "text-white",
    tagline: "text-olive-100/80",
    header: "text-white",
    link: "text-olive-100/70 hover:text-white",
    linkDescription:
      "text-olive-100/50 transition-colors group-hover:text-olive-100/80",
    dividerImage:
      "[background-image:linear-gradient(90deg,var(--color-olive-100)_1px,transparent_1px)]",
    copyright: "text-olive-100/70",
    copyrightAccent: "text-white hover:text-olive-100",
    pillBorder: "border-olive-100/20",
    pillBg: "bg-olive-950/60 backdrop-blur-sm",
    pillText: "text-olive-100",
    dot: "bg-olive-200",
    dotPing: "bg-olive-200/60",
  },
};

export type FooterStripProps = {
  version?: string;
  soundCount?: number;
  tone?: Tone;
  /** Show the brand column (logo + tagline). Default: true. */
  showBrand?: boolean;
};

/**
 * Inner footer content: brand (optional) + link grid + dotted divider +
 * bottom bar with status pill. No outer background — sits on whatever
 * surface the caller provides.
 */
export function FooterStrip({
  version = DEFAULT_VERSION,
  soundCount,
  tone = "light",
  showBrand = true,
}: FooterStripProps) {
  const t = TONE[tone];
  const linkCols = (
    <>
      <FooterColumnBlock column={navigateColumn} tone={t} />
      <FooterColumnBlock column={developColumn} tone={t} />
      <FooterColumnBlock column={byEduardoColumn} tone={t} />
    </>
  );

  return (
    <div>
      {showBrand ? (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link
              href="/"
              className={`font-display text-3xl w-fit leading-none ${t.brand}`}
            >
              Codevator.
            </Link>
            <p className={`max-w-xs text-sm/6 ${t.tagline}`}>
              Background music that plays while your AI agent codes — and
              stops when it&apos;s done.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-3">
            {linkCols}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {linkCols}
        </div>
      )}

      <div
        aria-hidden
        className={`mt-12 h-px bg-repeat-x opacity-30 ${t.dividerImage} [background-size:6px_1px]`}
      />

      <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-xs ${t.copyright}`}>
          © {new Date().getFullYear()} Codevator · MIT licensed · built by{" "}
          <a
            href="https://x.com/educalvolpz"
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors ${t.copyrightAccent}`}
          >
            @educalvolpz
          </a>
        </p>

        <StatusPill version={version} soundCount={soundCount} tone={t} />
      </div>
    </div>
  );
}

function FooterColumnBlock({
  column,
  tone,
}: {
  column: FooterColumn;
  tone: ToneTokens;
}) {
  return (
    <div>
      <h3 className={`text-sm font-medium ${tone.header}`}>{column.title}</h3>
      <ul className="mt-4 space-y-3">
        {column.links.map((link) => (
          <li key={link.label}>
            <FooterLinkItem link={link} tone={tone} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLinkItem({
  link,
  tone,
}: {
  link: FooterLink;
  tone: ToneTokens;
}) {
  const className = `group inline-flex flex-col gap-0.5 text-sm transition-colors ${tone.link}`;
  const inner = (
    <>
      <span className="inline-flex items-center gap-1">
        {link.label}
        {link.external ? <ArrowUpRight /> : null}
      </span>
      {link.description ? (
        <span className={`font-mono text-[10px] ${tone.linkDescription}`}>
          {link.description}
        </span>
      ) : null}
    </>
  );

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {inner}
    </Link>
  );
}

function StatusPill({
  version,
  soundCount,
  tone,
}: {
  version: string;
  soundCount?: number;
  tone: ToneTokens;
}) {
  return (
    <div
      className={`inline-flex w-fit items-center gap-2 rounded-full border py-1 pl-2 pr-3 shadow-sm ${tone.pillBorder} ${tone.pillBg}`}
    >
      <span className="relative flex size-2.5">
        <span
          className={`absolute inset-0 animate-ping rounded-full opacity-75 ${tone.dotPing}`}
        />
        <span
          className={`relative inline-flex size-2.5 rounded-full ${tone.dot}`}
        />
      </span>
      <span
        className={`font-mono text-[11px] tabular-nums ${tone.pillText}`}
      >
        v{version}
        {typeof soundCount === "number" && soundCount > 0
          ? ` · ${soundCount} sounds`
          : null}
      </span>
    </div>
  );
}

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}
