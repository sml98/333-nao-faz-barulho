"""Archive the other official catalog pages named in the execution order (no downloads)."""
import urllib.request,pathlib,concurrent.futures,json
urls=['https://kaylousberg.itch.io/furniture-bits','https://kaylousberg.itch.io/prototype-bits','https://quaternius.com/packs/universalanimationlibrary2.html','https://quaternius.com/packs/ultimatemonsters.html','https://quaternius.com/packs/toonshootergamekit.html','https://kenney.nl/assets/building-kit','https://kenney.nl/assets/castle-kit','https://kenney.nl/assets/prototype-kit','https://kenney.nl/assets/ui-pack','https://kenney.nl/support','https://polyhaven.com','https://api.polyhaven.com/','https://sketchfab.com/developers/download-api','https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html']
def fetch(u):
 try:
  r=urllib.request.urlopen(u,timeout=25);b=r.read();p='art_sources/catalog-'+u.rstrip('/').split('/')[-1]+'.html';pathlib.Path(p).write_bytes(b);return {'url':u,'status':r.status,'bytes':len(b),'saved':p}
 except Exception as e:return {'url':u,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5)as pool:results=list(pool.map(fetch,urls))
pathlib.Path('art_sources/catalog-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
