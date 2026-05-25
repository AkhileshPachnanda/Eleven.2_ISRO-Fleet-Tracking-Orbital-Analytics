import { useState, useEffect, useRef } from 'react'

// Range: +/- 5 days in milliseconds
const MAX_OFFSET_MS = 5 * 24 * 60 * 60 * 1000

function TimeScrubber({ timeOffset, setTimeOffset }) {
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [localOffset, setLocalOffset] = useState(timeOffset)
  const trackRef = useRef(null)

  // Sync local state when not actively scrubbing
  useEffect(() => {
    if (!isScrubbing) {
      setLocalOffset(timeOffset)
    }
  }, [timeOffset, isScrubbing])

  const handlePointerDown = (e) => {
    setIsScrubbing(true)
    handlePointerMove(e)
    e.target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!isScrubbing || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    // Calculate percentage (0 to 1)
    let percent = (e.clientX - rect.left) / rect.width
    percent = Math.max(0, Math.min(1, percent)) // Clamp between 0 and 1

    // Map percentage to time offset (-MAX to +MAX)
    const newOffset = (percent * 2 * MAX_OFFSET_MS) - MAX_OFFSET_MS
    setLocalOffset(newOffset)
    setTimeOffset(newOffset)
  }

  const handlePointerUp = (e) => {
    setIsScrubbing(false)
    e.target.releasePointerCapture(e.pointerId)
  }

  // Calculate percentage for visual thumb position
  const percent = ((localOffset + MAX_OFFSET_MS) / (2 * MAX_OFFSET_MS)) * 100

  // Format labels
  const formatOffset = (ms) => {
    if (Math.abs(ms) < 1000) return 'Live'
    const days = ms / (1000 * 60 * 60 * 24)
    if (Math.abs(days) < 0.1) return 'Near Live'
    return `${days > 0 ? '+' : ''}${days.toFixed(1)} Days`
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      width: '90%',
      maxWidth: '600px',
      background: 'rgba(26, 26, 30, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
        }}>
          Time Simulator
        </span>
        
        {Math.abs(localOffset) > 1000 && (
          <button
            onClick={() => setTimeOffset(0)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
          >
            Reset to Live
          </button>
        )}
      </div>

      <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}>
        {/* Track */}
        <div
          ref={trackRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '4px',
            background: 'var(--bg-elevated)',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Active Track (center to thumb) */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${Math.min(50, percent)}%`,
            width: `${Math.abs(percent - 50)}%`,
            background: 'var(--accent)',
            borderRadius: '2px',
            opacity: 0.6,
          }} />
          
          {/* Thumb */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${percent}%`,
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#ffffff',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }} />
          
          {/* Center Marker */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '2px',
            height: '10px',
            background: 'var(--text-tertiary)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--text-tertiary)',
        fontWeight: 500,
        fontFamily: 'var(--font-data)',
      }}>
        <span>-5 Days</span>
        <span style={{ color: Math.abs(localOffset) > 1000 ? 'var(--accent)' : 'inherit' }}>
          {formatOffset(localOffset)}
        </span>
        <span>+5 Days</span>
      </div>
    </div>
  )
}

export default TimeScrubber
