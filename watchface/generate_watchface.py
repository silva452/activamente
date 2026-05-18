"""
Generador de carátula "Activamente" para Xiaomi Redmi Watch 4
Resolución: 390 x 450 px
"""

import os
import json
import math
import zipfile
from PIL import Image, ImageDraw, ImageFont

# ── Constantes ──────────────────────────────────────────────
W, H = 390, 450
OUT = os.path.dirname(os.path.abspath(__file__)) + "/assets"
os.makedirs(OUT, exist_ok=True)

# Paleta de colores
BG        = (8, 12, 20)          # fondo casi negro azulado
ACCENT    = (0, 200, 255)        # cyan principal
ACCENT2   = (0, 140, 200)        # cyan oscuro
WHITE     = (255, 255, 255)
GRAY      = (120, 130, 145)
DARK_GRAY = (40, 48, 60)
RED       = (255, 60, 80)
GREEN     = (60, 220, 120)

def font(size, bold=False):
    """Carga fuente del sistema o fallback."""
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
    paths = candidates_bold if bold else candidates
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill,
                            outline=outline, width=width)


def draw_arc_progress(draw, cx, cy, r, start_deg, end_deg, color, width=6):
    """Arco de progreso."""
    bbox = [cx - r, cy - r, cx + r, cy + r]
    draw.arc(bbox, start=start_deg, end=end_deg, fill=color, width=width)


def draw_icon_heart(draw, cx, cy, size, color):
    """Icono de corazón simple."""
    s = size // 2
    for dx in range(-s, s):
        for dy in range(-s, s):
            dist = ((abs(dx) - s//2)**2 + (dy - (-s//4))**2) ** 0.5
            if dist < s * 0.7 and dy < s - abs(dx) * 0.8:
                draw.point((cx + dx, cy + dy - s//4), fill=color)


def draw_icon_steps(draw, cx, cy, size, color):
    """Icono de pasos (dos pies)."""
    s = max(size // 3, 3)
    draw.ellipse([cx - s*2 - 1, cy - s, cx - s - 1, cy + s], fill=color)
    draw.ellipse([cx + s - 1, cy - s*2, cx + s*2 - 1, cy], fill=color)


def draw_icon_battery(draw, cx, cy, w, h, color, pct=80):
    """Icono de batería."""
    bw, bh = w, h
    draw.rectangle([cx - bw//2, cy - bh//2, cx + bw//2, cy + bh//2],
                   outline=color, width=1)
    draw.rectangle([cx + bw//2, cy - bh//4, cx + bw//2 + 2, cy + bh//4],
                   fill=color)
    fill_w = int((bw - 2) * pct / 100)
    fc = GREEN if pct > 30 else RED
    draw.rectangle([cx - bw//2 + 1, cy - bh//2 + 1,
                    cx - bw//2 + 1 + fill_w, cy + bh//2 - 1], fill=fc)


# ── 1. FONDO ────────────────────────────────────────────────
def make_background():
    img = Image.new("RGBA", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Círculo decorativo exterior tenue
    cx, cy = W // 2, H // 2 - 20
    for r, alpha in [(185, 18), (160, 25), (140, 12)]:
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse([cx - r, cy - r, cx + r, cy + r],
                   outline=(*ACCENT, alpha), width=1)
        img = Image.alpha_composite(img, overlay)

    # Arco de acento superior
    draw = ImageDraw.Draw(img)
    draw_arc_progress(draw, cx, cy, 175, 200, 340, (*ACCENT2, 180), width=3)
    draw_arc_progress(draw, cx, cy, 175, 342, 198, (*DARK_GRAY, 120), width=3)

    img.save(f"{OUT}/background.png")
    print("✓ background.png")
    return img


# ── 2. DÍGITOS DE HORA (0-9 × 2 tamaños) ───────────────────
def make_digits():
    # Hora grande (90×110)
    dw, dh = 90, 110
    for d in range(10):
        img = Image.new("RGBA", (dw, dh), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        f = font(96, bold=True)
        draw.text((dw // 2, dh // 2), str(d), font=f, fill=WHITE, anchor="mm")
        img.save(f"{OUT}/hour_digit_{d}.png")

    # Minutos medianos (72×88)
    dw2, dh2 = 72, 88
    for d in range(10):
        img = Image.new("RGBA", (dw2, dh2), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        f = font(78, bold=True)
        draw.text((dw2 // 2, dh2 // 2), str(d), font=f, fill=ACCENT, anchor="mm")
        img.save(f"{OUT}/min_digit_{d}.png")

    # Separador ":"
    sw, sh = 22, 110
    img = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = 5
    draw.ellipse([sw//2 - r, sh//3 - r, sw//2 + r, sh//3 + r], fill=ACCENT)
    draw.ellipse([sw//2 - r, sh*2//3 - r, sw//2 + r, sh*2//3 + r], fill=ACCENT)
    img.save(f"{OUT}/separator.png")
    print("✓ dígitos de hora y minutos")


# ── 3. INDICADORES (fecha, pasos, ritmo, batería) ───────────
def make_indicators():
    # Fecha (día + mes)
    iw, ih = 160, 36
    img = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_rounded_rect(draw, [0, 0, iw - 1, ih - 1], 8, DARK_GRAY)
    f = font(18, bold=True)
    draw.text((iw // 2, ih // 2), "LUN 18 MAY", font=f, fill=ACCENT, anchor="mm")
    img.save(f"{OUT}/date_bg.png")

    # Pasos
    iw2, ih2 = 112, 64
    img = Image.new("RGBA", (iw2, ih2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_rounded_rect(draw, [0, 0, iw2 - 1, ih2 - 1], 12, DARK_GRAY)
    draw_icon_steps(draw, 22, ih2 // 2, 14, GREEN)
    f_lbl = font(11)
    f_val = font(18, bold=True)
    draw.text((iw2 - 8, 10), "PASOS", font=f_lbl, fill=GRAY, anchor="ra")
    draw.text((iw2 - 8, 42), "8 420", font=f_val, fill=WHITE, anchor="ra")
    img.save(f"{OUT}/steps_widget.png")

    # Ritmo cardíaco
    img = Image.new("RGBA", (iw2, ih2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_rounded_rect(draw, [0, 0, iw2 - 1, ih2 - 1], 12, DARK_GRAY)
    draw_icon_heart(draw, 22, ih2 // 2, 14, RED)
    draw.text((iw2 - 8, 10), "FC", font=f_lbl, fill=GRAY, anchor="ra")
    draw.text((iw2 - 8, 42), "72 bpm", font=f_val, fill=WHITE, anchor="ra")
    img.save(f"{OUT}/heart_widget.png")

    # Batería
    img = Image.new("RGBA", (iw2, ih2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_rounded_rect(draw, [0, 0, iw2 - 1, ih2 - 1], 12, DARK_GRAY)
    draw_icon_battery(draw, 22, ih2 // 2, 18, 10, WHITE, pct=80)
    draw.text((iw2 - 8, 10), "BATERÍA", font=f_lbl, fill=GRAY, anchor="ra")
    draw.text((iw2 - 8, 42), "80 %", font=f_val, fill=WHITE, anchor="ra")
    img.save(f"{OUT}/battery_widget.png")

    print("✓ widgets de indicadores")


# ── 4. PREVIEW COMPLETO ─────────────────────────────────────
def make_preview():
    img = make_background().copy()
    draw = ImageDraw.Draw(img)

    cx = W // 2
    # Hora: "10:30"
    f_hour = font(90, bold=True)
    f_min  = font(90, bold=True)
    f_sep  = font(80, bold=True)

    # Posición vertical de la hora
    time_y = 155

    draw.text((cx - 10, time_y), "10", font=f_hour, fill=WHITE, anchor="rm")
    draw.text((cx, time_y), ":", font=f_sep, fill=ACCENT, anchor="mm")
    draw.text((cx + 10, time_y), "30", font=f_min, fill=ACCENT, anchor="lm")

    # Fecha
    f_date = font(18, bold=True)
    draw_rounded_rect(draw, [cx - 80, 205, cx + 80, 235], 8, DARK_GRAY)
    draw.text((cx, 220), "LUN  18 MAY  2026", font=f_date, fill=ACCENT, anchor="mm")

    # Arco de actividad (progreso del día ~60 %)
    draw_arc_progress(draw, cx, 310, 68, 135, 135 + int(270 * 0.60), GREEN, width=7)
    draw_arc_progress(draw, cx, 310, 68, 135 + int(270 * 0.60), 45, DARK_GRAY, width=7)

    # Icono central del arco
    f_small = font(11)
    f_mid   = font(16, bold=True)
    draw.text((cx, 300), "ACTIVIDAD", font=f_small, fill=GRAY, anchor="mm")
    draw.text((cx, 320), "60 %", font=f_mid, fill=GREEN, anchor="mm")

    # Widgets inferiores
    wy = 390
    # Pasos (izquierda)
    draw_rounded_rect(draw, [14, wy - 28, 130, wy + 28], 12, DARK_GRAY)
    draw_icon_steps(draw, 34, wy, 12, GREEN)
    draw.text((126, wy - 10), "PASOS", font=f_small, fill=GRAY, anchor="ra")
    draw.text((126, wy + 12), "8 420", font=f_mid, fill=WHITE, anchor="ra")

    # Ritmo cardíaco (centro)
    draw_rounded_rect(draw, [143, wy - 28, 247, wy + 28], 12, DARK_GRAY)
    draw_icon_heart(draw, 162, wy, 12, RED)
    draw.text((243, wy - 10), "FC", font=f_small, fill=GRAY, anchor="ra")
    draw.text((243, wy + 12), "72 bpm", font=f_mid, fill=WHITE, anchor="ra")

    # Batería (derecha)
    draw_rounded_rect(draw, [260, wy - 28, 376, wy + 28], 12, DARK_GRAY)
    draw_icon_battery(draw, 280, wy, 16, 10, WHITE, pct=80)
    draw.text((372, wy - 10), "BAT", font=f_small, fill=GRAY, anchor="ra")
    draw.text((372, wy + 12), "80 %", font=f_mid, fill=WHITE, anchor="ra")

    img = img.convert("RGB")
    img.save(f"{OUT}/../preview.png", quality=95)
    print("✓ preview.png  (390×450)")
    return img


# ── 5. MANIFEST JSON ────────────────────────────────────────
def make_manifest():
    manifest = {
        "Description": {
            "Family": "Redmi Watch 4",
            "DeviceList": ["Redmi Watch 4"],
            "Title": "Activamente",
            "Author": "activamente",
            "Version": "1.0.0",
            "Resolution": {"Width": 390, "Height": 450}
        },
        "Background": {
            "Image": {
                "ImageSet": {
                    "ImageCount": 1,
                    "Images": [{"ImageIndex": 0, "Coordinates": {"X": 0, "Y": 0}}]
                }
            }
        },
        "Time": {
            "Hours": {
                "Tens": {
                    "ImageSet": {
                        "ImageCount": 10,
                        "ImagesPattern": "hour_digit_{d}.png",
                        "Coordinates": {"X": 55, "Y": 100}
                    }
                },
                "Units": {
                    "ImageSet": {
                        "ImageCount": 10,
                        "ImagesPattern": "hour_digit_{d}.png",
                        "Coordinates": {"X": 145, "Y": 100}
                    }
                }
            },
            "Separator": {
                "Image": {
                    "Coordinates": {"X": 184, "Y": 100},
                    "FileName": "separator.png"
                }
            },
            "Minutes": {
                "Tens": {
                    "ImageSet": {
                        "ImageCount": 10,
                        "ImagesPattern": "min_digit_{d}.png",
                        "Coordinates": {"X": 206, "Y": 100}
                    }
                },
                "Units": {
                    "ImageSet": {
                        "ImageCount": 10,
                        "ImagesPattern": "min_digit_{d}.png",
                        "Coordinates": {"X": 278, "Y": 100}
                    }
                }
            }
        },
        "Date": {
            "Day": {"ImageSet": {"Coordinates": {"X": 115, "Y": 205}}},
            "Month": {"ImageSet": {"Coordinates": {"X": 195, "Y": 205}}}
        },
        "Activity": {
            "Steps": {"Widget": {"FileName": "steps_widget.png", "Coordinates": {"X": 14, "Y": 362}}},
            "HeartRate": {"Widget": {"FileName": "heart_widget.png", "Coordinates": {"X": 143, "Y": 362}}},
            "Battery": {"Widget": {"FileName": "battery_widget.png", "Coordinates": {"X": 260, "Y": 362}}}
        }
    }
    with open(f"{OUT}/../manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print("✓ manifest.json")


# ── 6. EMPAQUETAR .face ─────────────────────────────────────
def make_face_package():
    face_path = os.path.dirname(OUT) + "/activamente.face"
    with zipfile.ZipFile(face_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(f"{OUT}/../manifest.json", "manifest.json")
        zf.write(f"{OUT}/../preview.png", "preview.png")
        for fname in os.listdir(OUT):
            if fname.endswith(".png"):
                zf.write(f"{OUT}/{fname}", f"assets/{fname}")
    print(f"✓ activamente.face  ({os.path.getsize(face_path) // 1024} KB)")


# ── MAIN ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Generando carátula Activamente para Redmi Watch 4…\n")
    make_background()
    make_digits()
    make_indicators()
    make_preview()
    make_manifest()
    make_face_package()
    print("\n¡Listo! Archivos generados en watchface/")
