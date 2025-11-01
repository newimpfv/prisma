# PWA Icons

Questa cartella deve contenere le icone per la Progressive Web App.

## Icone necessarie:

- **icon-72x72.png** (72x72 pixels)
- **icon-96x96.png** (96x96 pixels)
- **icon-128x128.png** (128x128 pixels)
- **icon-144x144.png** (144x144 pixels)
- **icon-152x152.png** (152x152 pixels)
- **icon-192x192.png** (192x192 pixels)
- **icon-384x384.png** (384x384 pixels)
- **icon-512x512.png** (512x512 pixels)

## Come creare le icone:

1. Parti da un logo PRISMA Solar ad alta risoluzione (almeno 1024x1024)
2. Usa uno strumento come:
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - Photoshop/GIMP per ridimensionare manualmente

3. Salva tutte le dimensioni in questa cartella

## Shortcuts Icons (opzionali):

- **shortcut-new.png** (96x96) - Icona "Nuovo Preventivo"
- **shortcut-clients.png** (96x96) - Icona "Clienti"
- **shortcut-inspection.png** (96x96) - Icona "Sopralluogo"

## Colori consigliati:

- Background: `#3b82f6` (blu PRISMA)
- Foreground: `#ffffff` (bianco)
- Accento: `#10b981` (verde)

## Esempio SVG da convertire:

```svg
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3b82f6" rx="64"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">⚡</text>
</svg>
```

Salva questo SVG e convertilo in PNG nelle varie dimensioni richieste.
