import { useState, useEffect, useRef, useMemo } from 'react'

// Range: +/- 2 days in milliseconds (96 hours total)
const MAX_OFFSET_MS = 1 * 24 * 60 * 60 * 1000

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

  const calculateOffset = (e) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    // Calculate percentage (0 to 1)
    let percent = (e.clientX - rect.left) / rect.width
    percent = Math.max(0, Math.min(1, percent)) // Clamp between 0 and 1

    // Map percentage to time offset (-MAX to +MAX)
    const rawOffset = (percent * 2 * MAX_OFFSET_MS) - MAX_OFFSET_MS
    
    // Quantize to 5-minute intervals to eliminate micro-jitters and excessive renders
    const stepMs = 5 * 60 * 1000
    const newOffset = Math.round(rawOffset / stepMs) * stepMs
    
    setLocalOffset(newOffset)
    setTimeOffset(newOffset)
  }

  const handlePointerDown = (e) => {
    setIsScrubbing(true)
    calculateOffset(e)
    e.target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!isScrubbing) return
    calculateOffset(e)
  }

  const handlePointerUp = (e) => {
    setIsScrubbing(false)
    e.target.releasePointerCapture(e.pointerId)
  }

  // Smooth wheel scrolling for high-precision time adjustments
  const handleWheel = (e) => {
    // Prevent default scroll behavior
    e.preventDefault()
    
    // Adjust by 15 minutes per wheel tick
    const adjustment = Math.sign(e.deltaY) *  2* 60 * 1000
    let newOffset = localOffset + adjustment
    
    // Clamp to boundaries
    newOffset = Math.max(-MAX_OFFSET_MS, Math.min(MAX_OFFSET_MS, newOffset))
    
    setLocalOffset(newOffset)
    setTimeOffset(newOffset)
  }

  // Bind non-passive wheel event directly to ref to prevent page scrolling
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onWheel = (e) => handleWheel(e)
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [localOffset])

  // Calculate percentage for visual thumb position
  const percent = ((localOffset + MAX_OFFSET_MS) / (2 * MAX_OFFSET_MS)) * 100

  // Current exact time being scrubbed
  const scrubbedTime = new Date(Date.now() + localOffset)

  // Formatters
  const formatEdgeDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
  }

  const formatTooltip = (date) => {
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).toUpperCase()
  }

  const edgeLeft = new Date(Date.now() - MAX_OFFSET_MS)
  const edgeRight = new Date(Date.now() + MAX_OFFSET_MS)

  // Generate tick marks (12 AM, 8 AM, 12 PM, 5 PM)
  const ticks = useMemo(() => {
    const now = Date.now()
    const startOffset = -MAX_OFFSET_MS
    const endOffset = MAX_OFFSET_MS
    
    const startTime = new Date(now + startOffset)
    // Find midnight of the start day
    const current = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate())
    
    const targetHours = [0, 8, 12, 17] // 12AM, 8AM, 12PM, 5PM
    const generatedTicks = []

    while (current.getTime() <= now + endOffset) {
      for (const h of targetHours) {
        const tickTime = new Date(current)
        tickTime.setHours(h)
        
        const tickOffset = tickTime.getTime() - now
        if (tickOffset >= startOffset && tickOffset <= endOffset) {
          const tickPercent = ((tickOffset + MAX_OFFSET_MS) / (2 * MAX_OFFSET_MS)) * 100
          generatedTicks.push({
            percent: tickPercent,
            isMidnight: h === 0,
            id: tickTime.getTime()
          })
        }
      }
      // Move to next day
      current.setDate(current.getDate() + 1)
    }
    
    return generatedTicks
  }, [])

  return (
    <div style={{
      position: 'absolute',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      width: '90%',
      maxWidth: '600px', // Adjusted size as requested
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      
      {/* Header and Reset Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 4px',
        height: '24px' // fixed height so layout doesn't jump
      }}>
        <div style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif", 
          fontSize: '11px', 
          fontWeight: 700,
          letterSpacing: '0.1em'
        }}>
          TIME SIMULATOR
        </div>
        
        {Math.abs(localOffset) > 1000 && (
          <button
            onClick={() => {
              setLocalOffset(0)
              setTimeOffset(0)
            }}
            style={{
              padding: '4px 12px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#000',
              background: '#E59C4F',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.05em',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => e.target.style.background = '#F6AD60'}
            onMouseLeave={(e) => e.target.style.background = '#E59C4F'}
          >
            RESET TO LIVE
          </button>
        )}
      </div>

      {/* Date Labels (Left and Right) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        color: 'rgba(255, 255, 255, 0.7)',
        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.1em'
      }}>
        <span>{formatEdgeDate(edgeLeft)}</span>
        <span>{formatEdgeDate(edgeRight)}</span>
      </div>

      <div style={{ position: 'relative', height: '40px', display: 'flex', alignItems: 'center' }}>
        {/* Track Area */}
        <div
          ref={trackRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '24px',
            background: 'rgba(26, 26, 30, 0.9)',
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'pointer',
            touchAction: 'none' // Prevent touch scrolling when scrubbing
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Ticks */}
          {ticks.map(tick => (
            <div
              key={tick.id}
              style={{
                position: 'absolute',
                left: `${tick.percent}%`,
                top: 0,
                bottom: 0,
                width: '1px',
                background: tick.isMidnight ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                pointerEvents: 'none'
              }}
            />
          ))}

          {/* Active / Highlighted Window (from 0 to current) */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${Math.min(50, percent)}%`,
            width: `${Math.abs(percent - 50)}%`,
            background: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }} />
          
          {/* Live Center Marker */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '1px',
            background: 'rgba(255,255,255,0.5)',
            pointerEvents: 'none',
          }} />
          
          {/* Scrubber Handle & Tooltip */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            bottom: '-8px',
            left: `${percent}%`,
            width: '2px',
            background: '#E59C4F', // Solid orange bar
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            {/* Tooltip */}
            {(isScrubbing || Math.abs(localOffset) > 1000) && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 12px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ffffff',
                color: '#000000',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}>
                {Math.abs(localOffset) < 1000 ? 'LIVE' : formatTooltip(scrubbedTime)}
                
                {/* Tooltip caret (triangle) */}
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '4px solid #ffffff'
                }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeScrubber
