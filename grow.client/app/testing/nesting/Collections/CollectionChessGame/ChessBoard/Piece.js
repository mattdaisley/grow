import React from 'react';

import { Paper } from '@mui/material';

import { useDrag } from 'react-dnd';

const Piece = ({ row, col, value, gameState, boardSize }) => {
  const [collected, drag, preview] = useDrag(
    () => ({
      type: value,
      item: { row, col, value },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [gameState],
  )

  if (value === '.') return null;

  if (collected.isDragging) {
    return (
      <div ref={preview}
        style={{
          width: '100%',
          height: '100%',
          fontSize: `${42 / boardSize}vmin`,
          textAlign: 'center',
        }}>{''}
      </div>
    )
  }

  return (
    <>
      <div
        ref={drag} 
        style={{ 
          width: '100%', 
          height: '100%',
          cursor: 'move'
        }}>
        <div
          ref={drag}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            fontSize: `${42 / boardSize}vmin`,
            textAlign: 'center',
            opacity: collected.isDragging ? 0.5 : 1,
          }}>
          {value === '.' ? ' ' : value}
        </div>
      </div>
    </>
  )
}

export default Piece;