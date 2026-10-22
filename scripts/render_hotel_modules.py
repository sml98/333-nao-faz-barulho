"""Render exported Bellmare environment GLBs for geometry QA."""
import bpy
import math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
out=root/'evidence'/'blender'/'hotel-modules.png'
out.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
for index,name in enumerate(['hotelWallPanel','hotelDoor','hotelSconce','hotelWardrobe','hotelBeacon']):
 before=set(bpy.data.objects)
 bpy.ops.import_scene.gltf(filepath=str(root/'public'/'assets'/'environment'/f'{name}.glb'))
 created=set(bpy.data.objects)-before
 x=index*2.7
 for obj in created:
  obj.location.x += x
  if name=='hotelWallPanel': obj.location.z += 1.55
  elif name=='hotelDoor': obj.location.z += 1.47
  elif name=='hotelSconce': obj.location.z += .3
  elif name=='hotelBeacon': obj.location.z += .05
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=False
scene.render.resolution_x=1500;scene.render.resolution_y=500;scene.render.resolution_percentage=100;scene.render.threads_mode='FIXED';scene.render.threads=2;scene.view_settings.view_transform='AgX'
world=bpy.data.worlds.new('hotel model QA');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.055,.028,.1,1);world.node_tree.nodes['Background'].inputs[1].default_value=.7;scene.world=world
for name,pos,power,size,color in [('Key',(-1,-5,8),1200,5,(1,.8,.6)),('Fill',(7,-4,4),700,4,(.65,.6,1)),('Rim',(7,3,7),1200,3,(1,.25,.48))]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color;obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);obj.location=pos;obj.rotation_euler=(Vector((5,0,1.2))-obj.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('QA Camera');camera=bpy.data.objects.new('QA Camera',data);bpy.context.collection.objects.link(camera);scene.camera=camera;data.type='ORTHO';camera.location=(5,-10,4);camera.rotation_euler=(Vector((5.3,0,1.5))-camera.location).to_track_quat('-Z','Y').to_euler();data.ortho_scale=14
scene.render.filepath=str(out)
bpy.ops.render.render(write_still=True)
print(out)
