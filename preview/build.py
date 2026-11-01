# Builds a single-file, hash-routed preview of the site (for sharing as a static page).
# Usage: npm run build && npm run preview:build   -> preview/out/money-coach-preview.html
import re, glob
css = open(glob.glob('.next/static/css/*.css')[0]).read()
css = re.sub(r'@font-face\{[^}]*\}', '', css)
import base64
js = open('preview/out/app.js').read().replace('</script', '<\\/script')
photo = 'data:image/jpeg;base64,' + base64.b64encode(open('public/images/gory-bedward.jpg','rb').read()).decode()
js = js.replace('/images/gory-bedward.jpg', photo)
open('preview/out/money-coach-preview.html', 'w').write(f'''<title>MONEY COACH Preview</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..800&family=Inter:wght@400..700&display=swap">
<style>:root{{--font-inter:"Inter",ui-sans-serif,system-ui,sans-serif;--font-fraunces:"Fraunces",ui-serif,Georgia,serif;color-scheme:light}}{css}body{{background:#faf8f2;color:#10243a;font-family:var(--font-inter)}}</style>
<div id="root"></div>
<script>{js}</script>
''')
