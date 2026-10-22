"""Inspect shipped GLBs and source scene surfaces without modifying assets."""

import bpy
import json
import struct
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"


def inspect_glb(path: Path) -> dict:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    bpy.context.view_layer.update()
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    triangles = 0
    bounds = []
    for obj in mesh_objects:
        mesh = obj.data
        mesh.calc_loop_triangles()
        triangles += len(mesh.loop_triangles)
        bounds.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    if bounds:
        lower = [min(point[i] for point in bounds) for i in range(3)]
        upper = [max(point[i] for point in bounds) for i in range(3)]
    else:
        lower = upper = [0, 0, 0]
    materials = []
    for material in bpy.data.materials:
        principled = material.node_tree.nodes.get("Principled BSDF") if material.use_nodes else None
        images = sorted(
            {
                node.image.name
                for node in material.node_tree.nodes
                if node.type == "TEX_IMAGE" and node.image
            }
        ) if material.use_nodes else []
        materials.append(
            {
                "name": material.name,
                "baseColor": list(principled.inputs["Base Color"].default_value)
                if principled
                else None,
                "roughness": principled.inputs["Roughness"].default_value if principled else None,
                "metallic": principled.inputs["Metallic"].default_value if principled else None,
                "images": images,
            }
        )
    actions = sorted(action.name for action in bpy.data.actions)
    return {
        "file": str(path.relative_to(ROOT)),
        "bytes": path.stat().st_size,
        "meshObjects": len(mesh_objects),
        "triangles": triangles,
        "boundsBlenderXYZ": {
            "min": [round(value, 4) for value in lower],
            "max": [round(value, 4) for value in upper],
            "size": [round(upper[i] - lower[i], 4) for i in range(3)],
        },
        # GLB is Y-up while Blender's imported scene uses Z-up: game Z is -Blender Y.
        "boundsGameXYZ": {
            "min": [round(lower[0], 4), round(lower[2], 4), round(-upper[1], 4)],
            "max": [round(upper[0], 4), round(upper[2], 4), round(-lower[1], 4)],
            "size": [
                round(upper[0] - lower[0], 4),
                round(upper[2] - lower[2], 4),
                round(upper[1] - lower[1], 4),
            ],
        },
        "materials": materials,
        "actions": actions,
        "morphTargets": sorted(
            {key.name for obj in mesh_objects if obj.data.shape_keys for key in obj.data.shape_keys.key_blocks}
        ),
    }


models = sorted((ASSETS / "characters").glob("*.glb")) + sorted(
    (ASSETS / "environment").glob("*.glb")
)
report = {"models": [inspect_glb(path) for path in models]}
atlas = ASSETS / "textures" / "bellmare-atlas.png"
with atlas.open("rb") as stream:
    header = stream.read(24)
    width, height = struct.unpack(">II", header[16:24])
report["legacyAtlas"] = {
    "file": str(atlas.relative_to(ROOT)),
    "bytes": atlas.stat().st_size,
    "width": width,
    "height": height,
    "format": "PNG",
    "runtimeLoaded": False,
    "note": "Retained as project source; removed from the gameplay startup to avoid its dark palette and 1.86 MB download.",
}
report["visualSceneAudit"] = {
    "logicalLayout": "Tecnico/hotel_bellmare_layout_v1.json; not changed",
    "primitiveRepresentationsReplaced": [
        "Half-metre floor boxes -> rounded stone GLB clusters, grouped in one-metre patches with half-cell edge tiles",
        "Flat wall panel compositions -> rounded Blender GLB modules",
        "Box doors -> rounded Blender GLB doors",
        "Primitive lamp fixtures -> sculpted GLB sconces",
        "Box hiding-place silhouettes -> beveled Kenney CC0 cabinets, remodeled in Blender",
        "Cone delivery marker -> animated multi-material GLB beacon",
        "Placeholder obstacle box pile -> Kenney CC0 parcel model, recolored and rounded in Blender",
        "Telephone-only marker -> Kenney CC0 table with sculpted rotary telephone GLB",
    ],
    "visiblePrimitivesRemaining": [
        "Thin carpet/runner sheets and their narrow border strips",
        "Merged box wall backing and ceiling shell under/behind the GLB facade modules",
        "Canvas-textured flat signs on the wall",
    ],
    "collisionPrimitives": "Remain logical-only in level.ts; no collision or route geometry changed",
}
out = ROOT / "docs" / "art-scene-audit.json"
out.write_text(json.dumps(report, indent=2) + "\n")
print(out)
