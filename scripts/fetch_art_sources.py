"""Reacquire only public CC0 sources needed for rebuilding. No paid/login links.
Run python scripts/fetch_art_sources.py then Blender build scripts in project root.
"""
from pathlib import Path
import urllib.request,hashlib,zipfile,csv
commit='672074b73ba276876a19e8816ecdc5241817ab47'
base=f'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/{commit}/'
expected={r['file']:r['sha256'] for r in csv.DictReader(open('docs/ASSET_MANIFEST.csv'))}
def fetch(url,path):
 path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
 if not path.exists():
  req=urllib.request.Request(url,headers={'User-Agent':'Bellmare-build/1.0'})
  with urllib.request.urlopen(req,timeout=90)as r:path.write_bytes(r.read())
 digest=hashlib.sha256(path.read_bytes()).hexdigest()
 if str(path)in expected and digest!=expected[str(path)]:raise RuntimeError('Source changed: '+str(path))
 print(str(path),path.stat().st_size,digest)
for name in ['Rogue.glb','Mage.glb']:
 fetch(base+'addons/kaykit_character_pack_adventures/Characters/gltf/'+name,'art_sources/kaykit/'+name)
# Saved license is versioned with the project; source path follows official tree.
fetch(base+'LICENSE.txt','art_sources/kaykit/LICENSE.txt')
url='https://kenney.nl/media/pages/assets/furniture-kit/440e0608a4-1677580847/kenney_furniture-kit.zip'
fetch(url,'art_sources/kenney_furniture-kit.zip')
with zipfile.ZipFile('art_sources/kenney_furniture-kit.zip')as z:
 for name in ['chairRounded','sideTableDrawers','lampRoundTable','plantSmall1']:
  source=next(n for n in z.namelist()if n.endswith('/'+name+'.glb'));Path('art_sources/kenney').mkdir(exist_ok=True);Path('art_sources/kenney/'+name+'.glb').write_bytes(z.read(source))
print('Ready. Quaternius is comparison only and is not needed to rebuild.')
