import bpy,json,os
from mathutils import Vector
out=[]
for file in ['art_sources/kaykit/Rogue.glb','art_sources/kaykit/Mage.glb','art_sources/quaternius/Superhero_Male_FullBody.gltf']:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.gltf(filepath=os.path.abspath(file));arms=[o for o in bpy.data.objects if o.type=='ARMATURE'];meshes=[o for o in bpy.data.objects if o.type=='MESH'];out.append({'file':file,'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons)for o in meshes),'bones':len(arms[0].data.bones)if arms else 0,'meshes':[(o.name,len(o.data.vertices))for o in meshes],'actions':len(bpy.data.actions),'shape_keys':[(o.name,[k.name for k in o.data.shape_keys.key_blocks])for o in meshes if o.data.shape_keys]})
open('art_sources/base-comparison.json','w').write(json.dumps(out,indent=2))
