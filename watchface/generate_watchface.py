"""
Generador de carátula "Activamente" para Xiaomi Redmi Watch 4
Estilo ANA-DIGI: hora digital arriba + dial analógico abajo
Resolución: 390 x 450 px
"""

import os
import json
import math
import zipfile
from PIL import Image, ImageDraw, ImageFont

W, H = 390, 450
# Centro del dial analógico (zona inferior)
CX, CY = W // 2, 295
R_OUTER = 108
R_TRACK = 96

OUT = os.path.dirname(os.path.abspath(__file__)) + "/assets"
os.makedirs(OUT, exist_ok=True)

BG        = (8, 12, 20)
ACCENT    = (0, 200, 255)
ACCENT2   = (0, 100, 160)
WHITE     = (255, 255, 255)
GRAY      = (110, 120, 135)
DARK_GRAY = (35, 44, 56)
RED       = (255, 60, 80)
GREEN     = (60, 220, 120)


def font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ] if bold else [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def polar(cx, cy, r, deg):
    rad = math.radians(deg - 90)
    return cx + r * math.cos(rad), cy + r * math.sin(rad)


def draw_rr(draw, xy, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_icon_steps(draw, cx, cy, size, color):
    s = max(size // 3, 3)
    draw.ellipse([cx - s*2 - 1, cy - s,     cx - s - 1, cy + s    ], fill=color)
    draw.ellipse([cx + s - 1,   cy - s*2,   cx + s*2-1, cy        ], fill=color)


def draw_icon_battery(draw, cx, cy, w, h, pct=80):
    fc = GREEN if pct > 30 else RED
    draw.rectangle([cx - w//2, cy - h//2, cx + w//2, cy + h//2], outline=GRAY, width=1)
    draw.rectangle([cx + w//2, cy - h//4, cx + w//2 + 2, cy + h//4], fill=GRAY)
    fw = int((w - 2) * pct / 100)
    draw.rectangle([cx - w//2 + 1, cy - h//2 + 1,
                    cx - w//2 + 1 + fw, cy + h//2 - 1], fill=fc)


# ── FONDO ────────────────────────────────────────────────────
def make_background():
    img = Image.new("RGBA", (W, H), BG)

    # Anillos decorativos tenues alrededor del dial
    for r, alpha in [(R_OUTER + 12, 20), (R_OUTER + 5, 30)]:
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        od.ellipse([CX - r, CY - r, CX + r, CY + r],
                   outline=(*ACCENT, alpha), width=1)
        img = Image.alpha_composite(img, ov)

    draw = ImageDraw.Draw(img)

    # Bisel de acento
    draw.arc([CX - R_OUTER - 4, CY - R_OUTER - 4,
              CX + R_OUTER + 4, CY + R_OUTER + 4],
             start=120, end=420, fill=(*ACCENT2, 160), width=3)

    # Marcadores de horas
    for h in range(12):
        angle = h * 30
        if h % 3 == 0:
            p1 = polar(CX, CY, R_TRACK,      angle)
            p2 = polar(CX, CY, R_TRACK - 14, angle)
            draw.line([p1, p2], fill=WHITE, width=3)
        else:
            p1 = polar(CX, CY, R_TRACK,      angle)
            p2 = polar(CX, CY, R_TRACK - 8,  angle)
            draw.line([p1, p2], fill=GRAY, width=2)

    # Puntos de minutos
    for m in range(60):
        if m % 5 != 0:
            angle = m * 6
            p1 = polar(CX, CY, R_TRACK,     angle)
            p2 = polar(CX, CY, R_TRACK - 4, angle)
            draw.line([p1, p2], fill=(*GRAY, 90), width=1)

    # Números 12 / 3 / 6 / 9
    f_n = font(15, bold=True)
    for h, label in [(0, "12"), (3, "3"), (6, "6"), (9, "9")]:
        x, y = polar(CX, CY, R_TRACK - 26, h * 30)
        draw.text((x, y), label, font=f_n, fill=WHITE, anchor="mm")

    # Punto central
    r = 7
    draw.ellipse([CX - r, CY - r, CX + r, CY + r], fill=ACCENT, outline=WHITE, width=2)

    # Línea separadora sutil entre zona digital y dial
    draw.line([(30, 192), (W - 30, 192)], fill=(*DARK_GRAY, 200), width=1)

    img.save(f"{OUT}/background.png")
    print("✓ background.png")
    return img


# ── MANECILLAS ───────────────────────────────────────────────
def make_hour_hand():
    size, pivot = 140, 70
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    tip_y, base_y, hw = pivot - 58, pivot + 16, 5
    poly = [
        (pivot - hw, base_y), (pivot - hw + 2, pivot),
        (pivot - 3, tip_y + 6), (pivot, tip_y),
        (pivot + 3, tip_y + 6), (pivot + hw - 2, pivot),
        (pivot + hw, base_y),
    ]
    draw.polygon(poly, fill=WHITE)
    draw.polygon(poly, outline=(*GRAY, 160), width=1)
    draw.line([(pivot, base_y - 3), (pivot, tip_y + 3)], fill=(*ACCENT, 150), width=2)
    img.save(f"{OUT}/hand_hour.png")
    print("✓ hand_hour.png")
    return img


def make_minute_hand():
    size, pivot = 140, 70
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    tip_y, base_y, hw = pivot - 80, pivot + 18, 3
    poly = [
        (pivot - hw, base_y), (pivot - hw + 1, pivot),
        (pivot - 2, tip_y + 8), (pivot, tip_y),
        (pivot + 2, tip_y + 8), (pivot + hw - 1, pivot),
        (pivot + hw, base_y),
    ]
    draw.polygon(poly, fill=ACCENT)
    draw.polygon(poly, outline=(*ACCENT2, 200), width=1)
    img.save(f"{OUT}/hand_minute.png")
    print("✓ hand_minute.png")
    return img


def make_second_hand():
    size, pivot = 140, 70
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.line([(pivot, pivot - 88), (pivot, pivot + 24)], fill=RED, width=2)
    r = 3
    draw.ellipse([pivot - r, pivot - r, pivot + r, pivot + r], fill=RED)
    img.save(f"{OUT}/hand_second.png")
    print("✓ hand_second.png")
    return img


# ── WIDGET PASOS ─────────────────────────────────────────────
def make_steps_widget():
    iw, ih = 160, 52
    img = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_rr(draw, [0, 0, iw - 1, ih - 1], 12, DARK_GRAY)
    draw_icon_steps(draw, 24, ih // 2, 14, GREEN)
    draw.text((50, 10),       "PASOS",  font=font(11),       fill=GRAY,  anchor="la")
    draw.text((50, 28),       "8 420",  font=font(17, True),  fill=WHITE, anchor="la")
    img.save(f"{OUT}/steps_widget.png")
    print("✓ steps_widget.png")
    return img


# ── PREVIEW COMPLETO ─────────────────────────────────────────
def make_preview(hour=10, minute=10, second=30):
    bg = make_background().copy()

    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)

    # ── HORA DIGITAL grande (zona superior)
    f_time = font(88, bold=True)
    f_sep  = font(76, bold=True)
    time_y = 105
    h_str  = f"{hour:02d}"
    m_str  = f"{minute:02d}"

    # Sombra tenue
    od.text((CX - 6 + 2, time_y + 2), h_str, font=f_time, fill=(0, 0, 0, 80), anchor="rm")
    od.text((CX + 6 + 2, time_y + 2), m_str, font=f_time, fill=(0, 0, 0, 80), anchor="lm")

    od.text((CX - 6, time_y), h_str, font=f_time, fill=WHITE,  anchor="rm")
    od.text((CX,     time_y), ":",   font=f_sep,  fill=ACCENT, anchor="mm")
    od.text((CX + 6, time_y), m_str, font=f_time, fill=ACCENT, anchor="lm")

    # ── FECHA (pastilla)
    f_date = font(16, bold=True)
    draw_rr(od, [CX - 72, 140, CX + 72, 164], 8, DARK_GRAY)
    od.text((CX, 152), "LUN  18  MAY", font=f_date, fill=ACCENT, anchor="mm")

    # ── BATERÍA (bajo la fecha)
    bat_y = 180
    draw_icon_battery(od, CX - 28, bat_y, 22, 11, pct=80)
    od.text((CX - 12, bat_y), "80 %", font=font(14, bold=True), fill=WHITE, anchor="lm")

    bg = Image.alpha_composite(bg, ov)

    # ── MANECILLAS analógicas
    def paste_hand(base, hand_img, deg):
        rot = hand_img.rotate(-deg, resample=Image.BICUBIC, expand=False)
        base.alpha_composite(rot, dest=(CX - rot.width // 2, CY - rot.height // 2))

    h_img = make_hour_hand()
    m_img = make_minute_hand()
    s_img = make_second_hand()

    paste_hand(bg, h_img, (hour % 12) * 30 + minute * 0.5)
    paste_hand(bg, m_img, minute * 6 + second * 0.1)
    paste_hand(bg, s_img, second * 6)

    # Punto central encima de manecillas
    ov2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od2 = ImageDraw.Draw(ov2)
    r = 6
    od2.ellipse([CX - r, CY - r, CX + r, CY + r], fill=ACCENT, outline=WHITE, width=2)
    bg = Image.alpha_composite(bg, ov2)

    # ── WIDGET PASOS (centrado abajo)
    sw = make_steps_widget()
    sw_x = CX - sw.width // 2
    sw_y = H - sw.height - 12
    bg.alpha_composite(sw, dest=(sw_x, sw_y))

    final = bg.convert("RGB")
    final.save(f"{OUT}/../preview.png", quality=95)
    print("✓ preview.png  (390×450)")
    return bg


# ── MANIFEST JSON ────────────────────────────────────────────
def make_manifest():
    manifest = {
        "Description": {
            "Family": "Redmi Watch 4",
            "DeviceList": ["Redmi Watch 4"],
            "Title": "Activamente",
            "Author": "activamente",
            "Version": "3.0.0",
            "Resolution": {"Width": W, "Height": H}
        },
        "Background": {
            "Image": {"FileName": "assets/background.png", "Coordinates": {"X": 0, "Y": 0}}
        },
        "Time": {
            "Hours": {
                "Tens":  {"ImageSet": {"ImageCount": 10, "ImagesPattern": "assets/hour_digit_{d}.png", "Coordinates": {"X": 52,  "Y": 58}}},
                "Units": {"ImageSet": {"ImageCount": 10, "ImagesPattern": "assets/hour_digit_{d}.png", "Coordinates": {"X": 140, "Y": 58}}}
            },
            "Separator": {"Image": {"FileName": "assets/separator.png", "Coordinates": {"X": 185, "Y": 58}}},
            "Minutes": {
                "Tens":  {"ImageSet": {"ImageCount": 10, "ImagesPattern": "assets/min_digit_{d}.png", "Coordinates": {"X": 200, "Y": 58}}},
                "Units": {"ImageSet": {"ImageCount": 10, "ImagesPattern": "assets/min_digit_{d}.png", "Coordinates": {"X": 275, "Y": 58}}}
            }
        },
        "Date": {
            "Text": {
                "Coordinates": {"X": CX - 72, "Y": 140},
                "Size": {"Width": 144, "Height": 24},
                "Alignment": "Center",
                "Color": "00C8FF",
                "Font": {"Name": "default", "Size": 16}
            }
        },
        "Battery": {
            "Widget": {"FileName": "assets/battery_inline.png", "Coordinates": {"X": CX - 40, "Y": 170}}
        },
        "AnalogDialFace": {
            "ClockHands": {
                "Hours":   {"Image": {"FileName": "assets/hand_hour.png"},   "Pivot": {"X": 70, "Y": 70}, "Coordinates": {"X": CX - 70, "Y": CY - 70}},
                "Minutes": {"Image": {"FileName": "assets/hand_minute.png"}, "Pivot": {"X": 70, "Y": 70}, "Coordinates": {"X": CX - 70, "Y": CY - 70}},
                "Seconds": {"Image": {"FileName": "assets/hand_second.png"}, "Pivot": {"X": 70, "Y": 70}, "Coordinates": {"X": CX - 70, "Y": CY - 70}}
            }
        },
        "Activity": {
            "Steps": {"Widget": {"FileName": "assets/steps_widget.png", "Coordinates": {"X": CX - 80, "Y": H - 64}}}
        }
    }
    with open(f"{OUT}/../manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print("✓ manifest.json")


# ── EMPAQUETAR ───────────────────────────────────────────────
def make_face_package():
    face_path = f"{OUT}/../activamente.face"
    with zipfile.ZipFile(face_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(f"{OUT}/../manifest.json", "manifest.json")
        zf.write(f"{OUT}/../preview.png",   "preview.png")
        for fname in sorted(os.listdir(OUT)):
            if fname.endswith(".png"):
                zf.write(f"{OUT}/{fname}", f"assets/{fname}")
    print(f"✓ activamente.face  ({os.path.getsize(face_path) // 1024} KB)")


# ── MAIN ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Generando carátula Activamente v3 para Redmi Watch 4…\n")
    make_preview(hour=10, minute=10, second=30)
    make_manifest()
    make_face_package()
    print("\n¡Listo! Archivos en watchface/")
