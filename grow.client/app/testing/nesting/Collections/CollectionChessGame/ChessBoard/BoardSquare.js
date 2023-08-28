import React from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Piece from './Piece';
import { useDrop } from 'react-dnd';

const BoardSquare = ({ row, col, gameState, boardSize, value, onMove, canMove }) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ['♜', '♞', '♝', '♛', '♚', '♟', '♙', '♖', '♘', '♗', '♕', '♔'],
      canDrop: (item) => { return canMove(gameState, item.row, item.col, row, col)},
      drop: (item) => { onMove(gameState, item.row, item.col, row, col) },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [gameState],
  )

  const isEvenRow = row % 2 === 0;
  const isEvenCol = col % 2 === 0;
  const isEvenSquare = (isEvenRow && isEvenCol) || (!isEvenRow && !isEvenCol);
  let color = isEvenSquare ? 'white' : 'lightgray';

  // if (Number(gameState.lastMove.startRow) === row && Number(gameState.lastMove.startCol) === col) {
  //   color = 'rgba(255, 255, 0, 0.5)'
  // }

  // if (Number(gameState.lastMove.endRow) === row && Number(gameState.lastMove.endCol) === col) {
  //   color = 'rgba(0, 255, 255, 0.5)'
  // }

  return (
    <Grid item
      ref={drop} 
      style={{ flexBasis: `${100 / boardSize}%`, width: `${100 / boardSize}%`, height: `${100 / boardSize}%`, backgroundColor: color }}>
      <Piece row={row} col={col} value={value} gameState={gameState} boardSize={boardSize} />
    </Grid>
  );
};

export default BoardSquare;