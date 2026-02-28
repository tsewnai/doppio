# PWA Icons

Place the following icon files in this directory:
- `icon-192.png` — 192×192 PNG (required for Android)
- `icon-512.png` — 512×512 PNG (required for Android splash)

You can generate these from an SVG using a tool like:
- https://realfavicongenerator.net
- https://maskable.app (to check maskable safe zone)

A simple coffee cup SVG as a starting point:
```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#7c4b2a"/>
  <text x="50" y="70" font-size="60" text-anchor="middle" fill="white">☕</text>
</svg>
```
