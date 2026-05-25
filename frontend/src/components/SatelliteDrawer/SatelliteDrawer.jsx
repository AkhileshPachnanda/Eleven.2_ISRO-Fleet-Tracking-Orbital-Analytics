import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STATUS_COLORS, ORBIT_COLORS } from '../../data/satellites'

const FILTERS = ['All', 'LEO', 'GEO', 'SSO']

function SatelliteDrawer({ satellites = [], loading, selectedSatellite, onSelectSatellite, isOpen, onClose }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = satellites
    if (filter !== 'All') {
      result = result.filter(s => s.orbitType === filter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.callsign.toLowerCase().includes(q) ||
        s.mission.toLowerCase().includes(q)
      )
    }
    return result
  }, [satellites, filter, search])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -340 }}
          animate={{ x: 0 }}
          exit={{ x: -340 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{
            position: 'absolute',
            top: '60px',
            left: '8px',
            bottom: '8px',
            width: '320px',
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
            padding: '16px 16px 12px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              Satellites
            </h2>
            <button
              onClick={onClose}
              aria-label="Close satellite list"
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

          {/* Search */}
          <div style={{ padding: '12px 16px 8px' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-tertiary)"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search satellites..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>
          </div>

          {/* Filter chips */}
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '4px 16px 12px',
          }}>
            {FILTERS.map(f => {
              const isActive = filter === f
              const chipColor = f === 'All' ? 'var(--accent)' : ORBIT_COLORS[f] || 'var(--accent)'
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    borderRadius: 'var(--radius-pill)',
                    border: `1px solid ${isActive ? chipColor + '40' : 'var(--border-default)'}`,
                    background: isActive ? chipColor + '18' : 'transparent',
                    color: isActive ? chipColor : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    letterSpacing: '0.01em',
                  }}
                >
                  {f}
                </button>
              )
            })}
          </div>

          {/* Satellite list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 8px 8px',
          }}>
            {loading && (
              <div style={{ padding: '24px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-md)' }} />
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
              }}>
                No satellites found
              </div>
            )}

            {!loading && filtered.map((sat, index) => {
              const isSelected = selectedSatellite?.id === sat.id
              const statusColor = STATUS_COLORS[sat.status]
              const orbitColor = ORBIT_COLORS[sat.orbitType]

              return (
                <motion.button
                  key={sat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  onClick={() => onSelectSatellite(sat)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '2px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    borderLeft: `3px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                    background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 120ms ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-elevated)'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Status dot */}
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    marginTop: '5px',
                    background: statusColor,
                    boxShadow: `0 0 4px ${statusColor}50`,
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name */}
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {sat.name}
                    </div>

                    {/* Tags row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        color: orbitColor,
                        background: orbitColor + '15',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-pill)',
                      }}>
                        {sat.orbitType}
                      </span>
                      <span className="font-data" style={{
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                      }}>
                        {sat.position
                          ? `${Math.round(sat.position.alt)} km`
                          : '— km'
                        }
                      </span>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-tertiary)',
            }}>
              Source: CelesTrak
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-tertiary)',
            }}>
              {filtered.length} satellite{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export default SatelliteDrawer
