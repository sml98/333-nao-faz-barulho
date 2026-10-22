import pathlib,hashlib,json,csv,datetime
root=pathlib.Path('.');rows=[]
previous={r['file']:r for r in csv.DictReader(open('docs/ASSET_MANIFEST.csv'))} if pathlib.Path('docs/ASSET_MANIFEST.csv').exists() else {}
commit='672074b73ba276876a19e8816ecdc5241817ab47'
for n in ['Rogue.glb','Mage.glb','LICENSE.txt']:
 p=root/'art_sources/kaykit'/n;tail='License.txt'if n=='LICENSE.txt'else 'addons/kaykit_character_pack_adventures/Characters/gltf/'+n
 # Exact license path is verified against the archived GitHub tree below.
 tree=json.loads(pathlib.Path('art_sources/kaykit-tree.json').read_text())
 if n=='LICENSE.txt':tail=next(x['path']for x in tree['tree']if x['path'].lower().endswith('license.txt'))
 rows.append(dict(name=n,author='Kay Lousberg / KayKit',page='https://kaylousberg.itch.io/kaykit-adventurers',download=f'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/{commit}/{tail}',license='CC0 1.0 (docs/licenses/KayKit-CC0.txt)',date='2026-10-21',file=str(p),usage='Rogue: Nico body/skin/rig/clips; Mage: Porteiro body/skin/rig/clips',modifications='Removed fantasy gear/head; remodeled wardrobe, face, bone attachments, facial morphs, carry IK and baked compatible in-place clips'))
p=root/'art_sources/kenney_furniture-kit.zip';rows.append(dict(name='Furniture Kit 2.0',author='Kenney',page='https://kenney.nl/assets/furniture-kit',download='https://kenney.nl/media/pages/assets/furniture-kit/440e0608a4-1677580847/kenney_furniture-kit.zip',license='CC0 1.0 (docs/licenses/Kenney-CC0.txt)',date='2026-10-21',file=str(p),usage='chairRounded, sideTableDrawers, lampRoundTable, plantSmall1; remodeled cabinet and parcels',modifications='Official CC0 source checked; OBJ/MTL source extracts are versioned for Blender rebuilds'))
p=root/'art_sources/quaternius-base-standard.zip';q=json.loads(pathlib.Path('art_sources/quaternius-download-provenance.json').read_text());rows.append(dict(name=q['file'],author='Quaternius',page=q['page'],download=q['url'],license='In-pack CC0; current website QAL v1.0 (2026-08-28). NOT included in runtime/distribution.',date=q['date'],file=str(p),usage='Blender comparison only, Superhero Male; not selected',modifications='No runtime derivatives; public free itch UI download'))
for p in sorted((root/'public/assets/characters').glob('*.glb')):rows.append(dict(name=p.stem,author='Bellmare project (KayKit-derived humanoids)',page='docs/ASSET_AUDIT.md',download='local scripts/character_build.py',license='KayKit CC0 derivative for humanoids; original modeled parcels',date='2026-10-21',file=str(p),usage='Runtime GLB',modifications='See source script and character-build-report.json'))
kenney_models={'chairRounded','lampRoundTable','plantSmall1','sideTableDrawers'}
kenney_derivatives={'hotelWardrobe':'Closed-door bookcase','hotelParcelStack':'Closed cardboard box'}
for p in sorted((root/'public/assets/environment').glob('*.glb')):
 if p.stem in kenney_models:
  author='Kenney';page='https://kenney.nl/assets/furniture-kit';download='Official CC0 Furniture Kit 2.0';license='CC0 1.0';usage='Prepared chair (not placed/loaded)'if p.stem=='chairRounded'else 'Runtime furniture GLB';modifications='Blender import/export; runtime-normalized origin, scale and placement'
 elif p.stem in kenney_derivatives:
  author='Bellmare project, Kenney CC0-derived geometry';page='https://kenney.nl/assets/furniture-kit';download='Versioned OBJ/MTL source under art_sources/kenney/';license='Original Bellmare additions plus Kenney CC0 derivative';usage='Runtime environment GLB';modifications=f"{kenney_derivatives[p.stem]} recolored, beveled and augmented with Bellmare details in Blender"
 else:
  author='Bellmare project';page='docs/ART_SCENE_AUDIT.md';download='scripts/build_hotel_models.py';license='Original project geometry';usage='Runtime environment GLB';modifications='Rounded custom Blender geometry and pastel Bellmare materials'
 rows.append(dict(name=p.stem,author=author,page=page,download=download,license=license,date='2026-10-21',file=str(p),usage=usage,modifications=modifications))
for r in rows:
 p=pathlib.Path(r['file'])
 if p.exists():r['bytes']=p.stat().st_size;r['sha256']=hashlib.sha256(p.read_bytes()).hexdigest()
 else:r['bytes']=int(previous[r['file']]['bytes']);r['sha256']=previous[r['file']]['sha256']
with open('docs/ASSET_MANIFEST.csv','w',newline='')as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
text='# Asset provenance — 21/10/2026\n\nExact URLs, bytes and SHA-256 for each source and exported GLB are in [ASSET_MANIFEST.csv](ASSET_MANIFEST.csv). The Quaternius signed URL was issued by the official public download UI and has expired; the acquisition script repeats the free UI path rather than reusing it. No authentication bypass or purchase.\n\n'
for r in rows:text+=f"- **{r['name']}** — {r['author']}; {r['license']}. File `{r['file']}`: {r['bytes']:,} bytes; SHA-256 `{r['sha256']}`. Use: {r['usage']}.\n"
text+='\nRaw packs and comparison assets remain outside public/. Quaternius is excluded from product and deliverable archive. Source pages and catalog request results are archived in art_sources/. New faces, caps, gloves and parcels were modeled in Blender; no 2D reference image stands in for a character.\n'
pathlib.Path('docs/ASSET_MANIFEST.md').write_text(text)
