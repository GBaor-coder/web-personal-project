import React from 'react'

export const ScrewHead = ({ className = '', cross = false }) => {
  return (
    <div 
      className={`screw-head ${cross ? 'cross' : ''} ${className}`} 
      title="Reinforced M3 Chassis Screw"
    />
  )
}
