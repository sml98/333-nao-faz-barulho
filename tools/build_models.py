"""Original stylized Bellmare models. Blender 4.3, no downloaded models.
Coordinates in author functions use game metres (X east, Y up, Z forward).
"""
import bpy, math, os, random
from mathutils import Vector
random.seed(333)
OUT=os.path.abspath('public/assets/models')
C={'navy':'20374f','dark':'111e2c','mustard':'c8912d','skin':'e7aa7d','blush':'c47962','hair':'38241d','khaki':'998368','sole':'d0c2a5','gold':'c79b58','burgundy':'641d2c','wine':'812c3f','metal':'555e60','black':'151b21','white':'eee1c6','iris':'72442b','cyan':'6bb9c7','box':'bc8b54','tape':'d4b27d','pink':'b56c8a'}
def color(h):
 h=C.get(h,h);return tuple(((int(h[i:i+2],16)/255+.055)/1.055)**2.4 for i in (0,2,4))+(1,)
mats={}
def mat(name,metal=0,rough=.55,emit=0):
 key=(name,metal,rough,emit)
 if key in mats:return mats[key]
 m=bpy.data.materials.new(name);m.diffuse_color=color(name);m.use_nodes=True;s=m.node_tree.nodes.get('Principled BSDF');s.inputs['Base Color'].default_value=color(name);s.inputs['Roughness'].default_value=max(.65,rough);s.inputs['Metallic'].default_value=metal*.3
 if emit:s.inputs['Emission Color'].default_value=color(name);s.inputs['Emission Strength'].default_value=emit*.6
 mats[key]=m;return m
def xyz(p):return (p[0],-p[2],p[1])
def empty(name,parent=None,p=(0,0,0)):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent;o.location=xyz(p);return o
def finish(o,name,p,scale,m,parent,smooth=True):
 o.name=name;o.location=xyz(p);o.scale=(scale[0],scale[2],scale[1]);o.parent=parent;o.data.materials.append(m)
 if smooth:
  for f in o.data.polygons:f.use_smooth=True
 return o
def sphere(name,p,s,m,parent):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16);return finish(bpy.context.object,name,p,s,m,parent)
def ball(name,p,s,m,parent):return sphere(name,p,tuple(v/2 for v in s),m,parent)
def cube(name,p,s,m,parent,bevel=.02):
 bpy.ops.mesh.primitive_cube_add(size=1);o=finish(bpy.context.object,name,p,s,m,parent,False)
 bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('soft crafted edges','BEVEL');mod.width=bevel;mod.segments=3
  norm=o.modifiers.new('weighted normals','WEIGHTED_NORMAL');norm.keep_sharp=True
 return o
def cyl(name,p,r,depth,m,parent,top=None):
 if top is not None:bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=r,radius2=top,depth=depth)
 else:bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=r,depth=depth)
 return finish(bpy.context.object,name,p,(1,1,1),m,parent)
def tube(name,points,r,m,parent):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=12;cu.bevel_depth=r;cu.bevel_resolution=3;sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
 for b,p in zip(sp.bezier_points,points):b.co=xyz(p);b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 ob=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(ob);ob.parent=parent;ob.data.materials.append(m);return ob
def mesh(name,verts,faces,m,parent):
 me=bpy.data.meshes.new(name);me.from_pydata([xyz(p) for p in verts],[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.parent=parent;o.data.materials.append(m)
 for f in me.polygons:f.use_smooth=True
 return o
def loft(name,rings,m,parent,segments=24):
 verts=[]
 for y,rx,rz,cx,cz in rings:
  for n in range(segments):a=n*2*math.pi/segments;verts.append((cx+math.sin(a)*rx,y,cz+math.cos(a)*rz))
 faces=[]
 for j in range(len(rings)-1):
  for n in range(segments):a=j*segments+n;b=j*segments+(n+1)%segments;faces.append((a,b,b+segments,a+segments))
 faces.extend([tuple(range(segments-1,-1,-1)),tuple((len(rings)-1)*segments+n for n in range(segments))]);return mesh(name,verts,faces,m,parent)
def eye(parent,x,y,z,monster=False):
 if monster:
  ball('eye brass socket',(x,y,z),(.19,.2,.11),mat('gold',.75,.28),parent)
  ball('dark eye rim',(x,y,z+.049),(.151,.16,.06),mat('black',.6,.3),parent)
  ball('glowing eye',(x,y,z+.078),(.107,.118,.045),mat('f4bd65',.1,.2,3),parent)
  ball('eye core',(x,y,z+.101),(.048,.06,.02),mat('white',0,.2,3),parent)
 else:
  ball('eyelid',(x,y,z),(.158,.175,.09),mat('skin'),parent)
  ball('eye white',(x,y+.008,z+.018),(.141,.157,.084),mat('white',0,.25),parent)
  ball('iris',(x+.005,y+.007,z+.056),(.07,.09,.025),mat('iris',0,.2),parent)
  ball('pupil',(x+.006,y+.008,z+.068),(.039,.063,.012),mat('black',0,.15),parent)
  ball('catchlight',(x-.008,y+.033,z+.076),(.017,.021,.008),mat('white',0,.1,1),parent)
def export(root,name):
 bpy.ops.object.select_all(action='DESELECT')
 def sel(o):
  o.select_set(True)
  for c in o.children:sel(c)
 sel(root);bpy.context.view_layer.objects.active=root
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False)
 bpy.data.objects.remove(root,do_unlink=True)
 # Start clean, ensuring distinct scene exports.
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def nico():
 root=empty('Nico');body=empty('corpo animável',root)
 jacket=mat('navy',0,.6);pants=mat('khaki',0,.8);gold=mat('gold',.45,.35);skin=mat('skin',0,.65);dark=mat('dark',0,.65)
 for i,x in enumerate([-.125,.125]):
  leg=empty('perna'+str(i),body,(x,.72,0))
  loft('cargo trouser',[(0,.105,.11,0,0),(-.15,.10,.1,0,0),(-.33,.087,.087,0,.01),(-.48,.083,.087,0,-.01),(-.58,.076,.085,0,0)],pants,leg)
  cube('cargo pocket',(x*.3,-.22,.02),(.13,.17,.18),pants,leg,.02)
  cube('pocket flap',(x*.3,-.14,.04),(.14,.04,.19),mat('khaki'),leg,.009)
  ball('shoe',(0,-.635,.045),(.205,.145,.34),jacket,leg)
  cube('cream sole',(0,-.694,.05),(.205,.038,.34),mat('sole'),leg,.018)
  cube('toe cap',(0,-.63,.17),(.17,.065,.08),mat('sole'),leg,.025)
  for n in range(3):tube('shoe lace',[(-.06,-.57,.09+n*.028),(.06,-.57,.09+n*.028)],.008,mat('sole'),leg)
 loft('fitted jacket',[(.70,.19,.135,0,0),(.77,.23,.15,0,0),(1.03,.23,.155,0,0),(1.22,.27,.155,0,-.012),(1.28,.18,.12,0,0)],jacket,body)
 cube('hem cuff',(0,.76,0),(.46,.08,.31),dark,body,.03)
 tube('zipper',[(0,.79,.155),(0,1.1,.162),(0,1.23,.13)],.009,gold,body)
 # Hood rolls and lining wrapping the neck.
 ball('hood lining',(0,1.245,-.06),(.43,.18,.33),mat('mustard'),body)
 ball('neck',(0,1.32,0),(.155,.18,.15),skin,body)
 for x in [-.13,.13]:tube('hood drawstring',[(x,1.28,.12),(x*.7,1.12,.175)],.009,mat('mustard'),body)
 for side in [-1,1]:
  tube('backpack strap',[(side*.17,.8,.15),(side*.22,1.15,.12),(side*.18,1.29,-.02),(side*.19,1.17,-.19)],.024,mat('mustard'),body)
  cube('jacket pocket',(side*.145,.91,.154),(.13,.13,.025),dark,body,.012)
  arm=empty('braço'+str(0 if side<0 else 1),body,(side*.26,1.19,0))
  # Bent carrying pose: upper arm down, forearm coming forwards to cradle a package.
  tube('jacket sleeve',[(0,0,0),(side*.025,-.16,.01),(side*.025,-.29,.08),(0,-.29,.24)],.074,jacket,arm)
  ball('elbow',(side*.025,-.27,.06),(.15,.15,.15),jacket,arm)
  cyl('cuff',(0,-.285,.24),.072,.07,dark,arm)
  ball('fingerless glove',(0,-.285,.29),(.13,.11,.13),dark,arm)
  for n in range(3):tube('curled finger',[(side*.02+(n-1)*.035,-.28,.30),(side*.02+(n-1)*.035,-.25,.35),(side*.02+(n-1)*.035,-.22,.34)],.017,skin,arm)
  ball('thumb',(-side*.065,-.25,.28),(.055,.08,.055),skin,arm)
 cube('backpack',(0,1.015,-.22),(.43,.5,.2),jacket,body,.07)
 cube('backpack pocket',(0,.91,-.34),(.32,.19,.06),dark,body,.035)
 for x in [-.145,.145]:tube('pack stitching',[(x,.82,-.376),(x,1.17,-.34)],.006,gold,body)
 cube('backpack patch',(0,1.09,-.328),(.13,.15,.01),mat('sole'),body,.015)
 cube('badge',( .105,1.1,.18),(.085,.115,.018),mat('sole'),body,.008)
 ball('badge portrait',(.105,1.112,.193),(.039,.048,.007),jacket,body)
 # Head: jaw, cheeks, nose, hair, cap; reference proportions with large eyes.
 head=empty('cabeça',body,(0,1.49,.025))
 ball('face',(0,0,0),(.39,.43,.34),skin,head)
 ball('jaw',(0,-.10,.035),(.28,.22,.27),skin,head)
 for x in [-.20,.20]:
  ball('ear',(x,-.015,0),(.087,.125,.065),skin,head);ball('ear interior',(x,-.015,.025),(.04,.07,.02),mat('blush'),head)
 for x in [-.088,.088]:
  eye(head,x,.025,.126)
  tube('eyebrow',[(x-.064,.145,.14),(x,.168,.156),(x+.056,.14,.149)],.014,mat('hair'),head)
 ball('nose',(0,-.035,.19),(.074,.086,.08),skin,head)
 tube('upper lip',[(-.055,-.133,.155),(0,-.12,.18),(.052,-.132,.158)],.009,mat('hair'),head)
 tube('lower lip',[(-.042,-.142,.154),(0,-.15,.17),(.038,-.141,.155)],.007,mat('blush'),head)
 ball('hair back',(0,.055,-.055),(.407,.36,.29),mat('hair'),head)
 # Front fringe locks, shaped tapered strands, keep eyes unobscured.
 for i in range(7):
  x=(i-3)*.047
  tube('hair lock',[(x,.18,.03),(x-.035,.15,.15),(x-.06,.10 if i%2 else .12,.16)],.026,mat('hair'),head)
 ball('cap dome',(0,.19,-.025),(.45,.19,.38),jacket,head)
 # Curved visor, not a flat cuboid.
 verts=[]
 for ring in [0,1]:
  for i in range(17):
   a=-math.pi*.5+i*math.pi/16;x=math.sin(a)*.24;z=.09+math.cos(a)*(.12+ring*.13);verts.append((x,.175-.028*math.cos(a)-ring*.02,z))
 faces=[(i,i+1,i+18,i+17) for i in range(16)];v=mesh('curved cap visor',verts,faces,jacket,head);sol=v.modifiers.new('visor thickness','SOLIDIFY');sol.thickness=.014
 tube('cap piping',[(verts[17+i][0],verts[17+i][1]+.003,verts[17+i][2]) for i in range(17)],.005,gold,head)
 ball('cap button',(0,.29,-.025),(.035,.024,.035),gold,head)
 cube('cap emblem',(0,.217,.154),(.052,.055,.008),gold,head,.01)
 export(root,'nico')
def porteiro():
 root=empty('Porteiro');body=empty('corpo animável',root)
 burg=mat('burgundy',0,.6);gold=mat('gold',.72,.29);metal=mat('metal',.8,.38);black=mat('black',.3,.4)
 for i,x in enumerate([-.15,.15]):
  p=empty('perna'+str(i),body,(x,1.14,0))
  loft('long trouser',[(0,.095,.09,0,0),(-.35,.071,.078,0,-.03),(-.62,.074,.078,0,.03),(-1,.055,.064,0,.01)],burg,p)
  ball('polished shoe',(0,-1.06,.07),(.18,.15,.36),black,p);tube('gold shoe trim',[(-.08,-1.07,.11),(0,-1.09,.25),(.08,-1.07,.11)],.007,gold,p)
 loft('long coat',[(1.02,.22,.14,0,-.015),(1.28,.20,.14,0,0),(1.65,.27,.17,0,.005),(1.96,.34,.18,0,.06),(2.02,.23,.12,0,.10)],burg,body)
 for side in [-1,1]:
  mesh('coat tail',[(side*.01,1.36,-.1),(side*.24,1.36,-.11),(side*.21,.90,-.16),(side*.035,1.02,-.15)],[(0,1,2,3)],burg,body)
  tube('gold lapel',[(side*.22,1.98,.17),(side*.10,1.75,.23),(side*.03,1.52,.17)],.016,gold,body)
  cube('epaulette',(side*.29,1.96,.06),(.19,.065,.27),gold,body,.02)
  arm=empty('braço'+str(0 if side<0 else 1),body,(side*.33,1.92,.03))
  tube('long sleeve',[(0,0,0),(side*.04,-.36,-.02),(side*.035,-.66,.09)],.066,burg,arm)
  for y in [-.63,-.68]:tube('gold cuff',[(side*-.03,y,.10),(side*.09,y,.10)],.015,gold,arm)
  ball('metal palm',(side*.035,-.77,.1),(.13,.2,.07),metal,arm)
  for j in range(4):
   x=side*.035+(j-1.5)*.035
   tube('long articulated finger',[(x,-.83,.11),(x+side*.015,-.97,.13),(x+side*.01,-1.06,.18)],.012,metal,arm)
   ball('knuckle',(x,-.90,.12),(.031,.035,.035),gold,arm)
  tube('hooked thumb',[(side*-.025,-.75,.13),(side*-.08,-.84,.2),(side*-.07,-.91,.22)],.016,metal,arm)
 for side in [-1,1]:
  for n in range(5):ball('uniform button',(side*.12,1.35+n*.125,.165),(.041,.042,.027),gold,body)
 tube('bell chain',[(-.17,1.95,.2),(0,1.72,.26),(.17,1.95,.2)],.009,gold,body)
 bell=cyl('sino no peito',(0,1.68,.30),.15,.20,gold,body,top=.075);ball('bell clapper',(0,1.56,.3),(.055,.065,.055),metal,body)
 head=empty('cabeça',body,(0,2.35,.18))
 ball('dark mask back',(0,-.01,-.03),(.35,.51,.29),black,head)
 # Distinctive elongated tapering mechanical mask, scalloped chin.
 loft('metal face',[(-.27,.035,.05,0,.09),(-.18,.105,.07,0,.1),(0,.18,.11,0,.06),(.16,.16,.10,0,.03),(.21,.10,.08,0,.01)],metal,head)
 for x in [-.095,.095]:eye(head,x,.04,.145,True)
 for n in range(7):
  x=(n-3)*.034;bottom=-.24+abs(n-3)*.022
  tube('mask grille',[(x*.65,bottom,.16),(x,-.09,.196),(x*.97,-.025,.175)],.008,gold,head)
 tube('metal grin',[(-.13,-.09,.18),(0,-.15,.20),(.13,-.09,.18)],.008,black,head)
 cyl('burgundy cap',(0,.24,0),.20,.17,burg,head)
 cyl('hat band',(0,.17,0),.207,.045,gold,head)
 ball('hat visor',(0,.14,.16),(.4,.042,.2),black,head)
 cube('hat emblem',(0,.25,.194),(.07,.075,.016),gold,head,.012)
 export(root,'porteiro')
def package():
 root=empty('Box')
 cube('papelão',(0,0,0),(.58,.46,.43),mat('box',0,.88),root,.035)
 cube('fold front',(0,-.16,.225),(.58,.125,.035),mat('box'),root,.008)
 for side in [-1,1]:
  tube('cardboard seam',[(side*.282,-.19,.20),(side*.285,.2,.2)],.006,mat('hair'),root)
  cube('side tape',(side*.293,.03,0),(.008,.06,.4),mat('tape'),root,.002)
 lid=empty('tampa',root,(0,.23,0));cube('lid left',(-.145,0,0),(.29,.035,.45),mat('box'),lid,.012);cube('lid right',(.145,.012,0),(.29,.035,.45),mat('box'),lid,.012)
 cube('top tape',(0,.033,0),(.095,.009,.44),mat('tape'),lid,.002)
 for x in [-.12,.12]:
  ball('eye white',(x,.04,.229),(.18,.21,.07),mat('white',0,.4),root);ball('pupil',(x+.01,.035,.263),(.055,.08,.02),mat('black',0,.25),root)
  ball('catchlight',(x,.06,.275),(.016,.02,.008),mat('white',0,.2,1),root)
  tube('worried eyebrow',[(x-.085,.165,.235),(x,.18,.255),(x+.073,.15,.24)],.015,mat('hair'),root)
 ball('boca animável',(0,-.105,.232),(.13,.065,.018),mat('hair'),root)
 export(root,'box')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
nico();porteiro();package();print('BELLM ARE MODELS EXPORTED',OUT)
