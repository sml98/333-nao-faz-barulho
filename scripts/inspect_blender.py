import bpy,json
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath='art_sources/kaykit/Rogue.glb')
print('OBJECTS',[(o.name,o.type,len(o.data.vertices) if o.type=='MESH' else 0,[(g.name)for g in o.vertex_groups][:4] if o.type=='MESH' else '') for o in bpy.data.objects])
a=next(o for o in bpy.data.objects if o.type=='ARMATURE');print('BONES',[(b.name,tuple(round(v,3)for v in b.head_local),tuple(round(v,3)for v in b.tail_local))for b in a.data.bones]);print('ACTIONS',[(x.name,tuple(x.frame_range))for x in bpy.data.actions])
bpy.context.scene.frame_set(0);print('ARM',a.matrix_world[:]);
