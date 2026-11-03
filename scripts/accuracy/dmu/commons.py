"""List Commons files: search or category, with date, size, licence.
usage: commons.py cat "Category:..." | search "query" [n]"""
import json, sys, urllib.parse, urllib.request
UA = {"User-Agent": "trainiac-renders/1.0 (https://traini.ac)"}
API = "https://commons.wikimedia.org/w/api.php?"
def get(params):
    req = urllib.request.Request(API + urllib.parse.urlencode(params), headers=UA)
    return json.load(urllib.request.urlopen(req))
mode, q = sys.argv[1], sys.argv[2]
n = int(sys.argv[3]) if len(sys.argv) > 3 else 50
if mode == "cat":
    p = {"action": "query", "format": "json", "generator": "categorymembers", "gcmtitle": q, "gcmtype": "file|subcat", "gcmlimit": n,
         "prop": "imageinfo", "iiprop": "size|extmetadata", "gcmsort": "timestamp", "gcmdir": "desc"}
else:
    p = {"action": "query", "format": "json", "generator": "search", "gsrsearch": q, "gsrnamespace": "6|14", "gsrlimit": n,
         "prop": "imageinfo", "iiprop": "size|extmetadata"}
r = get(p)
rows = []
for pg in r.get("query", {}).get("pages", {}).values():
    ii = (pg.get("imageinfo") or [{}])[0]
    md = ii.get("extmetadata", {})
    d = md.get("DateTimeOriginal", {}).get("value", "")[:10]
    lic = md.get("LicenseShortName", {}).get("value", "")
    rows.append((d, pg["title"], ii.get("width", ""), ii.get("height", ""), lic))
for row in sorted(rows, reverse=True):
    print(*row, sep=" | ")
