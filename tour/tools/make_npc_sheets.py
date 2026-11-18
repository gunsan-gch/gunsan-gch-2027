"""선배 지도·게임 캐릭터 시트 만들기

플레이어 캐릭터(img/walker.png, 32×40 칸 · 3열 걷기 × 4행 방향)를 바탕으로
머리색·머리 모양·소품·옷 색만 바꿔 선배마다 같은 크기와 그림체의 걷기 시트를 만듭니다.
그래서 지도 위에서 플레이어와 나란히 서도 키·비율이 같습니다.

    python3 tour/tools/make_npc_sheets.py      # img/npcs/sheets/<id>.png 생성

필요: Python 3, Pillow
"""
from pathlib import Path

from PIL import Image

TOUR = Path(__file__).resolve().parent.parent
BASE = TOUR / "img" / "walker.png"
OUT = TOUR / "img" / "npcs" / "sheets"
DIRS = ["down", "right", "up", "left"]
FW, FH = 32, 40
INK = (25, 20, 29, 255)         # 외곽선 (walker와 같은 거의 검정)


def hexc(h, a=255):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (a,)


def lum(p):
    return 0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2]


def tint(p, target, ref):
    """밝기는 유지하고 색만 target 쪽으로 (그림자·하이라이트가 그대로 남음)"""
    k = lum(p) / ref
    return tuple(max(0, min(255, round(c * k))) for c in target[:3]) + (p[3],)


# ---------- 색 바꾸기 ----------

def is_outline(p):
    return max(p[:3]) < 24


def recolor(frame, hair=None, jacket=None, skirt=None):
    px = frame.load()
    for y in range(FH):
        for x in range(FW):
            p = px[x, y]
            if p[3] == 0 or is_outline(p):
                continue
            r, g, b = p[:3]
            if hair and y <= 19 and r < 170 and not (r > 180):   # 머리 (얼굴 피부는 밝아서 제외)
                if r >= g - 4 and r - b < 40:
                    px[x, y] = tint(p, hair, 56)
                    continue
            if skirt and 21 <= y <= 28 and g > r + 12:           # 치마 (청록이라 상의보다 먼저 가름)
                px[x, y] = tint(p, skirt, 45)
                continue
            if jacket and 19 <= y <= 25 and b > r + 8:           # 교복 상의
                px[x, y] = tint(p, jacket, 37)


# ---------- 덧그리기 ----------

def stamp(frame, x0, y0, rows, colors, under=False):
    """rows: 문자열 줄. '.'은 건너뜀. under=True면 비어 있는 칸에만 (몸 뒤로)"""
    px = frame.load()
    for dy, row in enumerate(rows):
        for dx, key in enumerate(row):
            if key == '.':
                continue
            x, y = x0 + dx, y0 + dy
            if not (0 <= x < FW and 0 <= y < FH):
                continue
            if under and px[x, y][3] > 0:
                continue
            px[x, y] = colors[key]


def band(frame, rows, color, shade):
    """머리띠: 머리카락 칸만 색을 바꿈 (얼굴·외곽선은 그대로)"""
    px = frame.load()
    for y, c in zip(rows, (color, shade)):
        for x in range(FW):
            p = px[x, y]
            if p[3] and not is_outline(p) and p[0] < 170:
                px[x, y] = c


def mirror(rows):
    return [r[::-1] for r in rows]


BUN = ['..####..',
       '.#hhHh#.',
       '#hhhhhH#',
       '#hHhhhh#',
       '.#hhhh#.']

BOW = ['.##..##.',
       '#pp##pp#',
       '#ppPPpp#',
       '#pp##pp#',
       '.##..##.']

TAIL = ['.##.',      # 옆으로 묶은 머리 (귀 뒤에서 내려옴)
        '#hh#',
        '#rr#',
        '#hh#',
        '#hhh#',
        '#hHh#',
        '#hhh#',
        '.#hh#',
        '.#hH#',
        '.#hh#',
        '..#h#',
        '..##.']

LONG_SIDE = ['#hh',       # 어깨 아래로 내려오는 긴 머리 (앞모습 양옆)
             '#hh',
             '#hH',
             '#hh',
             '#hh',
             '.#h',
             '.##']

LONG_BACK = ['#hhhhhhhhhhhhhh#',   # 뒷모습: 등 위로 덮는 긴 머리
             '#hhhHhhhhhhHhhh#',
             '#hhhhhhhhhhhhhh#',
             '#hhhhhHhhHhhhhh#',
             '.#hhhhhhhhhhhh#.',
             '..#hhhhhhhhhh#..',
             '...##########...']

POSTER = ['.###.',     # 돌돌 만 포스터 (오른손)
          '#ccc#',
          '#rrr#',
          '#ccc#',
          '#ccc#',
          '#rrr#',
          '.###.']


def make(npc):
    sheet = Image.open(BASE).convert("RGBA")
    out = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    hair = npc["hair"]
    hl = tuple(min(255, round(c * 1.35)) for c in hair[:3]) + (255,)
    colors = {"#": INK, "h": hair, "H": hl, **npc.get("colors", {})}
    for row, d in enumerate(DIRS):
        for col in range(3):
            f = sheet.crop((col * FW, row * FH, (col + 1) * FW, (row + 1) * FH))
            recolor(f, hair=hair, jacket=npc.get("jacket"), skirt=npc.get("skirt"))
            npc["decorate"](f, d, col, colors)
            out.paste(f, (col * FW, row * FH))
    return out


# ---------- 선배별 ----------

def arum(f, d, col, c):
    """아름: 밝은 밤색 긴 생머리 + 큰 분홍 리본"""
    if d == "down":
        stamp(f, 5, 18, LONG_SIDE, c, under=True)
        stamp(f, 24, 18, mirror(LONG_SIDE), c, under=True)
        stamp(f, 19, 2, BOW, c)
    elif d == "up":
        stamp(f, 8, 19, LONG_BACK, c)
        stamp(f, 5, 2, BOW, c)
    elif d == "right":
        stamp(f, 6, 17, LONG_SIDE + ['.##'], c, under=True)
        stamp(f, 7, 2, BOW, c)
    else:
        stamp(f, 22, 17, mirror(LONG_SIDE + ['.##']), c, under=True)
        stamp(f, 17, 2, BOW, c)


def songhyeon(f, d, col, c):
    """송현: 왼쪽으로 묶은 머리 + 돌돌 만 초대 포스터"""
    if d == "down":
        stamp(f, 3, 11, TAIL, c, under=True)
        stamp(f, 22, 19, POSTER, c)
    elif d == "up":
        stamp(f, 24, 11, mirror(TAIL), c, under=True)
    elif d == "right":
        stamp(f, 4, 12, TAIL, c, under=True)
        stamp(f, 19, 19, POSTER, c)
    else:
        stamp(f, 23, 12, mirror(TAIL), c, under=True)
        stamp(f, 8, 19, POSTER, c)


def sua(f, d, col, c):
    """수아: 높이 올린 똥머리 + 산호색 머리띠, 민트 체육복"""
    bx = {"down": 12, "up": 12, "right": 10, "left": 14}[d]
    stamp(f, bx, 0, BUN, c)
    band(f, (6, 7), c["b"], c["B"])


NPCS = {
    "arum": dict(hair=hexc("#8a5a3c"), decorate=arum,
                 colors={"p": hexc("#f28aa5"), "P": hexc("#c2546b")}),
    "songhyeon": dict(hair=hexc("#36302f"), decorate=songhyeon,
                      colors={"r": hexc("#e2766f"), "c": hexc("#fbefd4")}),
    "sua": dict(hair=hexc("#2e2427"), decorate=sua,
                jacket=hexc("#5fb39a"), skirt=hexc("#2b3e66"),
                colors={"b": hexc("#ef7d6d"), "B": hexc("#c4524a")}),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, npc in NPCS.items():
        path = OUT / f"{name}.png"
        make(npc).save(path, optimize=True)
        print(path.relative_to(TOUR.parent))


if __name__ == "__main__":
    main()
