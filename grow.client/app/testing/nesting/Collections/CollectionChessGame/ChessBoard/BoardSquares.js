import React from 'react';

import Grid from '@mui/material/Unstable_Grid2';

import BoardSquare from './BoardSquare';

const BoardSquares = ({ gameState, boardSize, onMove, canMove }) => {
  // console.log('renderSquares', gameState.lastMove)
  const squares = [];

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      squares.push(
        <BoardSquare 
          key={`${row}-${col}`}
          gameState={gameState}
          boardSize={boardSize} 
          row={row} 
          col={col} 
          value={gameState.board[row][col]} 
          onMove={onMove} 
          canMove={canMove} />
      );
    }
  }

  return (
    <Grid container spacing={0} style={{ width: '70vmin', height: '70vmin' }}>
      {squares}
    </Grid>
  );

};

export default BoardSquares;