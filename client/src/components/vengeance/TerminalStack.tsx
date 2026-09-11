import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { CircleDot, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Terminal definitions ─────────────────────────────────────────────────────

type LineType = "annotation" | "method" | "code" | "comment" | "class" | "alert";

interface TLine { num: number; text: string; type: LineType; }
interface TDef {
  id: string; file: string; lines: TLine[];
  badge: string; finding: string; findingRef: string;
  fix: string; confidence: string; iconColor: string; iconBg: string;
}

const TERMINALS: TDef[] = [
  {
    id: "db",
    file: "src/main/java/com/acme/OrderService.java",
    lines: [
      { num: 42, text: "@Transactional",                    type: "annotation" },
      { num: 43, text: "public List<Order> getOrders() {",  type: "method"     },
      { num: 44, text: "  return orderRepo.findAll()",      type: "code"       },
      { num: 45, text: "    .stream()",                     type: "code"       },
      { num: 46, text: "    .map(order -> hydrate(order))", type: "alert"      },
      { num: 47, text: "    .toList();",                    type: "code"       },
      { num: 48, text: "}",                                 type: "code"       },
    ],
    badge: "N+1",   finding: "N+1 query path",     findingRef: "OrderService.java:46",
    fix: "JOIN FETCH customer", confidence: "98%",
    iconColor: "#f7b47a", iconBg: "rgba(247,180,122,.12)",
  },
  {
    id: "cache",
    file: "src/main/java/com/acme/ProductService.java",
    lines: [
      { num: 79, text: "public Product getProduct(Long id) {",  type: "method"  },
      { num: 80, text: "  // runs every call — no cache",       type: "comment" },
      { num: 81, text: "  Product p = productRepo",             type: "code"    },
      { num: 82, text: "    .findById(id).orElseThrow();",       type: "alert"   },
      { num: 83, text: "  return enrichWithDetails(p);",        type: "code"    },
      { num: 84, text: "}",                                     type: "code"    },
    ],
    badge: "CACHE", finding: "No cache boundary", findingRef: "ProductService.java:82",
    fix: "CACHE expensive read", confidence: "95%",
    iconColor: "#f3bd7b", iconBg: "rgba(243,189,123,.12)",
  },
  {
    id: "api",
    file: "src/main/java/com/acme/OrderController.java",
    lines: [
      { num: 28, text: "@RestController",                   type: "annotation" },
      { num: 29, text: "@RequestMapping(\"/api/orders\")",  type: "annotation" },
      { num: 30, text: "public class OrderController {",    type: "class"      },
      { num: 31, text: "  @GetMapping(\"/export\")",        type: "alert"      },
      { num: 32, text: "  public List<Order> exportAll() {",type: "code"      },
      { num: 33, text: "    return orderSvc.findAll();",    type: "code"       },
      { num: 34, text: "  }",                               type: "code"       },
    ],
    badge: "RATE",  finding: "Missing rate limit", findingRef: "OrderController.java:31",
    fix: "ADD REQUEST LIMIT", confidence: "97%",
    iconColor: "#f1705d", iconBg: "rgba(241,112,93,.12)",
  },
];

// ─── Stack positions ──────────────────────────────────────────────────────────

interface SPos { x: number; y: number; z: number; scale: number; opacity: number; zIndex: number; }

const DESK_POS: SPos[] = [
  { x: 0,  y: 0,   z: 0,   scale: 1,     opacity: 1,    zIndex: 30 },
  { x: 36, y: -30, z: -50, scale: 0.966, opacity: 0.66, zIndex: 20 },
  { x: 66, y: -55, z: -92, scale: 0.932, opacity: 0.43, zIndex: 10 },
];

const MOB_POS: SPos[] = [
  { x: 0,  y: 0,   z: 0,   scale: 1,    opacity: 1,    zIndex: 30 },
  { x: 12, y: -11, z: -20, scale: 0.98, opacity: 0.68, zIndex: 20 },
  { x: 22, y: -20, z: -36, scale: 0.96, opacity: 0.43, zIndex: 10 },
];

// ─── Scan phase ───────────────────────────────────────────────────────────────

type ScanPhase = "idle" | "scanning" | "hit" | "found" | "settling";

// ─── TerminalCard ─────────────────────────────────────────────────────────────

function TerminalCard({
  t, isActive, cardRef,
}: {
  t: TDef;
  isActive: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [phase,      setPhase]      = useState<ScanPhase>("idle");
  const [statusText, setStatusText] = useState("scanned");
  const [cardGlow,   setCardGlow]   = useState(false);
  const tids = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => { tids.current.forEach(clearTimeout); tids.current = []; };
  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms); tids.current.push(id);
  };

  useEffect(() => {
    if (!isActive) {
      clear();
      setPhase("idle"); setStatusText("scanned"); setCardGlow(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    later(() => { setPhase("scanning"); setStatusText("analyzing..."); }, 850);
    later(() => setPhase("hit"),                                           1800);
    later(() => { setPhase("found"); setStatusText("1 finding"); setCardGlow(true); }, 2400);
    later(() => setCardGlow(false),                                        3650);
    later(() => { setPhase("settling"); setStatusText("scanned"); },       3950);
    later(() => setPhase("idle"),                                          4750);

    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const beamOn  = isActive && (phase === "scanning" || phase === "hit");
  const lineHl  = isActive && (phase === "hit"      || phase === "found");
  const lastNum = t.lines[t.lines.length - 1].num + 1;

  const codeStyle = (type: LineType): React.CSSProperties | undefined => {
    if (type === "annotation")                 return { color: "#c5d684" };
    if (type === "method" || type === "class") return { color: "#aebcf1" };
    if (type === "comment")                    return { color: "#567474", fontStyle: "italic" };
    return undefined;
  };

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={`sg-terminal-card${isActive ? " sg-terminal-card--active" : ""}`}
    >
      {/* ── Title bar */}
      <div className="terminal-preview__bar">
        <div className="terminal-dots"><span /><span /><span /></div>
        <span className="terminal-preview__path sg-path">{t.file}</span>
        <span className="terminal-preview__status">
          <span className="status-dot status-dot--animated" />
          <AnimatePresence mode="wait">
            <motion.span
              key={statusText}
              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}   transition={{ duration: 0.18 }}
            >
              {statusText}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      {/* ── Body */}
      <div className="terminal-preview__body">
        {/* Code column */}
        <div className="code-column" style={{ position: "relative", overflow: "hidden" }}>
          {beamOn && (
            <div
              className={`scan-beam${phase === "hit" ? " scan-beam--hit" : ""}`}
              aria-hidden="true"
            />
          )}
          {t.lines.map((ln) => {
            const isAlert = ln.type === "alert";
            const hl = isAlert && lineHl;
            return (
              <div
                key={ln.num}
                className={[
                  "code-line",
                  isAlert ? "code-line--alert"   : "",
                  hl      ? "code-line--scanning" : "",
                ].filter(Boolean).join(" ")}
              >
                <span>{String(ln.num).padStart(2, "0")}</span>
                <code style={codeStyle(ln.type)}>{ln.text}</code>
                {isAlert && (
                  <span className={`inline-warning${hl ? " inline-warning--pulse" : ""}`}>
                    {t.badge}
                  </span>
                )}
              </div>
            );
          })}
          <div className="terminal-cursor" aria-hidden="true">
            <span>{lastNum}</span>
            <span className="cursor-blink">_</span>
          </div>
        </div>

        {/* Report card */}
        <div className={`scan-card${cardGlow ? " scan-card--revealed" : ""}`}>
          <div className="scan-card__eyebrow">
            <span className="scan-card__pulse" /> ScaleGuard report
          </div>
          <div className="scan-card__title">1 high-impact finding</div>
          <div className="scan-card__finding">
            <div className="finding-icon" style={{ color: t.iconColor, background: t.iconBg }}>
              <Zap size={15} />
            </div>
            <div>
              <strong>{t.finding}</strong>
              <span>{t.findingRef}</span>
            </div>
          </div>
          <div className="scan-card__fix">
            <span>Fix suggestion</span><code>{t.fix}</code>
          </div>
          <div className="scan-card__footer">
            <span>confidence {t.confidence}</span>
            <span>local analysis</span>
          </div>
        </div>
      </div>

      {/* ── Footer */}
      <div className="terminal-preview__footer">
        <span><CircleDot size={11} /> main*</span>
        <span>Spring Boot / Java</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}

// ─── TerminalStack ────────────────────────────────────────────────────────────

export function TerminalStack() {
  const r0 = useRef<HTMLDivElement | null>(null);
  const r1 = useRef<HTMLDivElement | null>(null);
  const r2 = useRef<HTMLDivElement | null>(null);
  const REFS = [r0, r1, r2] as React.RefObject<HTMLDivElement | null>[];

  // order[positionIndex] = cardIndex at that position
  const order     = useRef<[number, number, number]>([0, 1, 2]);
  const [active, setActive] = useState(0);

  const hovered   = useRef(false);
  const animating = useRef(false);
  const swapId    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced   = useRef(false);

  // Callbacks in refs to avoid circular/stale closure issues
  const doSchedule = useRef<() => void>(() => {});
  const doSwap     = useRef<() => void>(() => {});

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) return;

    const isMob = window.innerWidth <= 640;
    const POS   = isMob ? MOB_POS : DESK_POS;
    const ELS   = REFS.map(r => r.current!);
    if (ELS.some(el => !el)) return;

    // Set initial stack positions
    ELS.forEach((el, i) => {
      gsap.set(el, {
        x: POS[i].x, y: POS[i].y, z: POS[i].z,
        scale: POS[i].scale, opacity: POS[i].opacity, zIndex: POS[i].zIndex,
        force3D: true,
      });
    });

    // Card swap animation
    doSwap.current = () => {
      if (animating.current || hovered.current) return;
      animating.current = true;

      const [fi, mi, bi] = order.current;
      const FE = ELS[fi], ME = ELS[mi], BE = ELS[bi];

      const tl = gsap.timeline({
        onComplete() {
          order.current     = [mi, bi, fi];
          animating.current = false;
          setActive(mi);
          doSchedule.current();
        },
      });

      // 1: Front card exits down+back
      tl.to(FE, {
        y: 90, z: -90, opacity: 0, rotationZ: 1.1,
        duration: 0.42, ease: "power2.in",
      });
      // 2: Mid promotes to front
      tl.to(ME, {
        x: POS[0].x, y: POS[0].y, z: POS[0].z,
        scale: POS[0].scale, opacity: POS[0].opacity, zIndex: POS[0].zIndex,
        duration: 0.72, ease: "elastic.out(0.65, 0.85)",
      }, "-=0.22");
      // 3: Back promotes to mid
      tl.to(BE, {
        x: POS[1].x, y: POS[1].y, z: POS[1].z,
        scale: POS[1].scale, opacity: POS[1].opacity, zIndex: POS[1].zIndex,
        duration: 0.65, ease: "elastic.out(0.65, 0.85)",
      }, "<");
      // 4: Teleport old front to back (invisible)
      tl.set(FE, {
        x: POS[2].x, y: POS[2].y, z: POS[2].z,
        scale: POS[2].scale, opacity: 0, rotationZ: 0, zIndex: POS[2].zIndex,
      });
      // 5: Fade in at back
      tl.to(FE, { opacity: POS[2].opacity, duration: 0.38, ease: "power1.out" });
    };

    // Schedule next swap
    doSchedule.current = () => {
      if (swapId.current) clearTimeout(swapId.current);
      swapId.current = setTimeout(() => doSwap.current(), 4600);
    };

    doSchedule.current();

    return () => {
      if (swapId.current) clearTimeout(swapId.current);
      gsap.killTweensOf(ELS);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEnter = () => {
    hovered.current = true;
    if (swapId.current) { clearTimeout(swapId.current); swapId.current = null; }
  };

  const onLeave = () => {
    hovered.current = false;
    if (!animating.current && !reduced.current) doSchedule.current();
  };

  return (
    <motion.div
      className="sg-terminal-stack"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.22, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label="ScaleGuard scan results"
    >
      <div className="sg-terminal-stack__scene">
        {TERMINALS.map((t, i) => (
          <TerminalCard
            key={t.id}
            t={t}
            isActive={active === i}
            cardRef={REFS[i]}
          />
        ))}
      </div>
      <p className="sg-terminal-stack__label" aria-hidden="true">
        a production-shaped example
      </p>
    </motion.div>
  );
}
