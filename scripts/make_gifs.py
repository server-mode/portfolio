"""Pixel-art GIF factory for the portfolio.

Everything is drawn on a logical pixel grid (S device pixels per logical pixel)
using a hand-written 5x7 bitmap font, a fixed palette and nearest-neighbour
geometry, so the output stays perfectly crisp. No external assets required.

Run:  python scripts/make_gifs.py [name ...]
"""

import math
import os
import sys

from PIL import Image, ImageDraw

S = 5  # device pixels per logical pixel

# ---------------------------------------------------------------- palette ----
INK = (11, 11, 15)
WHITE = (255, 255, 255)
PAPER = (246, 247, 249)
LIGHT = (230, 233, 238)
GRAY = (146, 152, 162)
GRAY2 = (201, 206, 214)
BLUE = (66, 133, 244)
BLUE_D = (26, 80, 168)
RED = (234, 67, 53)
YELLOW = (251, 188, 5)
GREEN = (52, 168, 83)
DARK = (16, 18, 24)
DARK2 = (27, 31, 40)
DARK3 = (38, 43, 54)
MINT = (150, 233, 184)
CYAN = (120, 219, 255)
SKIN = (255, 219, 186)
SKIN2 = (233, 187, 152)
SKIN3 = (208, 120, 120)
HAIR = (26, 26, 32)

COLORS: set[tuple[int, int, int]] = set()


def C(color):
    COLORS.add(color)
    return color


# ------------------------------------------------------------ pixel font ----
FONT_SRC = {
    " ": "00000 00000 00000 00000 00000 00000 00000",
    "A": "01110 10001 10001 11111 10001 10001 10001",
    "B": "11110 10001 10001 11110 10001 10001 11110",
    "C": "01110 10001 10000 10000 10000 10001 01110",
    "D": "11110 10001 10001 10001 10001 10001 11110",
    "E": "11111 10000 10000 11110 10000 10000 11111",
    "F": "11111 10000 10000 11110 10000 10000 10000",
    "G": "01110 10001 10000 10111 10001 10001 01111",
    "H": "10001 10001 10001 11111 10001 10001 10001",
    "I": "11111 00100 00100 00100 00100 00100 11111",
    "J": "00111 00010 00010 00010 00010 10010 01100",
    "K": "10001 10010 10100 11000 10100 10010 10001",
    "L": "10000 10000 10000 10000 10000 10000 11111",
    "M": "10001 11011 10101 10101 10001 10001 10001",
    "N": "10001 11001 10101 10011 10001 10001 10001",
    "O": "01110 10001 10001 10001 10001 10001 01110",
    "P": "11110 10001 10001 11110 10000 10000 10000",
    "Q": "01110 10001 10001 10001 10101 10010 01101",
    "R": "11110 10001 10001 11110 10100 10010 10001",
    "S": "01111 10000 10000 01110 00001 00001 11110",
    "T": "11111 00100 00100 00100 00100 00100 00100",
    "U": "10001 10001 10001 10001 10001 10001 01110",
    "V": "10001 10001 10001 10001 10001 01010 00100",
    "W": "10001 10001 10001 10101 10101 11011 10001",
    "X": "10001 10001 01010 00100 01010 10001 10001",
    "Y": "10001 10001 01010 00100 00100 00100 00100",
    "Z": "11111 00001 00010 00100 01000 10000 11111",
    "0": "01110 10001 10011 10101 11001 10001 01110",
    "1": "00100 01100 00100 00100 00100 00100 01110",
    "2": "01110 10001 00001 00010 00100 01000 11111",
    "3": "11111 00010 00100 00010 00001 10001 01110",
    "4": "00010 00110 01010 10010 11111 00010 00010",
    "5": "11111 10000 11110 00001 00001 10001 01110",
    "6": "00110 01000 10000 11110 10001 10001 01110",
    "7": "11111 00001 00010 00100 01000 01000 01000",
    "8": "01110 10001 10001 01110 10001 10001 01110",
    "9": "01110 10001 10001 01111 00001 00010 01100",
    ".": "00000 00000 00000 00000 00000 01100 01100",
    ",": "00000 00000 00000 00000 01100 01100 00100",
    ":": "00000 01100 01100 00000 01100 01100 00000",
    ";": "00000 01100 01100 00000 01100 01100 00100",
    "!": "00100 00100 00100 00100 00100 00000 00100",
    "?": "01110 10001 00001 00010 00100 00000 00100",
    "-": "00000 00000 00000 11111 00000 00000 00000",
    "+": "00000 00100 00100 11111 00100 00100 00000",
    "/": "00001 00010 00010 00100 01000 01000 10000",
    "<": "00010 00100 01000 10000 01000 00100 00010",
    ">": "01000 00100 00010 00001 00010 00100 01000",
    "[": "01110 01000 01000 01000 01000 01000 01110",
    "]": "01110 00010 00010 00010 00010 00010 01110",
    "(": "00010 00100 01000 01000 01000 00100 00010",
    ")": "01000 00100 00010 00010 00010 00100 01000",
    "*": "00000 10101 01110 11111 01110 10101 00000",
    "#": "01010 01010 11111 01010 11111 01010 01010",
    "=": "00000 00000 11111 00000 11111 00000 00000",
    "_": "00000 00000 00000 00000 00000 00000 11111",
    "|": "00100 00100 00100 00100 00100 00100 00100",
    "%": "11001 11010 00010 00100 01000 01011 10011",
    "'": "00100 00100 00000 00000 00000 00000 00000",
    '"': "01010 01010 00000 00000 00000 00000 00000",
    "@": "01110 10001 10111 10101 10111 10000 01110",
    "$": "00100 01111 10100 01110 00101 11110 00100",
    "&": "01100 10010 10100 01000 10101 10010 01101",
}
FONT = {k: v.split() for k, v in FONT_SRC.items()}
GW, GH, ADV = 5, 7, 6


def text_width(s: str, spacing: int = 1) -> int:
    return len(s) * (GW + spacing) - spacing if s else 0


class Scene:
    """Logical-pixel canvas rendered straight to device resolution."""

    def __init__(self, w: int, h: int, bg=WHITE):
        self.lw, self.lh = w, h
        self.w, self.h = w * S, h * S
        self.img = Image.new("RGB", (self.w, self.h), C(bg))
        self.d = ImageDraw.Draw(self.img)

    # -- primitives -----------------------------------------------------
    def rect(self, x, y, w, h, color, clip=True):
        if clip:
            x0, y0 = max(0, x), max(0, y)
            x1, y1 = min(self.lw, x + w), min(self.lh, y + h)
            if x1 <= x0 or y1 <= y0:
                return
            x, y, w, h = x0, y0, x1 - x0, y1 - y0
        self.d.rectangle([x * S, y * S, (x + w) * S - 1, (y + h) * S - 1], fill=C(color))

    def box(self, x, y, w, h, fill=WHITE, edge=INK, t=1):
        self.rect(x, y, w, h, edge)
        if w > 2 * t and h > 2 * t:
            self.rect(x + t, y + t, w - 2 * t, h - 2 * t, fill)

    def bevel(self, x, y, w, h, light=LIGHT, dark=GRAY2):
        self.rect(x, y, w, 1, light)
        self.rect(x, y, 1, h, light)
        self.rect(x, y + h - 1, w, 1, dark)
        self.rect(x + w - 1, y, 1, h, dark)

    def dot(self, x, y, color):
        self.rect(x, y, 1, 1, color)

    def hline(self, x1, x2, y, color, t=1):
        lo, hi = min(x1, x2), max(x1, x2)
        self.rect(lo, y, hi - lo + 1, t, color)

    def vline(self, x, y1, y2, color, t=1):
        lo, hi = min(y1, y2), max(y1, y2)
        self.rect(x, lo, t, hi - lo + 1, color)

    def disc(self, cx, cy, r, color):
        for dy in range(-r, r + 1):
            span = int(math.sqrt(max(0, r * r - dy * dy)))
            self.rect(cx - span, cy + dy, span * 2 + 1, 1, color)

    def ring(self, cx, cy, r, color):
        if r <= 0:
            return
        seen = set()
        steps = max(16, r * 10)
        for i in range(steps):
            a = 2 * math.pi * i / steps
            x, y = round(cx + r * math.cos(a)), round(cy + r * math.sin(a))
            if (x, y) not in seen:
                seen.add((x, y))
                self.dot(x, y, color)

    def hatch(self, x, y, w, h, color, step=8, abs_y=False):
        """Dotted graph-paper fill (phase can be absolute for repairs)."""
        for iy in range(h):
            row = (y + iy) if abs_y else iy
            if row % step:
                continue
            for ix in range(0, w, step):
                self.dot(x + ix, y + iy, color)

    # -- text -----------------------------------------------------------
    def text(self, s, x, y, color, spacing=1, bold=False):
        cx = x
        for ch in str(s).upper():
            glyph = FONT.get(ch)
            if glyph is None:
                cx += GW + spacing
                continue
            for ry, row in enumerate(glyph):
                for rx, bit in enumerate(row):
                    if bit == "1":
                        self.dot(cx + rx, y + ry, color)
                        if bold:
                            self.dot(cx + rx, y + ry + 1, color)
            cx += GW + spacing
        return cx

    def text_c(self, s, cx, y, color, spacing=1, bold=False):
        self.text(s, round(cx - text_width(s, spacing) / 2), y, color, spacing, bold)

    def text_r(self, s, rx, y, color, spacing=1, bold=False):
        self.text(s, rx - text_width(s, spacing), y, color, spacing, bold)

    def fit(self, s, max_w, spacing=1):
        """Truncate text to fit a width."""
        out = ""
        for ch in s:
            if text_width(out + ch, spacing) > max_w:
                break
            out += ch
        return out

    # -- output ---------------------------------------------------------
    def frame(self):
        return self.img


def rnd(i: int, salt: int = 1) -> float:
    n = (i * 2654435761 + salt * 40503) & 0xFFFFFFFF
    n ^= n >> 13
    n = (n * 1274126177) & 0xFFFFFFFF
    n ^= n >> 16
    return (n % 10000) / 10000.0


def save_gif(frames, path, duration=100):
    palette_colors = sorted(COLORS)
    pal = Image.new("P", (1, 1))
    flat = [c for col in palette_colors for c in col]
    flat.extend([255] * (768 - len(flat)))
    pal.putpalette(flat)

    pframes = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pframes[0].save(
        path,
        save_all=True,
        append_images=pframes[1:],
        duration=duration,
        loop=0,
        optimize=True,
        disposal=1,
    )
    size = os.path.getsize(path)
    print(f"  {os.path.basename(path):22s} {len(pframes):3d}f  {size / 1024:7.1f} KB")
    return size


# ============================================================ 1. skyline ----
CLOUD = [
    "....XXXXX.....",
    "..XXWWWWWXX...",
    ".XWWWWWWWWWX..",
    "XWWWWWWWWWWWX.",
    "XWWWWWWWWWWWX.",
    ".XXXXXXXXXXX..",
]


def draw_cloud(sc: Scene, x, y):
    for ry, row in enumerate(CLOUD):
        for rx, ch in enumerate(row):
            if ch == "X":
                sc.dot(x + rx, y + ry, INK)
            elif ch == "W":
                sc.dot(x + rx, y + ry, WHITE)


def b_skyline(t: int, n: int) -> Image.Image:
    LW, LH = 320, 56
    sc = Scene(LW, LH, WHITE)
    sc.hatch(0, 0, LW, 40, LIGHT, 8)

    # sun
    sc.disc(291, 11, 6, YELLOW)
    sc.ring(291, 11, 6, INK)

    # clouds
    for cx, cy, spd in ((4, 3, 0.5), (112, 6, 0.32), (208, 2, 0.62)):
        x = round((cx + t * spd) % (LW + 30)) - 15
        draw_cloud(sc, x, cy)

    # birds
    for i, (bx, by) in enumerate(((60, 16), (74, 12), (86, 19))):
        x = round((bx + t * 0.9) % (LW + 40)) - 20
        sc.rect(x, by, 1, 1, GRAY)
        sc.rect(x + 1, by + 1, 1, 1, GRAY)
        sc.rect(x + 2, by + 1, 1, 1, GRAY)
        sc.rect(x + 3, by, 1, 1, GRAY)

    # distant skyline silhouettes
    x, i = -6, 0
    while x < LW:
        w = 18 + int(rnd(i, 11) * 16)
        h = 6 + int(rnd(i, 12) * 9)
        sc.rect(x, 40 - h, w, h, LIGHT)
        sc.rect(x, 40 - h, w, 1, GRAY2)
        x += w + 3
        i += 1

    # main tower row (sequential, no overlaps)
    bx, i = 0, 0
    while bx < LW:
        bw = 14 + int(rnd(i, 21) * 12)
        bh = 12 + int(rnd(i, 22) * 15)
        if bx > 268:
            bh = min(bh, 14)  # keep the sun clear
        draw_tower(sc, bx, 40 - bh, bw, bh, t, i + 1)
        bx += bw + 2 + int(rnd(i, 23) * 3)
        i += 1

    # sidewalk + road
    sc.rect(0, 40, LW, 3, PAPER)
    sc.rect(0, 40, LW, 1, INK)
    sc.hatch(0, 41, LW, 2, LIGHT, 6, abs_y=True)
    sc.rect(0, 43, LW, 9, WHITE)
    sc.rect(0, 43, LW, 1, GRAY2)
    for dx in range(0, LW, 18):
        sc.rect(dx + 3, 47, 9, 1, GRAY2)
    sc.rect(0, 52, LW, 1, GRAY2)

    # street lamps
    for lx in (26, 122, 214, 300):
        sc.rect(lx, 29, 1, 11, INK)
        sc.rect(lx, 29, 5, 1, INK)
        sc.rect(lx + 4, 30, 2, 2, YELLOW if (t // 3) % 2 == 0 else (253, 226, 149))
        sc.rect(lx - 1, 39, 3, 1, GRAY2)

    # pixel car
    car_x = round((t * 11) % (LW + 80)) - 40
    sc.box(car_x, 45, 17, 5, WHITE, INK)
    sc.box(car_x + 4, 44, 9, 3, WHITE, INK)
    sc.rect(car_x + 5, 45, 7, 2, DARK)
    sc.rect(car_x + 1, 46, 2, 2, CYAN)
    sc.rect(car_x + 2, 50, 3, 2, INK)
    sc.rect(car_x + 12, 50, 3, 2, INK)
    if t % 2 == 0:
        sc.rect(car_x - 3, 47, 3, 1, GRAY2)
        sc.rect(car_x - 5, 48, 2, 1, LIGHT)
    return sc.frame()


def draw_tower(sc: Scene, x, y, w, h, t, seed):
    sc.box(x, y, w, h, WHITE, INK)
    lit = (YELLOW, BLUE, MINT, YELLOW)
    cols = max(1, (w - 4) // 3)
    rows = max(1, (h - 6) // 3)
    for r in range(rows):
        for c in range(cols):
            wx = x + 2 + c * 3
            wy = y + 3 + r * 3
            if wx + 1 > x + w - 3 or wy + 1 > y + h - 4:
                continue
            v = rnd(seed * 97 + r * 31 + c * 17, seed)
            if v < 0.30:
                col = GRAY2
            else:
                period = 8 + int(v * 26)
                phase = int(rnd(seed * 31 + r * 7 + c * 3, seed + 5) * period)
                col = lit[int(v * 4) % 4] if ((t + phase) % period) < period * 0.55 else GRAY2
            sc.rect(wx, wy, 2, 2, col)
    # ground door
    sc.rect(x + w // 2 - 1, y + h - 4, 3, 3, DARK3)
    # roof furniture
    if w >= 17 and seed % 3 == 0:
        sc.box(x + 2, y - 4, 5, 4, WHITE, INK)
    if w >= 17 and seed % 3 == 1:
        sc.rect(x + w - 7, y - 3, 5, 3, PAPER)
        sc.rect(x + w - 7, y - 3, 5, 1, INK)
        sc.rect(x + w - 7, y - 3, 1, 3, INK)
    # antenna + beacon
    if seed % 2 == 0:
        ax = x + w - 4
        sc.rect(ax, y - 5, 1, 5, INK)
        on = (t // 3) % 2 == 0
        sc.dot(ax, y - 6, RED if on else GRAY2)


# =========================================================== 2. wave strip ----
def b_wave(t: int, n: int) -> Image.Image:
    LW, LH = 320, 26
    sc = Scene(LW, LH, WHITE)
    sc.rect(0, 0, LW, 1, INK)
    sc.rect(0, LH - 1, LW, 1, INK)

    # label block
    sc.rect(0, 1, 62, LH - 2, INK)
    sc.text("DATA", 6, 5, MINT)
    sc.text("STREAM", 6, 14, WHITE)
    sc.rect(62, 1, 1, LH - 2, INK)

    sc.hatch(63, 1, LW - 63, LH - 2, LIGHT, 8, abs_y=True)

    mid = 13
    for i in range((LW - 66) // 2):
        x = 66 + i * 2
        ph = i * 0.34 + t * 0.7
        amp = (
            math.sin(ph) * 0.5
            + math.sin(ph * 0.41 + 2.1) * 0.33
            + math.sin(ph * 2.3 + 0.6) * 0.17
        )
        h = max(1, int(round(abs(amp) * 8)))
        hot = (i + t) % 47 == 0 or i % 31 == 0
        sc.rect(x, mid - h, 1, h, BLUE if hot else INK)
        sc.rect(x, mid + 1, 1, max(1, h // 2), GRAY2)
    sc.hline(66, LW - 2, mid, GRAY2)
    # travelling marker
    mx = 66 + (t * 5) % (LW - 70)
    sc.rect(mx, 2, 2, 1, GREEN)
    return sc.frame()


# =========================================================== 3. code strip ----
CODE_LINES = [
    ('DF = READ("AQI.CSV")', WHITE),
    ("FIT(X, Y) -> RMSE 3.4", MINT),
    ("GPU0 TRAIN 42S ... OK", CYAN),
]


def b_code(t: int, n: int) -> Image.Image:
    LW, LH = 320, 52
    sc = Scene(LW, LH, DARK)

    # window chrome: title bar with 3 traffic lights
    sc.rect(0, 0, LW, 11, DARK2)
    for i, col in enumerate((RED, YELLOW, GREEN)):
        sc.disc(6 + i * 6, 5, 2, col)
    sc.text("TRAIN.PY", 28, 2, GRAY)
    sc.rect(0, 11, LW, 1, DARK3)

    # gutter
    sc.rect(0, 12, 14, 28, DARK2)
    sc.rect(14, 12, 1, 28, DARK3)

    scroll = t * 2.6
    for li, (line, color) in enumerate(CODE_LINES):
        y = 14 + li * 9
        sc.text(str(li + 1), 4, y, (74, 82, 96))
        period = text_width(line) + 22
        off = scroll * (1.0 + (li % 2) * 0.55)
        x = 18 - int(off % period)
        while x < LW:
            sc.text(line, x, y, color)
            x += period
        # keep the marquee out of the gutter
        sc.rect(14, y, 1, 7, DARK2)
        sc.rect(0, y, 14, 7, DARK2)
        sc.text(str(li + 1), 4, y, (74, 82, 96))
    if (t // 3) % 2 == 0:
        sc.rect(18, 32, 4, 7, MINT)

    # status bar
    sc.rect(0, 41, LW, 11, DARK2)
    sc.rect(0, 41, LW, 1, DARK3)
    sc.text("UTF-8", 4, 44, GRAY)
    sc.text("PYTHON 3.12", 44, 44, GRAY)
    sc.text("100%", LW - text_width("100%") - 5, 44, MINT)
    return sc.frame()


# ============================================================ 4. monitor ----
def b_monitor(t: int, n: int) -> Image.Image:
    LW, LH = 104, 92
    sc = Scene(LW, LH, WHITE)

    # case
    sc.box(8, 8, 88, 62, PAPER, INK)
    sc.bevel(9, 9, 86, 60)
    # bezel + screen
    sc.box(14, 14, 76, 44, INK, INK)
    sx, sy, sw, sh = 16, 16, 72, 40
    sc.rect(sx, sy, sw, sh, DARK)
    for ry in range(2, sh, 3):
        sc.rect(sx + 1, sy + ry, sw - 2, 1, DARK2)

    # typed code
    code = ("LOAD CSV", "X 48201", "RMSE 3.4")
    colors = (WHITE, MINT, CYAN)
    total = sum(len(c) for c in code)
    shown = int(((t + 1) / n) * (total + 4)) % (total + 4)
    acc, cur = 0, (sx + 3, sy + 3)
    for li, line in enumerate(code):
        y = sy + 3 + li * 8
        take = max(0, min(len(line), shown - acc))
        if take:
            sc.text(line[:take], sx + 3, y, colors[li])
            cur = (sx + 3 + text_width(line[:take]) - 1, y)
        acc += len(line)
        if shown - acc < 0:
            break
    if (t // 2) % 2 == 0:
        sc.rect(cur[0] + 2, cur[1], 3, 7, MINT)

    # sparkline of the training loss
    sc.hline(sx + 3, sx + sw - 4, sy + sh - 5, DARK3)
    pts = []
    for i in range(17):
        x = sx + 3 + i * 4
        v = math.sin(i * 0.55 + t * 0.18) * 0.5 + math.sin(i * 0.21) * 0.35
        y = sy + sh - 7 - round(v * 4)
        pts.append((x, y))
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        for yy in range(min(y0, y1), max(y0, y1) + 1):
            sc.dot(x0, yy, MINT)
        sc.dot(x1, y1, MINT)
    sc.rect(pts[-1][0] - 1, pts[-1][1] - 1, 2, 2, YELLOW)

    # glass glints
    for gx, gy, gw, gh in ((sx + sw - 16, sy + 2, 9, 1), (sx + sw - 13, sy + 4, 5, 1)):
        sc.rect(gx, gy, gw, 1, (58, 66, 84))

    # brand plate, vents, power led
    sc.text("CRT-DS", 14, 61, GRAY)
    for vx in (52, 56, 60, 64, 68, 72, 76):
        sc.rect(vx, 62, 2, 2, GRAY2)
    sc.disc(88, 62, 2, GREEN if (t // 4) % 2 == 0 else (28, 68, 44))

    # stand
    sc.box(40, 70, 24, 6, PAPER, INK)
    sc.box(32, 76, 40, 4, PAPER, INK)
    sc.rect(30, 80, 44, 1, GRAY2)

    # desk
    sc.rect(0, 82, LW, 1, INK)
    for i in range(0, LW, 9):
        sc.rect(i + 2, 84, 5, 1, LIGHT)
    sc.rect(0, 90, LW, 2, PAPER)

    # mouse
    sc.box(84, 73, 10, 7, WHITE, INK)
    sc.rect(88, 73, 1, 3, GRAY2)
    return sc.frame()


# ======================================================== 5. loading window ----
def b_window(t: int, n: int) -> Image.Image:
    LW, LH = 128, 88
    sc = Scene(LW, LH, PAPER)
    sc.hatch(0, 0, LW, LH, LIGHT, 9, abs_y=True)

    # drop shadow + shell
    sc.rect(9, 9, 112, 70, GRAY2)
    sc.box(6, 6, 112, 70, WHITE, INK)

    # title bar
    sc.rect(7, 7, 110, 9, INK)
    sc.text("MODEL.EXE", 10, 8, WHITE)
    for i in range(3):
        bx = 96 + i * 7
        sc.box(bx, 8, 6, 6, WHITE, GRAY2)
    sc.rect(98, 11, 2, 1, GRAY)   # minimise
    sc.rect(105, 9, 2, 4, GRAY)   # maximise
    sc.rect(112, 9, 2, 1, GRAY)   # close
    sc.rect(112, 12, 2, 1, GRAY)

    # menu bar
    sc.rect(7, 16, 110, 8, WHITE)
    sc.rect(7, 24, 110, 1, GRAY2)
    mx = 10
    for item in ("FILE", "EDIT", "RUN", "HELP"):
        sc.text(item, mx, 17, GRAY)
        mx += text_width(item) + 7

    # content panel
    sc.box(11, 28, 102, 42, WHITE, INK)
    sc.text("LOADING MODEL...", 15, 31, INK)

    pct = (t % n) / (n - 1)
    bx, by, bw = 15, 41, 94
    sc.box(bx, by, bw, 9, WHITE, INK)
    filled = int((bw - 4) * pct)
    if filled > 0:
        sc.rect(bx + 2, by + 2, filled, 5, BLUE)
        sc.rect(bx + 2, by + 2, filled, 1, (140, 181, 250))
        for i in range(2, bw - 2, 3):
            if i <= filled:
                sc.rect(bx + i, by + 2, 1, 5, WHITE)

    spinner = "|/-\\"[t % 4]
    sc.text_r(f"{spinner} {int(pct * 100):3d}%", 105, 52, GRAY)

    logs = [
        ("EPOCH 1  0.742", GREEN),
        ("EPOCH 2  0.418", GREEN),
        ("EPOCH 3  0.207", YELLOW),
        ("CHECKPOINT OK", CYAN),
    ]
    step = min(4, 1 + int(pct * 3.2))
    sc.text(logs[step - 1][0], 15, 61, logs[step - 1][1])
    return sc.frame()


# ============================================================ 6. floppy ----
def b_floppy(t: int, n: int) -> Image.Image:
    LW, LH = 72, 72
    sc = Scene(LW, LH, WHITE)
    sc.hatch(0, 0, LW, LH, LIGHT, 8, abs_y=True)

    sc.rect(9, 11, 60, 58, GRAY2)
    sc.box(6, 8, 60, 58, PAPER, INK)
    sc.bevel(7, 9, 58, 56)

    # notch (top right corner)
    sc.rect(56, 8, 10, 6, WHITE)
    sc.hatch(56, 8, 10, 6, LIGHT, 8, abs_y=True)
    sc.rect(56, 13, 10, 1, INK)
    sc.rect(56, 8, 1, 5, INK)

    # shutter
    sx, sy, sw_, sh_ = 13, 12, 26, 21
    sc.box(sx, sy, sw_, sh_, GRAY2, INK)
    slide = 5 if t % 20 < 10 else 1
    sc.rect(sx + 4 + slide, sy + 4, 9, sh_ - 8, GRAY)
    sc.rect(sx + 4 + slide, sy + 4, 1, sh_ - 8, INK)
    sc.rect(sx + 12 + slide, sy + 4, 1, sh_ - 8, INK)
    for i in range(3):
        sc.rect(sx + 2, sy + 5 + i * 5, 2, 2, WHITE)

    # label
    lx, ly, lw, lh = 10, 40, 52, 17
    sc.box(lx, ly, lw, lh, WHITE, INK)
    sc.text("DS-2024", lx + 3, ly + 3, INK)
    sc.rect(lx + 3, ly + 12, lw - 6, 1, LIGHT)
    for i in range(4):
        col = GREEN if (t // 2 + i) % 3 == 0 else GRAY2
        sc.rect(lx + 3 + i * 11, ly + 14, 8, 1, col)

    sc.text("1.44M", 12, 58, GRAY)
    blink = (t // 3) % 2 == 0
    sc.disc(58, 60, 2, RED if blink else (120, 40, 34))
    return sc.frame()


# ============================================================ 7. cursor ----
ARROW = [
    "X..........",
    "XX.........",
    "XWX........",
    "XWWX.......",
    "XWWWX......",
    "XWWWWX.....",
    "XWWWWWX....",
    "XWWWWWWX...",
    "XWWWWWWWX..",
    "XWWWWWWWWX.",
    "XWWWWWWWWWX",
    "XWWWWWWXXX.",
    "XWWWWWWX...",
    "XWWXXWWX...",
    "XWX..XWWX..",
    "XX....XWWX.",
    "X......XXX.",
]


def b_cursor(t: int, n: int) -> Image.Image:
    LW = LH = 26
    sc = Scene(LW, LH, WHITE)
    sc.hatch(0, 0, LW, LH, LIGHT, 6, abs_y=True)

    click = t % 12
    if click < 6:
        sc.ring(13, 14, 6 + click, BLUE if click < 4 else GRAY2)
    if 2 <= click < 10:
        sc.ring(13, 14, 3 + (click - 2) // 2, GRAY2)

    for ry, row in enumerate(ARROW):
        for rx, ch in enumerate(row):
            if ch == "X":
                sc.dot(8 + rx, 6 + ry, INK)
            elif ch == "W":
                sc.dot(8 + rx, 6 + ry, WHITE)

    if 7 <= click < 10:
        for dx, dy in ((6, 4), (19, 2), (20, 9)):
            sc.rect(dx, dy, 2, 1, YELLOW)
    return sc.frame()


# ============================================================ 8. keyboard ----
def b_keyboard(t: int, n: int) -> Image.Image:
    LW, LH = 96, 56
    sc = Scene(LW, LH, WHITE)
    sc.hatch(0, 0, LW, LH, LIGHT, 8, abs_y=True)

    # typed-text screen
    sc.box(2, 3, 92, 11, WHITE, INK)
    sc.rect(2, 3, 92, 1, GRAY2)
    msg = "SELECT * FROM STUDENTS;"
    visible = 1 + (t * 4) % (len(msg) + 18)
    part = msg[:visible][-13:]
    sc.text(part, 5, 5, GRAY)
    if (t // 2) % 2 == 0:
        sc.rect(5 + text_width(part), 5, 3, 7, BLUE)

    # keyboard body
    sc.rect(6, 19, 88, 32, GRAY2)
    sc.box(4, 16, 88, 34, WHITE, INK)
    sc.bevel(5, 17, 86, 32)

    pressed = (t * 3) % 44
    idx = 0
    for r in range(4):
        for c in range(11):
            kx = 8 + c * 5
            ky = 20 + r * 7
            if r == 3 and 3 <= c <= 7:
                if c != 3:
                    continue
                kx, w = 8 + 3 * 5, 24
            else:
                w = 4
            col = INK if idx == pressed else WHITE
            sc.box(kx, ky, w, 5, col, INK)
            if idx == pressed:
                sc.rect(kx + 1, ky + 4, w - 2, 1, BLUE)
            idx += 1

    # numpad
    sc.rect(68, 19, 24, 30, GRAY2)
    sc.box(66, 16, 24, 34, WHITE, INK)
    for r in range(3):
        for c in range(3):
            kx = 69 + c * 7
            ky = 20 + r * 8
            on = (r * 3 + c + t // 3) % 8 == 0
            sc.box(kx, ky, 5, 6, INK if on else WHITE, INK)
    return sc.frame()


# ============================================================ 9. avatar ----
def b_avatar(t: int, n: int) -> Image.Image:
    LW, LH = 60, 60
    sc = Scene(LW, LH, WHITE)

    sc.rect(0, 0, LW, LH, PAPER)
    sc.hatch(0, 0, LW, LH, LIGHT, 7, abs_y=True)
    sc.box(2, 2, LW - 4, LH - 4, PAPER, INK)

    # shoulders
    sc.rect(9, 46, 42, 12, BLUE)
    sc.rect(9, 46, 42, 1, INK)
    sc.vline(9, 46, 57, INK)
    sc.vline(50, 46, 57, INK)
    sc.rect(32, 46, 5, 12, BLUE_D)
    # collar
    sc.rect(24, 44, 12, 4, WHITE)
    sc.rect(24, 44, 12, 1, INK)
    sc.vline(24, 44, 47, INK)
    sc.vline(35, 44, 47, INK)

    # neck
    sc.rect(26, 39, 8, 6, SKIN2)
    sc.rect(26, 39, 8, 1, SKIN)

    # ears
    sc.box(12, 24, 3, 7, SKIN, INK)
    sc.box(46, 24, 3, 7, SKIN, INK)

    # head
    sc.box(14, 8, 33, 34, SKIN, INK)
    sc.rect(14, 8, 33, 1, INK)

    # hair
    sc.rect(15, 9, 31, 6, HAIR)
    sc.rect(15, 15, 3, 9, HAIR)
    sc.rect(44, 15, 3, 9, HAIR)
    sc.rect(18, 15, 3, 2, HAIR)
    sc.rect(39, 15, 4, 2, HAIR)
    sc.rect(33, 14, 4, 1, HAIR)
    sc.rect(25, 15, 8, 1, HAIR)

    # brows
    sc.rect(19, 20, 6, 1, INK)
    sc.rect(35, 20, 6, 1, INK)

    # glasses + eyes
    blink = (t % 30) in (22, 23)
    for lx in (18, 33):
        sc.box(lx, 23, 10, 8, WHITE, INK)
    sc.hline(27, 34, 27, INK)
    sc.rect(15, 26, 3, 1, INK)
    sc.rect(43, 26, 3, 1, INK)
    if not blink:
        sc.rect(22, 25, 2, 3, INK)
        sc.rect(37, 25, 2, 3, INK)
        sc.dot(22, 25, (140, 165, 200))
        sc.dot(37, 25, (140, 165, 200))
    else:
        for lx in (18, 33):
            sc.rect(lx + 1, 24, 8, 6, SKIN)
            sc.rect(lx + 1, 27, 8, 1, INK)

    # nose + cheeks + mouth
    sc.rect(29, 32, 2, 1, SKIN2)
    sc.rect(21, 33, 3, 1, (250, 196, 178))
    sc.rect(38, 33, 3, 1, (250, 196, 178))
    sc.hline(27, 33, 35, INK)
    sc.rect(28, 36, 5, 1, SKIN3)
    sc.rect(29, 37, 3, 1, SKIN2)

    # shirt details
    sc.rect(12, 51, 5, 2, BLUE_D)
    sc.rect(43, 51, 5, 2, BLUE_D)

    # twinkle
    if t % 10 < 5:
        sc.rect(50, 6, 1, 3, YELLOW)
        sc.rect(49, 7, 3, 1, YELLOW)
    return sc.frame()


# ============================================================ 10. ticker ----
ICONS = {
    "chip": [
        "..X..X..",
        ".XXXXXX.",
        ".X....X.",
        "XX.XX.XX",
        "X..XX..X",
        "XX.XX.XX",
        ".X....X.",
        ".XXXXXX.",
    ],
    "disk": [
        "XXXXXXXX",
        "X.XXXX.X",
        "X.XXXX.X",
        "X......X",
        "XXXXXXXX",
        "X..XX..X",
        "X..XX..X",
        "XXXXXXXX",
    ],
    "chart": [
        "X.......",
        "X....o..",
        "X..X.o..",
        "X..X.o..",
        "X.X X.o.",
        "X.XXX.o.",
        "X.XXXXX.",
        "XXXXXXXX",
    ],
    "term": [
        "XXXXXXXXX",
        "X.......X",
        "X.XXX...X",
        "X...X...X",
        "X.XXX...X",
        "X.......X",
        "X.oXXo..X",
        "XXXXXXXXX",
        "X.......X",
    ],
    "cloud": [
        "..XXX....",
        ".XXXXX...",
        "XXXXXXXX.",
        "XXXXXXXX.",
        ".........",
    ],
}


def b_ticker(t: int, n: int) -> Image.Image:
    LW, LH = 320, 20
    sc = Scene(LW, LH, WHITE)
    sc.rect(0, 0, LW, 1, INK)
    sc.rect(0, LH - 1, LW, 1, INK)

    items = [
        ("icon", "chip"), ("text", "DATA SCIENCE"),
        ("icon", "chart"), ("text", "MACHINE LEARNING"),
        ("icon", "term"), ("text", "PYTHON / SQL"),
        ("icon", "disk"), ("text", "PIPELINES"),
        ("icon", "cloud"), ("text", "CLOUD GPU"),
    ]
    widths = []
    for kind, val in items:
        widths.append(9 if kind == "icon" else text_width(val))
    gap = 12
    period = sum(widths) + gap * len(items)

    off = (t * 2) % period
    x = -off
    while x < LW:
        cx = x
        for (kind, val), w in zip(items, widths):
            if cx > -20 and cx < LW:
                if kind == "icon":
                    glyph = ICONS[val]
                    for ry, row in enumerate(glyph):
                        for rx, ch in enumerate(row):
                            if ch == "X":
                                sc.dot(cx + rx, 5 + ry, INK)
                            elif ch == "o":
                                sc.dot(cx + rx, 5 + ry, BLUE)
                else:
                    sc.text(val, cx, 6, INK)
            cx += w + gap
        x += period
    return sc.frame()


BUILDERS = {
    "banner-skyline": (b_skyline, 40, 110),
    "strip-wave": (b_wave, 30, 80),
    "strip-code": (b_code, 30, 100),
    "strip-ticker": (b_ticker, 60, 90),
    "crt-monitor": (b_monitor, 24, 150),
    "window-loading": (b_window, 36, 110),
    "floppy": (b_floppy, 20, 120),
    "cursor": (b_cursor, 24, 90),
    "keyboard": (b_keyboard, 24, 110),
    "avatar": (b_avatar, 30, 110),
}

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "public", "gifs")
PREVIEW = os.path.join(BASE, "scripts", "preview")


def montage(frames, name, picks=(0, 1 / 3, 2 / 3)):
    imgs = [frames[min(len(frames) - 1, int(len(frames) * p))] for p in picks]
    w = sum(i.width for i in imgs) + 16 * (len(imgs) - 1)
    h = max(i.height for i in imgs)
    sheet = Image.new("RGB", (w, h), (255, 255, 255))
    x = 0
    for im in imgs:
        sheet.paste(im, (x, 0))
        x += im.width + 16
    os.makedirs(PREVIEW, exist_ok=True)
    sheet.save(os.path.join(PREVIEW, f"{name}.png"))


def build(name: str):
    fn, n, dur = BUILDERS[name]
    frames = [fn(t, n) for t in range(n)]
    montage(frames, name)
    return save_gif(frames, os.path.join(OUT, f"{name}.gif"), dur)


if __name__ == "__main__":
    wanted = sys.argv[1:] or list(BUILDERS)
    total = 0
    for name in wanted:
        if name not in BUILDERS:
            print(f"unknown: {name}")
            continue
        print(f"* {name}")
        COLORS.clear()
        total += build(name)
    print(f"\ntotal {total / 1024 / 1024:.2f} MB")
