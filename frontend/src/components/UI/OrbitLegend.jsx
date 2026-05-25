import { ORBIT_COLORS } from '../../data/satellites'

const LEGEND_ITEMS = [
  { label: 'LEO', color: ORBIT_COLORS.LEO },
  { label: 'GEO', color: ORBIT_COLORS.GEO },
  { label: 'SSO', color: ORBIT_COLORS.SSO },
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
      gap: '6px',
      alignItems: 'flex-end',
    }}>
      {LEGEND_ITEMS.map(({ label, color }) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            opacity: 0.65,
          }}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
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
