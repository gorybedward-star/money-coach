# Builds a single-file preview of the toolkit.
# Usage: npm run build && npm run preview:toolkit   -> preview/out/toolkit-preview.html
import re, glob
css = "".join(open(f).read() for f in glob.glob('.next/static/css/*.css'))
css = re.sub(r'@font-face\{[^}]*\}', '', css)
js = open('preview/out/toolkit.js').read().replace('</script', '<\\/script')
open('preview/out/toolkit-preview.html', 'w').write(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Financial Reset Toolkit</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..800&family=Inter:wght@400..700&display=swap">
<style>:root{{--font-inter:"Inter",ui-sans-serif,system-ui,sans-serif;--font-fraunces:"Fraunces",ui-serif,Georgia,serif;color-scheme:light}}{css}body{{background:#f4f6f9;color:#0b1f3a;font-family:var(--font-inter)}}</style>
</head><body><div id="root"></div>
<script>{js}</script></body></html>
''')
