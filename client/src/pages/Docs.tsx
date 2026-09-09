import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, ChevronRight, CircleDot, Code2, FileCode2, Github, KeyRound, LockKeyhole, Terminal, type LucideIcon } from "lucide-react";
import { Link } from "wouter";

const sections = [
  ["01", "Architecture", "architecture"],
  ["02", "What leaves your machine", "data"],
  ["03", "API configuration", "config"],
];

const docsFlow: ReadonlyArray<readonly [string, string, LucideIcon, string]> = [
  ["01", "Extension", Code2, "Reads the active workspace with VS Code’s scoped APIs."],
  ["02", "Local scanner", FileCode2, "AST + static analysis produces structured findings on-device."],
  ["03", "Redaction gate", KeyRound, "Secrets and tokens are removed before any optional request."],
  ["04", "Report", Check, "Findings land in your editor with evidence and a fix path."],
];

export default function Docs() {
  return (
    <main className="docs-shell">
      <header className="site-header docs-header">
        <div className="site-container site-header__inner">
          <Link href="/" className="brand" aria-label="Back to ScaleGuard home"><span className="brand-mark"><Terminal size={17} /></span><span>Scale<span className="brand-accent">Guard</span></span><span className="brand-beta">DOCS</span></Link>
          <div className="docs-header__links"><Link href="/" className="text-link"><ArrowLeft size={14} /> Back to home</Link><a href="https://github.com" target="_blank" rel="noreferrer"><Github size={15} /> Scanner repo</a></div>
        </div>
      </header>
      <div className="docs-layout site-container">
        <aside className="docs-sidebar"><div className="docs-sidebar__label">On this page</div>{sections.map(([index, title, id]) => <a href={`#${id}`} key={id}><span>{index}</span>{title}<ChevronRight size={14} /></a>)}<div className="docs-sidebar__status"><span className="status-dot" /> v0.1 / private beta</div></aside>
        <article className="docs-content">
          <div className="eyebrow"><span className="eyebrow-dot" /> ScaleGuard docs / 0.1</div>
          <h1>A scaling checklist<br /><span>you can inspect.</span></h1>
          <p className="docs-lede">ScaleGuard is a local-first VS Code extension for teams shipping Spring Boot and MERN. These notes explain the data flow before you install the beta.</p>
          <div className="docs-callout"><LockKeyhole size={18} /><div><strong>Default posture: no network.</strong><p>Static and AST checks run locally. ScaleGuard only asks for permission before sending a redacted snippet for a judgment call.</p></div></div>

          <section id="architecture" className="docs-section"><div className="docs-section__label">01 / Architecture</div><h2>Four small steps, one clear report.</h2><p>The scanner is intentionally boring: deterministic rules first, optional model judgment second, and a human-readable report at the end.</p><div className="docs-flow">{docsFlow.map(([index, title, FlowIcon, detail]) => <div className="docs-flow__item" key={index}><span>{index}</span><FlowIcon size={17} /><strong>{title}</strong><p>{detail}</p></div>)}</div></section>

          <section id="data" className="docs-section"><div className="docs-section__label">02 / Data egress</div><h2>What ever leaves your machine?</h2><p>Almost nothing. The scanner core is designed to answer the common scaling questions locally. For the edge cases where a model is useful, the extension shows you the exact redacted payload and asks first.</p><div className="data-table"><div><span className="data-table__icon data-table__icon--green"><Check size={16} /></span><span><strong>AST / static findings</strong><small>Never leaves your machine</small></span><b className="data-safe">LOCAL</b></div><div><span className="data-table__icon data-table__icon--green"><Check size={16} /></span><span><strong>Secret values</strong><small>Redacted before any request</small></span><b className="data-safe">BLOCKED</b></div><div><span className="data-table__icon data-table__icon--yellow"><CircleDot size={16} /></span><span><strong>Judgment-call snippets</strong><small>Only after an explicit approval</small></span><b className="data-review">ASK FIRST</b></div><div><span className="data-table__icon data-table__icon--green"><Check size={16} /></span><span><strong>Findings history</strong><small>Stored in your repo or local workspace</small></span><b className="data-safe">LOCAL</b></div></div></section>

          <section id="config" className="docs-section"><div className="docs-section__label">03 / API configuration</div><h2>Connect a provider on your terms.</h2><p>The beta ships with a placeholder provider config. Pick an approved model endpoint, set the key in VS Code’s secret storage, and keep the approval gate on.</p><div className="config-block"><div className="config-block__top"><span>settings.json</span><span>placeholder / beta</span></div><pre><code>{`{
  "scaleGuard.framework": "spring-boot",
  "scaleGuard.analysis": "local",
  "scaleGuard.llm.enabled": false,
  "scaleGuard.llm.endpoint": "https://api.example.com/v1",
  "scaleGuard.llm.approval": "ask-first"
}`}</code></pre></div><div className="docs-next"><div><span className="docs-next__icon"><Terminal size={16} /></span><strong>Want the scanner core?</strong><p>Join the waitlist for the private beta and the open-source rule set.</p></div><Button asChild className="button-primary"><Link href="/#waitlist-final">Join the waitlist <ArrowRight size={15} /></Link></Button></div></section>
        </article>
      </div>
      <footer className="site-footer"><div className="site-container site-footer__inner"><Link href="/" className="brand"><span className="brand-mark"><Terminal size={16} /></span><span>Scale<span className="brand-accent">Guard</span></span></Link><span className="footer-note">Local-first scaling readiness.</span><span className="footer-note">© 2026 ScaleGuard</span></div></footer>
    </main>
  );
}
