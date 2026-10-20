"""픽셀 학교 투어 그림 교체 도구

GPT 등으로 새로 만든 원본 PNG를 한 폴더에 모아 두고 실행하면,
지난번 원본과 지문(sha256)을 비교해 바뀐 그림만 WebP로 변환해 tour/img에 넣습니다.

    python3 tour/tools/update_assets.py <원본 폴더>            # 바뀐 파일 확인 + 변환
    python3 tour/tools/update_assets.py <원본 폴더> --dry-run  # 확인만

필요: Python 3, Pillow (pip install pillow)
공유 미리보기(share)는 글자를 얹기 위해 fonttools, brotli도 필요합니다 (pip install fonttools brotli).
"""
import hashlib
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

TOUR = Path(__file__).resolve().parent.parent
FONTS = TOUR.parent / "assets" / "fonts"
MANIFEST = TOUR / "img" / "ASSET-SOURCES.json"
BACKGROUND_SIZE = (1774, 887)   # 배경 그림은 2:1 비율이어야 좌표가 맞습니다


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def convert(src, entry):
    im = Image.open(src)
    out = TOUR / "img" / entry["output"]
    kind = entry["kind"]
    if kind == "background":
        if abs(im.width / im.height - 2) > 0.01:
            raise SystemExit(f"{src.name}: 가로:세로가 2:1이 아닙니다 ({im.width}x{im.height})")
        if im.size != BACKGROUND_SIZE:
            print(f"  ! {src.name}: 크기 {im.width}x{im.height} → {BACKGROUND_SIZE[0]}x{BACKGROUND_SIZE[1]}로 맞춥니다")
            im = im.resize(BACKGROUND_SIZE, Image.LANCZOS)
        im.convert("RGB").save(out, "WEBP", quality=88, method=6)
    elif kind == "guide":
        im = im.crop(im.getbbox())
        im = im.resize((240, round(240 * im.height / im.width)), Image.LANCZOS)
        im.save(out, "WEBP", quality=90, method=6)
    elif kind == "photo":
        # 실제 사진: 회전 정보 반영 후 긴 변 2000px로 줄이고, 위치(GPS) 등 촬영 정보는 저장하지 않음
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((2000, 2000), Image.LANCZOS)
        im.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    elif kind == "share":
        make_share_image(im, out)
    elif kind == "sprite":
        if im.size != (96, 160):
            raise SystemExit(f"{src.name}: 캐릭터 시트는 96x160(32x40 칸, 3열x4행)이어야 합니다 ({im.width}x{im.height})")
        im.save(out, "PNG", optimize=True)
    return out


def load_font(name, size):
    """사이트 글꼴(otf)을 불러옵니다. 글꼴 파일은 바꾸지 않습니다."""
    from fontTools.ttLib import TTFont
    font = TTFont(FONTS / name)
    font.flavor = None
    buffer = io.BytesIO()
    font.save(buffer)
    buffer.seek(0)
    return ImageFont.truetype(buffer, size)


def make_share_image(im, out):
    """링크 공유 미리보기(1200x630): 왼쪽 남색 여백에 제목을 얹어 JPG로 저장"""
    if im.size != (1200, 630):
        raise SystemExit(f"공유 그림은 1200x630이어야 합니다 ({im.width}x{im.height})")
    canvas = Image.new("RGB", im.size, "#14285a")
    canvas.paste(im.convert("RGBA"), (0, 0), im.convert("RGBA"))
    draw = ImageDraw.Draw(canvas)
    x = 64
    draw.text((x, 150), "군산여자상업고등학교", font=load_font("EliceDXNeolli-Bold.otf", 30), fill="#ffd84d")
    draw.text((x, 196), "픽셀 학교 투어", font=load_font("CookieRun-Black.otf", 76), fill="#ffffff")
    body = load_font("EliceDXNeolli-Medium.otf", 30)
    draw.text((x, 320), "캐릭터와 함께 1층부터 5층까지", font=body, fill="#d5def0")
    draw.text((x, 362), "우리 학교를 걸어 봐요", font=body, fill="#d5def0")
    draw.rounded_rectangle((x, 446, x + 300, 500), radius=27, fill="#ffd84d")
    draw.text((x + 150, 473), "학교 둘러보기 →", font=load_font("EliceDXNeolli-Bold.otf", 26), fill="#14285a", anchor="mm")
    canvas.save(out, "JPEG", quality=88, optimize=True, progressive=True)


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    source_dir = Path(sys.argv[1])
    dry_run = "--dry-run" in sys.argv
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    changed = []
    for name, entry in manifest["sources"].items():
        src = source_dir / name
        if not src.exists():
            continue
        digest = sha256(src)
        if digest == entry["sha256"]:
            print(f"  = {name} (변경 없음)")
            continue
        print(f"  * {name} → img/{entry['output']} (바뀜)")
        changed.append(name)
        if not dry_run:
            convert(src, entry)
            entry["sha256"] = digest
    unknown = sorted(p.name for p in source_dir.glob("*.png") if p.name not in manifest["sources"])
    for name in unknown:
        print(f"  ? {name}: 목록에 없는 파일입니다. 새 그림이면 ASSET-SOURCES.json에 추가해 주세요.")
    if changed and not dry_run:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"바뀐 그림 {len(changed)}개" + (" (확인만 함)" if dry_run else ""))
    if changed:
        print("배경을 바꿨다면 tour-data.js의 walkAreas·이름표 위치가 새 그림과 맞는지 꼭 확인하세요.")


if __name__ == "__main__":
    main()
