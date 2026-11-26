import codecs

with codecs.open(r'C:\Users\mateo\footlel-frontend\componentes\pages\login.html', 'r', 'utf-8-sig') as f:
    content = f.read()

replacements = [
    ('Contrasena', 'Contrase\u00f1a'),
    ('Olvide mi contrasena', 'Olv\u00edd\u00e9 mi contrase\u00f1a'),
    ('Iniciar Sesion', 'Iniciar Sesi\u00f3n'),
    ('Footlel - Iniciar Sesi\u00f3n', 'Footlel - Iniciar Sesi\u00f3n'),
]

for old, new in replacements:
    content = content.replace(old, new)

with codecs.open(r'C:\Users\mateo\footlel-frontend\componentes\pages\login.html', 'w', 'utf-8') as f:
    f.write(content)

print('Done')
