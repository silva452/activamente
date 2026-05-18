"""
Generador de carátula analógica "Activamente" para Xiaomi Redmi Watch 4
Resolución: 390 x 450 px
"""

import os
import json
import math
import zipfile
from PIL import Image, ImageDraw, ImageFont

# ── Constantes ──────────────────────────────────────────────
W, H = 390, 450
# Centro del reloj analógico (ligeramente arriba del centro)
CX, CY = W // 2, 210
OUT = os.path.dirname(os.path.abspath(__file__)) + "/assets"
os.makedirs(OUT, exist_ok=True)

# Paleta
BG        = (8, 12, 20)
ACCENT    = (0, 200, 255)
ACCENT2   = (0, 100, 160)
WHITE     = (255, 255, 255)
GRAY      = (110, 120, 135)
DARK_GRAY = (35, 44, 56)
RED       = (255, 60, 80)
GREEN     = (60, 220, 120)
GOLD      = (255, 200, 60)

def font(size, bold=False):
    candidates_bold = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for p in (candidates_bold if bold else candidates):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def polar(cx, cy, r, deg):
    """Punto en coordenadas polares (0° = 12 en punto)."""
    rad = math.radians(deg - 90)
    return cx + r * math.cos(rad), cy + r * math.sin(rad)


def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_icon_heart(draw, cx, cy, size, color):
    s = size // 2
    for dx in range(-s, s):
        for dy in range(-s, s):
            dist = ((abs(dx) - s // 2) ** 2 + (dy - (-s // 4)) ** 2) ** 0.5
            if dist < s * 0.7 and dy < s - abs(dx) * 0.8:
                draw.point((cx + dx, cy + dy - s // 4), fill=color)


def draw_icon_steps(draw, cx, cy, size, color):
    s = max(size // 3, 3)
    draw.ellipse([cx - s*2 - 1, cy - s, cx - s - 1, cy + s], fill=color)
    draw.ellipse([cx + s - 1, cy - s*2, cx + s*2 - 1, cy], fill=color)


def draw_icon_battery(draw, cx, cy, w, h, color, pct=80):
    draw.rectangle([cx - w//2, cy - h//2, cx + w//2, cy + h//2], outline=color, width=1)
    draw.rectangle([cx + w//2, cy - h//4, cx + w//2 + 2, cy + h//4], fill=color)
    fill_w = int((w - 2) * pct / 100)
    fc = GREEN if pct > 30 else RED
    draw.rectangle([cx - w//2 + 1, cy - h//2 + 1,
                    cx - w//2 + 1 + fill_w, cy + h//2 - 1], fill=fc)


# ── 1. MANECILLA DE HORAS ───────────────────────────────────
def make_hour_hand():
    """
    Manecilla de horas apuntando hacia arriba (12 en punto).
    Pivot en el centro del canvas = (90, 90).
    Longitud: 80 px hacia arriba, cola 20 px hacia abajo.
    """
    size = 180
    pivot = size // 2
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    tip_y   = pivot - 80
    base_y  = pivot + 20
    half_w  = 6

    # Cuerpo con degradado simulado (dos rectángulos + punta)
    poly = [
        (pivot - half_w, base_y),
        (pivot - half_w + 2, pivot),
        (pivot - 3, tip_y + 8),
        (pivot, tip_y),
        (pivot + 3, tip_y + 8),
        (pivot + half_w - 2, pivot),
        (pivot + half_w, base_y),
    ]
    draw.polygon(poly, fill=WHITE)
    # Borde sutil
    draw.polygon(poly, outline=(*GRAY, 180), width=1)
    # Línea central de acento
    draw.line([(pivot, base_y - 4), (pivot, tip_y + 4)], fill=(*ACCENT, 160), width=2)

    img.save(f"{OUT}/hand_hour.png")
    print("✓ hand_hour.png")
    return img


# ── 2. MANECILLA DE MINUTOS ─────────────────────────────────
def make_minute_hand():
    """
    Manecilla de minutos apuntando hacia arriba.
    Más larga y delgada que la de horas.
    """
    size = 180
    pivot = size // 2
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    tip_y  = pivot - 110
    base_y = pivot + 22
    half_w = 4

    poly = [
        (pivot - half_w, base_y),
        (pivot - half_w + 1, pivot),
        (pivot - 2, tip_y + 10),
        (pivot, tip_y),
        (pivot + 2, tip_y + 10),
        (pivot + half_w - 1, pivot),
        (pivot + half_w, base_y),
    ]
    draw.polygon(poly, fill=ACCENT)
    draw.polygon(poly, outline=(*ACCENT2, 200), width=1)
    draw.line([(pivot, base_y - 4), (pivot, tip_y + 4)], fill=(*WHITE, 120), width=1)

    img.save(f"{OUT}/hand_minute.png")
    print("✓ hand_minute.png")
    return img


# ── 3. SEGUNDERO ─────────────────────────────────────────────
def make_second_hand():
    """Segundero fino en rojo/naranja."""
    size = 180
    pivot = size // 2
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    tip_y  = pivot - 120
    base_y = pivot + 30

    draw.line([(pivot, tip_y), (pivot, base_y)], fill=RED, width=2)
    # Círculo pequeño en el pivot
    r = 4
    draw.ellipse([pivot - r, pivot - r, pivot + r, pivot + r], fill=RED)

    img.save(f"{OUT}/hand_second.png")
    print("✓ hand_second.png")
    return img


# ── 4. FONDO DE ESFERA ANALÓGICA ────────────────────────────
def make_background():
    img = Image.new("RGBA", (W, H), BG)
    draw = ImageDraw.Draw(img)

    R_OUTER = 175   # radio exterior decorativo
    R_TRACK = 160   # pista de marcadores
    R_NUM   = 138   # radio para números de hora

    # Anillo exterior tenue
    for r, alpha in [(R_OUTER, 30), (R_OUTER - 3, 15)]:
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        od.ellipse([CX - r, CY - r, CX + r, CY + r],
                   outline=(*ACCENT, alpha), width=1)
        img = Image.alpha_composite(img, ov)

    draw = ImageDraw.Draw(img)

    # Arco de acento en el borde (tipo bisel)
    draw.arc([CX - R_OUTER, CY - R_OUTER, CX + R_OUTER, CY + R_OUTER],
             start=120, end=420, fill=(*ACCENT2, 140), width=3)

    # Marcadores de 12 horas
    for h in range(12):
        angle = h * 30  # 0° = 12
        if h % 3 == 0:
            # Marcadores largos en 12, 3, 6, 9
            p1 = polar(CX, CY, R_TRACK, angle)
            p2 = polar(CX, CY, R_TRACK - 18, angle)
            draw.line([p1, p2], fill=WHITE, width=3)
        else:
            # Marcadores cortos
            p1 = polar(CX, CY, R_TRACK, angle)
            p2 = polar(CX, CY, R_TRACK - 10, angle)
            draw.line([p1, p2], fill=GRAY, width=2)

    # Marcadores de minutos (60 total, skip horas)
    for m in range(60):
        if m % 5 != 0:
            angle = m * 6
            p1 = polar(CX, CY, R_TRACK, angle)
            p2 = polar(CX, CY, R_TRACK - 5, angle)
            draw.line([p1, p2], fill=(*GRAY, 100), width=1)

    # Números de hora (12, 3, 6, 9)
    f_num = font(20, bold=True)
    for h, label in [(0, "12"), (3, "3"), (6, "6"), (9, "9")]:
        angle = h * 30
        x, y = polar(CX, CY, R_NUM, angle)
        draw.text((x, y), label, font=f_num, fill=WHITE, anchor="mm")

    # Punto central (se sobrepondrá con manecillas)
    r_center = 8
    draw.ellipse([CX - r_center, CY - r_center, CX + r_center, CY + r_center],
                 fill=ACCENT, outline=WHITE, width=2)

    img.save(f"{OUT}/background.png")
    print("✓ background.png")
    return img


# ── 5. WIDGETS DE DATOS ─────────────────────────────────────
def make_widgets():
    f_lbl = font(11)
    f_val = font(15, bold=True)
    iw, ih = 106, 58

    # Pasos
    img = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_rounded_rect(draw, [0, 0, iw - 1, ih - 1], 10, DARK_GRAY)
    draw_icon_steps(draw, 20, ih // 2, 13, GREEN)
    draw.text((iw - 8, 10), "PASOS", font=f_lbl, fill=GRAY, anchor="ra")
    draw.text((iw - 8, 36), "8 420", font=f_val, fill=WHITE, anchor="ra")
    img.save(f"{OUT}/steps_widget.png")

    # Ritmo cardíaco
    img = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_rounded_rect(draw, [0, 0, iw - 1, ih - 1], 10, DARK_GRAY)
    draw_icon_heart(draw, 20, ih // 2, 13, RED)
    draw.text((iw - 8, 10), "FC", font=f_lbl, fill=GRAY, anchor="ra")
    draw.text((iw - 8, 36), "72 bpm", font=f_val, fill=WHITE, anchor="ra")
    img.save(f"{OUT}/heart_widget.png")

    # Batería
    img = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_rounded_rect(draw, [0, 0, iw - 1, ih - 1], 10, DARK_GRAY)
    draw_icon_battery(draw, 20, ih // 2, 16, 9, WHITE, pct=80)
    draw.text((iw - 8, 10), "BAT", font=f_lbl, fill=GRAY, anchor="ra")
    draw.text((iw - 8, 36), "80 %", font=f_val, fill=WHITE, anchor="ra")
    img.save(f"{OUT}/battery_widget.png")

    print("✓ widgets")


# ── 6. PREVIEW COMPLETO (10:10:30) ──────────────────────────
def make_preview(hour=10, minute=10, second=30):
    bg = make_background().copy()

    # ── Fecha debajo del reloj
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    f_date = font(16, bold=True)
    f_small = font(11)
    f_mid   = font(15, bold=True)

    # Fondo pastilla fecha
    draw_rounded_rect(od, [CX - 70, CY + 30, CX + 70, CY + 54], 8, DARK_GRAY)
    od.text((CX, CY + 42), "LUN  18 MAY", font=f_date, fill=ACCENT, anchor="mm")

    bg = Image.alpha_composite(bg, overlay)

    # ── Manecillas (rotación)
    def paste_hand(base, hand_img, deg):
        rotated = hand_img.rotate(-deg, resample=Image.BICUBIC, expand=False)
        px = CX - rotated.width // 2
        py = CY - rotated.height // 2
        base.alpha_composite(rotated, dest=(px, py))

    h_img = make_hour_hand()
    m_img = make_minute_hand()
    s_img = make_second_hand()

    # Ángulo hora: 360/12 por hora + fracción de minutos
    hour_angle   = (hour % 12) * 30 + minute * 0.5
    minute_angle = minute * 6 + second * 0.1
    second_angle = second * 6

    paste_hand(bg, h_img, hour_angle)
    paste_hand(bg, m_img, minute_angle)
    paste_hand(bg, s_img, second_angle)

    # Punto central encima de manecillas
    ov2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od2 = ImageDraw.Draw(ov2)
    r = 7
    od2.ellipse([CX - r, CY - r, CX + r, CY + r], fill=ACCENT, outline=WHITE, width=2)
    bg = Image.alpha_composite(bg, ov2)

    # ── Widgets inferiores (fila)
    ov3 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od3 = ImageDraw.Draw(ov3)
    wy = 400
    iw, ih = 106, 58

    # Pasos
    draw_rounded_rect(od3, [18, wy - ih//2, 18 + iw, wy + ih//2], 10, DARK_GRAY)
    draw_icon_steps(od3, 38, wy, 13, GREEN)
    od3.text((18 + iw - 8, wy - 14), "PASOS",  font=f_small, fill=GRAY, anchor="ra")
    od3.text((18 + iw - 8, wy + 10), "8 420",  font=f_mid,   fill=WHITE, anchor="ra")

    # Ritmo cardíaco
    mx = W // 2 - iw // 2
    draw_rounded_rect(od3, [mx, wy - ih//2, mx + iw, wy + ih//2], 10, DARK_GRAY)
    draw_icon_heart(od3, mx + 20, wy, 13, RED)
    od3.text((mx + iw - 8, wy - 14), "FC",      font=f_small, fill=GRAY,  anchor="ra")
    od3.text((mx + iw - 8, wy + 10), "72 bpm",  font=f_mid,   fill=WHITE, anchor="ra")

    # Batería
    rx = W - 18 - iw
    draw_rounded_rect(od3, [rx, wy - ih//2, rx + iw, wy + ih//2], 10, DARK_GRAY)
    draw_icon_battery(od3, rx + 20, wy, 16, 9, WHITE, pct=80)
    od3.text((rx + iw - 8, wy - 14), "BAT",    font=f_small, fill=GRAY,  anchor="ra")
    od3.text((rx + iw - 8, wy + 10), "80 %",   font=f_mid,   fill=WHITE, anchor="ra")

    bg = Image.alpha_composite(bg, ov3)
    final = bg.convert("RGB")
    final.save(f"{OUT}/../preview.png", quality=95)
    print("✓ preview.png  (390×450)")
    return bg


# ── 7. MANIFEST JSON ────────────────────────────────────────
def make_manifest():
    manifest = {
        "Description": {
            "Family": "Redmi Watch 4",
            "DeviceList": ["Redmi Watch 4"],
            "Title": "Activamente",
            "Author": "activamente",
            "Version": "2.0.0",
            "Resolution": {"Width": W, "Height": H}
        },
        "Background": {
            "Image": {"FileName": "assets/background.png", "Coordinates": {"X": 0, "Y": 0}}
        },
        "AnalogDialFace": {
            "ClockHands": {
                "Hours": {
                    "Image": {"FileName": "assets/hand_hour.png"},
                    "Pivot": {"X": 90, "Y": 90},
                    "Coordinates": {"X": CX - 90, "Y": CY - 90}
                },
                "Minutes": {
                    "Image": {"FileName": "assets/hand_minute.png"},
                    "Pivot": {"X": 90, "Y": 90},
                    "Coordinates": {"X": CX - 90, "Y": CY - 90}
                },
                "Seconds": {
                    "Image": {"FileName": "assets/hand_second.png"},
                    "Pivot": {"X": 90, "Y": 90},
                    "Coordinates": {"X": CX - 90, "Y": CY - 90}
                }
            }
        },
        "Date": {
            "Text": {
                "Coordinates": {"X": CX - 70, "Y": CY + 30},
                "Size": {"Width": 140, "Height": 24},
                "Alignment": "Center",
                "Color": "00C8FF",
                "Font": {"Name": "default", "Size": 16}
            }
        },
        "Activity": {
            "Steps":    {"Widget": {"FileName": "assets/steps_widget.png",   "Coordinates": {"X": 18,       "Y": 371}}},
            "HeartRate":{"Widget": {"FileName": "assets/heart_widget.png",   "Coordinates": {"X": W//2-53,  "Y": 371}}},
            "Battery":  {"Widget": {"FileName": "assets/battery_widget.png", "Coordinates": {"X": W-18-106, "Y": 371}}}
        }
    }
    with open(f"{OUT}/../manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print("✓ manifest.json")


# ── 8. EMPAQUETAR .face ─────────────────────────────────────
def make_face_package():
    face_path = f"{OUT}/../activamente.face"
    with zipfile.ZipFile(face_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(f"{OUT}/../manifest.json", "manifest.json")
        zf.write(f"{OUT}/../preview.png", "preview.png")
        for fname in sorted(os.listdir(OUT)):
            if fname.endswith(".png"):
                zf.write(f"{OUT}/{fname}", f"assets/{fname}")
    print(f"✓ activamente.face  ({os.path.getsize(face_path) // 1024} KB)")


# ── MAIN ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Generando carátula analógica Activamente para Redmi Watch 4…\n")
    make_widgets()
    make_preview(hour=10, minute=10, second=30)
    make_manifest()
    make_face_package()
    print("\n¡Listo! Archivos en watchface/")
