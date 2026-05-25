import { ORBIT_COLORS } from '../../data/satellites'

const LEGEND_ITEMS = [
  { label: 'LEO', full: 'Low Earth Orbit', color: ORBIT_COLORS.LEO },
  { label: 'GEO', full: 'Geostationary Orbit', color: ORBIT_COLORS.GEO },
  { label: 'SSO', full: 'Sun-Synchronous Orbit', color: ORBIT_COLORS.SSO },
]

function OrbitLegend() {
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
