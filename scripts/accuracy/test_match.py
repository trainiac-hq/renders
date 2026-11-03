"""Checks the camera solver recovers a camera it was given:

    python3 scripts/accuracy/test_match.py [<scene dir>]

The scene's landmarks are projected through a known camera (with half a
pixel of noise, as hand-picked points have), the solver is run on all but
three of them, and the focal length, the camera's position and the
held-out points must come back. The solved camera, exported for Blender,
is then put through camera.py's projection (the one the elevation check
uses, which matches Blender's renders to the pixel) and must land the
points where OpenCV does.
"""

import os
import subprocess
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import camera  # noqa: E402
from landmarks import landmarks  # noqa: E402
from match import FACE, FACE_SIGMA_CM, ROOT, blender_camera, camera_matrix, conditioning, errors, exif_focal, solve_camera  # noqa: E402


def main(argv):
    scene = argv[0] if argv else os.path.join(ROOT, "out", "match", "377-SN")
    if not os.path.exists(os.path.join(scene, "scene.json")):
        subprocess.run(["bun", os.path.join(ROOT, "pipeline", "isolated.ts"), "377-SN", scene], check=True)
    marks = landmarks(scene)
    names = [n for n in marks if n.startswith(("lamp", "gangway", "door0", "door1", "axle0", "axle1", "screen0-top", "screen1-top"))]
    obj = np.array([marks[n] for n in names], dtype=np.float64)
    w, h, f = 2400, 1600, 2100.0
    # A three-quarter view of the cab from 12 m, low, looking back along the train.
    eye = np.array([-9.0, -8.0, 1.6])
    target = np.array([3.0, 0.0, 1.8])
    fwd = (target - eye) / np.linalg.norm(target - eye)
    right = np.cross(fwd, [0, 0, 1.0])
    right /= np.linalg.norm(right)
    down = np.cross(fwd, right)
    R = np.array([right, down, fwd])
    tvec = -R @ eye
    rvec, _ = cv2.Rodrigues(R)
    K = camera_matrix(f, w, h)
    img, _ = cv2.projectPoints(obj, rvec, tvec, K, None)
    img = img.reshape(-1, 2) + np.random.default_rng(7).normal(0, 0.5, (len(names), 2))
    held = [0, len(names) // 2, len(names) - 1]
    fit = [i for i in range(len(names)) if i not in held]
    K2, dist, r2, t2, rms = solve_camera(obj[fit], img[fit], w, h)
    R2, _ = cv2.Rodrigues(r2)
    eye2 = -R2.T @ t2.reshape(3)
    held_err = errors([names[i] for i in held], obj[held], img[held], K2, dist, r2, t2)
    focal_err = abs(K2[0, 0] - f) / f
    pos_err = np.linalg.norm(eye2 - eye)
    print(f"{len(fit)} points fitted, rms {rms:.2f} px; focal {K2[0, 0]:.1f} (true {f}), off {focal_err * 100:.2f}%; camera off {pos_err * 100:.1f} cm")
    for n, v in held_err.items():
        print(f"  held out {n}: {v['px']} px, {v['cm']} cm")
    assert focal_err < 0.02, "focal length not recovered"
    assert pos_err < 0.10, "camera position not recovered"
    assert max(v["cm"] for v in held_err.values()) < 1.0, "held-out points off"
    # The Blender export reproduces OpenCV's projection.
    # An off-centre principal point (a cropped photo) must survive the export as lens shift.
    K2 = K2.copy()
    K2[0, 2], K2[1, 2] = w / 2 + 137.0, h / 2 - 83.0
    matrix, lens, shift = blender_camera(K2, r2, t2, w, h)
    cam = {"width": w, "height": h, "type": "PERSP", "lens": lens, "sensor": 36.0, "shift": shift,
           "worldToCamera": np.linalg.inv(np.array(matrix)).tolist()}
    cv_proj, _ = cv2.projectPoints(obj, r2, t2, K2, None)
    worst = max(np.hypot(*(np.array(camera.project(cam, o[0], o[2], o[1])) - p)) for o, p in zip(obj, cv_proj.reshape(-1, 2)))
    print(f"Blender camera vs OpenCV projection: worst {worst:.3f} px")
    assert worst < 0.05, "Blender camera export disagrees with the solved camera"
    depth(marks)
    exif()
    print("ok")


def look(eye, target):
    fwd = (target - eye) / np.linalg.norm(target - eye)
    right = np.cross(fwd, [0, 0, 1.0])
    right /= np.linalg.norm(right)
    R = np.array([right, np.cross(fwd, right), fwd])
    return cv2.Rodrigues(R)[0], -R @ eye


def depth(marks):
    w, h, f = 3840, 2560, 20000.0
    # A long lens 80 m off, looking along the side at the first cars.
    rvec, tvec = look(np.array([-6.0, -80.0, 2.0]), np.array([8.0, 0.0, 1.8]))
    K = camera_matrix(f, w, h)
    probes = {n: v for n, v in marks.items() if n.startswith(FACE)}
    rng = np.random.default_rng(3)

    def run(names, held):
        obj = np.array([marks[n] for n in names + held], dtype=np.float64)
        img, _ = cv2.projectPoints(obj, rvec, tvec, K, None)
        img = img.reshape(-1, 2) + rng.normal(0, 0.7, (len(obj), 2))
        k = len(names)
        K2, dist, r2, t2, rms = solve_camera(obj[:k], img[:k], w, h)
        cond = conditioning(obj[:k], rms, K2, dist, r2, t2, probes, list(range(7)), abs(marks["door0-front-bottom"][1]))
        err = errors(held, obj[k:], img[k:], K2, dist, r2, t2) if held else {}
        return cond, err

    # The pilot's 800 matches: door and window corners of the bodyside, nothing else.
    planar = [n for n in marks if n.startswith(("door1", "door2"))]
    cond, _ = run(planar, [])
    flat_sigma = max(cond["faceSigmaCm"].values())
    print(f"bodyside only ({len(planar)} points): flatness {cond['flatness']}, face 1 sigma up to {flat_sigma:.1f} cm")
    assert cond["flatness"] < 0.02 and flat_sigma > FACE_SIGMA_CM, "a one-plane solve must not claim to judge the face"
    off = planar + [n for n in marks if n.startswith(("axlebox", "bogie", "far-door", "lamp"))]
    cond, err = run(off, ["nose-tip"])
    sigma = max(cond["faceSigmaCm"].values())
    print(f"with points off the plane ({len(off)}): {cond['offPlane']} off it, face 1 sigma up to {sigma:.1f} cm; "
          f"nose tip held out {err['nose-tip']['cm']} cm")
    assert sigma <= FACE_SIGMA_CM and sigma * 5 < flat_sigma, "off-plane points should pin the face"
    assert err["nose-tip"]["cm"] < 2.0, "held-out nose tip off"


def exif():
    px, note = exif_focal("/nonexistent", 3000, 2000, {"focal35mm": 50, "width": 6000, "height": 4000})
    want = 50 * np.hypot(6000, 4000) / np.hypot(36, 24) / 2
    print(f"EXIF on a half-size copy: {px:.1f} px (want {want:.1f}): {note}")
    assert abs(px - want) < 0.01
    px, note = exif_focal("/nonexistent", 3000, 1800, {"focal35mm": 50, "width": 6000, "height": 4000})
    print(f"EXIF on a cropped copy: {note}")
    assert px is None


if __name__ == "__main__":
    main(sys.argv[1:])
