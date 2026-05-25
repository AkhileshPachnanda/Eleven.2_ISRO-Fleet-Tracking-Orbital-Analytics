import { useState, useEffect } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'

function TopBar({ satelliteCount, onToggleList, isListOpen, simulatedTime, isLive }) {
  const istTime = simulatedTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const istDate = simulatedTime.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <header
      className="glass"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '52px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 20px',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Left — Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleList}
          aria-label="Toggle satellite list"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            background: isListOpen ? 'var(--accent-muted)' : 'transparent',
            color: isListOpen ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
          }}>
            ISRO Satellites
          </span>
          {!isMobile && (
            <span style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-tertiary)',
            }}>
              {satelliteCount > 0 ? `${satelliteCount} tracked` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Center — Clock + Live badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: isMobile ? 'relative' : 'absolute',
        left: isMobile ? 'auto' : '50%',
        transform: isMobile ? 'none' : 'translateX(-50%)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-pill)',
          background: isLive ? 'rgba(107, 191, 138, 0.1)' : 'rgba(212, 165, 94, 0.1)',
          border: isLive ? '1px solid rgba(107, 191, 138, 0.15)' : '1px solid rgba(212, 165, 94, 0.15)',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isLive ? 'var(--status-nominal)' : 'var(--status-caution)',
            animation: isLive ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: isLive ? 'var(--status-nominal)' : 'var(--status-caution)',
            letterSpacing: '0.02em',
          }}>
            {isLive ? 'Live' : 'Simulated'}
          </span>
        </div>

        <span className="font-data" style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          letterSpacing: '0.02em',
        }}>
          {istTime}
        </span>

        {!isMobile && (
          <span style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
          }}>
            {istDate}
          </span>
        )}
      </div>

      {/* Right — IST label (hidden on mobile) */}
      {!isMobile && (
        <div style={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.02em',
        }}>
          IST
        </div>
      )}
    </header>
  )
}

export default TopBar
