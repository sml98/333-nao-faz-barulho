"""Build rounded Bellmare architecture modules from Blender meshes and Kenney CC0."""

import bpy
import bmesh
import math
import zipfile
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "environment"
KENNEY = ROOT / "art_sources" / "kenney_furniture-kit.zip"
OUT.mkdir(parents=True, exist_ok=True)

PALETTE = {
    "violet": "8587D8",
    "violet_light": "A9C9EF",
    "wine": "EB7E89",
    "wine_light": "F5AC92",
    "gold": "F3BA62",
    "gold_light": "FFF0C9",
    "dark": "31566A",
    "glass": "FFE18A",
    "cream": "FFF3D8",
    "wood": "56BCAF",
    "coral": "EF806F",
    "leaf": "73C98E",
}


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def srgb(value):
    value /= 255
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


MATERIALS = {}


def mat(name, color, roughness=0.48, metallic=0, emission=0):
    key = (name, color, roughness, metallic, emission)
    if key not in MATERIALS:
        material = bpy.data.materials.new(name)
        material.diffuse_color = tuple(srgb(int(color[i : i + 2], 16)) for i in (0, 2, 4)) + (1,)
        material.use_nodes = True
        shader = material.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Base Color"].default_value = material.diffuse_color
        shader.inputs["Roughness"].default_value = roughness
        shader.inputs["Metallic"].default_value = metallic
        shader.inputs["Emission Color"].default_value = material.diffuse_color
        shader.inputs["Emission Strength"].default_value = emission
        MATERIALS[key] = material
    return MATERIALS[key]


def blender_point(point):
    x, y, z = point
    return (x, -z, y)


def rounded_box(name, center, size, material, bevel=0.035):
    bpy.ops.mesh.primitive_cube_add(size=1, location=blender_point(center))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (size[0], size[2], size[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if material:
        obj.data.materials.append(material)
    if bevel:
        modifier = obj.modifiers.new("Machined radius", "BEVEL")
        modifier.width = min(bevel, min(size) * 0.42)
        modifier.segments = 3
        modifier.profile = 0.5
        normal = obj.modifiers.new("Weighted highlight normals", "WEIGHTED_NORMAL")
        normal.keep_sharp = True
        normal.weight = 45
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        bpy.ops.object.modifier_apply(modifier=normal.name)
    return obj


def organic_stone(name, center, size, material, seed):
    cx, cy, cz = center
    count = 7
    vertices = []
    faces = []
    phase = seed * 0.41
    bevel = min(size[1] * 0.19, size[0] * 0.055, size[2] * 0.055)
    rings = [
        (cy - size[1] / 2, 0.91),
        (cy - size[1] / 2 + bevel, 1.0),
        (cy + size[1] / 2 - bevel, 1.0),
        (cy + size[1] / 2, 0.91),
    ]
    for y, radius in rings:
        for index in range(count):
            angle = math.tau * index / count + phase
            wobble = 0.91 + 0.09 * (0.5 + 0.5 * math.sin(index * 1.91 + seed * 2.37))
            point = (
                cx + math.cos(angle) * size[0] * 0.5 * wobble * radius,
                y,
                cz + math.sin(angle) * size[2] * 0.5 * wobble * radius,
            )
            vertices.append(blender_point(point))
    faces.append(tuple(range(count - 1, -1, -1)))
    faces.append(tuple((len(rings) - 1) * count + i for i in range(count)))
    for ring in range(len(rings) - 1):
        for index in range(count):
            nxt = (index + 1) % count
            a = ring * count + index
            b = ring * count + nxt
            faces.append((a, b, b + count, a + count))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(material)
    mesh.update()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def sphere(name, center, size, material):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=16, ring_count=10, location=blender_point(center)
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = (size[0] / 2, size[2] / 2, size[1] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def tube(name, points, radius, material):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 8
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for bezier, point in zip(spline.bezier_points, points):
        bezier.co = blender_point(point)
        bezier.handle_left_type = "AUTO"
        bezier.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def lathed_y(name, center, rings, material, segments=24):
    cx, cy, cz = center
    vertices = []
    faces = []
    for y, radius in rings:
        for i in range(segments):
            angle = math.tau * i / segments
            vertices.append(blender_point((cx + math.cos(angle) * radius, cy + y, cz + math.sin(angle) * radius)))
    for ring in range(len(rings) - 1):
        for i in range(segments):
            a = ring * segments + i
            b = ring * segments + (i + 1) % segments
            faces.append((a, b, b + segments, a + segments))
    faces.extend([tuple(range(segments - 1, -1, -1)), tuple((len(rings) - 1) * segments + i for i in range(segments))])
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(material)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    bevel = obj.modifiers.new("Soft turned edge", "BEVEL")
    bevel.width = 0.008
    bevel.segments = 2
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    return obj


def join_material_meshes(prefix):
    bpy.ops.object.select_all(action="DESELECT")
    for curve in [obj for obj in bpy.context.scene.objects if obj.type == "CURVE"]:
        bpy.ops.object.select_all(action="DESELECT")
        bpy.context.view_layer.objects.active = curve
        curve.select_set(True)
        bpy.ops.object.convert(target="MESH")
        bpy.ops.object.select_all(action="DESELECT")
    fallback = [
        obj.name
        for obj in bpy.context.scene.objects
        if obj.type == "MESH" and (not obj.data.materials or obj.data.materials[0].name == "Material")
    ]
    if fallback:
        raise RuntimeError(f"Unassigned/default mesh material in {prefix}: {fallback}")
    materials = sorted(
        {
            obj.data.materials[0]
            for obj in bpy.context.scene.objects
            if obj.type == "MESH" and obj.data.materials
        },
        key=lambda item: item.name,
    )
    for material in materials:
        objects = [
            obj
            for obj in bpy.context.scene.objects
            if obj.type == "MESH" and obj.data.materials and obj.data.materials[0] == material
        ]
        if not objects:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        if len(objects) > 1:
            bpy.ops.object.join()
        result = bpy.context.object
        result.name = f"{prefix} {material.name}"
        result.data.name = result.name
        result.data.materials.clear()
        result.data.materials.append(material)
        for polygon in result.data.polygons:
            polygon.use_smooth = True
    bpy.ops.object.select_all(action="SELECT")
    bpy.context.view_layer.objects.active = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")


def export(name):
    join_material_meshes(name)
    path = OUT / f"{name}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_normals=True,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
    )
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATERIALS.clear()
    return path


def kenney_obj(object_name):
    source_dir = ROOT / "art_sources" / "kenney"
    source_dir.mkdir(parents=True, exist_ok=True)
    local_license = (source_dir / "License.txt").read_text(errors="replace")
    if "CC0" not in local_license:
        raise RuntimeError("Kenney Furniture Kit license was not verified as CC0")
    obj_path = source_dir / f"{object_name}.obj"
    mtl_path = source_dir / f"{object_name}.mtl"
    if KENNEY.exists():
        with zipfile.ZipFile(KENNEY) as archive:
            license_text = archive.read("License.txt").decode("utf-8", errors="replace")
            if "CC0" not in license_text:
                raise RuntimeError("Kenney archive license was not verified as CC0")
            source_base = f"Models/OBJ format/{object_name}"
            obj_path.write_bytes(archive.read(source_base + ".obj"))
            mtl_path.write_bytes(archive.read(source_base + ".mtl"))
    elif not obj_path.is_file() or not mtl_path.is_file():
        raise FileNotFoundError(f"Missing committed Kenney CC0 source model: {obj_path}")
    return obj_path


def create_wall_panel():
    teal = mat("Bellmare sea-glass enamel", PALETTE["wood"], 0.56)
    sky = mat("Bellmare soft blue inset", PALETTE["violet_light"], 0.55)
    coral = mat("Bellmare coral lower panel", PALETTE["coral"], 0.5)
    rose = mat("Bellmare blush piping", PALETTE["wine_light"], 0.48)
    cream = mat("Bellmare warm ivory trim", PALETTE["cream"], 0.43)
    gold = mat("Bellmare honey details", PALETTE["gold"], 0.34, 0.14)
    green = mat("Bellmare leaf accent", PALETTE["leaf"], 0.54)
    rounded_box("Upper soft inset", (0, 0.83, 0), (1.78, 1.45, 0.10), cream, 0.12)
    rounded_box("Upper sea-glass panel", (0, 0.84, 0.064), (1.56, 1.23, 0.035), sky, 0.10)
    rounded_box("Lower soft inset", (0, -0.79, 0), (1.78, 0.90, 0.10), cream, 0.11)
    rounded_box("Lower coral panel", (0, -0.79, 0.064), (1.54, 0.67, 0.035), coral, 0.09)
    for x in (-0.94, 0.94):
        rounded_box("Rounded teal edge", (x, 0, 0.045), (0.11, 2.96, 0.14), teal, 0.055)
        rounded_box("Ivory highlight", (x * 0.93, 0, 0.114), (0.025, 2.78, 0.025), cream, 0.012)
        rounded_box("Coral accent channel", (x * 0.87, 0, 0.08), (0.018, 2.74, 0.028), rose, 0.008)
    for y, width, height in [(-1.45, 1.96, 0.12), (-0.28, 1.92, 0.08), (0.10, 1.92, 0.07), (1.58, 1.96, 0.13)]:
        rounded_box("Rounded coral rail", (0, y, 0.045), (width, height, 0.14), rose if height < 0.1 else cream, 0.035)
    # A simple sculpted flower and leaves replace the dark, busy brass fan motif.
    for i in range(8):
        angle = math.tau * i / 8
        sphere("Flower petal", (math.cos(angle) * 0.20, 0.79 + math.sin(angle) * 0.20, 0.15), (0.20, 0.20, 0.10), coral if i % 2 else cream)
    sphere("Flower honey center", (0, 0.79, 0.205), (0.13, 0.13, 0.08), gold)
    for side in (-1, 1):
        tube("Friendly leaf stem", [(0, 0.32, 0.13), (side * 0.15, 0.45, 0.15), (side * 0.28, 0.55, 0.14)], 0.018, green)
        sphere("Friendly leaf", (side * 0.27, 0.54, 0.16), (0.19, 0.10, 0.08), green)
    for x in (-0.82, 0.82):
        for y in (-1.29, 1.28):
            sphere("Honey corner button", (x, y, 0.14), (0.07, 0.07, 0.05), gold)
    return export("hotelWallPanel")


def create_floor_tile():
    grout = mat("Bellmare cool sea-glass grout", "648D98", 0.83)
    stones = [mat("Bellmare blue-gray paver", "83A9B1", 0.82), mat("Bellmare mist paver", "9ABAB8", 0.84)]
    rounded_box("Tile grout bed", (0, -0.053, 0), (0.5, 0.014, 0.5), grout, 0.008)
    colors = [stones[0], stones[1], stones[0], stones[1]]
    centers = [(-0.125, -0.125), (0.125, -0.125), (-0.125, 0.125), (0.125, 0.125)]
    sizes = [(0.234, 0.232), (0.231, 0.234), (0.233, 0.229), (0.23, 0.232)]
    for index, ((x, z), size) in enumerate(zip(centers, sizes)):
        organic_stone(
            "Rounded plaza cobble",
            (x, -0.0225, z),
            (size[0], 0.045, size[1]),
            colors[index],
            index + 11,
        )
    return export("hotelFloorTile")


def create_floor_patch():
    grout = mat("Bellmare cool sea-glass grout patch", "648D98", 0.83)
    stones = [
        mat("Bellmare blue-gray paver patch", "83A9B1", 0.82),
        mat("Bellmare mist paver patch", "9ABAB8", 0.84),
    ]
    rounded_box("One metre grout bed", (0, -0.053, 0), (1.0, 0.014, 1.0), grout, 0.008)
    palette_index = 0
    for row in range(4):
        for column in range(4):
            x = (column - 1.5) * 0.25
            z = (row - 1.5) * 0.25
            width = 0.224 + ((row * 3 + column) % 3) * 0.004
            depth = 0.224 + ((row + column * 2) % 3) * 0.004
            organic_stone(
                "Rounded plaza cobble",
                (x, -0.0225, z),
                (width, 0.045, depth),
                stones[(row + column) % len(stones)],
                palette_index + row * 7 + column * 3,
            )
            palette_index += 1
    return export("hotelFloorPatch")


def create_door():
    gold = mat("Bellmare door brass", PALETTE["gold"], 0.27, 0.66)
    highlight = mat("Bellmare door champagne", PALETTE["gold_light"], 0.23, 0.56)
    slab = mat("Bellmare coral door", PALETTE["coral"], 0.43)
    inset = mat("Bellmare sea-glass door inset", PALETTE["wood"], 0.5)
    shadow = mat("Bellmare door shadow", PALETTE["dark"], 0.58)
    for x in (-0.91, 0.91):
        rounded_box("Rounded jamb", (x, 0, 0), (0.16, 2.9, 0.29), gold, 0.055)
        rounded_box("Jamb dark reveal", (x, 0, 0.155), (0.08, 2.71, 0.065), shadow, 0.025)
        rounded_box("Jamb pinstripe", (x, 0, 0.20), (0.025, 2.63, 0.03), highlight, 0.012)
    rounded_box("Rounded lintel", (0, 1.39, 0), (1.98, 0.18, 0.30), gold, 0.07)
    rounded_box("Door outer dark reveal", (0, -0.02, 0.105), (1.72, 2.66, 0.10), shadow, 0.075)
    rounded_box("Door slab", (0, -0.02, 0.17), (1.63, 2.58, 0.10), slab, 0.075)
    for x in (-0.61, 0.61):
        rounded_box("Leaf stiles", (x, -0.02, 0.245), (0.07, 2.35, 0.04), gold, 0.025)
    for y in (-1.13, -0.20, 1.13):
        rounded_box("Door rail", (0, y, 0.245), (1.28, 0.075, 0.04), gold, 0.025)
    for y, height, width in [(-0.66, 0.68, 1.02), (0.68, 0.77, 1.02)]:
        rounded_box("Recessed panel border", (0, y, 0.25), (width, height, 0.055), highlight, 0.075)
        rounded_box("Inset panel", (0, y, 0.282), (width - 0.11, height - 0.13, 0.036), inset, 0.055)
        rounded_box("Raised panel core", (0, y, 0.305), (width - 0.24, height - 0.27, 0.028), slab, 0.045)
    tube("Door fan crest", [(-0.27, 1.12, 0.30), (-0.18, 1.23, 0.34), (0, 1.32, 0.35)], 0.016, highlight)
    tube("Door fan crest right", [(0.27, 1.12, 0.30), (0.18, 1.23, 0.34), (0, 1.32, 0.35)], 0.016, highlight)
    rounded_box("Handle backplate", (0.59, -0.07, 0.325), (0.13, 0.28, 0.065), gold, 0.045)
    tube("Handle lever", [(0.59, -0.07, 0.37), (0.77, -0.07, 0.38), (0.80, -0.04, 0.37)], 0.022, highlight)
    sphere("Handle end", (0.80, -0.04, 0.37), (0.06, 0.06, 0.06), gold)
    for y in (-0.93, 0.84):
        rounded_box("Hinge", (-0.76, y, 0.30), (0.045, 0.16, 0.045), highlight, 0.02)
    return export("hotelDoor")


def create_sconce():
    gold = mat("Bellmare sconce brass", PALETTE["gold"], 0.26, 0.72)
    highlight = mat("Bellmare sconce trim", PALETTE["gold_light"], 0.23, 0.54)
    glow = mat("Bellmare amber glass", PALETTE["glass"], 0.22, 0.05, 1.3)
    plate = mat("Bellmare sconce enamel", PALETTE["wood"], 0.43)
    rounded_box("Enamel wall plate", (0, 0, 0), (0.36, 0.59, 0.10), plate, 0.12)
    rounded_box("Plate brass edge", (0, 0, 0.043), (0.29, 0.52, 0.03), gold, 0.10)
    rounded_box("Plate inset", (0, 0, 0.064), (0.22, 0.43, 0.03), plate, 0.08)
    for y in (-0.16, 0, 0.16):
        sphere("Plate stud", (0, y, 0.085), (0.036, 0.036, 0.025), highlight)
    tube("Sconce arm", [(0, -0.02, 0.09), (0, -0.02, 0.22), (0, -0.10, 0.30)], 0.024, gold)
    lathed_y("Bell shade", (0, -0.08, 0.34), [(-0.16, 0.15), (-0.12, 0.155), (0.06, 0.075), (0.12, 0.052)], gold)
    lathed_y("Shade rim", (0, -0.08, 0.34), [(-0.175, 0.15), (-0.145, 0.16)], highlight)
    sphere("Warm bulb", (0, -0.13, 0.34), (0.12, 0.16, 0.12), glow)
    sphere("Shade finial", (0, 0.055, 0.34), (0.08, 0.08, 0.08), highlight)
    tube("Left leaf", [(-0.23, -0.08, 0.07), (-0.18, 0.01, 0.11), (-0.06, 0.03, 0.13)], 0.012, highlight)
    tube("Right leaf", [(0.23, -0.08, 0.07), (0.18, 0.01, 0.11), (0.06, 0.03, 0.13)], 0.012, highlight)
    return export("hotelSconce")


def create_wardrobe():
    obj_path = kenney_obj("bookcaseClosedDoors")
    bpy.ops.wm.obj_import(filepath=str(obj_path), forward_axis="NEGATIVE_Z", up_axis="Y")
    bookcase = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
    bookcase.name = "Kenney closed door bookcase — CC0 remodeled"
    bpy.context.view_layer.update()
    world_vertices = [bookcase.matrix_world @ vertex.co for vertex in bookcase.data.vertices]
    lower = [min(point[i] for point in world_vertices) for i in range(3)]
    upper = [max(point[i] for point in world_vertices) for i in range(3)]
    source_size = [upper[i] - lower[i] for i in range(3)]
    target_size = (0.48, 1.0, 2.0)
    for vertex, point in zip(bookcase.data.vertices, world_vertices):
        vertex.co = tuple((point[i] - lower[i]) * target_size[i] / source_size[i] for i in range(3))
    bookcase.location = (0, 0, 0)
    bookcase.rotation_euler = (0, 0, 0)
    bookcase.scale = (1, 1, 1)
    print("KENNEY CABINET", [round(value, 3) for value in source_size], target_size)
    for material in bookcase.data.materials:
        source_name = material.name.lower()
        material.name = "Kenney CC0 wood recolored Bellmare"
        material.use_nodes = True
        shader = material.node_tree.nodes.get("Principled BSDF")
        color = PALETTE["wood"] if "wood" in source_name else PALETTE["gold_light"]
        values = tuple(srgb(int(color[i : i + 2], 16)) for i in (0, 2, 4)) + (1,)
        shader.inputs["Base Color"].default_value = values
        shader.inputs["Roughness"].default_value = 0.43
        shader.inputs["Metallic"].default_value = 0.22 if "metal" in material.name.lower() else 0.02
    bevel = bookcase.modifiers.new("Soft cabinet edges", "BEVEL")
    bevel.width = 0.025
    bevel.segments = 3
    normal = bookcase.modifiers.new("Cabinet weighted normals", "WEIGHTED_NORMAL")
    bpy.context.view_layer.objects.active = bookcase
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    bpy.ops.object.modifier_apply(modifier=normal.name)
    gold = mat("Bellmare armoire brass details", PALETTE["gold"], 0.28, 0.66)
    cream = mat("Bellmare armoire enamel", PALETTE["gold_light"], 0.24, 0.4)
    for z in (-0.41, 0.41):
        rounded_box("Armoire front edge", (0, 1.02, z), (0.53, 1.88, 0.035), gold, 0.035)
        rounded_box("Armoire inset border", (0, 1.0, z * 1.045), (0.39, 1.65, 0.035), cream, 0.035)
        rounded_box("Armoire coral enamel", (0, 1.0, z * 1.09), (0.31, 1.55, 0.028), mat("Bellmare armoire coral", PALETTE["coral"], 0.63), 0.03)
        sphere("Door knob", (0.12, 1.0, z * 1.14), (0.06, 0.08, 0.06), gold)
    rounded_box("Armoire crown", (0, 2.0, 0), (0.58, 0.14, 1.06), gold, 0.05)
    rounded_box("Armoire crown highlight", (0, 2.075, 0), (0.48, 0.045, 0.98), cream, 0.018)
    return export("hotelWardrobe")


def create_beacon():
    gold = mat("Bellmare objective brass", PALETTE["gold"], 0.22, 0.74)
    cream = mat("Bellmare objective glow", PALETTE["cream"], 0.2, 0.08, 1.1)
    plum = mat("Bellmare objective enamel", PALETTE["wood"], 0.4, 0.02)
    bpy.ops.mesh.primitive_torus_add(major_segments=24, minor_segments=8, major_radius=0.18, minor_radius=0.025, location=blender_point((0, 0.06, 0)))
    bpy.context.object.name = "Floating brass halo"
    bpy.context.object.data.materials.append(gold)
    lathed_y("Beacon crown", (0, 0, 0), [(0.0, 0.09), (0.05, 0.13), (0.13, 0.06), (0.23, 0.03)], gold)
    sphere("Beacon opal", (0, 0.29, 0), (0.12, 0.14, 0.12), cream)
    for angle in range(0, 360, 90):
        radians = math.radians(angle)
        sphere("Beacon gem", (math.cos(radians) * 0.16, 0.07, math.sin(radians) * 0.16), (0.045, 0.05, 0.045), plum)
    return export("hotelBeacon")


def create_telephone():
    wine = mat("Bellmare telephone enamel", PALETTE["coral"], 0.38, 0.02)
    dark = mat("Bellmare telephone underside", PALETTE["dark"], 0.49, 0.05)
    gold = mat("Bellmare telephone brass", PALETTE["gold"], 0.23, 0.72)
    cream = mat("Bellmare telephone ivory", PALETTE["cream"], 0.26, 0.12)
    rounded_box("Rotary telephone base", (0, 0.06, 0), (0.31, 0.09, 0.24), dark, 0.045)
    rounded_box("Lacquered telephone body", (0, 0.105, 0), (0.29, 0.085, 0.225), wine, 0.045)
    rounded_box("Ivory dial face", (0, 0.155, 0.012), (0.20, 0.018, 0.18), cream, 0.075)
    bpy.ops.mesh.primitive_torus_add(
        major_segments=24,
        minor_segments=8,
        major_radius=0.065,
        minor_radius=0.009,
        location=blender_point((0, 0.174, 0.012)),
    )
    bpy.context.object.name = "Rotary brass ring"
    bpy.context.object.data.materials.append(gold)
    sphere("Dial center", (0, 0.173, 0.012), (0.055, 0.018, 0.055), wine)
    for index in range(10):
        angle = math.tau * index / 10
        sphere(
            "Rotary ivory finger button",
            (math.cos(angle) * 0.047, 0.18, 0.012 + math.sin(angle) * 0.047),
            (0.015, 0.012, 0.015),
            gold,
        )
    for x in (-0.1, 0.1):
        rounded_box("Receiver cradle", (x, 0.205, -0.085), (0.035, 0.05, 0.045), gold, 0.016)
    rounded_box("Receiver grip", (0, 0.24, -0.083), (0.25, 0.055, 0.065), wine, 0.027)
    for x in (-0.115, 0.115):
        sphere("Receiver bell", (x, 0.24, -0.083), (0.075, 0.08, 0.09), gold)
        sphere("Receiver cap", (x, 0.24, -0.083), (0.048, 0.051, 0.058), dark)
    tube(
        "Coiled brass cord",
        [(-0.105, 0.20, -0.105), (-0.145, 0.18, -0.15), (-0.14, 0.13, -0.16), (-0.105, 0.105, -0.12)],
        0.009,
        gold,
    )
    return export("hotelTelephone")


def create_parcel_stack():
    obj_path = kenney_obj("cardboardBoxClosed")
    bpy.ops.wm.obj_import(filepath=str(obj_path), forward_axis="NEGATIVE_Z", up_axis="Y")
    box = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
    box.name = "Kenney cardboard package — CC0"
    bpy.context.view_layer.update()
    world_vertices = [box.matrix_world @ vertex.co for vertex in box.data.vertices]
    lower = [min(point[i] for point in world_vertices) for i in range(3)]
    upper = [max(point[i] for point in world_vertices) for i in range(3)]
    source_size = [upper[i] - lower[i] for i in range(3)]
    target_size = (0.47, 0.44, 0.31)
    for vertex, point in zip(box.data.vertices, world_vertices):
        vertex.co = tuple((point[i] - lower[i]) * target_size[i] / source_size[i] for i in range(3))
    box.location = (0, 0, 0)
    box.rotation_euler = (0, 0, 0)
    box.scale = (1, 1, 1)
    for material in box.data.materials:
        source_name = material.name.lower()
        material.name = "Kenney CC0 paper carton"
        material.use_nodes = True
        shader = material.node_tree.nodes.get("Principled BSDF")
        color = "B86B4B" if "dark" in source_name else "E4AD67"
        shader.inputs["Base Color"].default_value = tuple(srgb(int(color[i : i + 2], 16)) for i in (0, 2, 4)) + (1,)
        shader.inputs["Roughness"].default_value = 0.76
    bevel = box.modifiers.new("Soft parcel edges", "BEVEL")
    bevel.width = 0.008
    bevel.segments = 2
    normal = box.modifiers.new("Parcel weighted normals", "WEIGHTED_NORMAL")
    bpy.context.view_layer.objects.active = box
    for modifier in list(box.modifiers):
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    upper_box = box.copy()
    upper_box.data = box.data.copy()
    bpy.context.collection.objects.link(upper_box)
    upper_box.scale = (0.80, 0.82, 0.84)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    upper_box.location = (0.025, 0.02, 0.31)
    tape = mat("Bellmare parcel teal cloth tape", PALETTE["wood"], 0.74)
    label = mat("Bellmare parcel address paper", "FFFFFF", 0.88)
    for center_x, face_y, center_z, half_x, half_z, box_height, bottom in [
        (0, 0.155, 0, 0.235, 0.22, 0.31, 0),
        (0.025, 0.44, 0.02, 0.188, 0.18, 0.26, 0.31),
    ]:
        top_y = bottom + box_height + 0.008
        rounded_box("Parcel tape lengthwise", (center_x, top_y, center_z), (0.035, 0.012, half_z * 2), tape, 0.006)
        rounded_box("Parcel tape crosswise", (center_x, top_y, center_z), (half_x * 2, 0.012, 0.028), tape, 0.006)
        rounded_box(
            "Parcel address label",
            (center_x, face_y, center_z + half_z + 0.004),
            (half_x * 0.55, box_height * 0.30, 0.012),
            label,
            0.007,
        )
    return export("hotelParcelStack")


if not KENNEY.exists():
    raise FileNotFoundError(KENNEY)
clear_scene()
products = [
    create_wall_panel(),
    create_floor_tile(),
    create_floor_patch(),
    create_door(),
    create_sconce(),
    create_wardrobe(),
    create_beacon(),
    create_telephone(),
    create_parcel_stack(),
]
print("Built Bellmare hotel modules:", ", ".join(f"{path.name} ({path.stat().st_size} bytes)" for path in products))
