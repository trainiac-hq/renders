"""Solves the camera a reference photo was taken with, from points whose
place on the model is exactly known, so the model can be rendered from
that same camera and laid over the photo.

    python3 scripts/accuracy/match.py solve <code> <photo id> [--train 377-SN]
    python3 scripts/accuracy/match.py overlay <code> <photo id> <render prefix> <out dir>
    python3 scripts/accuracy/match.py measure <code> <photo id> --train 377-SN
    python3 scripts/accuracy/match.py surface <code> <photo id> --train 800-GW   # picks in "surface" onto the shell

Needs OpenCV (`pip install opencv-python-headless`).

`classes/<code>/match/<photo id>.json` holds the correspondences:

    {"ref": "<ref id in evidence.json>", "side": "near" | "far",
     "points": {"<landmark>": [u, v], ...},       # pixels in the ref image
     "holdout": ["<landmark>", ...],              # kept out of the solve
     "model": {"<name>": [x, y], ...},           # extra bodyside points (spec numbers)
     "focalPx": 14419 | "exif",                   # optional: focal length fixed (pixels, or from EXIF)
     "exif": {"focal35mm": 600, "width": 5472, "height": 3648},  # optional: the original's EXIF,
                                                  # from its Commons page when the copy has none
     "readings": {"<landmark>": "how it was found"}}

Landmarks are named by landmarks.py, from the scene the train builds.
`solve` searches the focal length (square pixels, principal point at the
image centre, then let free if that helps the held-out points: Commons
photos are often cropped), solves the pose with every point but the held-out ones,
checks them with RANSAC, adds one radial distortion term if it helps the
held-out points, and reports each held-out point's error in pixels and in
centimetres on the train at that point's distance. It writes the camera
to spec.json `views` as `match-<photo>` (rendered) and `match-<photo>-flat`
(unlit paint colours, for edges), and to `classes/<code>/match/<photo>.solved.json`.
It fails if any held-out point is off by more than TOLERANCE_CM.

Depth: a camera solved from points on one plane (the bodyside's window
corners) fits that plane to centimetres and can still put the nose
anywhere along the line of sight. So every solve reports its conditioning:
how flat the fitted points are (the smallest singular value of the centred
point cloud over the largest), how many lie off the bodyside's plane, and,
from the solve's own covariance (the Jacobian of the reprojection in pose
and focal length, scaled by the fit's rms, at least half a pixel), the 1
sigma uncertainty in centimetres of where the face and nose points
(lamps, windscreens, gangway frame, nose tip) project. Held-out face
points are only scored when that is under FACE_SIGMA_CM; otherwise they
are reported as "not scored" and the solve asks for off-plane points
(axlebox covers, bogie frame ends, the far side, the face itself).

EXIF: `"focalPx": "exif"` fixes the focal length from the photo's EXIF
(the file's own, else the match file's `exif`, copied from the Commons
page): the 35 mm equivalent over the original's diagonal, scaled to this
copy. A copy whose proportions differ from the original's is cropped and
the EXIF focal can't be used; the solve says so and searches instead.

`overlay` takes the two renders and writes, into the out dir:
<code>-<photo>-outline.png (the model's edges as thin lines on the photo),
-render.png (photo | render side by side) and -blend.png (half and half).
"""

import json
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from landmarks import landmarks  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
# Held-out points must land within this on the train. A pixel on these
# photos is 1-3 cm at the cab; a feature placed 5 cm out reads as wrong
# beside the photo, and is still well clear of picking error (about a
# pixel) and of the model's own tolerance (the elevation check, 6 cm).
TOLERANCE_CM = 6.0
# A face point is scored only if the solve pins where it projects to this
# (1 sigma): a third of the tolerance, so a real 6 cm error stands out.
FACE_SIGMA_CM = TOLERANCE_CM / 3
FACE = ("lamp", "screen", "gangway", "nose")
RENDER_WIDTH = 1600
FLIP = np.diag([1.0, -1.0, -1.0])


def class_dir(code):
    return os.path.join(ROOT, "classes", code)


def scene_for(train, workdir):
    if not os.path.exists(os.path.join(workdir, "scene.json")):
        subprocess.run(["bun", os.path.join(ROOT, "pipeline", "isolated.ts"), train, workdir], check=True)
    return workdir


def camera_matrix(f, w, h):
    return np.array([[f, 0, w / 2], [0, f, h / 2], [0, 0, 1]], dtype=np.float64)


def pose(obj, img, K, dist=None):
    ok, rvec, tvec = cv2.solvePnP(obj, img, K, dist, flags=cv2.SOLVEPNP_SQPNP)
    if not ok:
        return None
    rvec, tvec = cv2.solvePnPRefineLM(obj, img, K, dist, rvec, tvec)
    proj, _ = cv2.projectPoints(obj, rvec, tvec, K, dist)
    err = np.linalg.norm(proj.reshape(-1, 2) - img, axis=1)
    return rvec, tvec, float(np.sqrt((err ** 2).mean()))


def solve_camera(obj, img, w, h):
    """Focal length by search, then pose; returns (K, dist, rvec, tvec, rms)."""
    best = None
    for f in np.geomspace(0.3 * w, 10 * w, 160):
        r = pose(obj, img, camera_matrix(f, w, h))
        if r and (best is None or r[2] < best[1][2]):
            best = (f, r)
    lo, hi = best[0] / 1.05, best[0] * 1.05
    for _ in range(40):
        a, b = lo + (hi - lo) * 0.382, lo + (hi - lo) * 0.618
        ra, rb = pose(obj, img, camera_matrix(a, w, h)), pose(obj, img, camera_matrix(b, w, h))
        if ra[2] < rb[2]:
            hi = b
        else:
            lo = a
    f = (lo + hi) / 2
    K = camera_matrix(f, w, h)
    rvec, tvec, rms = pose(obj, img, K)
    return K, np.zeros(5), rvec, tvec, rms


def free_principal(obj, img, K, w, h):
    """Principal point solved too, with the focal length and pose: a photo
    cropped off-centre (Commons uploads often are) has its optical centre
    elsewhere than the middle of the frame."""
    flags = (cv2.CALIB_USE_INTRINSIC_GUESS | cv2.CALIB_FIX_ASPECT_RATIO | cv2.CALIB_ZERO_TANGENT_DIST
             | cv2.CALIB_FIX_K1 | cv2.CALIB_FIX_K2 | cv2.CALIB_FIX_K3)
    rms, K2, dist, rvecs, tvecs = cv2.calibrateCamera([obj.astype(np.float32)], [img.astype(np.float32)], (w, h),
                                                     K.copy(), np.zeros(5), flags=flags)
    return K2, dist.reshape(-1), rvecs[0], tvecs[0], rms


def with_distortion(obj, img, K, w, h):
    """One radial term (k1), focal and pose refined together."""
    flags = (cv2.CALIB_USE_INTRINSIC_GUESS | cv2.CALIB_FIX_PRINCIPAL_POINT | cv2.CALIB_FIX_ASPECT_RATIO
             | cv2.CALIB_ZERO_TANGENT_DIST | cv2.CALIB_FIX_K2 | cv2.CALIB_FIX_K3)
    rms, K2, dist, rvecs, tvecs = cv2.calibrateCamera([obj.astype(np.float32)], [img.astype(np.float32)], (w, h),
                                                     K.copy(), np.zeros(5), flags=flags)
    return K2, dist.reshape(-1), rvecs[0], tvecs[0], rms


def errors(names, obj, img, K, dist, rvec, tvec):
    proj, _ = cv2.projectPoints(obj, rvec, tvec, K, dist)
    proj = proj.reshape(-1, 2)
    R, _ = cv2.Rodrigues(rvec)
    out = {}
    for n, o, i, p in zip(names, obj, img, proj):
        px = float(np.linalg.norm(p - i))
        depth = float((R @ o + tvec.reshape(3))[2])
        out[n] = {"px": round(px, 2), "cm": round(px * depth / K[0, 0] * 100, 2), "projected": [round(float(p[0]), 1), round(float(p[1]), 1)]}
    return out


def blender_camera(K, rvec, tvec, w, h):
    """The solved camera as Blender wants it: camera-to-world matrix, lens
    on a 36 mm sensor, and the lens shift that puts the principal point
    where it was (in units of the image width)."""
    R, _ = cv2.Rodrigues(rvec)
    world_to_cam = np.eye(4)
    world_to_cam[:3, :3] = FLIP @ R
    world_to_cam[:3, 3] = FLIP @ tvec.reshape(3)
    shift = [float((w / 2 - K[0, 2]) / w), float((K[1, 2] - h / 2) / w)]
    return np.linalg.inv(world_to_cam).tolist(), float(K[0, 0] / w * 36.0), shift


def exif_focal(path, w, h, given=None):
    """The focal length in this copy's pixels from EXIF: (px, note), or
    (None, why not). The 35 mm equivalent is defined on the diagonal."""
    from PIL import Image as _Image

    info = {}
    try:
        ex = _Image.open(path).getexif()
        sub = ex.get_ifd(0x8769)
        info = {"focal35mm": sub.get(0xA405), "focalMm": sub.get(0x920A), "width": sub.get(0xA002), "height": sub.get(0xA003),
                "planeRes": sub.get(0xA20E), "planeUnit": sub.get(0xA210)}
    except Exception:
        pass
    if not info.get("focal35mm") and not (info.get("focalMm") and info.get("planeRes")):
        info = dict(given or {})
    if not info:
        return None, "no EXIF in the file or the match file"
    W, H = info.get("width") or w, info.get("height") or h
    if abs(W / H - w / h) > 0.01 * (w / h):
        return None, f"the copy ({w}x{h}) has other proportions than the original ({W}x{H}): cropped"
    if info.get("focal35mm"):
        f = float(info["focal35mm"]) * np.hypot(W, H) / np.hypot(36.0, 24.0)
        how = f"{info['focal35mm']} mm (35 mm equivalent)"
    elif info.get("focalMm") and info.get("planeRes"):
        mm = {2: 25.4, 3: 10.0, 4: 1.0}.get(int(info.get("planeUnit") or 2), 25.4)
        f = float(info["focalMm"]) * float(info["planeRes"]) / mm
        how = f"{info['focalMm']} mm at {info['planeRes']} px per {mm} mm"
    else:
        return None, "EXIF has neither a 35 mm equivalent nor a focal plane resolution"
    return f * w / W, f"EXIF {how}, original {W}x{H}, scaled by {w / W:.4f}"


def project_params(obj, p, K, dist):
    """Projection with pose, focal and principal point taken from p:
    [rvec, tvec, f, cx, cy]."""
    k = K.copy()
    k[0, 0] = k[1, 1] = p[6]
    k[0, 2], k[1, 2] = p[7], p[8]
    proj, _ = cv2.projectPoints(obj, p[:3], p[3:6], k, dist)
    return proj.reshape(-1)


def conditioning(fit_obj, rms, K, dist, rvec, tvec, probes, free, side_y):
    """How well the solve pins depth: the fitted points' flatness, how many
    lie off the bodyside's plane, and the 1 sigma (cm) of each probe point's
    projection from the solve's covariance over the parameters it solved
    (`free`: indices into [rvec, tvec, f, cx, cy])."""
    centred = fit_obj - fit_obj.mean(axis=0)
    sv = np.linalg.svd(centred, compute_uv=False)
    flat = float(sv[-1] / sv[0]) if sv[0] > 0 else 0.0
    off = int(sum(abs(abs(o[1]) - side_y) > 0.08 for o in fit_obj))
    p = np.concatenate([rvec.reshape(3), tvec.reshape(3), [K[0, 0], K[0, 2], K[1, 2]]])
    steps = np.array([1e-6] * 3 + [1e-5] * 3 + [K[0, 0] * 1e-6, 1e-3, 1e-3])

    def jac(obj):
        cols = []
        for i in free:
            d = np.zeros(9)
            d[i] = steps[i]
            cols.append((project_params(obj, p + d, K, dist) - project_params(obj, p - d, K, dist)) / (2 * steps[i]))
        return np.array(cols).T

    J = jac(fit_obj)
    sigma = max(float(rms), 0.5)
    cov = sigma ** 2 * np.linalg.pinv(J.T @ J)
    R, _ = cv2.Rodrigues(rvec)
    out = {}
    for name, o in probes.items():
        Jp = jac(np.array([o], dtype=np.float64))
        px = float(np.sqrt(max(np.linalg.eigvalsh(Jp @ cov @ Jp.T))))
        depth = float((R @ np.array(o) + tvec.reshape(3))[2])
        out[name] = round(px * depth / K[0, 0] * 100, 2)
    return {"flatness": round(flat, 4), "offPlane": off, "faceSigmaCm": out}


def solve(code, photo, train):
    base = class_dir(code)
    m = json.load(open(os.path.join(base, "match", f"{photo}.json")))
    ev = json.load(open(os.path.join(base, "evidence.json")))
    image = Image.open(os.path.join(base, ev["refs"][m["ref"]]["file"]))
    w, h = image.size
    marks = landmarks(scene_for(train, os.path.join(ROOT, "out", "match", train)), m.get("side", "near"), m.get("model"), m.get("modelFace"))
    missing = [n for n in m["points"] if n not in marks]
    if missing:
        raise SystemExit(f"no such landmarks: {missing}")
    names = list(m["points"])
    fit = [n for n in names if n not in m.get("holdout", [])]
    held = [n for n in names if n in m.get("holdout", [])]
    O = lambda ns: np.array([marks[n] for n in ns], dtype=np.float64)
    I = lambda ns: np.array([m["points"][n] for n in ns], dtype=np.float64)
    focal = m.get("focalPx")
    exif_px, exif_note = exif_focal(os.path.join(base, ev["refs"][m["ref"]]["file"]), w, h, m.get("exif"))
    if focal == "exif":
        focal = exif_px
        print(f"  focal from EXIF: {exif_note}" if exif_px else f"  EXIF focal not used: {exif_note}")
    elif exif_px and not focal:
        print(f"  EXIF gives {exif_px:.0f} px ({exif_note}); \"focalPx\": \"exif\" would fix it")
    m["focalPx"] = focal
    if m.get("focalPx"):
        # Known from the photo's EXIF (the points alone may not pin it: a
        # long lens on near-planar points), so only the pose is solved.
        K = camera_matrix(m["focalPx"], w, h)
        dist = np.zeros(5)
        rvec, tvec, rms = pose(O(fit), I(fit), K)
    else:
        K, dist, rvec, tvec, rms = solve_camera(O(fit), I(fit), w, h)
    result = {"photo": photo, "size": [w, h], "fit": fit, "holdout": held, "rmsFit": round(rms, 2)}
    # RANSAC on the fitted points: anything it calls an outlier is flagged.
    ok, _, _, inliers = cv2.solvePnPRansac(O(fit), I(fit), K, None, reprojectionError=max(4.0, 0.004 * w), iterationsCount=500)
    inl = set(int(i) for i in inliers.reshape(-1)) if ok and inliers is not None else set(range(len(fit)))
    result["outliers"] = [fit[i] for i in range(len(fit)) if i not in inl]
    # With enough points, let the principal point go free (a cropped photo),
    # kept if it helps the held-out points.
    Kp = None
    if len(fit) >= 9 and not m.get("focalPx"):
        try:
            Kp, distp, rvecp, tvecp, rmsp = free_principal(O(fit), I(fit), K, w, h)
        except cv2.error as e:
            # OpenCV refuses when the optimum leaves the image: keep it centred.
            print(f"  principal point left at the centre: {str(e).splitlines()[-1][:80]}")
            Kp = None
    if len(fit) >= 9 and not m.get("focalPx") and Kp is not None:
        e0 = errors(held, O(held), I(held), K, dist, rvec, tvec)
        ep = errors(held, O(held), I(held), Kp, distp, rvecp, tvecp)
        inside = 0 <= Kp[0, 2] < w and 0 <= Kp[1, 2] < h and Kp[0, 0] > 0
        # A principal point solved off the image is a degenerate fit, never a crop.
        if held and inside and max(v["cm"] for v in ep.values()) < max(v["cm"] for v in e0.values()):
            K, dist, rvec, tvec, rms = Kp, distp, rvecp, tvecp, rmsp
            result["principalPoint"] = "free: it improves the held-out points (the photo is likely cropped)"
    if len(fit) >= 8 and not m.get("focalPx"):
        try:
            K2, dist2, rvec2, tvec2, rms2 = with_distortion(O(fit), I(fit), K, w, h)
        except cv2.error as e:
            print(f"  no distortion term: {str(e).splitlines()[-1][:80]}")
            K2 = None
        e1 = errors(held, O(held), I(held), K, dist, rvec, tvec)
        e2 = errors(held, O(held), I(held), K2, dist2, rvec2, tvec2) if K2 is not None else None
        if K2 is not None and held and max(v["cm"] for v in e2.values()) < max(v["cm"] for v in e1.values()) and abs(dist2[0]) < 0.5:
            K, dist, rvec, tvec, rms = K2, dist2, rvec2, tvec2, rms2
            result["distortion"] = "k1 kept: it improves the held-out points"
    result["rmsFit"] = round(float(rms), 2)
    result["focalPx"] = round(float(K[0, 0]), 1)
    result["principal"] = [round(float(K[0, 2]), 1), round(float(K[1, 2]), 1)]
    result["k1"] = round(float(dist[0]), 4)
    result["fitErrors"] = errors(fit, O(fit), I(fit), K, dist, rvec, tvec)
    result["heldOut"] = errors(held, O(held), I(held), K, dist, rvec, tvec)
    # Depth: can this camera judge the face at all?
    side_y = abs(marks["door0-front-bottom"][1]) if "door0-front-bottom" in marks else 1.35
    probes = {n: v for n, v in marks.items() if n.startswith(FACE) or n in (m.get("modelFace") or {})}
    free = list(range(6)) + ([] if m.get("focalPx") else [6]) + ([7, 8] if "principalPoint" in result else [])
    cond = conditioning(O(fit), rms, K, dist, rvec, tvec, probes, free, side_y)
    worst_face = max(cond["faceSigmaCm"].values(), default=0.0)
    cond["faceScored"] = bool(probes) and bool(worst_face <= FACE_SIGMA_CM)
    result["conditioning"] = cond
    is_face = lambda n: n.startswith(FACE) or n in (m.get("modelFace") or {})
    scored = {n: v for n, v in result["heldOut"].items() if cond["faceScored"] or not is_face(n)}
    result["notScored"] = [n for n in result["heldOut"] if n not in scored]
    worst = max((v["cm"] for v in scored.values()), default=0.0)
    result["worstHeldOutCm"] = float(worst)
    result["ok"] = bool(worst <= TOLERANCE_CM)
    matrix, lens, shift = blender_camera(K, rvec, tvec, w, h)
    rw = min(RENDER_WIDTH, w)
    rh = round(h * rw / w)
    result["camera"] = {"matrix": matrix, "lens": lens, "shift": shift, "size": [rw, rh], "k1": float(dist[0])}
    json.dump(result, open(os.path.join(base, "match", f"{photo}.solved.json"), "w"), indent=1)
    spec_path = os.path.join(base, "spec.json")
    spec = json.load(open(spec_path))
    views = spec.setdefault("views", {})
    views[f"match-{photo}"] = {"matrix": matrix, "lens": lens, "shift": shift, "size": [rw, rh]}
    views[f"match-{photo}-flat"] = {"matrix": matrix, "lens": lens, "shift": shift, "size": [rw, rh], "flat": True}
    json.dump(spec, open(spec_path, "w"), indent=1)
    print(f"{code} {photo}: focal {result['focalPx']} px, k1 {result['k1']}, fit rms {result['rmsFit']} px over {len(fit)} points")
    if result["outliers"]:
        print(f"  RANSAC outliers: {', '.join(result['outliers'])}")
    c = result["conditioning"]
    print(f"  conditioning: flatness {c['flatness']} (0 = one plane), {c['offPlane']} of {len(fit)} fitted points off the bodyside's plane, "
          f"face 1 sigma up to {max(c['faceSigmaCm'].values(), default=0):.1f} cm (scored under {FACE_SIGMA_CM:.0f} cm): "
          f"{'face scored' if c['faceScored'] else 'face NOT scored: add points off the bodyside plane'}")
    for n, v in result["heldOut"].items():
        tag = "  (not scored: depth unconstrained)" if n in result["notScored"] else ""
        print(f"  held out {n:26s} {v['px']:6.1f} px  {v['cm']:6.1f} cm{tag}")
    print(f"  {'ok' if result['ok'] else 'FAIL'}: worst held-out {worst} cm (tolerance {TOLERANCE_CM} cm)")
    return result


def overlay(code, photo, prefix, outdir):
    base = class_dir(code)
    m = json.load(open(os.path.join(base, "match", f"{photo}.json")))
    solved = json.load(open(os.path.join(base, "match", f"{photo}.solved.json")))
    ev = json.load(open(os.path.join(base, "evidence.json")))
    photo_img = Image.open(os.path.join(base, ev["refs"][m["ref"]]["file"])).convert("RGB")
    w, h = photo_img.size
    k1 = solved["camera"]["k1"]
    if abs(k1) > 1e-6:
        a = np.asarray(photo_img)
        K = camera_matrix(solved["focalPx"], w, h)
        K[0, 2], K[1, 2] = solved["principal"]
        a = cv2.undistort(a, K, np.array([k1, 0, 0, 0, 0]))
        photo_img = Image.fromarray(a)
    rw, rh = solved["camera"]["size"]
    photo_img = photo_img.resize((rw, rh), Image.LANCZOS)
    render = Image.open(f"{prefix}-match-{photo}.png").convert("RGBA").resize((rw, rh), Image.LANCZOS)
    flat = np.asarray(Image.open(f"{prefix}-match-{photo}-flat.png").convert("RGBA").resize((rw, rh), Image.NEAREST)).astype(np.int32)
    # Edges: where the paint colour changes, or the train ends.
    rgb, alpha = flat[:, :, :3], flat[:, :, 3] > 128
    edge = np.zeros(alpha.shape, bool)
    for axis in (0, 1):
        d = np.abs(np.diff(rgb, axis=axis)).max(axis=2) > 14
        da = np.diff(alpha.astype(np.int8), axis=axis) != 0
        e = d | da
        if axis == 0:
            edge[1:, :] |= e
        else:
            edge[:, 1:] |= e
    outline = np.asarray(photo_img).copy()
    outline[edge] = (0, 255, 255)
    os.makedirs(outdir, exist_ok=True)
    out = Image.fromarray(outline)
    d = ImageDraw.Draw(out)
    marks = solved["fitErrors"] | solved["heldOut"]
    for n, (u, v) in m["points"].items():
        s = rw / w
        colour = (255, 60, 60) if n in solved["holdout"] else (255, 255, 0)
        d.ellipse([u * s - 4, v * s - 4, u * s + 4, v * s + 4], outline=colour, width=2)
        pu, pv = marks[n]["projected"]
        d.line([u * s, v * s, pu * s, pv * s], fill=colour, width=2)
    out.save(os.path.join(outdir, f"{code}-{photo}-outline.png"))
    bg = Image.new("RGBA", (rw, rh), (255, 255, 255, 255))
    bg.alpha_composite(render)
    pair = Image.new("RGB", (rw * 2 + 10, rh), "white")
    pair.paste(photo_img, (0, 0))
    pair.paste(bg.convert("RGB"), (rw + 10, 0))
    pair.save(os.path.join(outdir, f"{code}-{photo}-render.png"))
    over = photo_img.convert("RGBA").copy()
    half = render.copy()
    half.putalpha(Image.fromarray((np.asarray(render)[:, :, 3] * 0.5).astype(np.uint8)))
    over.alpha_composite(half)
    over.convert("RGB").save(os.path.join(outdir, f"{code}-{photo}-blend.png"))
    print(f"{code} {photo}: outline, render and blend -> {outdir}")


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "solve":
        code, photo = sys.argv[2], sys.argv[3]
        if "--train" not in sys.argv:
            raise SystemExit("solve needs --train <class>-<operator>, the train whose scene gives the landmarks")
        train = sys.argv[sys.argv.index("--train") + 1]
        r = solve(code, photo, train)
        sys.exit(0 if r["ok"] else 1)
    elif cmd == "overlay":
        overlay(*sys.argv[2:6])
    elif cmd not in ("measure", "surface"):
        raise SystemExit(__doc__)


def measure(code, photo, train):
    """With the solved camera, where each picked bodyside point really is:
    its ray from the camera met with the bodyside plane it lies on, read as
    [x, y] in metres, beside the spec's. This is how a photo measures the
    model back once its camera is known."""
    base = class_dir(code)
    m = json.load(open(os.path.join(base, "match", f"{photo}.json")))
    solved = json.load(open(os.path.join(base, "match", f"{photo}.solved.json")))
    marks = landmarks(scene_for(train, os.path.join(ROOT, "out", "match", train)), m.get("side", "near"), m.get("model"), m.get("modelFace"))
    K = camera_matrix(solved["focalPx"], *solved["size"])
    K[0, 2], K[1, 2] = solved["principal"]
    world_to_cam = np.linalg.inv(np.array(solved["camera"]["matrix"]))
    R = FLIP @ world_to_cam[:3, :3]
    t = FLIP @ world_to_cam[:3, 3]
    C = -R.T @ t
    out = {}
    for n, (u, v) in m["points"].items():
        X = np.array(marks[n])
        ray = R.T @ np.linalg.inv(K) @ np.array([u, v, 1.0])
        if n.startswith(("lamp", "screen", "gangway", "frame")):
            s = (X[0] - C[0]) / ray[0]  # on the face's plane: across and up
            P = C + s * ray
            out[n] = {"model": [round(X[1], 3), round(X[2], 3)], "photo": [round(P[1], 3), round(P[2], 3)], "axes": "z, y"}
        else:
            s = (X[1] - C[1]) / ray[1]  # on the bodyside's plane: along and up
            P = C + s * ray
            out[n] = {"model": [round(X[0], 3), round(X[2], 3)], "photo": [round(P[0], 3), round(P[2], 3)], "axes": "x, y"}
    for n, v in out.items():
        d = [round(b - a, 3) for a, b in zip(v["model"], v["photo"])]
        print(f"  {n:24s} {v['axes']}: model {v['model']} photo {v['photo']}  diff {d}")
    return out


if __name__ == "__main__" and sys.argv[1] == "measure":
    measure(sys.argv[2], sys.argv[3], sys.argv[sys.argv.index("--train") + 1])


def on_surface(code, photo, train, picks):
    """Where picked image points lie on the model's shell: for each, the
    point of the nose or bodyside surface, searched over (z, y), whose
    projection through the solved camera lands on the pick. Returns
    {name: {x, z, y, u, px}}: x back from the tip, z across, y up, u the
    fraction across the face, and px how close the best point projects (a
    large px means the shell itself is not where the photo has it)."""
    from landmarks import Scene

    base = class_dir(code)
    solved = json.load(open(os.path.join(base, "match", f"{photo}.solved.json")))
    if not solved.get("conditioning", {}).get("faceScored", False):
        print(f"  warning: {photo}'s camera does not pin depth at the face (match.py solve reports why); surface points are unreliable")
    sc = Scene(scene_for(train, os.path.join(ROOT, "out", "match", train)))
    K = camera_matrix(solved["focalPx"], *solved["size"])
    K[0, 2], K[1, 2] = solved["principal"]
    world_to_cam = np.linalg.inv(np.array(solved["camera"]["matrix"]))
    R = FLIP @ world_to_cam[:3, :3]
    t = FLIP @ world_to_cam[:3, 3]
    rvec, _ = cv2.Rodrigues(R)
    ys = np.arange(0.3, sc.s["heights"]["roof"], 0.005)
    pts, meta = [], []
    for y in ys:
        hw = sc.half_width(y)
        for z in np.arange(-hw, hw + 1e-9, 0.005):
            x = sc.nose_x(y, z)
            if x is None:
                continue
            pts.append((x, z, y))
            meta.append((y, z, hw))
    P = np.array(pts)
    proj, _ = cv2.projectPoints(P, rvec, t, K, None)
    proj = proj.reshape(-1, 2)
    # Only the surface facing the camera: points nearer it than the shell behind them.
    depth = (R @ P.T + t.reshape(3, 1))[2]
    out = {}
    for name, (u, v) in picks.items():
        d = np.hypot(proj[:, 0] - u, proj[:, 1] - v)
        near = d < max(3.0, d.min() + 1.0)
        i = int(np.argmin(np.where(near, depth, np.inf)))
        y, z, hw = meta[i]
        x = P[i][0]
        out[name] = {"x": round(float(x), 3), "z": round(float(z), 3), "y": round(float(y), 3),
                     "u": round(float(0.5 + z / (2 * sc.half_width(min(y, sc.s["heights"]["cantrail"])))), 3),
                     "px": round(float(d[i]), 1)}
    return out


if __name__ == "__main__" and sys.argv[1] == "surface":
    code, photo = sys.argv[2], sys.argv[3]
    m = json.load(open(os.path.join(class_dir(code), "match", f"{photo}.json")))
    res = on_surface(code, photo, sys.argv[sys.argv.index("--train") + 1], m.get("surface", {}))
    for n, v in res.items():
        print(f"  {n:22s} {v}")
