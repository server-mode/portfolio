type DeskArtProps = {
  monitors: number;
  extras: string[];
};

const INK = "#0b0b0f";
const PAPER = "#f6f7f9";
const LINE = "#e3e6ec";
const GRAY = "#c9ced6";
const DARK = "#141821";
const MINT = "#96e9b8";
const CYAN = "#78dbff";
const YELLOW = "#fbbc05";
const GREEN = "#34a853";
const BLUE = "#1a73e8";

/** Flat pixel "desk" pictogram used for the setup timeline. */
export default function DeskArt({ monitors, extras }: DeskArtProps) {
  const left = extras.find((e) => e !== "plant");
  const right = extras.includes("plant") ? "plant" : null;

  return (
    <svg viewBox="0 0 220 150" role="img" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="220" height="150" fill={PAPER} />

      {/* wall dots */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={`w${i}`} x={14 + i * 24} y={10} width="2" height="2" fill={LINE} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={`w2${i}`} x={22 + i * 24} y={22} width="2" height="2" fill={LINE} />
      ))}

      {/* desk */}
      <rect x="8" y="108" width="204" height="6" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <rect x="20" y="114" width="4" height="26" fill={GRAY} />
      <rect x="196" y="114" width="4" height="26" fill={GRAY} />
      <rect x="8" y="140" width="204" height="2" fill={LINE} />

      {/* laptop */}
      {monitors === 0 && (
        <>
          <rect x="82" y="70" width="56" height="36" fill={INK} />
          <rect x="86" y="74" width="48" height="28" fill={DARK} />
          <rect x="90" y="78" width="26" height="2" fill={MINT} />
          <rect x="90" y="84" width="34" height="2" fill={CYAN} />
          <rect x="90" y="90" width="18" height="2" fill={MINT} />
          <rect x="76" y="104" width="68" height="4" fill={INK} />
        </>
      )}

      {/* single monitor */}
      {monitors === 1 && (
        <>
          <rect x="70" y="52" width="78" height="48" fill={INK} />
          <rect x="74" y="56" width="70" height="40" fill={DARK} />
          <rect x="79" y="61" width="30" height="2" fill={MINT} />
          <rect x="79" y="67" width="44" height="2" fill={CYAN} />
          <rect x="79" y="73" width="22" height="2" fill={MINT} />
          <rect x="79" y="79" width="38" height="2" fill="#3a4150" />
          <rect x="105" y="100" width="8" height="8" fill={INK} />
          <rect x="94" y="105" width="30" height="3" fill={INK} />
        </>
      )}

      {/* two monitors */}
      {monitors >= 2 && (
        <>
          <rect x="26" y="58" width="68" height="44" fill={INK} />
          <rect x="30" y="62" width="60" height="36" fill={DARK} />
          <rect x="35" y="67" width="24" height="2" fill={MINT} />
          <rect x="35" y="73" width="36" height="2" fill={CYAN} />
          <rect x="35" y="79" width="18" height="2" fill={MINT} />
          <rect x="56" y="100" width="8" height="6" fill={INK} />
          <rect x="48" y="105" width="24" height="3" fill={INK} />

          <rect x="126" y="58" width="68" height="44" fill={INK} />
          <rect x="130" y="62" width="60" height="36" fill={DARK} />
          <rect x="135" y="67" width="34" height="2" fill={CYAN} />
          <rect x="135" y="73" width="22" height="2" fill={MINT} />
          <rect x="135" y="79" width="40" height="2" fill="#3a4150" />
          <rect x="156" y="100" width="8" height="6" fill={INK} />
          <rect x="148" y="105" width="24" height="3" fill={INK} />
        </>
      )}

      {/* desk lamp */}
      {left === "lamp" && (
        <>
          <rect x="11" y="88" width="3" height="20" fill={INK} />
          <rect x="11" y="86" width="15" height="3" fill={INK} />
          <rect x="23" y="80" width="12" height="10" fill={INK} />
          <rect x="25" y="82" width="8" height="6" fill={YELLOW} />
          <rect x="27" y="98" width="2" height="2" fill={YELLOW} />
          <rect x="31" y="102" width="2" height="2" fill={YELLOW} />
          <rect x="8" y="107" width="9" height="2" fill={INK} />
        </>
      )}

      {/* microphone */}
      {left === "mic" && (
        <>
          <rect x="14" y="72" width="10" height="16" fill={INK} />
          <rect x="16" y="74" width="6" height="12" fill={DARK} />
          <rect x="17" y="76" width="4" height="1" fill={CYAN} />
          <rect x="17" y="79" width="4" height="1" fill={CYAN} />
          <rect x="17" y="82" width="4" height="1" fill={CYAN} />
          <rect x="18" y="88" width="2" height="18" fill={INK} />
          <rect x="12" y="106" width="14" height="2" fill={INK} />
        </>
      )}

      {/* speaker */}
      {left === "speaker" && (
        <>
          <rect x="11" y="80" width="20" height="26" fill="#ffffff" stroke={INK} strokeWidth="2" />
          <circle cx="21" cy="88" r="2" fill={INK} />
          <circle cx="21" cy="97" r="3" fill={INK} />
        </>
      )}

      {/* plant */}
      {right === "plant" && (
        <>
          <rect x="192" y="99" width="16" height="9" fill={INK} />
          <rect x="194" y="101" width="12" height="6" fill={YELLOW} />
          <rect x="198" y="90" width="2" height="9" fill={GREEN} />
          <rect x="194" y="84" width="4" height="6" fill={GREEN} />
          <rect x="201" y="86" width="4" height="4" fill={GREEN} />
          <rect x="190" y="88" width="4" height="4" fill={GREEN} />
          <rect x="203" y="90" width="3" height="4" fill={GREEN} />
        </>
      )}

      {/* mug */}
      <rect x="150" y="100" width="7" height="8" fill="#ffffff" stroke={INK} strokeWidth="1" />
      <rect x="157" y="102" width="2" height="4" fill={INK} />
    </svg>
  );
}
