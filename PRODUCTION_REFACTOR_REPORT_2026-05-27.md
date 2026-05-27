# Production Refactor Report

Date: 2026-05-27
Repository: `D:\ISRO-Mission_Control`
Scope: Frontend performance hardening, memory leak prevention, render optimization, codebase cleanup, dead file removal.

## 1. Objective
This pass was executed to prepare the codebase for production under strict constraints:
1. Remove redundancy and dead code.
2. Fix memory leak risks and uncleaned lifecycle work.
3. Reduce main-thread blocking from heavy JS computations.
4. Improve render efficiency and reduce unnecessary rerenders.

---

## 2. High-Level Outcome
- Refactored hot runtime paths in satellite propagation, selection flow, scrubber interactions, and 3D rendering.
- Removed unused/legacy files and dependencies that were no longer in the runtime import graph.
- Reduced avoidable logs and debug interception behaviors.
- Verified frontend production build succeeds after changes.

---

## 3. Detailed Change Log (By File)

### 3.1 `frontend/src/hooks/useSatellites.js`
#### What changed
- Reworked satellite propagation lifecycle from direct synchronous loops into chunked async batch computation.
- Added constants:
  - `POSITION_UPDATE_INTERVAL_MS = 250`
  - `TLE_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000`
  - `POSITION_BATCH_SIZE = 6`
- Added change-detection helper (`hasPositionChanged`) to avoid pointless state updates when position drift is beneath thresholds.
- Added mounted/run guards to prevent stale async computations from committing state after unmount or superseded runs:
  - `isMountedRef`
  - `computeRunIdRef`
- Added deterministic interval cleanup for both position tick and TLE refresh interval refs.
- Removed noisy runtime logging from this hook.

#### Why it matters
- Prevents memory leaks / stale state commits from async work.
- Lowers long synchronous work on main thread by yielding across batches.
- Reduces rerenders when data is semantically unchanged.

#### Constraint mapping
- Memory Management: yes
- Thread Block Reduction: yes
- Render Efficiency: yes

---

### 3.2 `frontend/src/pages/CommandCenter.jsx`
#### What changed
- Replaced selected object state with selected ID state:
  - `selectedSatellite` -> `selectedSatelliteId`
  - `selectedSatellite` is now derived via `useMemo` from latest satellite array.
- Added `AbortController` in mission intel fetch effect to cancel in-flight request on selection change/unmount.
- Effect dependency tightened to `selectedSatellite?.id` to avoid re-fetch on position updates.
- Memoized derived values and handlers:
  - `simulatedTime` (`useMemo`)
  - `handleSelectSatellite`, `handleToggleList`, `handleCloseList`, `handleCloseDetails` (`useCallback`)

#### Why it matters
- Prevents stale-selection bugs and unnecessary subtree updates when satellite objects are recreated.
- Prevents network response race leaks and setState after unmount.

#### Constraint mapping
- Memory Management: yes
- Render Efficiency: yes

---

### 3.3 `frontend/src/components/UI/TimeScrubber.jsx`
#### What changed
- Added `useCallback` for `calculateOffset` and `handleWheel`.
- Converted wheel adjustment to functional state updates to avoid stale closure behavior.
- Fixed wheel event binding churn by binding effect to stable callback, not `localOffset`.
- Pointer capture now uses `currentTarget` and guarded `releasePointerCapture`.

#### Why it matters
- Eliminates repeated listener attach/detach cycles tied to each local offset update.
- Prevents event-target edge-case leaks and improves interaction correctness.

#### Constraint mapping
- Memory Management: yes
- Render Efficiency: yes

---

### 3.4 `frontend/src/hooks/useMediaQuery.js`
#### What changed
- Initial state now resolves from `window.matchMedia(query).matches`.
- Effect dependency simplified to `[query]` (removed self-dependent `matches` loop).
- Added fallback support for legacy listener API (`addListener/removeListener`) where `addEventListener` is unavailable.

#### Why it matters
- Prevents needless effect re-runs and listener rebinding.
- Improves cross-browser stability.

#### Constraint mapping
- Memory Management: yes
- Render Efficiency: yes

---

### 3.5 `frontend/src/components/Globe/GlobeCanvas.jsx`
#### What changed
- Removed unused interaction state and pointer handlers that no longer impacted rendering.
- Added memoized visible satellite list (`useMemo`) instead of filtering inline every render.
- Tightened camera animation trigger dependencies to avoid animation retriggers on fast-changing position values.
- Removed unused prop flow to `GlobeView`.

#### Why it matters
- Reduces per-render work in a hot 3D container.
- Avoids unnecessary camera animation state churn.

#### Constraint mapping
- Render Efficiency: yes

---

### 3.6 `frontend/src/components/Globe/GroundTrack.jsx`
#### What changed
- Fixed memo dependencies to include TLE and `timeOffset` rather than only satellite ID.
- Memoized geometry creation.
- Reduced curve point density from 1000 to 360.

#### Why it matters
- Prevents stale track rendering.
- Significantly reduces geometry workload while preserving visual quality.

#### Constraint mapping
- Thread Block Reduction: yes
- Render Efficiency: yes

---

### 3.7 `frontend/src/components/Globe/SatelliteMarker.jsx`
#### What changed
- Removed dead variable (`showModel`).
- Memoized cloned GLTF scene (`useMemo`) for selected model rendering path.

#### Why it matters
- Reduces object churn and repeated clone cost during rerenders.

#### Constraint mapping
- Render Efficiency: yes

---

### 3.8 `frontend/src/components/Globe/GlobeView.jsx`
#### What changed
- Removed unused prop (`isInteracting`) from signature.

#### Why it matters
- Cleans stale component API and avoids confusion.

#### Constraint mapping
- Tree Shaking & Redundancy: yes

---

### 3.9 `frontend/src/components/Globe/LandingGlobe.jsx`
#### What changed
- Removed unused `useEffect` import.

#### Why it matters
- Dead import cleanup for cleaner bundles and lint hygiene.

#### Constraint mapping
- Tree Shaking & Redundancy: yes

---

### 3.10 `frontend/src/components/TopBar/TopBar.jsx`
#### What changed
- Removed unused imports (`useState`, `useEffect`).

#### Why it matters
- Dead import cleanup.

#### Constraint mapping
- Tree Shaking & Redundancy: yes

---

### 3.11 `frontend/src/lib/api.js`
#### What changed
- Added option-aware header merge in `apiFetch` so caller options can include `signal` and custom headers safely.
- Updated `fetchTLEs` and `fetchMissionIntel` to accept optional request options.
- Removed unused `fetchHealth` export.

#### Why it matters
- Enables clean request cancellation from components.
- Removes unused API surface.

#### Constraint mapping
- Memory Management: yes
- Tree Shaking & Redundancy: yes

---

### 3.12 `frontend/src/lib/celestrak.js`
#### What changed
- Added optional request options passthrough to `fetchTLEs`.
- Removed debug logging and simplified fallback behavior on fetch failure.

#### Why it matters
- Keeps runtime quieter for production.

#### Constraint mapping
- Tree Shaking & Redundancy: yes

---

### 3.13 `frontend/src/lib/texturePreloader.js`
#### What changed
- Removed unused manifest entry: `earthNight8k` (not consumed).
- Removed unused exports and functions:
  - `TEXTURE_MANIFEST`
  - `loadTexture`
  - `getTexture`
  - `getTextureSync`
- Replaced texture load warning log with silent structured rejection.

#### Why it matters
- Shrinks public utility surface to what is actually used.
- Removes non-essential console noise.

#### Constraint mapping
- Tree Shaking & Redundancy: yes

---

### 3.14 `frontend/src/main.jsx`
#### What changed
- Removed global `console.warn` interceptor that filtered third-party warnings.

#### Why it matters
- Avoids mutating global console behavior in production runtime.

#### Constraint mapping
- Tree Shaking & Redundancy: yes

---

### 3.15 `backend/src/index.js`
#### What changed
- Removed startup banner `console.log` block.

#### Why it matters
- Removes ornamental debug-style runtime output.

#### Constraint mapping
- Tree Shaking & Redundancy: yes

---

### 3.16 `backend/src/services/celestrak.js`
#### What changed
- Removed per-satellite warning logs on failed fetches in batch mode.

#### Why it matters
- Prevents log noise amplification under partial external failure conditions.

#### Constraint mapping
- Tree Shaking & Redundancy: yes

---

## 4. Files Deleted (Redundant / Legacy / Debug)

### 4.1 Legacy UI components (not used in current app route graph)
- `frontend/src/components/DetailPanel/DetailPanel.jsx`
- `frontend/src/components/Sidebar/sidebar.jsx`
- `frontend/src/components/Globe/globePanel.jsx`

### 4.2 One-off scripts / generated artifacts not used by runtime
- `add_specific.js`
- `build_sats.js`
- `generate.js`
- `get_sats.js`
- `ind.json`
- `ind_sats.json`
- `frontend/scripts/generate_textures.js`

### 4.3 Source texture assets replaced by production public textures
- `frontend/src/assets/8k_earth_daymap.jpg`
- `frontend/src/assets/8k_earth_clouds.jpg`
- `frontend/src/assets/8k_earth_nightmap.jpg`
- `frontend/src/assets/8081_earthbump4k.jpg`

---

## 5. Dependencies Removed

From `frontend/package.json` and lockfile:
- `@radix-ui/react-dialog`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`
- `react-force-graph-2d`
- `sharp` (devDependency)

Rationale:
- No active imports in current runtime source.
- Related generator script removed.

---

## 6. Verification Performed

### 6.1 Build
- Command: `frontend\\node_modules\\.bin\\vite.cmd build`
- Result: Success.

### 6.2 Syntax checks
- `node --check backend/src/index.js` -> pass
- `node --check backend/src/services/celestrak.js` -> pass
- `node --check frontend/src/hooks/useSatellites.js` -> pass

### 6.3 Lint
- Attempted ESLint run failed due environment/module resolution (`@eslint/js` from root-level config path in this shell context).
- This is a tooling-path/environment issue, not a compile failure in modified source.

---

## 7. Constraint-by-Constraint Compliance Summary

### 7.1 Tree Shaking & Redundancy
Completed:
- Removed unused imports and dead variables in multiple files.
- Removed debug console interception and non-essential logs.
- Deleted legacy unused components/scripts/assets.
- Pruned unused dependencies.

### 7.2 Memory Management
Completed:
- Added abort/cancellation for async intel fetches.
- Added robust mount/run guards in satellite computation pipeline.
- Fixed lifecycle cleanup for intervals and listener bindings.

### 7.3 Thread Block Reduction
Completed:
- Chunked satellite propagation compute loop into async batches.
- Reduced propagation update frequency (100ms -> 250ms).
- Reduced ground-track curve density and memoized geometry.

Further recommendation:
- Move propagation into a Web Worker for full isolation from main thread.

### 7.4 Render Efficiency
Completed:
- Memoized selection-derived data and handlers.
- Converted selection state to stable ID-based lookup.
- Removed unnecessary filtering/work inside render paths.
- Avoided state commits when position change is beneath thresholds.

---

## 8. Remaining Performance Risk and Next Step

### Largest remaining hot spot
- Satellite SGP4 propagation still runs on main thread (now chunked, but not worker-isolated).

### Recommended next production step
1. Implement Worker-based propagation service:
   - Move `getCurrentPosition` batch calculations off main thread.
   - Keep UI thread for rendering and interaction only.
2. Use transferable payloads or compact objects for worker responses.
3. Gate worker update frequency based on camera interaction and visibility.

---

## 9. Git Working Tree Notes
- `handover.md` is present as an untracked file and was not modified by this refactor.
- All deletions/edits listed above were applied directly in workspace.

---

## 10. Final Deliverables in This Pass
- Production-refactored source files with lifecycle + render + thread optimizations.
- Redundant/legacy/debug files deleted.
- Unused dependencies removed from frontend manifest/lock.
- Build verification completed successfully.
