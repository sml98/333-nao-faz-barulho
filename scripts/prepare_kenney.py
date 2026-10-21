import bpy,os
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
os.makedirs('public/assets/environment',exist_ok=True)
for name in ['chairRounded','sideTableDrawers','lampRoundTable','plantSmall1']:
 bpy.ops.import_scene.gltf(filepath=os.path.abspath('art_sources/kenney/'+name+'.glb'))
 bpy.ops.export_scene.gltf(filepath=os.path.abspath('public/assets/environment/'+name+'.glb'),export_format='GLB')
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
