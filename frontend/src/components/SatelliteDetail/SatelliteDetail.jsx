import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { STATUS_COLORS, ORBIT_COLORS } from '../../data/satellites'

function SatelliteDetail({ satellite, missionIntel, intelLoading, intelError, isOpen, onClose }) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [snapState, setSnapState] = useState('half') // 'collapsed' | 'half' | 'expanded'
  const dragControls = useDragControls()

  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => setWindowHeight(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const snapPoints = useMemo(() => {
    const panelHeight = windowHeight * 0.92
    return {
      expanded: 0,
      half: panelHeight * 0.45,
      collapsed: panelHeight - 145, // 145px visible peek for details
      panelHeight
    }
  }, [windowHeight])

  const getSnapY = useCallback(() => {
    switch (snapState) {
      case 'collapsed': return snapPoints.collapsed
      case 'expanded': return snapPoints.expanded
      default: return snapPoints.half
    }
  }, [snapState, snapPoints])

  return (
    <AnimatePresence
      onExitComplete={() => setSnapState('half')}
    >
      {isOpen && satellite && (
        <motion.aside
          key="satellite-detail"
          initial={isMobile ? { y: snapPoints.panelHeight } : { x: 380, y: 0 }}
          animate={isMobile
            ? { y: getSnapY() }
            : { x: 0, y: 0 }
          }
          exit={isMobile ? { y: snapPoints.panelHeight } : { x: 380, y: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag={isMobile ? 'y' : false}
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{
            top: 0,
            bottom: snapPoints.collapsed
          }}
          dragElastic={0.1}
          onDragEnd={(event, info) => {
            const currentY = getSnapY() + info.offset.y
            const velocity = info.velocity.y
            const projectedY = currentY + velocity * 0.15

            const diffExpanded = Math.abs(projectedY - snapPoints.expanded)
            const diffHalf = Math.abs(projectedY - snapPoints.half)
            const diffCollapsed = Math.abs(projectedY - snapPoints.collapsed)

            const minDiff = Math.min(diffExpanded, diffHalf, diffCollapsed)

            if (projectedY > snapPoints.collapsed + 50) {
              onClose()
            } else if (minDiff === diffExpanded) {
              setSnapState('expanded')
            } else if (minDiff === diffCollapsed) {
              setSnapState('collapsed')
            } else {
              setSnapState('half')
            }
          }}
          style={{
            position: 'absolute',
            background: 'var(--bg-secondary)',
            ...(isMobile ? {
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              height: '92vh',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              borderTop: '1px solid var(--border-subtle)',
              zIndex: 50,
            } : {
              top: '60px',
              right: '8px',
              bottom: '8px',
              width: '360px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              zIndex: 40,
            }),
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Drag handle area — mobile only */}
          {isMobile && (
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{
                padding: '12px 16px 8px',
                cursor: 'grab',
                touchAction: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{
                width: '36px',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--border-default)',
              }} />
            </div>
          )}

          {/* Header */}
          <div style={{
            padding: isMobile ? '4px 16px 16px' : '16px',
            borderBottom: snapState === 'collapsed' && isMobile ? 'none' : '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: snapState === 'collapsed' && isMobile ? '0' : '10px',
            }}>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                  marginBottom: '6px',
                }}>
                  {satellite.name}
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: ORBIT_COLORS[satellite.orbitType],
                    background: ORBIT_COLORS[satellite.orbitType] + '18',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                  }}>
                    {satellite.orbitType}
                  </span>
                  {/* Status badge — always visible, especially in collapsed state */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: STATUS_COLORS[satellite.status] + '15',
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: STATUS_COLORS[satellite.status],
                      boxShadow: `0 0 4px ${STATUS_COLORS[satellite.status]}50`,
                    }} />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: STATUS_COLORS[satellite.status],
                      textTransform: 'capitalize',
                    }}>
                      {satellite.status.charAt(0) + satellite.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close detail panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable content — hidden in collapsed state on mobile */}
          <AnimatePresence>
            {!(isMobile && snapState === 'collapsed') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                }}
              >
                {/* Live telemetry */}
                <Section title="Live telemetry" delay={0}>
                  <DataRow
                    label="Latitude"
                    value={satellite.position ? `${satellite.position.lat.toFixed(4)}°` : '—'}
                    live
                  />
                  <DataRow
                    label="Longitude"
                    value={satellite.position ? `${satellite.position.lng.toFixed(4)}°` : '—'}
                    live
                  />
                  <DataRow
                    label="Altitude"
                    value={satellite.position ? `${Math.round(satellite.position.alt)} km` : '—'}
                    live
                  />
                  <DataRow
                    label="Velocity"
                    value={satellite.position ? `${satellite.position.velocity.toFixed(2)} km/s` : '—'}
                    live
                  />
                </Section>

                {/* Mission info */}
                <Section title="Mission info" delay={0.05}>
                  <DataRow label="Launched" value={satellite.launched} />
                  <DataRow label="Mass" value={`${satellite.mass} kg`} />
                  <DataRow label="Callsign" value={satellite.callsign} />
                </Section>


                {/* AI Mission Summary */}
                <Section title="Mission summary" delay={0.15}>
                  {intelLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="skeleton" style={{ height: '14px', width: '100%' }} />
                      <div className="skeleton" style={{ height: '14px', width: '85%' }} />
                      <div className="skeleton" style={{ height: '14px', width: '70%' }} />
                    </div>
                  )}
                  {!intelLoading && intelError && (
                    <p style={{
                      fontSize: '13px',
                      lineHeight: 1.7,
                      color: 'var(--status-alert)',
                    }}>
                      {intelError}
                    </p>
                  )}
                  {!intelLoading && !intelError && missionIntel && (
                    <>
                      <p style={{
                        fontSize: '13px',
                        lineHeight: 1.7,
                        color: 'var(--text-secondary)',
                      }}>
                        {missionIntel}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginTop: '6px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--accent-subtle)',
                        width: 'fit-content',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                          <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          color: 'var(--accent)',
                          letterSpacing: '0.02em',
                        }}>
                          Generated by AI
                        </span>
                      </div>
                    </>
                  )}
                  {!intelLoading && !intelError && !missionIntel && (
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-tertiary)',
                    }}>
                      No summary available
                    </p>
                  )}
                </Section>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

/* ── Section wrapper ── */
function Section({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        letterSpacing: '0.03em',
        marginBottom: '12px',
        textTransform: 'capitalize',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
    </motion.div>
  )
}

/* ── Data row ── */
function DataRow({ label, value, live }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: '12px',
    }}>
      <span style={{
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--text-tertiary)',
        flexShrink: 0,
      }}>
        {label}
      </span>
      <span className="font-data" style={{
        fontSize: '13px',
        fontWeight: 500,
        color: live ? 'var(--accent-hover)' : 'var(--text-primary)',
        textAlign: 'right',
        letterSpacing: '0.01em',
      }}>
        {value}
      </span>
    </div>
  )
}

export default SatelliteDetail
