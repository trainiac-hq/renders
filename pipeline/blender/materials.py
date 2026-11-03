"""Materials: satin paint carrying the livery, glass, rubber, metal and the
running gear's grime. Weathering is procedural (height, ambient occlusion,
noise in world space), so it lands the same way on every class."""

import os

import bpy

from common import FEATURES, H, SCENE, SRC, Graph, image, new_material, output, principled, projection, srgb

GRIME = srgb("#3A3228")
BRAKE_DUST = srgb("#4A3E35")


def weathered(g, colour, z, amount=1.0):
    """Colour with the dirt a train in service carries: grime rising from the
    solebar, dirt settled in joints and corners, a little roof staining.
    Grime only darkens (a DARKEN mix): paint darker than the grime itself,
    a black bumper say, stays as it is rather than turning brown."""
    # Grime rising from the bottom of the body, patchy.
    low = g.math("SUBTRACT", 1.0, g.smoothstep(z, H["bottom"] - 0.1, H["bottom"] + 1.1))
    patchy = g.math("ADD", 0.55, g.math("MULTIPLY", g.noise(1.4, detail=6), 0.6))
    grime = g.math("MULTIPLY", g.math("MULTIPLY", low, patchy), 0.45 * amount)
    colour = g.mix(colour, GRIME, grime, blend="DARKEN")
    # Dirt in panel joints, round doors and windows: where light can't reach.
    ao = g.node("ShaderNodeAmbientOcclusion", samples=8, only_local=True)
    ao.inputs["Distance"].default_value = 0.06
    crevice = g.math("MULTIPLY", g.math("SUBTRACT", 1.0, ao.outputs["AO"]), 0.55 * amount)
    colour = g.mix(colour, GRIME, crevice, blend="DARKEN")
    # Faint streaks down the sides and staining along the roof.
    streaks = g.noise(5.0, stretch=(0.35, 0.35, 3.0), detail=3)
    colour = g.mix(colour, GRIME, g.math("MULTIPLY", g.math("MAXIMUM", g.math("SUBTRACT", streaks, 0.5), 0.0), 0.12 * amount), blend="DARKEN")
    # Fine specks of road dirt, thickest low down and at the front.
    specks = g.smoothstep(g.noise(70.0, detail=1), 0.66, 0.72)
    low_front = g.math("MAXIMUM", low, g.math("SUBTRACT", 1.0, g.smoothstep(g.position()["X"], 0.0, 3.0)))
    colour = g.mix(colour, GRIME, g.math("MULTIPLY", g.math("MULTIPLY", specks, low_front), 0.3 * amount), blend="DARKEN")
    roof = g.smoothstep(z, H["cantrail"] - 0.05, H["cantrail"] + 0.2)
    stain = g.math("MULTIPLY", roof, g.math("MULTIPLY", g.noise(1.2, stretch=(4.0, 1.0, 1.0), detail=5), 0.35 * amount))
    colour = g.mix(colour, GRIME, stain, blend="DARKEN")
    return colour, g.math("ADD", grime, crevice)


def albedo_of(g, colour):
    """Marks a material's paint colour before weathering, for the flat
    elevation the accuracy checks measure (studio.flat_albedo)."""
    if isinstance(colour, tuple):
        rgb = g.node("ShaderNodeRGB")
        rgb.outputs[0].default_value = colour
        colour = rgb.outputs[0]
    n = g.node("NodeReroute", name="albedo", label="albedo")
    g.link(colour, n.inputs[0])


def body():
    """The bodyshell: livery from the textures, nose features from the side
    or front view by which faces the point more squarely, satin paint over
    faint orange peel, weathered."""
    m, g = new_material("body")
    tex = SCENE["textures"]
    side_uv = projection(g, tex["side"], "side")
    front_uv = projection(g, tex["front"], "front")
    albedo = image(g, "side-albedo.png", side_uv, colour=True)
    glass_s, seams_s, louvres = image(g, "side-mat.png", side_uv)[:3]
    sn = image(g, "side-nose.png", projection(g, tex["sideNose"], "side"))
    fn = image(g, "front-nose.png", front_uv)
    fm = image(g, "front-mat.png", front_uv)

    # How squarely a point faces forward rather than sideways, 1 on the face
    # and 0 on the flanks. Both views carry the same features where they
    # meet, so this only chooses the sharper projection; it changes smoothly
    # so nothing shows where it turns.
    geo = g.node("ShaderNodeNewGeometry")
    normal = g.node("ShaderNodeSeparateXYZ")
    g.link(geo.outputs["Normal"], normal.inputs[0])
    pos = g.position()
    lean = g.math("SUBTRACT", g.math("ABSOLUTE", normal.outputs["X"]), g.math("ABSOLUTE", normal.outputs["Y"]))
    ahead = g.smoothstep(lean, -0.2, 0.2)
    forward = g.smoothstep(g.math("MULTIPLY", normal.outputs["X"], -1.0), -0.05, 0.2)
    on_nose = g.math("SUBTRACT", 1.0, g.smoothstep(pos["X"], SCENE["noseLength"] - 0.5, SCENE["noseLength"]))
    zone = image(g, "side-zone.png", projection(g, tex["sideNose"], "side"))[0]
    w = g.math("MULTIPLY", g.math("MULTIPLY", g.math("MULTIPLY", ahead, forward), on_nose), zone)

    panel, dark, screen, lamp = (g.mixf(sn[i], fn[i], w) for i in range(4))
    gangway = g.math("MULTIPLY", fm[0], w)
    seams = g.math("MAXIMUM", seams_s, g.math("MULTIPLY", fm[1], w), clamp=True)

    c = SCENE["colours"]
    # The face's own colour, and the shapes painted on it, are mixed in
    # together where the front view takes over: mixing the face colour in
    # first and the shapes after would show the face colour wherever the
    # views blend, round a corner where a shape carries on as the side's paint.
    face_colour = g.node("ShaderNodeTexImage", image=bpy.data.images.load(os.path.join(SRC, "front-albedo.png")), interpolation="Linear", extension="EXTEND")
    face_colour.image.colorspace_settings.name = "sRGB"
    face_colour.image.alpha_mode = "STRAIGHT"
    g.link(front_uv, face_colour.inputs["Vector"])
    front_paint = g.mix(srgb(c["face"]), face_colour.outputs["Color"], face_colour.outputs["Alpha"])
    colour = g.mix(albedo, front_paint, w)
    colour = g.mix(colour, srgb(c["panel"]), panel)
    # Shapes painted on a flat face in their own colours, over the panel.
    fa = g.node("ShaderNodeTexImage", image=bpy.data.images.load(os.path.join(SRC, "front-albedo.png")), interpolation="Linear", extension="EXTEND")
    fa.image.colorspace_settings.name = "sRGB"
    fa.image.alpha_mode = "STRAIGHT"
    g.link(front_uv, fa.inputs["Vector"])
    colour = g.mix(colour, fa.outputs["Color"], g.math("MULTIPLY", fa.outputs["Alpha"], w))
    # Lamps are modelled, set in housings; whatever of their outline the
    # housing's cut leaves on the paint is housing too.
    colour = g.mix(colour, srgb(c["dark"]), g.math("MAXIMUM", g.math("MAXIMUM", dark, lamp), g.math("MULTIPLY", louvres, 0.7)))
    colour = g.mix(colour, srgb(c["gangway"]), gangway)
    colour = g.mix(colour, (0.02, 0.02, 0.022, 1), g.math("MULTIPLY", seams, 0.5))
    unweathered = colour
    colour, dirt = weathered(g, colour, pos["Z"])

    # Satin paint: rough, with a little variation from panel to panel.
    variation = g.math("MULTIPLY", g.math("SUBTRACT", g.noise(0.8, detail=2), 0.5), 0.12)
    rough = g.math("ADD", 0.64, variation)
    rough = g.mixf(rough, 0.56, panel)
    rough = g.mixf(rough, 0.45, g.math("MAXIMUM", dark, lamp))
    rough = g.math("ADD", rough, g.math("MULTIPLY", dirt, 0.25), clamp=True)

    # Seams pressed in, and the faintest orange peel.
    peel = g.node("ShaderNodeBump")
    peel.inputs["Strength"].default_value = 0.05
    peel.inputs["Distance"].default_value = 0.0004
    g.link(g.noise(260.0, detail=2), peel.inputs["Height"])
    bump = g.node("ShaderNodeBump", invert=True)
    bump.inputs["Strength"].default_value = 0.5
    bump.inputs["Distance"].default_value = 0.003
    g.link(seams, bump.inputs["Height"])
    g.link(peel.outputs["Normal"], bump.inputs["Normal"])
    normal_out = bump.outputs["Normal"]

    paint = principled(g, **{"Base Color": colour, "Roughness": rough, "Specular IOR Level": 0.2, "Normal": normal_out})
    # Painted-on glass, for flush glazing the model doesn't cut: on a long
    # nose's windscreen, say.
    glass = glass_shader(g, normal_out)
    glazed = g.math("MAXIMUM", glass_s, screen)
    albedo_of(g, g.mix(unweathered, srgb(SCENE["colours"]["glass"]), glazed))
    s = g.node("ShaderNodeMixShader")
    g.link(glazed, s.inputs[0])
    g.link(paint.outputs[0], s.inputs[1])
    g.link(glass.outputs[0], s.inputs[2])
    output(g, s.outputs[0])
    return m


def paint(name, colour):
    """Plain satin paint in one colour, weathered like the body."""
    m, g = new_material(name)
    pos = g.position()
    albedo_of(g, colour)
    base, dirt = weathered(g, colour, pos["Z"])
    rough = g.math("ADD", 0.56, g.math("MULTIPLY", g.math("SUBTRACT", g.noise(0.8, detail=2), 0.5), 0.1))
    rough = g.math("ADD", rough, g.math("MULTIPLY", dirt, 0.25), clamp=True)
    output(g, principled(g, **{"Base Color": base, "Roughness": rough, "Specular IOR Level": 0.2}).outputs[0])
    return m


def glass_shader(g, normal=None):
    """Dark tinted glass: where the reflections belong, with faint smudging."""
    smudge = g.math("ADD", 0.025, g.math("MULTIPLY", g.noise(6.0, detail=4), 0.05))
    values = {"Base Color": srgb(SCENE["colours"]["glass"]), "Roughness": smudge, "Specular IOR Level": 0.7, "IOR": 1.52}
    if normal is not None:
        values["Normal"] = normal
    return principled(g, **values)


def glass():
    m, g = new_material("glass")
    output(g, glass_shader(g).outputs[0])
    return m


def plain(name, colour, roughness=0.6, metallic=0.0, specular=0.5, grime=0.0):
    """A plain material, dirtied towards the rails by `grime`."""
    m, g = new_material(name)
    base = colour
    if grime:
        pos = g.position()
        low = g.math("SUBTRACT", 1.0, g.smoothstep(pos["Z"], 0.2, 1.4))
        dust = g.math("MULTIPLY", g.math("MULTIPLY", low, g.math("ADD", 0.3, g.noise(3.0, detail=5))), grime)
        base = g.mix(colour, BRAKE_DUST, dust)
    variation = g.math("ADD", roughness, g.math("MULTIPLY", g.math("SUBTRACT", g.noise(4.0), 0.5), 0.1))
    output(g, principled(g, **{"Base Color": base, "Roughness": variation, "Metallic": metallic,
                               "Specular IOR Level": specular}).outputs[0])
    return m


def studded(name, colour):
    """Black rubber with rows of rivet heads, as on a gangway's surround."""
    m, g = new_material(name)
    dots = g.node("ShaderNodeTexVoronoi", feature="F1")
    dots.inputs["Scale"].default_value = 14.0
    dots.inputs["Randomness"].default_value = 0.0
    g.link(g.node("ShaderNodeNewGeometry").outputs["Position"], dots.inputs["Vector"])
    head = g.math("SUBTRACT", 1.0, g.smoothstep(dots.outputs["Distance"], 0.08, 0.14))
    bump = g.node("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.7
    bump.inputs["Distance"].default_value = 0.004
    g.link(head, bump.inputs["Height"])
    rough = g.mixf(0.8, 0.5, head)
    output(g, principled(g, **{"Base Color": colour, "Roughness": rough, "Specular IOR Level": 0.3,
                               "Normal": bump.outputs["Normal"]}).outputs[0])
    return m


def grille(name, bars="#7A7F85", scale=70.0):
    """Perforated metal: bars catching the light between rows of holes onto a black void."""
    m, g = new_material(name)
    holes = g.node("ShaderNodeTexVoronoi", feature="F1")
    holes.inputs["Scale"].default_value = scale
    holes.inputs["Randomness"].default_value = 0.0
    g.link(g.node("ShaderNodeNewGeometry").outputs["Position"], holes.inputs["Vector"])
    hole = g.math("SUBTRACT", 1.0, g.smoothstep(holes.outputs["Distance"], 0.3, 0.36))
    base = g.mix(srgb(bars), (0.0, 0.0, 0.0, 1), hole)
    bump = g.node("ShaderNodeBump", invert=True)
    bump.inputs["Strength"].default_value = 0.6
    g.link(hole, bump.inputs["Height"])
    output(g, principled(g, **{"Base Color": base, "Metallic": g.mixf(0.85, 0.0, hole), "Roughness": g.mixf(0.3, 0.9, hole),
                               "Normal": bump.outputs["Normal"]}).outputs[0])
    return m


def lens(name):
    """A lamp's polished reflector bowl seen through its clear cover: bright
    chrome under a glossy glass coat, a little milky."""
    m, g = new_material(name)
    output(g, principled(g, **{"Base Color": (0.88, 0.89, 0.9, 1), "Metallic": 1.0, "Roughness": 0.14,
                               "Coat Weight": 1.0, "Coat Roughness": 0.05, "Coat Tint": (0.97, 0.97, 0.98, 1),
                               "Emission Color": (1.0, 0.98, 0.95, 1), "Emission Strength": 0.25}).outputs[0])
    return m


def lamp_module(name):
    """The lamp unit in the middle of the reflector: white, lit, behind glass."""
    m, g = new_material(name)
    output(g, principled(g, **{"Base Color": (0.95, 0.95, 0.93, 1), "Roughness": 0.3, "Coat Weight": 1.0,
                               "Coat Roughness": 0.05, "Emission Color": (1.0, 0.97, 0.92, 1),
                               "Emission Strength": 2.0}).outputs[0])
    return m


def tail_lamp(name):
    """A red tail lamp behind its lens, faintly lit."""
    m, g = new_material(name)
    output(g, principled(g, **{"Base Color": srgb("#8C0F12"), "Roughness": 0.15, "Coat Weight": 1.0, "Coat Roughness": 0.03,
                               "Emission Color": srgb("#FF2A1F"), "Emission Strength": 0.6}).outputs[0])
    return m


def led_cluster(name):
    """A round LED cluster seen unlit through its cover: a dark disc packed
    with small pale emitters in a honeycomb."""
    m, g = new_material(name)
    dots = g.node("ShaderNodeTexVoronoi", feature="F1")
    dots.inputs["Scale"].default_value = 70.0
    dots.inputs["Randomness"].default_value = 0.0
    g.link(g.node("ShaderNodeNewGeometry").outputs["Position"], dots.inputs["Vector"])
    led = g.math("SUBTRACT", 1.0, g.smoothstep(dots.outputs["Distance"], 0.18, 0.28))
    colour = g.mix(srgb("#202326"), srgb("#E8E2D6"), led)
    albedo_of(g, colour)
    output(g, principled(g, **{"Base Color": colour, "Roughness": 0.3, "Specular IOR Level": 0.6}).outputs[0])
    return m


def emissive(name, colour, strength):
    m, g = new_material(name)
    output(g, principled(g, **{"Base Color": colour, "Emission Color": colour, "Emission Strength": strength,
                               "Roughness": 0.3}).outputs[0])
    return m


def led_dot(name):
    """An unlit LED emitter: a small pale dome, warm amber-white, faintly glowing."""
    m, g = new_material(name)
    output(g, principled(g, **{"Base Color": srgb("#F0D49A"), "Roughness": 0.2, "Coat Weight": 1.0, "Coat Roughness": 0.05,
                               "Emission Color": (1.0, 0.85, 0.6, 1), "Emission Strength": 0.35}).outputs[0])
    return m


def clear_glass(name, tint=None, reflect=0.45):
    """A lamp's clear cover: light passes straight through (so what's
    behind it stays lit), the surface reflects by Fresnel, a touch milky;
    `tint` colours what passes, `reflect` scales the reflection."""
    m, g = new_material(name)
    through = g.node("ShaderNodeBsdfTransparent")
    if tint is not None:
        through.inputs["Color"].default_value = tint
    milky = g.node("ShaderNodeBsdfDiffuse")
    milky.inputs["Color"].default_value = (0.9, 0.92, 0.95, 1)
    haze = g.node("ShaderNodeMixShader")
    haze.inputs[0].default_value = 0.02
    g.link(through.outputs[0], haze.inputs[1])
    g.link(milky.outputs[0], haze.inputs[2])
    shine = g.node("ShaderNodeBsdfGlossy")
    shine.inputs["Roughness"].default_value = 0.05
    fresnel = g.node("ShaderNodeFresnel")
    fresnel.inputs["IOR"].default_value = 1.5
    mix = g.node("ShaderNodeMixShader")
    g.link(g.math("MULTIPLY", fresnel.outputs[0], reflect), mix.inputs[0])
    g.link(haze.outputs[0], mix.inputs[1])
    g.link(shine.outputs[0], mix.inputs[2])
    output(g, mix.outputs[0])
    return m


class Palette:
    """Every material the model uses, made once."""

    def __init__(self):
        c = SCENE["colours"]
        self.body = body()
        self.glass = glass()
        self.panel = paint("panel", srgb(c["panel"]))
        self.rubber = plain("rubber", srgb("#121314"), roughness=0.85, specular=0.25)
        self.studded = studded("gangway surround", srgb("#161718"))
        self.black = plain("black plastic", srgb("#16181A"), roughness=0.5)
        self.metal = plain("metal", srgb("#2C2E31"), roughness=0.4, metallic=0.7)
        self.chrome = plain("reflector", (0.8, 0.8, 0.82, 1), roughness=0.12, metallic=1.0)
        self.under = plain("under", srgb(c["under"]), roughness=0.75, grime=0.35)
        self.frame = plain("bogie", srgb("#26282B"), roughness=0.7, grime=0.45)
        self.wheel = plain("wheel", srgb("#34312E"), roughness=0.7, metallic=0.3, grime=0.3)
        self.tread = plain("tread", (0.6, 0.6, 0.6, 1), roughness=0.22, metallic=1.0)
        self.spring = plain("spring", srgb("#2A2A2A"), roughness=0.55, metallic=0.4, grime=0.25)
        self.roof = plain("roof", srgb(c["roof"]), roughness=0.7, grime=0.0)
        self.kit = plain("roof kit", srgb(c["kit"]), roughness=0.6, grime=0.0) if c.get("kit", c["roof"]) != c["roof"] else self.roof
        self.insulator = plain("insulator", srgb("#C8BBA0"), roughness=0.3)
        self.bulb = emissive("lamp", (1.0, 0.96, 0.9, 1), 6.0)
        self.tail = plain("tail lamp", srgb("#5A0A0A"), roughness=0.15)
        self.cover = clear_glass("lamp glass")
        self.lens = lens("lamp lens")
        self.module = lamp_module("lamp module")
        self.grille = grille("grille")
        # A flat face's mesh grille: black, its bars only a little lighter than the mask round it.
        self.face_grille = grille("face grille", bars="#3E4146", scale=90.0)
        self.surround = plain("surround", srgb(c["dark"]), roughness=0.45)
        self.tail_lamp = tail_lamp("tail lamp lens")
        self.steel_bright = plain("handrail", (0.7, 0.71, 0.72, 1), roughness=0.25, metallic=1.0)
        self.white = plain("white lettering", (0.9, 0.9, 0.9, 1), roughness=0.4)
        self.seam = plain("seam", srgb("#1C1A17"), roughness=0.8)
        # An unlit LED tail lamp behind its frosted cover: pale, faintly pink.
        self.diffuser = plain("led diffuser", srgb("#D6C3BB"), roughness=0.35, specular=0.6)
        self.led = led_cluster("led cluster")
        # A glazed lamp's parts (body.glazed_lamp).
        self.recess = plain("lamp recess", srgb("#3C444C"), roughness=0.5)
        self.led_board = plain("led board", srgb("#3E4246"), roughness=0.45, metallic=0.3)
        self.led_dot = led_dot("led emitter")
        self.lamp_glass = clear_glass("glazed lamp glass", tint=(0.93, 0.95, 0.97, 1), reflect=0.6)
        # A glazed tail lamp's own red lens over its LEDs (Face.glazedTail 'red').
        self.red_lens = clear_glass("glazed tail lens", tint=(0.85, 0.06, 0.05, 1), reflect=0.5)
        self.bellows = plain("bellows", srgb("#9A9EA2"), roughness=0.8, specular=0.3)
        self.gangway_door = paint("gangway door", srgb(c["gangway"]))
        self._paints = {}

    def named(self, name):
        """A material by the name scene.ts gives it."""
        fixed = {"glass": self.glass, "dark": self.surround, "frame": self.surround, "black": self.black, "panel": self.panel,
                 "grille": self.grille, "chrome": self.chrome, "module": self.module, "tail": self.tail_lamp,
                 "cover": self.cover, "lens": self.lens, "seam": self.seam}
        if name in fixed:
            return fixed[name]
        if name.startswith("paint:"):
            colour = name[len("paint:"):]
            if colour == "under":
                colour = SCENE["colours"]["under"]
            if colour not in self._paints:
                self._paints[colour] = paint(f"paint {colour}", srgb(colour))
            return self._paints[colour]
        raise KeyError(f"no material named {name}")
