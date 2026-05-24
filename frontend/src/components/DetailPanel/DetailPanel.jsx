import { STATUS_COLORS, ORBIT_COLORS } from '../../data/satellites'

function DetailPanel({ satellite, missionIntel, intelLoading, intelError }) {
  return (
    <aside style={{
      width: '320px',
      height: '100%',
      flexShrink: 0,
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>

      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          fontFamily: 'Space Grotesk',
          fontSize: '0.6rem',
          letterSpacing: '0.25em',
          color: 'var(--primary)',
          marginBottom: '0.25rem'
        }}>
          MISSION BRIEFING
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '0.55rem',
          letterSpacing: '0.15em',
          color: 'var(--text-ghost)'
        }}>
          {satellite ? satellite.callsign : 'NO TARGET SELECTED'}
        </div>
      </div>

      {/* Empty state */}
      {!satellite && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '1px solid var(--border)',
            transform: 'rotate(45deg)'
          }} />
          <p style={{
            fontFamily: 'JetBrains Mono',
            fontSize: '0.55rem',
            letterSpacing: '0.15em',
            color: 'var(--text-ghost)',
            textAlign: 'center',
            lineHeight: 2
          }}>
            SELECT A SATELLITE<br />FROM THE MANIFEST
          </p>
        </div>
      )}

      {/* Selected satellite content */}
      {satellite && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border) transparent'
        }}>

          {/* Mission name block */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {/* Status diamond */}
              <div style={{
                width: '10px',
                height: '10px',
                flexShrink: 0,
                backgroundColor: STATUS_COLORS[satellite.status],
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }} />
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.55rem',
                letterSpacing: '0.2em',
                color: STATUS_COLORS[satellite.status]
              }}>
                {satellite.status}
              </span>
            </div>

            <h2 style={{
              fontFamily: 'Space Grotesk',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
              lineHeight: 1.2
            }}>
              {satellite.name}
            </h2>

            <div style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              color: ORBIT_COLORS[satellite.orbitType]
            }}>
              {satellite.orbitType} // {satellite.mission}
            </div>
          </div>

          {/* Live telemetry */}
          <Section title="REAL-TIME TELEMETRY">
            <DataRow
              label="LATITUDE"
              value={satellite.position
                ? `${satellite.position.lat.toFixed(4)}°`
                : '---'
              }
              live
            />
            <DataRow
              label="LONGITUDE"
              value={satellite.position
                ? `${satellite.position.lng.toFixed(4)}°`
                : '---'
              }
              live
            />
            <DataRow
              label="ALTITUDE"
              value={satellite.position
                ? `${Math.round(satellite.position.alt)} KM`
                : '---'
              }
              live
            />
            <DataRow
              label="VELOCITY"
              value={satellite.position
                ? `${satellite.position.velocity.toFixed(2)} KM/S`
                : '---'
              }
              live
            />
          </Section>

          {/* Mission data */}
          <Section title="MISSION DATA">
            <DataRow label="LAUNCHED" value={satellite.launched} />
            <DataRow label="MASS" value={`${satellite.mass} KG`} />
            <DataRow label="CALLSIGN" value={satellite.callsign} />
          </Section>

          {/* Mission description */}
          <Section title="MISSION OVERVIEW">
            <p style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '0.6rem',
              lineHeight: 1.8,
              color: 'var(--text-dim)',
              letterSpacing: '0.03em'
            }}>
              {satellite.description}
            </p>
          </Section>

          {/* AI summary */}
          <Section title="MISSION SUMMARY">
            {intelLoading && (
              <p style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.58rem',
                lineHeight: 1.8,
                color: 'var(--primary)',
                letterSpacing: '0.05em'
              }}>
                GENERATING SUMMARY...
              </p>
            )}
            {!intelLoading && intelError && (
              <p style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.58rem',
                lineHeight: 1.8,
                color: '#ff7b7b',
                letterSpacing: '0.03em'
              }}>
                {intelError}
              </p>
            )}
            {!intelLoading && !intelError && missionIntel && (
              <p style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.6rem',
                lineHeight: 1.8,
                color: 'var(--text-dim)',
                letterSpacing: '0.03em'
              }}>
                {missionIntel}
              </p>
            )}
            {!intelLoading && !intelError && !missionIntel && (
              <p style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.58rem',
                lineHeight: 1.8,
                color: 'var(--text-ghost)',
                letterSpacing: '0.05em'
              }}>
                NO SUMMARY AVAILABLE
              </p>
            )}
          </Section>

          {/* Lock confirmed indicator */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              border: '1px dashed var(--primary)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              animation: 'spin 8s linear infinite'
            }} />
            <span style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              color: 'var(--primary)'
            }}>
              LOCK CONFIRMED
            </span>
          </div>
        </div>
      )}
    </aside>
  )
}

// Reusable section wrapper
function Section({ title, children }) {
  return (
    <div style={{
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{
        fontFamily: 'Space Grotesk',
        fontSize: '0.55rem',
        letterSpacing: '0.2em',
        color: 'var(--text-ghost)',
        marginBottom: '1rem'
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {children}
      </div>
    </div>
  )
}

// Reusable data row
function DataRow({ label, value, live }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: '1rem'
    }}>
      <span style={{
        fontFamily: 'Space Grotesk',
        fontSize: '0.55rem',
        letterSpacing: '0.15em',
        color: 'var(--text-ghost)',
        flexShrink: 0
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'JetBrains Mono',
        fontSize: '0.7rem',
        color: live ? 'var(--secondary)' : 'var(--text-primary)',
        letterSpacing: '0.05em',
        textAlign: 'right'
      }}>
        {value}
      </span>
    </div>
  )
}

export default DetailPanel
