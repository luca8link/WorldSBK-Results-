from PIL import Image, ImageDraw

# Master rendered large, then downscaled for clean anti-aliasing.
S = 512
BG = (193, 18, 31)       # deep racing red
FG = (245, 245, 245)     # off-white
ACCENT = (20, 20, 22)    # near-black

def rounded(draw, box, r, fill):
    draw.rounded_rectangle(box, radius=r, fill=fill)

img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# background tile
rounded(d, [0, 0, S-1, S-1], int(S*0.22), BG)

# Delta (Δ) = "difference / gap". Filled triangle with a cut-out, drawn centered.
cx = S/2
top = S*0.20
base_y = S*0.78
half = S*0.30
outer = [(cx, top), (cx-half, base_y), (cx+half, base_y)]
d.polygon(outer, fill=FG)
# inner cut-out to make it read as an outline triangle
t2 = S*0.34
h2 = half*0.52
inner = [(cx, t2), (cx-h2, base_y-S*0.07), (cx+h2, base_y-S*0.07)]
d.polygon(inner, fill=BG)

# small accent bar under the delta (a timing tick)
bar_w = S*0.34
bar_h = S*0.045
bx0 = cx - bar_w/2
by0 = S*0.83
d.rounded_rectangle([bx0, by0, bx0+bar_w, by0+bar_h], radius=bar_h/2, fill=ACCENT)

for size in (16, 32, 48, 128):
    img.resize((size, size), Image.LANCZOS).save(f"icon{size}.png")
    print(f"wrote icon{size}.png")
