import bpy,bmesh,json,os
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.gltf(filepath=os.path.abspath('art_sources/kaykit/Rogue.glb'))
o=bpy.data.objects['Rogue_Body'];bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.0001)
left=set(bm.verts);data=[]
while left:
 seed=left.pop();island={seed};stack=[seed]
 while stack:
  for e in stack.pop().link_edges:
   v=e.other_vert(seed)if seed in e.verts else None
  # Normal neighbor walk.
  vtx=next(iter(island))if False else None
  break
 stack=[seed]
 while stack:
  vtx=stack.pop()
  for e in vtx.link_edges:
   v=e.other_vert(vtx)
   if v in left:left.remove(v);island.add(v);stack.append(v)
 coords=[v.co for v in island];lo=[min(v[i]for v in coords)for i in range(3)];hi=[max(v[i]for v in coords)for i in range(3)];data.append({'verts':len(island),'min':lo,'max':hi})
print('COMPONENTS',json.dumps(sorted(data,key=lambda d:-d['verts']),indent=2));bm.free()
