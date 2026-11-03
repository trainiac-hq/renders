"""Download a Commons file thumbnail to scratch for looking: peek.py "File:..." out.jpg [width]"""
import json, sys, urllib.parse, urllib.request
UA = {"User-Agent": "trainiac-renders/1.0 (https://traini.ac)"}
t, out = sys.argv[1], sys.argv[2]
w = sys.argv[3] if len(sys.argv) > 3 else "1200"
p = {"action": "query", "format": "json", "titles": t, "prop": "imageinfo", "iiprop": "url", "iiurlwidth": w}
r = json.load(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p), headers=UA)))
pg = next(iter(r["query"]["pages"].values()))
url = pg["imageinfo"][0]["thumburl"]
open(out, "wb").write(urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read())
print(out)
