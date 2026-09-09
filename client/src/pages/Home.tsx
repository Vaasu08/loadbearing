import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GlowBorderCard } from "@/components/vengeance/GlowBorderCard";
import { SpotlightPanel } from "@/components/vengeance/SpotlightPanel";
import { VengeanceButton } from "@/components/vengeance/VengeanceButton";
import { trpc } from "@/lib/trpc";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronDown,
  CircleDot,
  CloudOff,
  Code2,
  Database,
  FileCode2,
  Gauge,
  GitBranch,
  Github,
  KeyRound,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  PackageCheck,
  PanelTop,
  Play,
  ScanSearch,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Terminal,
  TimerReset,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

const checks = [
  {
    category: "Database",
    icon: Database,
    color: "blue",
    items: [
      ["N+1 query paths", "The list endpoint looks harmless in review. Under load, it quietly becomes 101 database trips."],
      ["Missing indexes", "A filter works in your dev database, then turns into a table scan the moment the table gets real."],
      ["Connection pool pressure", "HikariCP / Mongoose is left to guess — until every request is waiting for a connection."],
    ],
  },
  {
    category: "Caching",
    icon: Layers3,
    color: "violet",
    items: [
      ["No cache boundary", "The same expensive read runs again and again, with nowhere to keep the answer for a minute."],
      ["Invalidation gaps", "A write updates the database — but the old answer is still sitting in Redis."],
      ["Stampede risk", "One expired key turns into 500 requests all trying to rebuild the same thing."],
    ],
  },
  {
    category: "API hygiene",
    icon: Network,
    color: "lime",
    items: [
      ["Missing rate limits", "The public route is fine in staging. In prod, one noisy client can own it."],
      ["Unbounded thread pools", "The executor keeps creating workers until the host has nothing left to give."],
      ["Blocking I/O on hot paths", "A synchronous call sits inside the async flow and quietly pins a worker."],
    ],
  },
];

const steps = [
  { number: "01", title: "Install the extension", detail: "Add ScaleGuard to VS Code and choose Spring Boot or MERN.", icon: PackageCheck },
  { number: "02", title: "Scan locally", detail: "AST and static checks run on-device. No network call required.", icon: ScanSearch },
  { number: "03", title: "Ask only when needed", detail: "Redacted snippets go out only for judgment calls your rules cannot settle.", icon: LockKeyhole },
  { number: "04", title: "Ship with a report", detail: "Get severity, evidence, and concrete fixes before your users find the bottleneck.", icon: BarChart3 },
];

const perks = [
  { icon: Gauge, title: "Lifetime Pro for the first 500", detail: "Join early and keep every advanced check, forever." },
  { icon: FileCode2, title: "The launch-day checklist", detail: "Get the free PDF: 10 Scaling Mistakes That Kill APIs at Launch." },
  { icon: GitBranch, title: "Shape the next framework", detail: "Vote on deep checks for Spring Boot, Express, or Django." },
  { icon: BadgeCheck, title: "Founding member access", detail: "Get the badge and a private beta Discord invite." },
];

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.55, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span className="section-label__index">{index}</span>
      <span>{children}</span>
    </div>
  );
}

function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<"joined" | "duplicate" | null>(null);
  const join = trpc.waitlist.join.useMutation({
    onSuccess: (result) => {
      setSuccess(result.duplicate ? "duplicate" : "joined");
      setEmail("");
      window.dispatchEvent(new CustomEvent("scaleguard:waitlist", { detail: result.count }));
    },
    onError: (mutationError) => setError(mutationError.message || "Something went wrong. Try again."),
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(null);
    const normalized = email.trim();
    if (!normalized || !/^\S+@\S+\.\S+$/.test(normalized)) {
      setError("Enter a valid email to join the list.");
      return;
    }
    join.mutate({ email: normalized });
  };

  return (
    <div className={compact ? "waitlist-form waitlist-form--compact" : "waitlist-form"}>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={compact ? "email-final" : "email-hero"}>Email address</label>
        <Input
          id={compact ? "email-final" : "email-hero"}
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error)}
          className="waitlist-input"
          disabled={join.isPending}
        />
        <VengeanceButton type="submit" className="button-primary shrink-0" disabled={join.isPending}>
          {join.isPending ? "Joining…" : "Join the waitlist"}
          {!join.isPending && <ArrowRight size={16} />}
        </VengeanceButton>
      </form>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="form-message form-message--error">
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="form-message form-message--success">
            <Check size={14} /> {success === "duplicate" ? "You’re already on the list — see you in the beta." : "You’re in. Check your inbox for the launch checklist."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function TerminalPreview() {
  return (
    <SpotlightPanel className="terminal-spotlight">
      <GlowBorderCard className="terminal-glow-card" glow="lime">
        <motion.div
          className="terminal-preview"
          initial={{ opacity: 0, y: 28, rotate: 1.2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.23, 1, 0.32, 1] }}
        >
      <div className="terminal-preview__bar">
        <div className="terminal-dots"><span /><span /><span /></div>
        <span className="terminal-preview__path">src/main/java/com/acme/OrderService.java</span>
        <span className="terminal-preview__status"><span className="status-dot" /> scanned</span>
      </div>
      <div className="terminal-preview__body">
        <div className="code-column">
          {["@Transactional", "public List<Order> getOrders() {", "  return orderRepo.findAll()", "    .stream()", "    .map(order -> hydrate(order))", "    .toList();", "}"].map((line, index) => (
            <div className={index === 4 ? "code-line code-line--alert" : "code-line"} key={line}>
              <span>{String(index + 42).padStart(2, "0")}</span><code>{line}</code>
              {index === 4 && <span className="inline-warning">N+1</span>}
            </div>
          ))}
        </div>
        <div className="scan-card">
          <div className="scan-card__eyebrow"><span className="scan-card__pulse" /> ScaleGuard report</div>
          <div className="scan-card__title">1 high-impact finding</div>
          <div className="scan-card__finding">
            <div className="finding-icon"><Zap size={15} /></div>
            <div><strong>N+1 query path</strong><span>OrderService.java:46</span></div>
          </div>
          <div className="scan-card__fix"><span>Fix suggestion</span><code>JOIN FETCH customer</code></div>
          <div className="scan-card__footer"><span>confidence 98%</span><span>local analysis</span></div>
        </div>
      </div>
      <div className="terminal-preview__footer"><span><CircleDot size={11} /> main* </span><span>Spring Boot / Java</span><span>UTF-8</span></div>
        </motion.div>
      </GlowBorderCard>
    </SpotlightPanel>
  );
}

export default function Home() {
  const countQuery = trpc.waitlist.count.useQuery(undefined, { staleTime: 30_000 });
  const [liveCount, setLiveCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (countQuery.data?.count !== undefined) setLiveCount(countQuery.data.count);
    const updateCount = (event: Event) => {
      const count = (event as CustomEvent<number>).detail;
      if (typeof count === "number") setLiveCount(count);
    };
    window.addEventListener("scaleguard:waitlist", updateCount);
    return () => window.removeEventListener("scaleguard:waitlist", updateCount);
  }, [countQuery.data?.count]);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      const headerHeight = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 68;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 18;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <main className="site-shell">
      <div className="scroll-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <header className="site-header">
        <div className="site-container site-header__inner">
          <a href="#top" className="brand" aria-label="ScaleGuard home">
            <span className="brand-mark"><Terminal size={17} /></span>
            <span>Scale<span className="brand-accent">Guard</span></span>
            <span className="brand-beta">BETA</span>
          </a>
          <nav className={mobileOpen ? "site-nav site-nav--open" : "site-nav"} aria-label="Main navigation">
            <button onClick={() => scrollTo("checks")}>What it catches</button>
            <button onClick={() => scrollTo("how-it-works")}>How it works</button>
            <Link href="/docs" onClick={() => setMobileOpen(false)}>Docs</Link>
            <button onClick={() => scrollTo("waitlist-final")} className="nav-cta">Join waitlist <ArrowRight size={14} /></button>
          </nav>
          <button className="mobile-menu" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>

      <section id="top" className="hero-section site-container">
        <div className="hero-grid">
          <div className="hero-copy">
            <Reveal>
              <div className="eyebrow"><span className="eyebrow-dot" /> VS Code extension <span className="eyebrow-slash">/</span> for the day after launch</div>
            </Reveal>
            <Reveal delay={0.07}>
              <h1>Your API works fine at <span className="highlight-text">10 users.</span><br />Will it survive 10,000?</h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="hero-subcopy">ScaleGuard reads the Spring Boot and MERN code paths most likely to fall over under load — while the fix is still a small pull request.</p>
            </Reveal>
            <Reveal delay={0.17}>
              <WaitlistForm />
              <div className="hero-meta"><span><ShieldCheck size={14} /> Local-first by default</span><span><CloudOff size={14} /> No secrets in the cloud</span></div>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="hero-links">
                <button onClick={() => scrollTo("checks")} className="text-link">Show me the checklist <ArrowDownRight size={15} /></button>
                <span className="live-count"><span className="live-count__dot" /> {liveCount.toLocaleString()} people are in the room</span>
              </div>
            </Reveal>
          </div>
          <div className="hero-visual"><TerminalPreview /><div className="hero-visual__glow" /><div className="hero-visual__grid" /></div>
        </div>
        <div className="scroll-cue"><span>scroll to inspect</span><ChevronDown size={14} /></div>
      </section>

      <section className="trust-strip">
        <div className="site-container">
          <div className="trust-statement"><span className="trust-statement__line" />The boring promise we care about: <em>your code stays yours.</em></div>
          <div className="trust-items">
            <div><span className="trust-icon"><Code2 size={17} /></span><span><strong>Local-first analysis</strong><small>AST checks run on-device</small></span></div>
            <div><span className="trust-icon"><KeyRound size={17} /></span><span><strong>Secrets auto-redacted</strong><small>Before any LLM judgment call</small></span></div>
            <div><span className="trust-icon"><Github size={17} /></span><span><strong>Open-source scanner core</strong><small>Inspect the rules yourself</small></span></div>
          </div>
        </div>
      </section>

      <section id="checks" className="content-section site-container">
        <div className="section-heading section-heading--split">
          <Reveal><SectionLabel index="01">The checks we wish we had</SectionLabel><h2>Catch the expensive<br /><span>little decisions.</span></h2></Reveal>
          <Reveal delay={0.1}><p>No hand-wavy “consider caching” advice. You get the file, the line, and the thing your future on-call self will wish you had fixed.</p></Reveal>
        </div>
        <div className="checks-grid">
          {checks.map((group, groupIndex) => {
            const Icon = group.icon;
            return <Reveal key={group.category} delay={groupIndex * 0.08} className="h-full"><Card className={`check-card check-card--${group.color}`}><CardContent className="p-0"><div className="check-card__header"><span className="check-card__icon"><Icon size={18} /></span><div><span className="check-card__eyebrow">checks / 0{groupIndex + 1}</span><h3>{group.category}</h3></div><span className="check-card__count">0{group.items.length}</span></div><div className="check-list">{group.items.map(([title, detail]) => <div className="check-item" key={title}><span className="check-item__bullet"><Check size={12} /></span><div><strong>{title}</strong><p>{detail}</p></div></div>)}</div></CardContent></Card></Reveal>;
          })}
        </div>
        <Reveal delay={0.18}><div className="code-callout"><span className="code-callout__icon"><Terminal size={17} /></span><code><span className="code-muted">$ scaleguard scan</span> <span className="code-accent">--framework</span> spring-boot <span className="code-muted">--fail-on</span> high</code><span className="code-callout__result"><span className="status-dot" /> 3 findings found</span></div></Reveal>
      </section>

      <section id="how-it-works" className="content-section process-section">
        <div className="site-container">
          <Reveal><SectionLabel index="02">The ritual</SectionLabel><div className="section-heading"><h2>Give scaling a seat<br /><span>in code review.</span></h2></div></Reveal>
          <div className="steps-grid">
            {steps.map((step, index) => { const Icon = step.icon; return <Reveal key={step.number} delay={index * 0.07} className="step-card"><div className="step-card__number">{step.number}</div><div className="step-card__icon"><Icon size={19} /></div><h3>{step.title}</h3><p>{step.detail}</p>{index < steps.length - 1 && <ArrowRight className="step-card__arrow" size={17} />}</Reveal>; })}
          </div>
          <div className="privacy-note"><div className="privacy-note__icon"><LockKeyhole size={18} /></div><div><strong>Local by default. Deliberate by design.</strong><p>Static and AST analysis never makes a network call. If a judgment call needs an LLM, ScaleGuard strips secrets and sends only the smallest relevant snippet — with a visible approval step.</p></div><span className="privacy-note__tag">privacy / first</span></div>
        </div>
      </section>

      <section className="content-section compare-section site-container">
        <div className="section-heading section-heading--split"><Reveal><SectionLabel index="03">The honest comparison</SectionLabel><h2>Why not just ask<br /><span>your coding agent?</span></h2></Reveal><Reveal delay={0.1}><p>Your agent is great at the question you remembered to ask. ScaleGuard is the small, repeatable nudge that shows up even on a Friday afternoon.</p></Reveal></div>
        <Reveal delay={0.12}><div className="comparison-table" role="table" aria-label="ScaleGuard compared with general coding agents"><div className="comparison-row comparison-row--head"><div>Capability</div><div><span className="agent-dot" /> General coding agent</div><div><span className="brand-mark brand-mark--tiny"><Terminal size={12} /></span> ScaleGuard</div></div>{[["Runs on every push", false, true], ["Fixed rule-set per framework", false, true], ["Scoped / limited data access", false, true], ["Tracks findings over time", "sometimes", true]].map(([label, agent, tool]) => <div className="comparison-row" key={label as string}><div>{label}</div><div>{agent === true ? <Check size={16} /> : agent === false ? <X size={16} /> : <span className="maybe">{agent}</span>}</div><div><Check size={16} /></div></div>)}</div></Reveal>
      </section>

      <section className="perks-section">
        <div className="site-container">
          <div className="perks-header"><Reveal><SectionLabel index="04">For the first few teams</SectionLabel><h2>Bring your<br /><span>war stories.</span></h2></Reveal><Reveal delay={0.1}><p>We’re building this with the engineers who have actually been paged by the “works on my machine” incident.</p></Reveal></div>
          <div className="perks-grid">{perks.map((perk, index) => { const Icon = perk.icon; return <Reveal key={perk.title} delay={index * 0.06}><div className="perk-card"><div className="perk-card__top"><Icon size={18} /><span>0{index + 1}</span></div><h3>{perk.title}</h3><p>{perk.detail}</p></div></Reveal>; })}</div>
        </div>
      </section>

      <section className="docs-teaser site-container">
        <div className="docs-teaser__inner"><div className="docs-teaser__grid" /><Reveal><div className="docs-teaser__icon"><PanelTop size={19} /></div><SectionLabel index="05">Open architecture</SectionLabel><h2>Know exactly what<br /><span>leaves your machine.</span></h2><p>Read the architecture notes, data-flow promises, and API config guide before you install anything.</p><Link href="/docs" className="button-secondary">Read the docs <ArrowRight size={15} /></Link></Reveal><div className="docs-terminal"><div className="docs-terminal__top"><span>scaleguard.config.ts</span><span><CircleDot size={10} /> synced</span></div><pre>{`export default {
  framework: "spring-boot",
  analysis: "local",
  redact: ["secrets", "tokens"],
  llm: { mode: "ask-first" }
}`}</pre></div></div>
      </section>

      <section id="waitlist-final" className="final-cta site-container"><div className="final-cta__inner"><div className="final-cta__noise" /><Reveal><div className="eyebrow"><span className="eyebrow-dot" /> Founding access is open</div><h2>Leave fewer surprises<br /><span>for the on-call rotation.</span></h2><p>Free early access. No credit card. First 500 get lifetime Pro — and a say in what we check next.</p><WaitlistForm compact /></Reveal><div className="final-cta__orb" /></div></section>

      <footer className="site-footer"><div className="site-container site-footer__inner"><a href="#top" className="brand"><span className="brand-mark"><Terminal size={16} /></span><span>Scale<span className="brand-accent">Guard</span></span></a><span className="footer-note">Scaling readiness, before the request spike.</span><div className="footer-links"><a href="https://github.com" target="_blank" rel="noreferrer"><Github size={15} /> scanner repo</a><a href="https://x.com" target="_blank" rel="noreferrer">𝕏 / updates</a><Link href="/docs">docs</Link></div></div></footer>
    </main>
  );
}
