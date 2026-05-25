import { motion, AnimatePresence } from 'framer-motion'
import { STATUS_COLORS, ORBIT_COLORS } from '../../data/satellites'

function SatelliteDetail({ satellite, missionIntel, intelLoading, intelError, isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && satellite && (
        <motion.aside
          initial={{ x: 380 }}
          animate={{ x: 0 }}
          exit={{ x: 380 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{
            position: 'absolute',
            top: '60px',
            right: '8px',
            bottom: '8px',
            width: '360px',
            zIndex: 40,
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '10px',
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
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}>
                    {satellite.mission}
                  </span>
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

            {/* Status bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: STATUS_COLORS[satellite.status] + '10',
            }}>
              <div style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: STATUS_COLORS[satellite.status],
                boxShadow: `0 0 4px ${STATUS_COLORS[satellite.status]}50`,
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: 500,
                color: STATUS_COLORS[satellite.status],
                textTransform: 'capitalize',
              }}>
                {satellite.status.charAt(0) + satellite.status.slice(1).toLowerCase()}
              </span>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
          }}>
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

            {/* Overview */}
            <Section title="Overview" delay={0.1}>
              <p style={{
                fontSize: '13px',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
              }}>
                {satellite.description}
              </p>
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
                <p style={{
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                }}>
                  {missionIntel}
                </p>
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
          </div>
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
