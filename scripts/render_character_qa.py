"""Render the exported GLBs in Blender. These are asset QA, not gameplay screenshots."""
import bpy,os,math,sys
from mathutils import Vector
os.makedirs('evidence/blender',exist_ok=True)
def clear():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for a in list(bpy.data.actions):bpy.data.actions.remove(a)
def load(name):
 bpy.ops.import_scene.gltf(filepath=os.path.abspath('public/assets/characters/'+name+'.glb'))
 for arm in [o for o in bpy.data.objects if o.type=='ARMATURE']:
  if arm.animation_data:
   for t in arm.animation_data.nla_tracks:t.mute=True
   idle=next((a for a in bpy.data.actions if a.name=='Idle' or a.name.startswith('Idle_')),None)
   arm.animation_data.action=idle
 bpy.context.scene.frame_set(0)
def stage():
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=False;scene.render.resolution_x=600;scene.render.resolution_y=700;scene.render.resolution_percentage=100;scene.render.threads_mode='FIXED';scene.render.threads=2;scene.view_settings.view_transform='AgX'
 world=bpy.data.worlds.new('Purple QA studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.06,.19,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5;scene.world=world
 for name,pos,power,size,color in [('Key',(-3,-4,5),500,4,(1,.82,.70)),('Fill',(3,-3,3),350,3,(.7,.75,1)),('Rim',(2,3,4),600,3,(1,.3,.6))]:
  d=bpy.data.lights.new(name,'AREA');d.energy=power;d.size=size;d.color=color;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,1.1))-o.location).to_track_quat('-Z','Y').to_euler()
 d=bpy.data.cameras.new('QA Camera');c=bpy.data.objects.new('QA Camera',d);bpy.context.collection.objects.link(c);d.type='ORTHO';scene.camera=c;return c
if '--poses'not in sys.argv:
 for name,height in [('nico',2),('porteiro',2.8)]:
  clear();load(name);c=stage()
  for view,pos,target,scale in [('front',(0,-5,height*.53),(0,0,height*.51),height*1.16),('profile',(5,0,height*.53),(0,0,height*.51),height*1.16),('back',(0,5,height*.53),(0,0,height*.51),height*1.16),('face',(0,-5,height*.84),(0,0,height*.80),height*.58)]:
   c.location=pos;c.rotation_euler=(Vector(target)-c.location).to_track_quat('-Z','Y').to_euler();c.data.ortho_scale=scale;bpy.context.scene.render.filepath=os.path.abspath('evidence/blender/'+name+'-'+view+'.png');bpy.ops.render.render(write_still=True)
 clear()
 for i,name in enumerate(['caixa_nervosa','pacote_arrogante','caixa_paranoica']):
  before=set(bpy.data.objects);load(name)
  for o in set(bpy.data.objects)-before:
   if o.parent is None:o.location.x+=(i-1)*.85
 c=stage();c.location=(1,-5,1.1);c.rotation_euler=(Vector((0,0,0))-c.location).to_track_quat('-Z','Y').to_euler();c.data.ortho_scale=2.9;bpy.context.scene.render.resolution_x=1000;bpy.context.scene.render.resolution_y=500;bpy.context.scene.render.filepath=os.path.abspath('evidence/blender/three-parcels.png');bpy.ops.render.render(write_still=True)

for name,pose,height,frame in [('nico','Run',2,7),('nico','CarryRun',2,12),('porteiro','Chase',2.8,9)]:
 clear();load(name)
 arm=next(o for o in bpy.data.objects if o.type=='ARMATURE');arm.animation_data.action=next(a for a in bpy.data.actions if a.name==pose or a.name.startswith(pose+'_'));bpy.context.scene.frame_set(frame);bpy.context.view_layer.update()
 c=stage();c.location=(.6,-5,height*.55);c.rotation_euler=(Vector((0,0,height*.50))-c.location).to_track_quat('-Z','Y').to_euler();c.data.ortho_scale=height*1.18;bpy.context.scene.render.filepath=os.path.abspath('evidence/blender/'+name+'-'+pose.lower()+'.png');bpy.ops.render.render(write_still=True)
