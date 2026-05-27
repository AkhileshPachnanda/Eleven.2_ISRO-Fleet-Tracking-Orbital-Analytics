import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ORBIT_COLORS } from '../../data/satellites'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const LEGEND_ITEMS = [
  { label: 'LEO', full: 'Low Earth Orbit', color: ORBIT_COLORS.LEO },
  { label: 'GEO', full: 'Geostationary Orbit', color: ORBIT_COLORS.GEO },
  { label: 'SSO', full: 'Sun-Synchronous Orbit', color: ORBIT_COLORS.SSO },
]

function OrbitLegend() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isOpen, setIsOpen] = useState(false)

  if (isMobile) {
    return (
      <div style={{
        position: 'absolute',
        bottom: '140px',
        right: '16px',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}>
        {/* Floating Legend Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, originY: 1, originX: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                background: 'rgba(26, 26, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                pointerEvents: 'auto',
              }}
            >
              {LEGEND_ITEMS.map(({ label, full, color }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    letterSpacing: '0.01em',
                  }}>
                    {full}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: color,
                    letterSpacing: '0.02em',
                    minWidth: '28px',
                    textAlign: 'right',
                  }}>
                    {label}
                  </span>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 6px ${color}40`,
                  }} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle orbit legend"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isOpen ? '#242424ff' : 'rgba(26, 26, 30, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 150ms ease',
          }}
        >
          {isOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3" cy="6" r="1.5" fill="currentColor" />
              <circle cx="3" cy="12" r="1.5" fill="currentColor" />
              <circle cx="3" cy="18" r="1.5" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    )
  }

  // Desktop view
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 20,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      alignItems: 'flex-end',
    }}>
      {LEGEND_ITEMS.map(({ label, full, color }) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            opacity: 0.7,
          }}
        >
          <span style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.01em',
          }}>
            {full}
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: color,
            letterSpacing: '0.02em',
            minWidth: '28px',
            textAlign: 'right',
          }}>
            {label}
          </span>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}40`,
          }} />
        </div>
      ))}
    </div>
  )
}

export default OrbitLegend
