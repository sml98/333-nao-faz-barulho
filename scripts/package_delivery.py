"""Local delivery archives, excluding dependencies, raw comparison packs and git internals."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import hashlib,json
project=Path.cwd();kit=project.parent
main=Path('/workspace/333-cartoon-meme-viral-jogavel.zip')
with ZipFile(main,'w',ZIP_DEFLATED,compresslevel=6)as z:
 for p in kit.rglob('*'):
  if not p.is_file():continue
  rel=p.relative_to(kit);parts=rel.parts
  if any(n in parts for n in ['node_modules','.git','test-results','playwright-report','raw-video']):continue
  if p.suffix in ['.zip','.blend','.blend1','.bin','.gltf']:continue
  if 'art_sources'in parts:
   allowed=p.name in ['LICENSE.txt','License.txt','README.md','quaternius-download-provenance.json','base-comparison.json','catalog-results.json','quaternius-license.html','kaykit-tree.json']
   if not allowed:continue
  if p.name in ['nico-diagnostic.png','delivery-artifacts.json']:continue
  z.write(p,Path('333')/rel)
blend=Path('/workspace/333-fontes-blender-cartoon.zip')
with ZipFile(blend,'w',ZIP_DEFLATED,compresslevel=6)as z:
 for p in (project/'art_sources').glob('*.blend'):z.write(p,Path('fontes_blender')/p.name)
 for p in (project/'docs/licenses').glob('*'):z.write(p,Path('licencas')/p.name)
 for p in [project/'CREDITS.md',project/'docs/ASSET_MANIFEST.csv',project/'scripts/character_build.py']:z.write(p,p.name)
result=[]
for p in [main,blend]:
 with ZipFile(p)as z:
  assert z.testzip()is None
  if p==main:
   names=z.namelist();assert '333/bellmare-333/dist/index.html'in names;assert '333/Tecnico/hotel_bellmare_layout_v1.json'in names;assert not any('quaternius/'in n for n in names)
 result.append({'file':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(project/'docs/delivery-artifacts.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
