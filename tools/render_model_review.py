"""Render actual authored GLBs for visual review, separate from gameplay evidence."""
import bpy,os,math
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def model(name,pos):
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=os.path.abspath('public/assets/models/'+name+'.glb'));added=set(bpy.data.objects)-before;roots=[o for o in added if o.parent not in added]
 root=bpy.data.objects.new('Review '+name,None);bpy.context.collection.objects.link(root)
 for o in roots:o.parent=root
 root.location=pos
 return root
nico=model('nico',(-.75,0,0));monster=model('porteiro',(.65,.2,0));box=model('box',(-.75,-.44,1.0))
def mat(name,c):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.9;return m
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.data.materials.append(mat('teal stage',(.025,.06,.075)))
def area(name,pos,power,size,c):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=c;o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
area('soft golden key',(-3,-4,6),500,4,(1,.83,.65));area('soft cool fill',(4,-2,4),360,4,(.65,.8,1));area('rim',(0,4,4),600,3,(1,.65,.37))
world=bpy.data.worlds.new('world');bpy.context.scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.05,.09,.12,1);world.node_tree.nodes['Background'].inputs[1].default_value=.4
camdata=bpy.data.cameras.new('review camera');cam=bpy.data.objects.new('review camera',camdata);bpy.context.collection.objects.link(cam);cam.location=(3,-7,3.0);cam.rotation_euler=(Vector((0,0,1.34))-cam.location).to_track_quat('-Z','Y').to_euler();camdata.type='ORTHO';camdata.ortho_scale=3.5;bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=False;scene.render.resolution_x=1100;scene.render.resolution_y=860;scene.render.resolution_percentage=100;scene.render.threads_mode='FIXED';scene.render.threads=2;scene.view_settings.view_transform='Standard';scene.render.filepath=os.path.abspath('evidence/cartoon-models-blender.png');bpy.ops.render.render(write_still=True)
