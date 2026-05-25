import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LandingGlobe from '../components/Globe/LandingGlobe'

function Landing() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Globe — background, slightly offset downward */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }}>
        <LandingGlobe />
      </div>

      {/* Gradient overlay — helps text readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        background: `
          radial-gradient(ellipse at center 40%, transparent 30%, var(--bg-primary) 75%),
          linear-gradient(to bottom, var(--bg-primary) 0%, transparent 20%, transparent 70%, var(--bg-primary) 100%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Top nav */}
      <nav style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          ISRO
        </span>
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
        }}>
          <a
            href="https://www.isro.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
          >
            About ISRO
          </a>
        </div>
      </nav>

      {/* Hero content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--accent)',
            letterSpacing: '0.08em',
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}
        >
          Indian Space Research Organisation
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            marginBottom: '16px',
          }}
        >
          India's eyes<br />in orbit
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            fontSize: '16px',
            fontWeight: 400,
            color: 'var(--text-secondary)',
            maxWidth: '400px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          Track every ISRO satellite in real-time.
          Live orbital positions, telemetry, and mission data.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/control')}
          style={{
            padding: '12px 32px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'inherit',
            background: 'var(--accent)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'background 150ms ease',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => e.target.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.target.style.background = 'var(--accent)'}
        >
          Explore →
        </motion.button>
      </div>

      {/* Bottom credit */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          letterSpacing: '0.02em',
        }}
      >
        Data sourced from CelesTrak • Positions updated live
      </motion.p>
    </motion.div>
  )
}

export default Landing