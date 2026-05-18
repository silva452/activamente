"""
Carátula "Activamente" v4 — Redmi Watch 4  (390 × 450 px)
Todo dentro de la esfera circular: hora digital, fecha, batería, pasos, manecillas.
"""

import os, json, math, zipfile
from PIL import Image, ImageDraw, ImageFont

W, H   = 390, 450
CX, CY = W // 2, H // 2 + 5      # centro de la esfera
R      = 183                       # radio de la esfera (casi llena la pantalla)

OUT = os.path.dirname(os.path.abspath(__file__)) + "/assets"
os.makedirs(OUT, exist_ok=True)

BG        = (6, 10, 18)
DIAL_FILL = (11, 16, 26)
ACCENT    = (0, 210, 255)
ACCENT2   = (0, 110, 170)
WHITE     = (255, 255, 255)
GRAY      = (100, 115, 135)
DARK_GRAY = (32, 42, 55)
RED       = (255, 55, 75)
GREEN     = (50, 215, 115)


def font(size, bold=False):
    for p in ([
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ] if bold else [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def polar(r, deg, cx=CX, cy=CY):
    a = math.radians(deg - 90)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def rr(draw, xy, rad, fill=None, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=rad, fill=fill, outline=outline, width=width)


# ── FONDO + ESFERA ───────────────────────────────────────────
def make_background():
    img  = Image.new("RGBA", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Relleno de la esfera
    draw.ellipse([CX-R, CY-R, CX+R, CY+R], fill=DIAL_FILL)

    # Anillos decorativos
    for r2, alpha, w2 in [(R, 80, 2), (R-6, 40, 1), (R-12, 20, 1)]:
        ov = Image.new("RGBA", (W, H), (0,0,0,0))
        od = ImageDraw.Draw(ov)
        od.ellipse([CX-r2, CY-r2, CX+r2, CY+r2], outline=(*ACCENT, alpha), width=w2)
        img = Image.alpha_composite(img, ov)

    draw = ImageDraw.Draw(img)

    # Arco de acento (bisel superior)
    draw.arc([CX-R+2, CY-R+2, CX+R-2, CY+R-2],
             start=-60, end=240, fill=(*ACCENT2, 180), width=4)

    # ── Marcadores de horas ──────────────────────────────────
    R_TICK = R - 10
    for h in range(12):
        ang = h * 30
        if h % 3 == 0:          # 12, 3, 6, 9 — largo
            p1 = polar(R_TICK,      ang)
            p2 = polar(R_TICK - 18, ang)
            draw.line([p1, p2], fill=WHITE, width=4)
        else:                    # resto — corto
            p1 = polar(R_TICK,      ang)
            p2 = polar(R_TICK - 10, ang)
            draw.line([p1, p2], fill=GRAY, width=2)

    # Puntos de minutos (entre horas)
    for m in range(60):
        if m % 5 != 0:
            p1 = polar(R_TICK,     m * 6)
            p2 = polar(R_TICK - 4, m * 6)
            draw.line([p1, p2], fill=(*GRAY, 80), width=1)

    # Números de hora principales
    f_num = font(18, bold=True)
    for h, lbl in [(0,"12"),(3,"3"),(6,"6"),(9,"9")]:
        x, y = polar(R_TICK - 32, h * 30)
        draw.text((x, y), lbl, font=f_num, fill=(*WHITE, 220), anchor="mm")

    # Línea divisoria tenue (separa zona digital de zona dial)
    div_y = CY - 48
    x0 = CX + R * math.cos(math.radians(180 + 35)) + 10
    x1 = CX + R * math.cos(math.radians(-35)) - 10
    draw.line([(x0, div_y), (x1, div_y)], fill=(*DARK_GRAY, 160), width=1)

    # Punto central del pivot
    draw.ellipse([CX-8, CY-8, CX+8, CY+8], fill=ACCENT, outline=WHITE, width=2)

    img.save(f"{OUT}/background.png")
    print("✓ background.png")
    return img


# ── MANECILLA HORA ───────────────────────────────────────────
def make_hour_hand():
    size, pv = 160, 80
    img  = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    tip, base, hw = pv - 72, pv + 18, 6
    poly = [
        (pv-hw, base), (pv-hw+2, pv+10),
        (pv-3, tip+6), (pv, tip),
        (pv+3, tip+6), (pv+hw-2, pv+10),
        (pv+hw, base),
    ]
    draw.polygon(poly, fill=WHITE)
    draw.polygon(poly, outline=(*GRAY, 140), width=1)
    draw.line([(pv, base-3), (pv, tip+3)], fill=(*ACCENT, 140), width=2)
    img.save(f"{OUT}/hand_hour.png")
    return img


# ── MANECILLA MINUTOS ────────────────────────────────────────
def make_minute_hand():
    size, pv = 160, 80
    img  = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    tip, base, hw = pv - 100, pv + 20, 4
    poly = [
        (pv-hw, base), (pv-hw+1, pv+10),
        (pv-2, tip+8), (pv, tip),
        (pv+2, tip+8), (pv+hw-1, pv+10),
        (pv+hw, base),
    ]
    draw.polygon(poly, fill=ACCENT)
    draw.polygon(poly, outline=(*ACCENT2, 180), width=1)
    img.save(f"{OUT}/hand_minute.png")
    return img


# ── SEGUNDERO ────────────────────────────────────────────────
def make_second_hand():
    size, pv = 160, 80
    img  = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    draw.line([(pv, pv-110), (pv, pv+28)], fill=RED, width=2)
    draw.ellipse([pv-3, pv-3, pv+3, pv+3], fill=RED)
    img.save(f"{OUT}/hand_second.png")
    return img


# ── PREVIEW COMPLETO ─────────────────────────────────────────
def make_preview(hour=10, minute=10, second=30):
    bg = make_background().copy()

    ov = Image.new("RGBA", (W, H), (0,0,0,0))
    od = ImageDraw.Draw(ov)

    # ── HORA DIGITAL (parte alta dentro de la esfera)
    f_big  = font(80, bold=True)
    f_colon= font(68, bold=True)
    ty = CY - 88          # vertical: zona superior de la esfera
    h_str, m_str = f"{hour:02d}", f"{minute:02d}"

    # Sombra
    od.text((CX - 5 + 2, ty + 2), h_str, font=f_big,   fill=(0,0,0,70), anchor="rm")
    od.text((CX + 5 + 2, ty + 2), m_str, font=f_big,   fill=(0,0,0,70), anchor="lm")

    od.text((CX - 5, ty), h_str, font=f_big,   fill=WHITE,  anchor="rm")
    od.text((CX,     ty), ":",   font=f_colon, fill=ACCENT, anchor="mm")
    od.text((CX + 5, ty), m_str, font=f_big,   fill=ACCENT, anchor="lm")

    # ── FECHA (pastilla, justo bajo la hora)
    f_date = font(15, bold=True)
    dy = CY - 34
    rr(od, [CX-66, dy-14, CX+66, dy+14], 8, DARK_GRAY)
    od.text((CX, dy), "LUN  18  MAY", font=f_date, fill=ACCENT, anchor="mm")

    # ── BATERÍA (bajo la fecha, antes del pivot)
    by = CY - 8
    bat_pct = 80
    bw, bh = 20, 10
    # icono batería
    od.rectangle([CX-52, by-bh//2, CX-52+bw, by+bh//2], outline=GRAY, width=1)
    od.rectangle([CX-52+bw, by-bh//4, CX-52+bw+2, by+bh//4], fill=GRAY)
    fw = int((bw-2) * bat_pct / 100)
    od.rectangle([CX-51, by-bh//2+1, CX-51+fw, by+bh//2-1], fill=GREEN)
    od.text((CX-26, by), f"{bat_pct} %", font=font(13, bold=True), fill=WHITE, anchor="lm")

    bg = Image.alpha_composite(bg, ov)

    # ── MANECILLAS
    def paste(base, hand_img, deg):
        rot = hand_img.rotate(-deg, resample=Image.BICUBIC, expand=False)
        base.alpha_composite(rot, dest=(CX - rot.width//2, CY - rot.height//2))

    paste(bg, make_hour_hand(),   (hour % 12) * 30 + minute * 0.5)
    paste(bg, make_minute_hand(), minute * 6 + second * 0.1)
    paste(bg, make_second_hand(), second * 6)

    # Pivot encima de todo
    ov3 = Image.new("RGBA", (W, H), (0,0,0,0))
    od3 = ImageDraw.Draw(ov3)
    od3.ellipse([CX-7, CY-7, CX+7, CY+7], fill=ACCENT, outline=WHITE, width=2)
    bg = Image.alpha_composite(bg, ov3)

    # ── PASOS (parte baja dentro de la esfera)
    ov4 = Image.new("RGBA", (W, H), (0,0,0,0))
    od4 = ImageDraw.Draw(ov4)
    sw, sh = 162, 50
    sx, sy = CX - sw//2, CY + R - sh - 22   # dentro del arco inferior
    rr(od4, [sx, sy, sx+sw, sy+sh], 12, DARK_GRAY)

    # icono pasos
    s = 4
    od4.ellipse([sx+18-s*2, sy+sh//2-s, sx+18-s, sy+sh//2+s], fill=GREEN)
    od4.ellipse([sx+18+s-1, sy+sh//2-s*2, sx+18+s*2-1, sy+sh//2], fill=GREEN)

    od4.text((sx+38, sy+10),   "PASOS", font=font(11),       fill=GRAY,  anchor="la")
    od4.text((sx+38, sy+27),   "8 420", font=font(16, True),  fill=WHITE, anchor="la")
    bg = Image.alpha_composite(bg, ov4)

    # Guardar assets individuales para el paquete
    make_hour_hand().save(f"{OUT}/hand_hour.png")
    make_minute_hand().save(f"{OUT}/hand_minute.png")
    make_second_hand().save(f"{OUT}/hand_second.png")

    final = bg.convert("RGB")
    final.save(f"{OUT}/../preview.png", quality=95)
    print("✓ preview.png")
    return bg


# ── MANIFEST ────────────────────────────────────────────────
def make_manifest():
    sv = CY + R - 50 - 22
    manifest = {
        "Description": {
            "Family": "Redmi Watch 4", "DeviceList": ["Redmi Watch 4"],
            "Title": "Activamente", "Author": "activamente",
            "Version": "4.0.0", "Resolution": {"Width": W, "Height": H}
        },
        "Background": {"Image": {"FileName": "assets/background.png", "Coordinates": {"X": 0, "Y": 0}}},
        "Time": {
            "Hours": {
                "Tens":  {"ImageSet": {"ImageCount": 10, "ImagesPattern": "assets/h_digit_{d}.png", "Coordinates": {"X": 68,  "Y": CY-128}}},
                "Units": {"ImageSet": {"ImageCount": 10, "ImagesPattern": "assets/h_digit_{d}.png", "Coordinates": {"X": 152, "Y": CY-128}}}
            },
            "Separator": {"Image": {"FileName": "assets/separator.png", "Coordinates": {"X": 188, "Y": CY-128}}},
            "Minutes": {
                "Tens":  {"ImageSet": {"ImageCount": 10, "ImagesPattern": "assets/m_digit_{d}.png", "Coordinates": {"X": 200, "Y": CY-128}}},
                "Units": {"ImageSet": {"ImageCount": 10, "ImagesPattern": "assets/m_digit_{d}.png", "Coordinates": {"X": 272, "Y": CY-128}}}
            }
        },
        "Date":    {"Text": {"Coordinates": {"X": CX-66, "Y": CY-48}, "Size": {"Width": 132, "Height": 28}, "Alignment": "Center", "Color": "00D2FF", "Font": {"Size": 15}}},
        "Battery": {"InlineWidget": {"Coordinates": {"X": CX-52, "Y": CY-13}, "Color": "37D773"}},
        "AnalogDialFace": {
            "ClockHands": {
                "Hours":   {"Image": {"FileName": "assets/hand_hour.png"},   "Pivot": {"X": 80, "Y": 80}, "Coordinates": {"X": CX-80, "Y": CY-80}},
                "Minutes": {"Image": {"FileName": "assets/hand_minute.png"}, "Pivot": {"X": 80, "Y": 80}, "Coordinates": {"X": CX-80, "Y": CY-80}},
                "Seconds": {"Image": {"FileName": "assets/hand_second.png"}, "Pivot": {"X": 80, "Y": 80}, "Coordinates": {"X": CX-80, "Y": CY-80}}
            }
        },
        "Activity": {
            "Steps": {"Widget": {"FileName": "assets/steps_widget.png", "Coordinates": {"X": CX-81, "Y": sv}}}
        }
    }
    with open(f"{OUT}/../manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    print("✓ manifest.json")


# ── EMPAQUETAR ───────────────────────────────────────────────
def make_face_package():
    fp = f"{OUT}/../activamente.face"
    with zipfile.ZipFile(fp, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(f"{OUT}/../manifest.json", "manifest.json")
        zf.write(f"{OUT}/../preview.png",   "preview.png")
        for fn in sorted(os.listdir(OUT)):
            if fn.endswith(".png"):
                zf.write(f"{OUT}/{fn}", f"assets/{fn}")
    print(f"✓ activamente.face  ({os.path.getsize(fp) // 1024} KB)")


if __name__ == "__main__":
    print("Generando carátula Activamente v4…\n")
    make_preview(hour=10, minute=10, second=30)
    make_manifest()
    make_face_package()
    print("\n¡Listo!")
