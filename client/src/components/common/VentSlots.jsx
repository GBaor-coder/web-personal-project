import React from 'react'

export const VentSlots = ({ count = 4, className = '' }) => {
  return (
    <div className={`vent-slots ${className}`} aria-hidden="true" title="Thermal dissipation vents">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="vent-slot" />
      ))}
    </div>
  )
}
