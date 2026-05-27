import { useState, useCallback } from "react";

// ── Web Speech API hook ─────────────────────────────────────────

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.82; u.pitch = 1.05;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);
  return { speak, stop, speaking };
}

// ── Shared UI components ────────────────────────────────────────

function SRPanel({ lines, active, speak, speaking, stop }) {
  if (!active) return null;
  const fullText = lines.map(l => l.text.replace(/"/g, "")).join(" ");
  return (
    <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 10, padding: "18px 22px", marginTop: 16, fontFamily: "monospace", fontSize: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ color: "#8b949e", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          🔊 Screen reader announces
        </div>
        {window.speechSynthesis && (
          <button onClick={speaking ? stop : () => speak(fullText)} style={{ padding: "5px 14px", background: speaking ? "#7f1d1d" : "#1e3a5f", border: `1px solid ${speaking ? "#ef4444" : "#3b82f6"}`, borderRadius: 20, color: speaking ? "#fca5a5" : "#93c5fd", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em" }}>
            {speaking ? "◼ Stop" : "▶ Hear it"}
          </button>
        )}
      </div>
      {lines.map((line, i) => (
        <div key={i} style={{ color: line.dim ? "#4b5563" : "#e6edf3", lineHeight: 2, paddingLeft: line.indent ? 20 : 0 }}>
          {line.text}
        </div>
      ))}
    </div>
  );
}

function Badge({ label, ok, na }) {
  const s = na
    ? { bg: "#111827", border: "#1f2937", color: "#4b5563", mark: "—" }
    : ok
    ? { bg: "#052e16", border: "#166534", color: "#4ade80", mark: "✓" }
    : { bg: "#2d0000", border: "#7f1d1d", color: "#f87171", mark: "✗" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 13, fontWeight: 600 }}>
      <span>{s.mark}</span><span>{label}</span>
    </span>
  );
}

function Insight({ children }) {
  return (
    <div style={{ position: "relative", marginTop: 40, paddingTop: 16 }}>
      <div style={{ position: "absolute", top: 0, left: 18, transform: "translateY(-50%)", background: "#f59e0b", color: "#0a0500", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100, whiteSpace: "nowrap" }}>
        What this reveals
      </div>
      <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(245,158,11,0.02) 100%)", border: "1px solid rgba(245,158,11,0.22)", borderRadius: 12, padding: "24px 22px 22px", color: "#fde68a", fontSize: 15, lineHeight: 1.85 }}>
        {children}
      </div>
    </div>
  );
}

function Btn({ onClick, active, children, variant = "default" }) {
  const styles = {
    default: { padding: "12px 20px", background: active ? "#1e3a5f" : "#1e293b", border: `1px solid ${active ? "#3b82f6" : "#334155"}`, color: active ? "#93c5fd" : "#94a3b8", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 },
    reveal: { padding: "12px 20px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 },
  };
  return <button onClick={onClick} style={styles[variant]}>{children}</button>;
}

// ── Station 1: The Color Challenge ─────────────────────────────

function Station1() {
  const [revealed, setRevealed] = useState(false);
  const [srOn, setSrOn] = useState(false);
  const { speak, stop, speaking } = useSpeech();

  const srLines = [
    { text: "Heading level 2: Library Hours, Main Branch." },
    { text: "Monday through Friday, 8 AM to 10 PM.", indent: true },
    { text: "Saturday, 10 AM to 6 PM.", indent: true },
    { text: "Sunday, noon to 8 PM.", indent: true },
    { text: "Holiday hours may vary. Check our website for updates.", indent: true },
  ];

  return (
    <div>
      <p style={{ color: "#cbd5e1", lineHeight: 1.8, marginBottom: 24, fontSize: 16 }}>
        A library website publishes its branch hours. There's information in the box below.
        Try to read it.
      </p>
      <div style={{ background: "white", borderRadius: 12, padding: 36, border: "2px solid #e5e7eb", minHeight: 130, marginBottom: 14 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, transition: "color 0.5s ease", color: revealed ? "#111827" : "white" }}>
          Library Hours — Main Branch
        </h3>
        <div style={{ fontSize: 16, lineHeight: 2, transition: "color 0.5s ease", color: revealed ? "#374151" : "white", whiteSpace: "pre-line" }}>
          {"Monday–Friday: 8:00 AM – 10:00 PM\nSaturday: 10:00 AM – 6:00 PM\nSunday: Noon – 8:00 PM\nHoliday hours may vary. Check our website for updates."}
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 22, fontStyle: "italic" }}>
        The information exists. It's published. It's right there.
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        <Badge label="Visible to you" ok={revealed} />
        <Badge label="Screen reader" ok={true} />
        <Badge label="Copy / paste" ok={true} />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn onClick={() => setSrOn(s => !s)} active={srOn}>
          {srOn ? "🔊 Screen reader on" : "🔇 Simulate screen reader"}
        </Btn>
        {!revealed && (
          <Btn onClick={() => setRevealed(true)} variant="reveal">
            Reveal to sighted reader →
          </Btn>
        )}
      </div>
      <SRPanel lines={srLines} active={srOn} speak={speak} stop={stop} speaking={speaking} />
      <Insight>
        The text was there all along — styled white on white. Invisible to visual readers.
        Perfectly readable to a screen reader, because the <em>text itself</em> existed
        in the document's structure; only its presentation was limiting access.
        <br /><br />
        Accessibility gaps are often not missing content. They are mismatches between
        how content is stored and how a particular reader needs to receive it.
      </Insight>
    </div>
  );
}

// ── Station 2: The Image Trap ───────────────────────────────────

function Station2() {
  const [mode, setMode] = useState("image");
  const [srOn, setSrOn] = useState(false);
  const [copyResult, setCopyResult] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const { speak, stop, speaking } = useSpeech();

  const citation = "Rosen, S. (2018). What does a library accessibility specialist do? How a new role advances accessibility through education and advocacy. College & Research Libraries News, 79(1), 23.";
  const doi = "https://doi.org/10.5860/crln.79.1.23";

  const imageSR = [{ text: '"Image."' }];
  const textSR = [
    { text: '"Rosen, S., 2018. What does a library accessibility specialist do?"' },
    { text: '"How a new role advances accessibility through education and advocacy."', indent: true },
    { text: '"College and Research Libraries News, volume 79, issue 1, page 23."', indent: true },
    { text: '"D-O-I: doi.org/10.5860/crln.79.1.23"', indent: true },
  ];

  const handleCopy = () => {
    if (mode === "image") { setCopyResult("fail"); }
    else { navigator.clipboard.writeText(`${citation}\nDOI: ${doi}`).catch(() => {}); setCopyResult("success"); }
    setSearchResult(null);
  };
  const handleSearch = () => {
    setSearchResult(mode === "image" ? "fail" : "success");
    setCopyResult(null);
  };
  const switchMode = (m) => { setMode(m); setCopyResult(null); setSearchResult(null); setSrOn(false); };

  return (
    <div>
      <p style={{ color: "#cbd5e1", lineHeight: 1.8, marginBottom: 20, fontSize: 16 }}>
        Your ILL team delivers a chapter scan. A patron needs to cite it —
        and wants to copy the DOI into their citation manager. Toggle between
        how the scan arrives.
      </p>
      <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid #1e293b", marginBottom: 22 }}>
        {["image", "text"].map(m => (
          <button key={m} onClick={() => switchMode(m)} style={{ flex: 1, padding: "13px 16px", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: mode === m ? (m === "image" ? "#2d0000" : "#052e16") : "#111827", color: mode === m ? (m === "image" ? "#fca5a5" : "#4ade80") : "#6b7280", transition: "all 0.2s" }}>
            {m === "image" ? "📄 Scanned image (no OCR)" : "📝 With OCR text layer"}
          </button>
        ))}
      </div>
      <div style={{ background: mode === "image" ? "#f7f3ec" : "#f9fafb", borderRadius: 12, padding: 30, border: "2px solid #e5e7eb", marginBottom: 14, position: "relative", minHeight: 90 }}>
        <div style={{ userSelect: mode === "image" ? "none" : "text", filter: mode === "image" ? "contrast(0.9) sepia(0.1)" : "none", cursor: mode === "image" ? "default" : "text" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#1a1a1a", lineHeight: 2 }}>{citation}</div>
          <div style={{ marginTop: 10, fontSize: 14, color: "#374151", fontFamily: "monospace" }}>DOI: {doi}</div>
        </div>
        <div style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 700, color: mode === "image" ? "#9ca3af" : "#4ade80", background: mode === "image" ? "#f3f4f6" : "#052e16", padding: "3px 10px", borderRadius: 4, border: `1px solid ${mode === "image" ? "#e5e7eb" : "#166534"}` }}>
          {mode === "image" ? "image only" : "text layer present"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        <Badge label="Visible" ok={true} />
        <Badge label="Screen reader" ok={mode === "text"} />
        <Badge label="Copy / cite" ok={mode === "text"} />
        <Badge label="Searchable" ok={mode === "text"} />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn onClick={() => setSrOn(s => !s)} active={srOn}>{srOn ? "🔊 Screen reader on" : "🔇 Simulate screen reader"}</Btn>
        <Btn onClick={handleCopy} variant="reveal">Try to copy DOI</Btn>
        <Btn onClick={handleSearch} variant="reveal">Search for "advocacy"</Btn>
      </div>
      {copyResult === "fail" && <div style={{ marginTop: 14, padding: "12px 18px", background: "#2d0000", border: "1px solid #7f1d1d", borderRadius: 8, color: "#fca5a5", fontSize: 14, lineHeight: 1.7 }}>✗ Can't select or copy from an image. The patron needs to retype the DOI manually — character by character, risking transcription issues.</div>}
      {copyResult === "success" && <div style={{ marginTop: 14, padding: "12px 18px", background: "#052e16", border: "1px solid #166534", borderRadius: 8, color: "#4ade80", fontSize: 14 }}>✓ Citation and DOI copied to clipboard. Paste directly into Zotero, a search box, or an email.</div>}
      {searchResult === "fail" && <div style={{ marginTop: 14, padding: "12px 18px", background: "#2d0000", border: "1px solid #7f1d1d", borderRadius: 8, color: "#fca5a5", fontSize: 14, lineHeight: 1.7 }}>✗ No text layer to search. In a 40-page chapter, a patron can't navigate to the section they need. Ctrl+F finds nothing.</div>}
      {searchResult === "success" && <div style={{ marginTop: 14, padding: "12px 18px", background: "#052e16", border: "1px solid #166534", borderRadius: 8, color: "#4ade80", fontSize: 14 }}>✓ Found "advocacy" — 1 match highlighted. In a full chapter, a patron jumps directly to the passages they need.</div>}
      <SRPanel lines={mode === "image" ? imageSR : textSR} active={srOn} speak={speak} stop={stop} speaking={speaking} />
      <Insight>
        Both versions look identical on screen. Both pass the eye test.
        Only one can be read aloud, copied, cited, or searched.
        <br /><br />
        This is the ILL moment: applying OCR isn't an extra step tacked onto the scanning workflow.
        It's the difference between delivering information and delivering a photograph of
        information. The skew correction and the OCR pass are siblings — both answer the
        same question: <em>can the person on the other end actually receive this?</em>
      </Insight>
    </div>
  );
}

// ── Station 3: The Keyboard Experience ────────────────────────

function Station3() {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const items = [
    { id: 1, label: "Search the catalog", keyboard: true },
    { id: 2, label: "Request ILL materials", keyboard: true },
    { id: 3, label: "Renew my loans", keyboard: false },
    { id: 4, label: "My account", keyboard: true },
  ];

  return (
    <div>
      <p style={{ color: "#cbd5e1", lineHeight: 1.8, marginBottom: 10, fontSize: 16 }}>
        Navigate this interface using <strong style={{ color: "#f1f5f9" }}>only your keyboard.</strong>{" "}
        Press{" "}
        <kbd style={{ background: "#374151", padding: "3px 9px", borderRadius: 5, fontSize: 13, fontFamily: "monospace", color: "#e2e8f0", border: "1px solid #4b5563" }}>Tab</kbd>
        {" "}to move,{" "}
        <kbd style={{ background: "#374151", padding: "3px 9px", borderRadius: 5, fontSize: 13, fontFamily: "monospace", color: "#e2e8f0", border: "1px solid #4b5563" }}>Enter</kbd>
        {" "}to select.
      </p>
      <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
        Click somewhere neutral first to clear focus, then Tab in. Try to reach every item.
      </p>
      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 26, border: "2px solid #e2e8f0", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>Library Services</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(item =>
            item.keyboard ? (
              <button key={item.id} onClick={() => setSelected(item.id)} style={{ padding: "15px 22px", background: selected === item.id ? "#1e3a5f" : "white", border: `2px solid ${selected === item.id ? "#3b82f6" : "#e2e8f0"}`, borderRadius: 9, textAlign: "left", color: selected === item.id ? "#93c5fd" : "#374151", fontSize: 15, cursor: "pointer", fontWeight: 500, transition: "all 0.15s" }}
                onFocus={e => { e.target.style.boxShadow = "0 0 0 3px #3b82f680"; e.target.style.outline = "none"; }}
                onBlur={e => e.target.style.boxShadow = "none"}>
                {item.label}
              </button>
            ) : (
              <div key={item.id} onClick={() => setSelected(item.id)} style={{ padding: "15px 22px", background: selected === item.id ? "#7f1d1d" : "white", border: `2px solid ${selected === item.id ? "#ef4444" : "#e2e8f0"}`, borderRadius: 9, color: selected === item.id ? "#fca5a5" : "#374151", fontSize: 15, cursor: "pointer", fontWeight: 500, userSelect: "none", position: "relative" }}>
                {item.label}
                {revealed && <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#ef4444", fontWeight: 700 }}>mouse only</span>}
              </div>
            )
          )}
        </div>
      </div>
      {selected === 3 && <div style={{ padding: "12px 18px", background: "#2d0000", border: "1px solid #7f1d1d", borderRadius: 8, color: "#fca5a5", fontSize: 14, marginBottom: 12, lineHeight: 1.7 }}>✗ "Renew my loans" can only be activated by mouse click. Keyboard users reach a dead end — there's no path through.</div>}
      {selected && selected !== 3 && <div style={{ padding: "12px 18px", background: "#052e16", border: "1px solid #166534", borderRadius: 8, color: "#4ade80", fontSize: 14, marginBottom: 12 }}>✓ "{items.find(i => i.id === selected)?.label}" — reachable by keyboard and mouse.</div>}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Btn onClick={() => setRevealed(s => !s)} variant="reveal">{revealed ? "Hide explanation" : "Show what's happening →"}</Btn>
      </div>
      {revealed && (
        <div style={{ padding: "18px 22px", background: "#1c1917", border: "1px solid #44403c", borderRadius: 8, color: "#d6d3d1", fontSize: 14, lineHeight: 1.85, marginBottom: 8 }}>
          Three of these are real{" "}<code style={{ background: "#292524", padding: "2px 7px", borderRadius: 4, color: "#86efac", fontSize: 13 }}>&lt;button&gt;</code>{" "}elements — naturally focusable, keyboard-activatable. "Renew my loans" is a{" "}<code style={{ background: "#292524", padding: "2px 7px", borderRadius: 4, color: "#fb923c", fontSize: 13 }}>&lt;div&gt;</code>{" "}with an <code style={{ background: "#292524", padding: "2px 7px", borderRadius: 4, color: "#fb923c", fontSize: 13 }}>onClick</code> — a common pattern that looks identical on screen but is invisible to keyboard navigation. The improvement is a single word.
        </div>
      )}
      <Insight>
        People who navigate by keyboard — due to motor differences, repetitive strain,
        switch access, or personal preference — have no workaround when an interactive
        element isn't in the tab order. There's no "try clicking from a slightly different angle."
        The item simply doesn't exist for them.
        <br /><br />
        This is one of the most common accessibility issues on the web, and it's
        completely invisible to mouse users.
      </Insight>
    </div>
  );
}

// ── Station 4: The Full Picture ────────────────────────────────

function Station4() {
  const rows = [
    { label: "White-on-white styled text", desc: "From Station 1", visual: false, sr: true, copy: true, keyboard: null, search: true },
    { label: "Image of text (no OCR)", desc: "Standard unprocessed scan", visual: true, sr: false, copy: false, keyboard: null, search: false },
    { label: "Image of text (with OCR)", desc: "The same scan, processed", visual: true, sr: true, copy: true, keyboard: null, search: true },
    { label: "Mouse-only interactive element", desc: "From Station 3", visual: true, sr: false, copy: null, keyboard: false, search: null },
    { label: "Semantic HTML with alt text", desc: "Accessible by design", visual: true, sr: true, copy: true, keyboard: true, search: true },
  ];
  const cols = [
    { key: "visual", label: "👁 Visual" },
    { key: "sr", label: "🔊 Screen reader" },
    { key: "copy", label: "✂️ Copy/cite" },
    { key: "keyboard", label: "⌨️ Keyboard" },
    { key: "search", label: "🔍 Searchable" },
  ];
  const Cell = ({ val }) =>
    val === null ? <span style={{ color: "#374151" }}>—</span>
    : <span style={{ color: val ? "#4ade80" : "#f87171", fontSize: 17 }}>{val ? "✓" : "✗"}</span>;

  return (
    <div>
      <p style={{ color: "#cbd5e1", lineHeight: 1.8, marginBottom: 26, fontSize: 16 }}>
        Each of these scenarios appeared in the first three stations. Here's the pattern.
      </p>
      <div style={{ overflowX: "auto", marginBottom: 30, borderRadius: 10, border: "1px solid #1e293b" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "15px 20px", background: "#0f172a", color: "#94a3b8", borderBottom: "1px solid #1e293b", fontWeight: 600, fontSize: 13 }}>Content type</th>
              {cols.map(c => <th key={c.key} style={{ padding: "15px 12px", background: "#0f172a", color: "#94a3b8", borderBottom: "1px solid #1e293b", fontWeight: 600, textAlign: "center", fontSize: 12, whiteSpace: "nowrap" }}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#0f172a" : "#0a0f1e" }}>
                <td style={{ padding: "15px 20px", borderBottom: "1px solid #1e293b" }}>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 4, fontSize: 14 }}>{row.label}</div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{row.desc}</div>
                </td>
                {cols.map(c => <td key={c.key} style={{ padding: "15px 12px", textAlign: "center", borderBottom: "1px solid #1e293b" }}><Cell val={row[c.key]} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ background: "#080b12", border: "1px solid #1e293b", borderRadius: 12, padding: 30, marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>The reframe</div>
        <p style={{ fontSize: 18, lineHeight: 1.9, color: "#e2e8f0", fontStyle: "italic", marginBottom: 16 }}>
          Accessibility is whether information can successfully travel from where it lives
          to where a reader is — in a form they can receive.
        </p>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.8 }}>
          Skew correction, contrast adjustment, OCR, alt text, semantic structure —
          all answer the same question. The sense that some feel "necessary" and
          others feel "optional" is a habit of professional perception, not a fact
          about what matters.
        </p>
      </div>
      <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(245,158,11,0.02) 100%)", border: "1px solid rgba(245,158,11,0.22)", borderRadius: 12, padding: "20px 24px", color: "#fde68a", fontSize: 15, lineHeight: 1.85 }}>
        <div style={{ fontWeight: 700, color: "#fbbf24", marginBottom: 10, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>For library workers specifically</div>
        A library's mission is information access. Every accessibility decision —
        whether to apply OCR, add alt text, or use semantic HTML — is a decision
        about which patrons that mission actually serves.
        Not a compliance question. A mission question.
        These commitments are the same commitment.
      </div>
    </div>
  );
}

// ── Main shell ─────────────────────────────────────────────────

const STATIONS = [
  { num: "01", title: "The Color Challenge", sub: "When the eye can deceive", Comp: Station1 },
  { num: "02", title: "The Image Trap", sub: "When seeing isn't accessing", Comp: Station2 },
  { num: "03", title: "The Keyboard Experience", sub: "When the mouse is a privilege", Comp: Station3 },
  { num: "04", title: "The Full Picture", sub: "Connecting the dots", Comp: Station4 },
];

export default function AccessLab() {
  const [cur, setCur] = useState(0);
  const { Comp, num, title, sub } = STATIONS[cur];

  return (
    <div style={{ background: "#080b12", color: "#e2e8f0", minHeight: "100vh", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "26px 36px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
          UC San Diego Library · Digital Experience Team
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em", marginBottom: 8 }}>
          The Access Lab
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, maxWidth: 540, lineHeight: 1.75 }}>
          An experiential introduction to digital accessibility — four stations,
          each presenting the same information differently, revealing who can
          and cannot receive it.
        </p>
        <p style={{ color: "#4b5563", fontSize: 13, marginTop: 10, lineHeight: 1.7 }}>
          Note: some stations intentionally demonstrate inaccessible content. Everything outside those demonstrations aims to meet WCAG AA.
        </p>
      </div>

      {/* Station nav */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e293b", overflowX: "auto" }}>
        {STATIONS.map((s, i) => (
          <button key={i} onClick={() => setCur(i)} style={{ padding: "18px 22px", minWidth: 155, textAlign: "left", border: "none", borderBottom: `3px solid ${cur === i ? "#f59e0b" : "transparent"}`, borderRight: "1px solid #1e293b", cursor: "pointer", background: cur === i ? "#0f172a" : "transparent", transition: "all 0.15s" }}
            onFocus={e => { e.target.style.outline = "none"; e.target.style.boxShadow = "inset 0 0 0 2px #f59e0b60"; }}
            onBlur={e => e.target.style.boxShadow = "none"}>
            <div style={{ fontSize: 11, fontWeight: 700, color: cur === i ? "#f59e0b" : "#475569", letterSpacing: "0.1em", marginBottom: 5 }}>{s.num}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: cur === i ? "#f8fafc" : "#64748b", marginBottom: 3 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: cur === i ? "#475569" : "#374151" }}>{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "36px", maxWidth: 720 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
          Station {num}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em", marginBottom: 5 }}>{title}</h2>
        <p style={{ color: "#475569", fontSize: 14, marginBottom: 30 }}>{sub}</p>
        <Comp />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, paddingTop: 26, borderTop: "1px solid #1e293b" }}>
          <button onClick={() => setCur(c => Math.max(0, c - 1))} disabled={cur === 0} style={{ padding: "12px 22px", background: "transparent", border: "1px solid #1e293b", borderRadius: 8, color: cur === 0 ? "#1e293b" : "#64748b", cursor: cur === 0 ? "default" : "pointer", fontSize: 14 }}>
            ← Previous
          </button>
          <button onClick={() => setCur(c => Math.min(STATIONS.length - 1, c + 1))} disabled={cur === STATIONS.length - 1} style={{ padding: "12px 22px", background: cur === STATIONS.length - 1 ? "transparent" : "#f59e0b", border: "1px solid transparent", borderRadius: 8, color: cur === STATIONS.length - 1 ? "#1e293b" : "#0a0500", cursor: cur === STATIONS.length - 1 ? "default" : "pointer", fontSize: 14, fontWeight: 700 }}>
            Next station →
          </button>
        </div>
      </div>
    </div>
  );
}
