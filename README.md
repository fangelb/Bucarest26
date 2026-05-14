# Bucarest '26 🎂

**Guia de viatge col·laborativa** · 12–14 Juny 2026 · 7 persones · 40 anys

PWA instal·lable amb: llocs turístics, agenda compartida, favorits compartits i gestió de despeses estil Tricount.

---

## 🚀 Posada en marxa

### 1. Instal·la dependències

```bash
npm install
```

### 2. Configura Firebase (per col·laboració en temps real)

**Crear el projecte Firebase (5 min, completament gratuït):**

1. Ves a [console.firebase.google.com](https://console.firebase.google.com)
2. **"Afegir projecte"** → Nom: `bucarest26` → Continua sense Analytics
3. Al menú esquerre: **Build → Realtime Database**
4. **"Crear base de dades"** → Ubicació: `europe-west1` → Mode de prova (permet lectura/escriptura durant 30 dies)
5. Copia la URL de la base de dades (ex: `https://bucarest26-xxxxx-default-rtdb.europe-west1.firebasedatabase.app`)

> ⚠️ **Regles de seguretat** (opcionals però recomanades): En Firebase → Realtime Database → Regles, mantén el mode de prova els primers 30 dies. Per producció pots restringir per group code si vols.

**Configura l'entorn:**

```bash
cp .env.example .env
```

Edita `.env` i afegeix la teva URL:
```
VITE_FIREBASE_URL=https://bucarest26-xxxxx-default-rtdb.europe-west1.firebasedatabase.app
```

### 3. Genera les icones de la PWA

Obre `generate-icons.html` al navegador (fes doble clic al fitxer). Es descarregaran automàticament `icon-192.png` i `icon-512.png`. Mou-los a la carpeta `public/`.

### 4. Executa en local

```bash
npm run dev
```

Obre [http://localhost:5173/Bucarest26/](http://localhost:5173/Bucarest26/)

---

## 📦 Desplegament a GitHub Pages

### Primer desplegament (manual)

```bash
npm run build
```

Puja la carpeta `dist/` com a GitHub Pages o usa el workflow automàtic.

### Desplegament automàtic (GitHub Actions)

El workflow `.github/workflows/deploy.yml` fa el build i el deploy automàticament cada cop que fas push a `main`.

**Cal configurar el secret de Firebase:**

1. GitHub → El teu repo → **Settings → Secrets and variables → Actions**
2. **"New repository secret"**:
   - Name: `VITE_FIREBASE_URL`
   - Value: la teva URL de Firebase
3. Activar GitHub Pages: **Settings → Pages → Source: GitHub Actions**

### Canviar la base URL

Si el repo no es diu `Bucarest26`, edita `vite.config.js`:
```js
const BASE = '/NomDelTeuRepo/';
```

Si és una **User Page** (`usuari.github.io` sense subruta):
```js
const BASE = '/';
```

I també edita `index.html` (les dues referències a `/Bucarest26/`).

---

## 📱 Instal·lar la PWA

Un cop desplegada, al mòbil:
- **Android (Chrome):** Apareix un banner "Instal·lar" automàticament, o Menu → "Afegir a pantalla d'inici"
- **iOS (Safari):** Botó Compartir → "Afegir a pantalla d'inici"

**Auto-actualització:** Quan despleguis una nova versió, els usuaris que tinguin l'app instal·lada veuran un banner "🔄 Nova versió disponible" amb botó per actualitzar.

---

## 👥 Ús col·laboratiu (per als 7 amics)

1. Cadascú obre l'app al mòbil
2. Va a **Despeses** i introdueix el **mateix codi** (ex: `bucarest2026`)
3. L'app sincronitza automàticament cada 20 segons:
   - ❤️ **Favorits** compartits
   - 📅 **Agenda** compartida (afegir/eliminar events)
   - 💸 **Despeses** i liquidació automàtica
4. Editeu els noms dels membres des de qualsevol dispositiu

---

## 🛠️ Estructura del projecte

```
Bucarest26/
├── .github/workflows/deploy.yml   # Auto-deploy a GitHub Pages
├── public/
│   ├── icon.svg                   # Icona font (SVG)
│   ├── icon-192.png               # Icona PWA (generar amb generate-icons.html)
│   └── icon-512.png               # Icona PWA gran
├── src/
│   ├── App.jsx                    # Component principal (tota la lògica)
│   ├── firebase.js                # Helper Firebase REST API
│   └── main.jsx                   # Entry point React
├── generate-icons.html            # Generador d'icones PNG
├── index.html                     # HTML base amb meta PWA
├── vite.config.js                 # Vite + vite-plugin-pwa
├── package.json
├── .env.example                   # Plantilla de variables d'entorn
└── .gitignore
```

---

## 📊 Estructura dades Firebase

```
/groups/{codi}/
  ├── members: ["Ferran", "Amic 2", ...]
  ├── favorites: ["t1", "c1", ...]
  ├── expenses: [{id, desc, amount, payer, participants, date}, ...]
  └── agenda: [{id, day, time, title, notes, color}, ...]
```

---

## 🗺️ Sobre el mapa

El mapa (OpenStreetMap embed) **no es veu a l'artifact de Claude** per restriccions d'iframe del sandbox. Funciona correctament un cop desplegat a GitHub Pages. Cada lloc té un botó directe a Google Maps.
