import * as THREE from 'three'

/**
 * TexturePreloader — singleton service that background-loads textures
 * into THREE.Cache so they're instant when the dashboard mounts.
 *
 * Call `preloadDashboardTextures()` on the Landing page.
 * Call `getTexture(key)` in GlobeView to retrieve cached textures.
 */

// Enable THREE.js built-in cache
THREE.Cache.enabled = true

const TEXTURE_MANIFEST = {
  // Full-res textures (for Command Center dashboard)
  earthDay8k: '/assets/textures/earth_daymap_8k.jpg',
  earthClouds8k: '/assets/textures/earth_clouds_8k.jpg',
  earthBump4k: '/assets/textures/earth_bump_4k.jpg',
  earthNight8k: '/assets/textures/earth_nightmap_8k.jpg',

  // Lightweight textures (for Landing page)
  earthDay2k: '/assets/textures/earth_daymap_2k.jpg',
  earthClouds2k: '/assets/textures/earth_clouds_2k.jpg',
  earthBump2k: '/assets/textures/earth_bump_2k.jpg',
}

const textureCache = new Map()
const loadingPromises = new Map()
const loader = new THREE.TextureLoader()

/**
 * Load a single texture by key — returns a promise.
 * If already loaded, resolves immediately from cache.
 */
function loadTexture(key) {
  // Already loaded
  if (textureCache.has(key)) {
    return Promise.resolve(textureCache.get(key))
  }

  // Already in-flight
  if (loadingPromises.has(key)) {
    return loadingPromises.get(key)
  }

  const url = TEXTURE_MANIFEST[key]
  if (!url) {
    return Promise.reject(new Error(`Unknown texture key: ${key}`))
  }

  const promise = new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        // Configure texture defaults for globe rendering
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = 4 // Good quality without being expensive
        textureCache.set(key, texture)
        loadingPromises.delete(key)
        resolve(texture)
      },
      undefined, // onProgress — not useful for individual textures
      (err) => {
        loadingPromises.delete(key)
        console.warn(`[TexturePreloader] Failed to load ${key}:`, err)
        reject(err)
      }
    )
  })

  loadingPromises.set(key, promise)
  return promise
}

/**
 * Get a texture synchronously if already cached, or null.
 * Use this in render loops where you can't await.
 */
function getTextureSync(key) {
  return textureCache.get(key) || null
}

/**
 * Get or load a texture — returns a Promise<THREE.Texture>.
 */
function getTexture(key) {
  return loadTexture(key)
}

/**
 * Preload all dashboard textures in the background.
 * Uses requestIdleCallback to avoid blocking the main thread.
 * Call this from the Landing page after initial render.
 */
function preloadDashboardTextures() {
  const dashboardKeys = ['earthDay8k', 'earthClouds8k', 'earthBump4k']

  const scheduleWork = typeof requestIdleCallback === 'function'
    ? requestIdleCallback
    : (cb) => setTimeout(cb, 100)

  // Stagger loads to avoid saturating bandwidth
  dashboardKeys.forEach((key, index) => {
    scheduleWork(() => {
      loadTexture(key).catch(() => {
        // Silently fail — dashboard will load its own textures as fallback
      })
    })
  })
}

/**
 * Preload the CommandCenter JS chunk so navigation is instant.
 */
function preloadCommandCenterChunk() {
  const scheduleWork = typeof requestIdleCallback === 'function'
    ? requestIdleCallback
    : (cb) => setTimeout(cb, 200)

  scheduleWork(() => {
    // Vite dynamic import — will be code-split and prefetched
    import('../pages/CommandCenter.jsx').catch(() => {
      // Silent fail — will load normally on navigation
    })
  })
}

export {
  TEXTURE_MANIFEST,
  loadTexture,
  getTexture,
  getTextureSync,
  preloadDashboardTextures,
  preloadCommandCenterChunk,
}
