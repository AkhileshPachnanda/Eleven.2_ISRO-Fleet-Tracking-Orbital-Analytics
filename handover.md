# ISRO Mission Control - Comprehensive Project Handover

## 1. Project Overview & Objectives
The ISRO Mission Control application is a sophisticated, real-time 3D tracking dashboard designed to monitor Indian Space Research Organisation (ISRO) assets, along with notable international satellites like the International Space Station (ISS). 

The goal of this project is to provide a highly interactive, responsive, and performant WebGL experience that merges complex orbital physics with AI-generated intelligence summaries, creating a "Command Center" feel for end-users.

---

## 2. System Architecture

The application operates on a decoupled client-server architecture, utilizing a "Backend-For-Frontend" (BFF) pattern to protect API keys and manage caching.

### 2.1 Frontend (React / Vite)
- **Framework:** React 19 bootstrapped with Vite for ultra-fast Hot Module Replacement (HMR) and optimized Rollup/Rolldown builds.
- **3D Engine:** `three.js` wrapped in `@react-three/fiber` (R3F) and `@react-three/drei` for declarative WebGL components.
- **Animation & UI:** `framer-motion` handles complex layout transitions, specifically the dynamic Sidebar-to-Bottom-Sheet responsive design.
- **Physics Engine:** `satellite.js` (v7) runs locally in the browser, utilizing WebAssembly (Wasm) and pthreads to crunch orbital mechanics without blocking the main UI thread.

### 2.2 Backend (Node.js / Express)
- **Runtime:** Node.js (v20+ recommended).
- **Web Server:** Express.js configured with `cors` and `express-rate-limit` for security.
- **Caching Layer:** `node-cache` acts as an in-memory datastore. It stores heavy payload responses (like Celestrak TLEs and Groq AI summaries) to dramatically reduce latency and API billing costs.

---

## 3. Core Physics & Orbital Mechanics

### 3.1 Two-Line Elements (TLE)
A TLE is a standardized data format used by NORAD to encode the orbital elements of an Earth-orbiting object. 
- The backend fetches the latest TLE string for each tracked satellite from **CelesTrak**.
- Because orbits degrade over time due to atmospheric drag, the backend is configured to automatically refresh these TLEs every 6 hours.

### 3.2 The SGP4 Propagator
Inside the frontend (`src/lib/propogator.js`), the `satellite.js` library uses the SGP4 (Simplified General Perturbations) mathematical model.
- It takes the raw TLE and the current (or simulated) Javascript `Date` object.
- It outputs the exact Geodetic position (Latitude, Longitude, and Altitude in kilometers).

### 3.3 Spherical to Cartesian Conversion
To render the satellite on the `three.js` 3D globe, the geodetic coordinates must be converted to Cartesian (X, Y, Z) space. This is handled by the `latLngToVector3` function:
- Calculates the radius (Earth Radius + Satellite Altitude).
- Uses trigonometry (`Math.sin` and `Math.cos` on the `phi` and `theta` angles) to place the `THREE.Vector3` accurately in the 3D scene.

---

## 4. API Integrations & Data Flow

### 4.1 CelesTrak (Orbital Data)
- **Flow:** `Frontend` -> `Backend (/api/celestrak)` -> `CelesTrak HTTP API`.
- **Logic:** The backend receives an array of NORAD IDs, batches the request, downloads the raw TLE text, parses it, caches it for 6 hours, and returns a clean JSON map to the frontend.

### 4.2 Groq (AI Intelligence)
- **Flow:** `Frontend` -> `Backend (/api/groq)` -> `Groq LLM (llama-3.3-70b-versatile)`.
- **Logic:** When a user clicks a satellite, the backend constructs a prompt using the satellite's metadata (Orbit Type, Launch Date, Mission). Groq generates a concise 3-sentence operational summary. The backend caches this exact string for 1 hour to prevent redundant AI generation for popular satellites.

---

## 5. Recent Technical Milestones & Fixes

1. **Top-Level Await & Web Worker Bundling:** 
   - *Challenge:* `satellite.js` relies on WebAssembly pthreads which use modern ES Module Top-Level Awaits. Vite's default Rollup config attempted to bundle this as an older `iife` worker, causing build crashes.
   - *Solution:* Updated `vite.config.js` to strictly enforce `target: 'esnext'` and `worker: { format: 'es' }`.

2. **Mobile UI/UX Paradigm Shift:** 
   - *Challenge:* Fixed 360px sidebars completely covered the 3D globe on mobile phones.
   - *Solution:* Implemented a custom `useMediaQuery` hook. On screens under 768px, `framer-motion` dynamically morphs the sidebars into native-feeling **Bottom Sheets**. The Satellite Details sheet acts as a full-width overlay (`zIndex: 50`) sliding up over the List sheet (`zIndex: 40`), leaving the top 55% of the screen clear for the 3D camera zoom.

3. **Time Scrubber Performance Quantization:**
   - *Challenge:* Dragging the timeline slider fired hundreds of millisecond updates per second, forcing the 3D engine to recompute SGP4 physics 60 times a second, causing massive frame drops and UI jitter.
   - *Solution:* Applied mathematical quantization to the pointer events. The slider now "snaps" to invisible 5-minute intervals, reducing the math load by 99% while scrubbing, resulting in buttery-smooth performance.

4. **Dynamic 3D Model Injecting:**
   - *Challenge:* Wanted a specific high-resolution 3D model exclusively for the ISS without loading it for all satellites.
   - *Solution:* Updated `SatelliteMarker.jsx` to dynamically switch the GLTF payload based on the `noradId === 25544` flag. Scaled the heavy 44MB `.glb` model down significantly (`[0.003, 0.003, 0.003]`) and implemented background prefetching to eliminate pop-in delay.

5. **Console Output Sanitization:**
   - *Challenge:* The browser console was flooded with `THREE.Clock` deprecation warnings (from R3F internals), Firefox `mozPressure` warnings, and React 18 Strict Mode double-fetching logs.
   - *Solution:* Engineered a global `console.warn` interceptor in `main.jsx` to silently drop known third-party warnings, and implemented a `useRef` guard in `useSatellites.js` to elegantly block React's double-mount fetch behavior.

---

## 6. DevOps & Deployment Handbook

The repository has been fully Dockerized for enterprise-grade deployment stability.

### 6.1 Docker Architecture
- **Backend Container:** A lightweight `node:20-alpine` image that installs production dependencies and exposes port `3001`.
- **Frontend Container:** A highly optimized Multi-Stage build. Stage 1 uses Node to compile the Vite React app into static files. Stage 2 discards Node entirely and spins up a blazing-fast `nginx:alpine` web server to host the static files on port `80`. A custom `nginx.conf` ensures React Router handles client-side URL routing correctly.

### 6.2 Running Locally via Docker Compose
```bash
# This builds both containers and wires them together via an internal network.
docker compose up --build
```
*Note: The `docker-compose.yml` maps the frontend to port `5173` on your host machine to avoid Windows OS security restrictions on port 80.*

### 6.3 Going Live (Production Cloud Deployment)
1. **Host the Backend:** Deploy the `backend/` folder to a PaaS provider like **Render** or **Railway**. 
   - Ensure the `GROQ_API_KEY` is added to their Environment Variables dashboard.
   - *Crucial:* Once the frontend is deployed, update `backend/src/index.js` CORS settings to only allow your frontend's domain URL.
2. **Host the Frontend:** Deploy the `frontend/` folder to a Static Edge provider like **Vercel** or **Cloudflare Pages**.
   - Ensure the `VITE_API_URL` environment variable is set to the live URL generated by your Backend provider. This binds the frontend to the backend at compile time.
