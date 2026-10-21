import bpy,os,json
from mathutils import Vector,Matrix
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
OUT=os.environ.get('BELLMAR_ENV_OUT','public/assets/environment');os.makedirs(OUT,exist_ok=True);report=[]
def material(name,hex):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');rgb=[int(hex[i:i+2],16)/255 for i in (0,2,4)];p.inputs['Base Color'].default_value=(*[((x+.055)/1.055)**2.4 for x in rgb],1);p.inputs['Roughness'].default_value=.7;return m
for name,target in [('chairRounded',.95),('sideTableDrawers',.74),('lampRoundTable',.30),('plantSmall1',1.15)]:
 bpy.ops.import_scene.gltf(filepath=os.path.abspath('art_sources/kenney/'+name+'.glb'));bpy.context.view_layer.update();meshes=[o for o in bpy.data.objects if o.type=='MESH'];coords=[o.matrix_world@v.co for o in meshes for v in o.data.vertices];lo=min(v.z for v in coords);hi=max(v.z for v in coords);scale=target/(hi-lo);cx=(min(v.x for v in coords)+max(v.x for v in coords))/2;cy=(min(v.y for v in coords)+max(v.y for v in coords))/2;matrices={o:o.matrix_world.copy()for o in meshes}
 for o in meshes:
  o.data=o.data.copy();matrix=matrices[o];o.parent=None;o.matrix_world=Matrix.Identity(4)
  for v in o.data.vertices:v.co=(matrix@v.co-Vector((cx,cy,lo)))*scale
  for v in o.data.vertices:
   if name=='sideTableDrawers':v.co.x*=.66
   elif name=='plantSmall1':v.co.x*=.85;v.co.y*=.85
  o.data.materials.clear()
  colors=['64294f','d9a348','a94464']if name=='chairRounded'else['49213a','dda947','773257']if name=='sideTableDrawers'else['dba84d','ffe3a3','d69341']if name=='lampRoundTable'else['b68c43','4e9b75','6ebc87']
  for j,c in enumerate(colors):o.data.materials.append(material(name+str(j),c))
  for p in o.data.polygons:
   height=sum(o.data.vertices[i].co.z for i in p.vertices)/len(p.vertices)
   if name=='plantSmall1':p.material_index=1 if height>.38 else 0
   elif name=='lampRoundTable':p.material_index=1 if height>.15 else 0
   else:p.material_index=1 if (height<.065 or abs(height-target)<.035)else 0
 bpy.context.view_layer.update()
 report.append({'name':name,'targetHeight':target,'sourceHeight':hi-lo,'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons)for o in meshes)})
 bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT+'/'+name+'.glb'),export_format='GLB')
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
open('docs/kenney-build-report.json','w').write(json.dumps(report,indent=2))
