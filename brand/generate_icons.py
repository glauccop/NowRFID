"""Generates the NowRFID launcher icons and logo assets from the brand mark.

The launcher icon is a simplified redraw of brand/NowRFID-original.jpeg (3 thicker antenna
coils instead of 7) so it stays legible at 48 px and survives Android's adaptive-icon masks.

Usage (Pillow required):  python3 brand/generate_icons.py
"""
import math
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, 'brand')
RES = os.path.join(ROOT, 'android-app', 'android', 'app', 'src', 'main', 'res')
APP_ASSETS = os.path.join(ROOT, 'android-app', 'src', 'assets')

NAVY = (6, 47, 65)  # sampled from the original logo (≈ Horizon native-mobile splash #032D42)
GREEN = (98, 203, 75)  # sampled from the original logo
WHITE = (255, 255, 255)
CLEAR = (0, 0, 0, 0)
SS = 4  # supersampling for anti-aliasing
FONT_CANDIDATES = [
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]

# Android densities: legacy icon is 48dp, adaptive layers are 108dp.
DENSITIES = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
MARK_CONTENT = 0.50  # artwork side / 108dp canvas: stays inside the circular mask


def font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def coil_points(x0, y0, x1, y1, r, chamfer, steps=24):
    """Rounded rectangle whose bottom-right corner is cut diagonally, like the logo's antenna."""
    pts = []

    def arc(cx, cy, a0, a1):
        for i in range(steps + 1):
            a = math.radians(a0 + (a1 - a0) * i / steps)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))

    arc(x0 + r, y0 + r, 180, 270)
    arc(x1 - r, y0 + r, 270, 360)
    pts.append((x1, y1 - chamfer))
    pts.append((x1 - chamfer, y1))
    arc(x0 + r, y1 - r, 90, 180)
    pts.append(pts[0])
    return pts


def draw_mark(size, background=NAVY, color=GREEN, ink=NAVY, content=MARK_CONTENT):
    """Draws the mark centred on a size×size canvas. background=None → transparent."""
    s = size * SS
    img = Image.new('RGBA', (s, s), (background + (255,)) if background else CLEAR)
    d = ImageDraw.Draw(img)
    side = s * content
    o = (s - side) / 2
    u = side / 100.0
    stroke = int(5.2 * u)

    coils = [(0, 24, 27), (11, 17, 22), (22, 11, 13)]  # inset, corner radius, chamfer
    for inset, r, ch in coils:
        pts = coil_points(o + inset * u, o + inset * u, o + (100 - inset) * u, o + (100 - inset) * u, r * u, ch * u)
        d.line(pts, fill=color, width=stroke, joint='curve')

    inner = coils[-1][0]
    c0, c1 = o + (inner + 9) * u, o + (100 - inner - 9) * u
    d.rounded_rectangle((c0, c0, c1, c1), radius=5 * u, fill=color)
    lead_y = o + 57 * u
    d.line((c1, lead_y, o + (100 - inner) * u, lead_y), fill=color, width=stroke)

    chip = c1 - c0
    cx = cy = (c0 + c1) / 2
    d.text((cx, cy + chip * 0.02), 'RFID', font=font(int(chip * 0.30)), fill=ink, anchor='mm')
    w = max(1, int(chip * 0.045))
    for rad, half in ((chip * 0.17, 40), (chip * 0.26, 32)):
        top, bot = cy - chip * 0.10, cy + chip * 0.12
        d.arc((cx - rad, top - rad, cx + rad, top + rad), 270 - half, 270 + half, fill=ink, width=w)
        d.arc((cx - rad, bot - rad, cx + rad, bot + rad), 90 - half, 90 + half, fill=ink, width=w)

    return img.resize((size, size), Image.LANCZOS)


def shaped(size, shape, content):
    """Legacy (pre-Android 8) icon: navy shape with transparent margin, mark on top."""
    s = size * SS
    img = Image.new('RGBA', (s, s), CLEAR)
    d = ImageDraw.Draw(img)
    pad = s * 0.04
    if shape == 'circle':
        d.ellipse((pad, pad, s - pad, s - pad), fill=NAVY + (255,))
    else:
        d.rounded_rectangle((pad, pad, s - pad, s - pad), radius=s * 0.18, fill=NAVY + (255,))
    mark = draw_mark(s, background=None, content=content)
    img.alpha_composite(mark)
    return img.resize((size, size), Image.LANCZOS)


def save(img, *path):
    full = os.path.join(*path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    img.save(full, optimize=True)
    return full


def main():
    for name, scale in DENSITIES.items():
        folder = os.path.join(RES, f'mipmap-{name}')
        legacy, layer = round(48 * scale), round(108 * scale)
        save(shaped(legacy, 'square', 0.70), folder, 'ic_launcher.png')
        save(shaped(legacy, 'circle', 0.62), folder, 'ic_launcher_round.png')
        save(draw_mark(layer, background=None), folder, 'ic_launcher_foreground.png')
        # Android 13 themed icon: single-colour silhouette, chip text cut out.
        save(draw_mark(layer, background=None, color=WHITE, ink=CLEAR), folder, 'ic_launcher_monochrome.png')

    save(draw_mark(512, content=0.62), BRAND, 'nowrfid-icon-512.png')  # store / docs
    save(draw_mark(1024, content=0.62), BRAND, 'nowrfid-icon-1024.png')
    save(shaped(192, 'square', 0.70), APP_ASSETS, 'logo-mark.png')  # in-app header

    # Full logo (original artwork) for large surfaces, e.g. the ServiceNow dashboard.
    original = Image.open(os.path.join(BRAND, 'NowRFID-original.jpeg')).convert('RGB')
    for px in (512, 256):
        save(original.resize((px, px), Image.LANCZOS), BRAND, f'nowrfid-logo-{px}.png')
    print('icons generated')


if __name__ == '__main__':
    main()
