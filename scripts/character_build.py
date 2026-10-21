"""Bellmare meme/viral: modify CC0 KayKit authored meshes/rig, bake compatible clips.
Run in project root: blender -b --python scripts/character_build.py -- nico|all
Sources/credits and download hashes are in docs/ASSET_MANIFEST.md.
"""
import bpy,bmesh,math,os,sys,json
from mathutils import Vector,Matrix,Quaternion
OUT=os.environ.get('BELLMAR_CHAR_OUT','public/assets/characters');os.makedirs(OUT,exist_ok=True)
REPORT=[]
COL={'red':'b52850','wine':'6d2044','pink':'f56b9b','navy':'202a50','gold':'e6ad45','white':'fff0dd','skin':'f3b789','cheek':'e88d89','hair':'3d2029','black':'171024','eye':'ffffff','iris':'54283a','brown':'c99a66'}
def rgba(h):
 h=COL.get(h,h);return tuple(((int(h[i:i+2],16)/255+.055)/1.055)**2.4 for i in (0,2,4))+(1,)
M={}
def mat(c,glow=0):
 if (c,glow)not in M:
  m=bpy.data.materials.new(c);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=rgba(c);p.inputs['Roughness'].default_value=.72;p.inputs['Metallic'].default_value=0
  if glow:p.inputs['Emission Color'].default_value=rgba(c);p.inputs['Emission Strength'].default_value=glow
  M[c,glow]=m
 return M[c,glow]
def xyz(p):return (p[0],-p[2],p[1])
def finish(o,name,p,s,c):
 o.name=name;o.location=xyz(p);o.scale=(s[0],s[2],s[1]);o.data.materials.append(mat(c))
 for f in o.data.polygons:f.use_smooth=True
 return o
def sphere(name,p,s,c,seg=16,rings=10):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings);return finish(bpy.context.object,name,p,tuple(v/2 for v in s),c)
def rounded(name,p,s,c,r=.025):
 bpy.ops.mesh.primitive_cube_add(size=1);o=finish(bpy.context.object,name,p,s,c);bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=o.modifiers.new('tailored rounded edge','BEVEL');mod.width=r;mod.segments=3;bpy.ops.object.modifier_apply(modifier=mod.name)
 return o
def surface(name,verts,faces,c,sub=0):
 me=bpy.data.meshes.new(name);me.from_pydata([xyz(v) for v in verts],[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);me.materials.append(mat(c))
 for p in me.polygons:p.use_smooth=True
 if sub:
  m=o.modifiers.new('sculpt surface','SUBSURF');m.levels=sub
  bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.modifier_apply(modifier=m.name);o.select_set(False)
 return o
def sweep(name,points,radii,c,sides=8):
 verts=[]
 for i,p in enumerate(points):
  tangent=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)]);tangent.normalize();a=tangent.cross(Vector((0,0,1)))
  if a.length<.1:a=tangent.cross(Vector((0,1,0)))
  a.normalize();b=tangent.cross(a).normalized()
  for j in range(sides):v=Vector(p)+(a*math.cos(j*2*math.pi/sides)+b*math.sin(j*2*math.pi/sides))*radii[i];verts.append(v)
 faces=[]
 for i in range(len(points)-1):
  for j in range(sides):k=i*sides+j;n=i*sides+(j+1)%sides;faces.append((k,n,n+sides,k+sides))
 faces.extend([tuple(range(sides-1,-1,-1)),tuple((len(points)-1)*sides+j for j in range(sides))]);return surface(name,verts,faces,c,1)
def bone_parent(o,arm,bone):
 bpy.context.view_layer.update();world=o.matrix_world.copy();o.parent=arm;o.parent_type='BONE';o.parent_bone=bone;o.matrix_world=world;return o
def empty(name):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);return o
def sculpt_head(arm,monster=False):
 # Quad surface with jaw, cheeks, brow and cranium; actual modeled head, not a photo face.
 rings=[(1.18,.09,.10),(1.22,.19,.15),(1.30,.28,.20),(1.42,.335,.245),(1.55,.32,.24),(1.67,.25,.20),(1.73,.12,.12),(1.75,.025,.025)]
 verts=[];n=32
 for y,rx,rz in rings:
  for i in range(n):
   a=i*2*math.pi/n;front=max(0,math.cos(a));x=math.sin(a)*rx;z=math.cos(a)*rz+.015
   # Broad cheeks and rounded jaw silhouette.
   if y<1.43:z+=front*.025
   verts.append((x,y,z))
 faces=[]
 for k in range(len(rings)-1):
  for i in range(n):a=k*n+i;b=k*n+(i+1)%n;faces.append((a,b,b+n,a+n))
 faces.extend([tuple(range(n-1,-1,-1)),tuple((len(rings)-1)*n+i for i in range(n))])
 face=surface('FaceSculpt',verts,faces,'skin',1);bone_parent(face,arm,'head')
 for side in [-1,1]:
  x=side*.15
  for name,p,s,c in [('EyeWhite',(x,1.49,.237),(.245,.315,.115),'eye'),('EyeIris',(x+side*.008,1.49,.293),(.095,.145,.025),'iris'),('Pupil',(x+side*.008,1.49,.308),(.058,.105,.016),'black'),('EyeShine',(x-.026,1.537,.322),(.027,.037,.009),'eye')]:
   o=sphere(name+('.L'if side<0 else '.R'),p,s,c);bone_parent(o,arm,'head')
   if name=='EyeIris' or name=='Pupil':
    o.shape_key_add(name='Basis');k=o.shape_key_add(name='Look')
    for v in k.data:v.co.x+=.035
   if name!='EyeShine':

    if not o.data.shape_keys:o.shape_key_add(name='Basis')
    key=o.shape_key_add(name='Blink')
    for v in key.data:v.co.z*=.065
  eyebrow=sweep('Brow'+('.L'if side<0 else '.R'),[(x-side*.10,1.65,.263),(x,1.69,.275),(x+side*.10,1.65,.26)],[.013,.025,.016],'hair');bone_parent(eyebrow,arm,'head');eyebrow.shape_key_add(name='Basis');k=eyebrow.shape_key_add(name='Panic')
  for v in k.data:v.co.z+=.025;v.co.y-=.008
  for name,p,s,c in [('Ear',(side*.335,1.43,.005),(.115,.175,.075),'skin'),('EarInner',(side*.35,1.43,.039),(.055,.095,.015),'cheek'),('Blush',(side*.23,1.36,.21),(.07,.035,.008),'cheek')]:bone_parent(sphere(name,p,s,c),arm,'head')
 bone_parent(sphere('Nose',(0,1.405,.296),(.092,.09,.083),'skin'),arm,'head')
 mouth=sphere('Mouth',(0,1.292,.217),(.185,.115,.039),'black',24,14);mouth.shape_key_add(name='Basis');key=mouth.shape_key_add(name='Panic')
 for v in key.data:v.co.z*=2.15;v.co.x*=1.23
 bone_parent(mouth,arm,'head');bone_parent(rounded('UpperTeeth',(0,1.322,.239),(.13,.035,.012),'white',.009),arm,'head');bone_parent(sphere('Tongue',(0,1.264,.24),(.095,.04,.013),'pink'),arm,'head')
 # Sculpted tapered swept locks with varied silhouettes, all attached to head bone.
 for i in range(9):
  x=(i-4)*.068;tip=(x-.07,1.61-abs(i-4)*.012,.20+(.04 if abs(i-4)<3 else -.05))
  h=sweep('HairLock'+str(i),[(x*.75,1.73,-.015),(x,1.735,.11),(x-.035,1.70,.225),tip],[.065,.075,.06,.006],'hair',10);bone_parent(h,arm,'head')
 for side in [-1,1]:bone_parent(sweep('SideHair',[(side*.26,1.66,.04),(side*.33,1.59,.025),(side*.32,1.48,.04),(side*.29,1.45,.06)],[.06,.07,.045,.007],'hair'),arm,'head')
 # Delivery cap: sculpted crown panels, curved visor, red-white identity of reference 3.
 bone_parent(sphere('CapCrown',(0,1.75,-.015),(.63,.255,.48),'white',24,14),arm,'head')
 verts=[]
 for row in range(4):
  for i in range(25):
   a=-math.pi/2+i*math.pi/24;verts.append((math.sin(a)*(.32+row*.01),1.738-.035*math.cos(a)-row*.017,.08+math.cos(a)*(.16+row*.055)))
 faces=[(r*25+i,r*25+i+1,(r+1)*25+i+1,(r+1)*25+i)for r in range(3)for i in range(24)]
 visor=surface('CapCurvedVisor',verts,faces,'red',1);sol=visor.modifiers.new('visor edge','SOLIDIFY');sol.thickness=.016;bone_parent(visor,arm,'head')
 bone_parent(rounded('CapBadge',(0,1.785,.219),(.085,.075,.018),'red',.018),arm,'head')
 return face

def carry_pose(arm):
 for suffix,side in [('.l',1),('.r',-1)]:
  upper=arm.pose.bones['upperarm'+suffix];lower=arm.pose.bones['lowerarm'+suffix];wrist=arm.pose.bones['wrist'+suffix]
  S=upper.matrix.translation.copy();H=Vector((side*.305,-.44,1.0));l1=arm.data.bones[upper.name].length;l2=arm.data.bones[lower.name].length;d=(H-S).length;d=min(d,l1+l2-.005);u=(H-S).normalized();along=(l1*l1-l2*l2+d*d)/(2*d);off=math.sqrt(max(.001,l1*l1-along*along));v=Vector((side*.3,0,-1));v=(v-u*v.dot(u)).normalized();E=S+u*along+v*off
  for bone,start,end in [(upper,S,E),(lower,E,H)]:bone.matrix=Matrix.Translation(start)@(end-start).to_track_quat('Y','Z').to_matrix().to_4x4();bpy.context.view_layer.update()
  wrist.matrix=Matrix.Translation(H)@Vector((0,-1,.05)).to_track_quat('Y','Z').to_matrix().to_4x4();bpy.context.view_layer.update()

def bake_actions(arm,source,recipes=None):
 recipes=recipes or {'Idle':('Idle',False),'Walk':('Walking_A',False),'Run':('Running_A',False),'Carry':('Idle',True),'CarryWalk':('Walking_A',True),'CarryRun':('Running_A',True),'Crouch':('Sit_Chair_Idle',True),'Hide':('Sit_Chair_Idle',True),'LookBack':('Idle',False),'Panic':('Hit_A',True),'Stumble':('Dodge_Forward',False),'Relief':('Cheer',False)}
 data={};bones=list(arm.pose.bones)
 for new,(old,carry)in recipes.items():
  act=source[old];arm.animation_data.action=act;end=max(1,round(act.frame_range[1]));frames=list(range(end+1));samples=[]
  for f in frames:
   bpy.context.scene.frame_set(f);bpy.context.view_layer.update()
   if carry:carry_pose(arm)
   if new in ['Listen','Search','Confused']:
    phase=f/max(1,end)*math.pi*2;head=arm.pose.bones['head'];head.rotation_quaternion=head.rotation_quaternion@Quaternion((0,1,0),math.sin(phase)*(.65 if new=='Search' else .35));head.rotation_quaternion=head.rotation_quaternion@Quaternion((1,0,0),math.sin(phase*2)*.10)
   if new=='LookBack':arm.pose.bones['head'].rotation_quaternion=arm.pose.bones['head'].rotation_quaternion@Quaternion((0,1,0),math.sin(f/max(1,end)*math.pi)*.9)
   values=[]
   for pb in bones:
    l,q,s=pb.matrix_basis.decompose()
    if pb.name=='root':l=Vector((0,0,0))
    values.append((tuple(l),tuple(q),tuple(s)))
   samples.append(values)
  data[new]=(frames,samples)
 arm.animation_data.action=None
 for t in list(arm.animation_data.nla_tracks):arm.animation_data.nla_tracks.remove(t)
 for act in list(bpy.data.actions):bpy.data.actions.remove(act)
 for name,(frames,samples)in data.items():
  act=bpy.data.actions.new(name);act.use_fake_user=True
  for j,pb in enumerate(bones):
   for component,(prop,count)in enumerate([('location',3),('rotation_quaternion',4),('scale',3)]):
    for k in range(count):
     vals=[samples[i][j][component][k]for i in range(len(frames))]
     # Constant channels still retain their rest values; export keeps compatible paths.
     fc=act.fcurves.new(data_path=pb.path_from_id(prop),index=k,action_group=pb.name);fc.keyframe_points.add(len(frames));fc.keyframe_points.foreach_set('co',[v for pair in zip(frames,vals)for v in pair]);
     for key in fc.keyframe_points:key.interpolation='LINEAR'
  for pb in bones:pb.rotation_mode='QUATERNION'
  track=arm.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,0,act);track.mute=True
 arm.animation_data.use_nla=False
 return data

def tailor_torso(arm,name,monster=False):
 # Remodel torso as a clean quad garment and transfer weights from the actual KayKit body.
 from mathutils.kdtree import KDTree
 old=bpy.data.objects[name];kd=KDTree(len(old.data.vertices))
 for v in old.data.vertices:kd.insert(v.co,v.index)
 kd.balance()
 rings=[(.42 if monster else .52,.30,.22),(.47 if monster else .55,.32,.235),(.62,.31,.23),(.83,.30,.23),(1.01,.32,.23),(1.10,.30,.19),(1.16,.16,.12),(1.20,.10,.10)]
 verts=[];n=24
 for y,rx,rz in rings:
  for j in range(n):a=j*math.pi*2/n;verts.append((math.sin(a)*rx,y,math.cos(a)*rz))
 faces=[]
 for r in range(len(rings)-1):
  for j in range(n):a=r*n+j;b=r*n+(j+1)%n;faces.append((a,b,b+n,a+n))
 faces.extend([tuple(range(n-1,-1,-1)),tuple((len(rings)-1)*n+j for j in range(n))])
 cloth=surface('TailoredUniform'if monster else 'DeliveryHoodie',verts,faces,'red',1)
 for vg in old.vertex_groups:cloth.vertex_groups.new(name=vg.name)
 for v in cloth.data.vertices:
  co,idx,dist=kd.find(v.co)
  for g in old.data.vertices[idx].groups:cloth.vertex_groups[g.group].add([v.index],g.weight,'REPLACE')
 cloth.parent=arm;mod=cloth.modifiers.new('Preserved KayKit skin weights','ARMATURE');mod.object=arm;bpy.data.objects.remove(old,do_unlink=True)
 if not monster:
  bone_parent(rounded('HoodieKangarooPocket',(0,.73,.237),(.32,.15,.022),'wine',.045),arm,'spine')
  bone_parent(rounded('HoodieHem',(0,.55,.0),(.58,.055,.43),'wine',.025),arm,'hips')
 return cloth

def build_nico():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for a in list(bpy.data.actions):bpy.data.actions.remove(a)
 bpy.ops.import_scene.gltf(filepath=os.path.abspath('art_sources/kaykit/Rogue.glb'));arm=next(o for o in bpy.data.objects if o.type=='ARMATURE');arm.name='NicoRig';source={a.name.removesuffix('_Rig'):a for a in bpy.data.actions}
 if arm.animation_data:
  arm.animation_data.action=None
  for t in arm.animation_data.nla_tracks:t.mute=True
 arm.data.pose_position='REST'
 for o in list(bpy.data.objects):
  if o.type=='MESH' and o.name not in ['Rogue_Body','Rogue_ArmLeft','Rogue_ArmRight','Rogue_LegLeft','Rogue_LegRight']:bpy.data.objects.remove(o,do_unlink=True)
 for o in [o for o in bpy.data.objects if o.type=='MESH']:
  o.data.materials.clear()
  for c in ['red','navy','white','skin','gold']:o.data.materials.append(mat(c))
  for p in o.data.polygons:
   z=sum(o.data.vertices[v].co.z for v in p.vertices)/len(p.vertices)
   # Mesh vertices are in authored model coordinates after glTF import.
   if 'Leg'in o.name:p.material_index=2 if z<.075 else 0 if z<.19 else 1
   elif 'Arm'in o.name:
    hand=sum(sum(g.weight for g in o.data.vertices[v].groups if o.vertex_groups[g.group].name.startswith(('hand','wrist'))) for v in p.vertices)/len(p.vertices);p.material_index=3 if hand>.4 else 0
   else:p.material_index=0 if z>.57 else 1
   p.use_smooth=True
  bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.0001);bm.to_mesh(o.data);bm.free()
  m=o.modifiers.new('rounded authored base','SUBSURF');m.levels=1;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
  dec=o.modifiers.new('mobile surface reduction','DECIMATE');dec.ratio=.35;bpy.ops.object.modifier_apply(modifier=dec.name)
 tailor_torso(arm,'Rogue_Body')
 sculpt_head(arm)
 bone_parent(sphere('HairBack',(0,1.52,-.13),(.60,.42,.27),'hair'),arm,'head')
 for o in list(bpy.data.objects):
  if o.parent_type=='BONE' and o.parent_bone=='head':
   world=o.matrix_world.copy();pivot=Vector(xyz((0,1.45,0)));o.matrix_world=Matrix.Translation(pivot)@Matrix.Scale(1.25,4)@Matrix.Translation(-pivot)@world
 for side in [-1,1]:
  for obj in [rounded('BackpackStrap',(side*.18,1.03,.225),(.045,.35,.04),'gold',.015),rounded('HoodDrawstring',(side*.08,1.10,.24),(.016,.18,.015),'gold',.005)]:bone_parent(obj,arm,'chest')
 for name,p,s,c in [('Backpack',(0,.98,-.25),(.48,.52,.24),'navy'),('BackpackPocket',(0,.89,-.39),(.34,.19,.065),'wine'),('Hood',(0,1.16,-.02),(.48,.17,.34),'wine'),('ChestZipper',(0,.96,.24),(.015,.3,.012),'gold')]:bone_parent(rounded(name,p,s,c,.035 if name!='ChestZipper'else .004),arm,'chest')
 socket=empty('PackageSocket');socket.location=xyz((0,.98,.48));bone_parent(socket,arm,'chest')
 arm.data.pose_position='POSE';data=bake_actions(arm,source);arm.animation_data.action=bpy.data.actions['Idle'];bpy.context.scene.frame_set(0)
 merge_parts(arm)
 bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('art_sources/nico-remodeled.blend'))
 bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT+'/nico.glb'),export_format='GLB',export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_frame_range=False,export_yup=True,export_skins=True,export_morph=True)
 REPORT.append({'name':'nico','source':'KayKit Rogue CC0, authored body/rig/animation; remodeled face, wardrobe and carry IK','clips':list(data),'bytes':os.path.getsize(OUT+'/nico.glb'),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons)for o in bpy.data.objects if o.type=='MESH')})


def merge_parts(arm):
 # Consolidate rigid details that follow the same bone; preserve all morph meshes.
 groups={}
 for o in list(bpy.data.objects):
  if o.type=='MESH' and not o.data.shape_keys:
   key=o.parent_bone if o.parent_type=='BONE' else 'skinned'
   groups.setdefault(key,[]).append(o)
 for key,objects in groups.items():
  if len(objects)<2:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in objects:o.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name='Details_'+key

def build_monster():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for a in list(bpy.data.actions):bpy.data.actions.remove(a)
 bpy.ops.import_scene.gltf(filepath=os.path.abspath('art_sources/kaykit/Mage.glb'));arm=next(o for o in bpy.data.objects if o.type=='ARMATURE');arm.name='PorteiroRig';source={a.name.removesuffix('_Rig'):a for a in bpy.data.actions}
 arm.animation_data.action=None
 for t in arm.animation_data.nla_tracks:t.mute=True
 arm.data.pose_position='REST'
 for o in list(bpy.data.objects):
  if o.type=='MESH' and o.name not in ['Mage_Body','Mage_ArmLeft','Mage_ArmRight','Mage_LegLeft','Mage_LegRight']:bpy.data.objects.remove(o,do_unlink=True)
 for o in [o for o in bpy.data.objects if o.type=='MESH']:
  o.data.materials.clear()
  for c in ['red','black','gold']:o.data.materials.append(mat(c))
  for p in o.data.polygons:
   z=sum(o.data.vertices[v].co.z for v in p.vertices)/len(p.vertices)
   hand=sum(sum(g.weight for g in o.data.vertices[v].groups if o.vertex_groups[g.group].name.startswith(('hand','wrist'))) for v in p.vertices)/len(p.vertices)
   p.material_index=1 if 'Leg'in o.name or hand>.45 else 0;p.use_smooth=True
  bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.0001);bm.to_mesh(o.data);bm.free()
  m=o.modifiers.new('tailored soft uniform','SUBSURF');m.levels=1;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
  m=o.modifiers.new('mobile','DECIMATE');m.ratio=.45;bpy.ops.object.modifier_apply(modifier=m.name)
 tailor_torso(arm,'Mage_Body',True)
 # Skull follows the existing head joint. Elongated mask, concave grin, sculpted tongue.
 bone_parent(sphere('DarkFace',(0,1.51,.02),(.49,.66,.38),'black',24,16),arm,'head')
 for side in [-1,1]:
  eye=sphere('GlowingEye',(side*.115,1.60,.193),(.14,.25,.035),'gold');eye.data.materials.clear();eye.data.materials.append(mat('fff078',1.3));eye.rotation_euler.y=side*.15;bone_parent(eye,arm,'head');eye.shape_key_add(name='Basis');k=eye.shape_key_add(name='Blink')
  for v in k.data:v.co.z*=.1
 grin=surface('Grin',[(math.cos(a)*(.19 if row==0 else .16),1.405+math.sin(a)*(.125 if row==0 else .095),.205+row*.006)for row in range(2)for a in [i*2*math.pi/32 for i in range(32)]],[(i,(i+1)%32,(i+1)%32+32,i+32)for i in range(32)],'pink',1);bone_parent(grin,arm,'head')
 bone_parent(sphere('GrinCavity',(0,1.405,.21),(.35,.21,.024),'black'),arm,'head')
 for i in range(8):
  x=(i-3.5)*.038;y=1.458-abs(x)*.18
  tooth=rounded('GrinTooth',(x,y,.235),(.032,.045,.015),'white',.009);bone_parent(tooth,arm,'head')
 tongue=sweep('LongTongue',[(-.04,1.39,.23),(.005,1.33,.255),(.035,1.28,.28),(.02,1.26,.29)],[.065,.065,.045,.018],'pink',10);bone_parent(tongue,arm,'head')
 for name,p,sz,c in [('BellCap',(0,1.87,.00),(.55,.25,.43),'red'),('CapGoldBand',(0,1.78,.04),(.565,.035,.45),'gold'),('BlackVisor',(0,1.752,.23),(.58,.035,.23),'black'),('BellBadge',(0,1.868,.224),(.075,.10,.016),'gold')]:bone_parent(rounded(name,p,sz,c,.025),arm,'head')
 for side in [-1,1]:
  for y in [.78,.91,1.04]:bone_parent(sphere('BrassButton',(side*.115,y,.238),(.039,.039,.023),'gold',12,8),arm,'chest')
  bone_parent(rounded('Epaulette',(side*.23,1.11,.005),(.17,.045,.23),'gold',.015),arm,'chest')
  glove=sphere('OversizedGlove',(side*.83,1.10,0),(.28,.21,.22),'black');bone_parent(glove,arm,'hand'+('.l'if side>0 else '.r'))
  for j in range(3):bone_parent(sphere('GloveKnuckle',(side*(.84+j*.035),1.115,-.08+j*.03),(.09,.12,.10),'black'),arm,'hand'+('.l'if side>0 else '.r'))
 recipes={'Idle':('Idle',False),'Patrol':('Walking_A',False),'Listen':('Idle',False),'Investigate':('Walking_C',False),'Chase':('Running_B',False),'Search':('Idle',False),'Return':('Walking_A',False),'Confused':('Hit_A',False)}
 arm.data.pose_position='POSE';data=bake_actions(arm,source,recipes);arm.animation_data.action=bpy.data.actions['Idle'];bpy.context.scene.frame_set(0)
 # Entire authored mesh+rig elongated together; skin bind and animation stay consistent.
 arm.scale=(1.02,1.02,1.40)
 merge_parts(arm)
 bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('art_sources/porteiro-remodeled.blend'))
 bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT+'/porteiro.glb'),export_format='GLB',export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_frame_range=False,export_yup=True,export_skins=True,export_morph=True)
 REPORT.append({'name':'porteiro','source':'KayKit Mage CC0, rig/body and compatible clips; remodeled mask, uniform, cap, gloves','clips':list(data),'bytes':os.path.getsize(OUT+'/porteiro.glb'),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons)for o in bpy.data.objects if o.type=='MESH')})

def build_boxes():
 for index,name in enumerate(['caixa_nervosa','pacote_arrogante','caixa_paranoica']):
  bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
  # Different geometry/proportions; lids have their own animation pivot.
  w,h,d=[(.64,.48,.43),(.57,.59,.38),(.65,.42,.48)][index];paper=['c79359','ad719d','7991ac'][index];root=empty('ParcelRoot')
  def child(o):o.parent=root;return o
  child(rounded('CartonBody',(0,0,0),(w,h,d),paper,.032))
  child(rounded('PackingTape',(0,h/2+.002,0),(.085,.009,d+.005),'gold',.002))
  lid=empty('tampa');lid.location=xyz((0,h/2,-d/2));lid.parent=root
  flap=rounded('LidFold',(0,h/2,0),(w,.025,d),paper,.008);world=flap.matrix_world.copy();flap.parent=lid;flap.matrix_world=world
  for side in [-1,1]:
   x=side*w*.24;eye=child(sphere('eye white'if side<0 else 'eye white.001',(x,h*.08,d/2+.022),(w*.32,h*(.36 if index!=1 else .22),.075),'white'))
   eye.shape_key_add(name='Basis');k=eye.shape_key_add(name='Blink')
   for v in k.data:v.co.z*=.1
   pupil=child(sphere('Pupil',(x+(side*.015 if index==2 else 0),h*.085,d/2+.065),(.067,.052 if index==1 else .095,.025),'black'));pupil.shape_key_add(name='Basis');k=pupil.shape_key_add(name='Look')
   for v in k.data:v.co.x+=.02
   child(sphere('Shine',(x-.018,h*.12,d/2+.082),(.02,.025,.01),'white',12,8))
   if index==1:child(rounded('HeavyUpperEyelid',(x,h*.17,d/2+.065),(w*.32,.055,.045),paper,.018))
   brow=child(sweep('Brow',[(x-.07,h*.30,d/2+.05),(x,h*(.38 if index==0 else .28),d/2+.06),(x+.07,h*(.31 if index!=1 else .36),d/2+.05)],[.008,.018,.008],'black',6));brow.shape_key_add(name='Basis');k=brow.shape_key_add(name='Panic')
   for v in k.data:v.co.z+=.025
  if index==1:
   mouth=child(sweep('boca animável',[(-.08,-h*.23,d/2+.025),(0,-h*.27,d/2+.03),(.08,-h*.19,d/2+.025)],[.006,.014,.007],'black',6))
  else:mouth=child(sphere('boca animável',(0,-h*.24,d/2+.02),(.16,.10,.025),'black'))
  mouth.shape_key_add(name='Basis');k=mouth.shape_key_add(name='Panic')
  for v in k.data:v.co.z*=1.7
  if index!=1:child(sphere('Tongue',(0,-h*.29,d/2+.038),(.085,.033,.015),'pink'))
  # Fold seams, shipping label and dimensional stickers.
  child(rounded('ShippingLabel',(-w*.37,-h*.30,d/2+.005),(.09,.10,.009),'white',.004))
  for j in range(3):child(rounded('Barcode',(-w*.37+(j-1)*.019,-h*.30,d/2+.011),(.006,.056,.005),'black',.001))
  if index==0:
   for side in [-1,1]:child(sphere('Sweat',(side*w*.43,-h*.05,d/2+.025),(.035,.07,.025),'76d8ee',12,8))
  elif index==1:child(rounded('LuxurySeal',(w*.36,-h*.30,d/2+.01),(.08,.09,.012),'gold',.012))
  else:
   for side in [-1,1]:child(sweep('TapeCross',[(side*w*.44,-h*.42,d/2+.01),(side*w*.38,-h*.36,d/2+.01),(side*w*.34,-h*.28,d/2+.01)],[.009,.009,.009],'gold',6))
  bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('art_sources/'+name+'.blend'))
  bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT+'/'+name+'.glb'),export_format='GLB',export_animations=False,export_yup=True,export_morph=True)
  REPORT.append({'name':name,'source':'Original modeled carton/folds/face, no external source','bytes':os.path.getsize(OUT+'/'+name+'.glb'),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons)for o in bpy.data.objects if o.type=='MESH')})

args=sys.argv[sys.argv.index('--')+1:]if'--'in sys.argv else ['all']
if 'nico'in args or'all'in args:build_nico()
if 'porteiro'in args or'all'in args:build_monster()
if 'boxes'in args or'all'in args:build_boxes()
previous=json.load(open('docs/character-build-report.json'))if os.path.exists('docs/character-build-report.json')else []
combined={r['name']:r for r in previous}
combined.update({r['name']:r for r in REPORT})
open('docs/character-build-report.json','w').write(json.dumps(list(combined.values()),indent=2));print('BUILD COMPLETE',REPORT)
