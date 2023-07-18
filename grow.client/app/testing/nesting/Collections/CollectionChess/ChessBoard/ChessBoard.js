'use client';

import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import debounce from 'lodash.debounce';

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';

const ChessBoard = ({ boardSize, gameState }) => {

  // console.log('ChessBoard', gameState.board[0], gameState.board[1])

  // Generate the chessboard squares
  const renderSquares = () => {
    // console.log('renderSquares', gameState.lastMove)
    const squares = [];

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const isEvenRow = row % 2 === 0;
        const isEvenCol = col % 2 === 0;
        const isEvenSquare = (isEvenRow && isEvenCol) || (!isEvenRow && !isEvenCol);
        let color = isEvenSquare ? 'white' : 'lightgray';

        if (Number(gameState.lastMove.startRow) === row && Number(gameState.lastMove.startCol) === col) {
          color = 'rgba(255, 255, 0, 0.5)'
        }

        if (Number(gameState.lastMove.endRow) === row && Number(gameState.lastMove.endCol) === col) {
          color = 'rgba(0, 255, 255, 0.5)'
        }

        squares.push(
          <Grid item key={`${row}${col}`} style={{ flexBasis: `${100 / boardSize}%`, height: 0, paddingBottom: `${100 / boardSize}%`, backgroundColor: color }}>
            <Paper style={{ width: '100%', height: '100%', fontSize: `${10/boardSize}vw`, textAlign: 'center' }}>
              {gameState.board[row][col]}
            </Paper>
          </Grid>
        );
      }
    }

    let borderColor = 'gray'
    const output = gameState.lastMove.output ?? [];
    if (output.length > 0) {
      if (output[0] < 0 || output[0] >= 1 || output[1] < 0 || output[1] >= 1 || output[2] < 0 || output[2] >= 1 || output[3] < 0 || output[3] >= 1) {
        borderColor = 'red';
      } 
    }

    return (
      <Grid container spacing={0} style={{ width: '100%', border: `1px solid ${borderColor}` }}>
        {squares}
      </Grid>
    );
  };

  const memoSquares = useMemo(() => renderSquares(), [JSON.stringify(gameState.board), gameState.currentGeneration]);

  return (
    <Grid container>
      <Grid item xs={8}>
        {/* {memoSquares} */}
        {renderSquares()}
        <div>
          Score: {gameState.lastMove.newScore?.toFixed(8)}
        </div>
        <div>
          Move: {gameState.lastMove.startPiece} {gameState.lastMove.startRow} {gameState.lastMove.startCol} to {gameState.lastMove.endPiece} {gameState.lastMove.endRow} {gameState.lastMove.endCol}
        </div>
      </Grid>
      <Grid item xs={4} style={{height: 500, fontSize: 12}}>
        {/* <div>{gameState.currentGeneration}</div> */}
        {/* <div style={{height:24}}>
          {gameState.lastMove.input?.map(x => Math.round(x*100)/100)}
        </div> */}
        <div>
          Inputs:
          {!!gameState.lastMove.input && gameState.lastMove.input.map((x, i) => (<div key={i}>{x}</div>))}
        </div>
        <div>
          Outputs:
          {!!gameState.lastMove.output && gameState.lastMove.output.map((x, i) => (<div key={i}>{x}</div>))}
        </div>
      </Grid>
    </Grid>
  );
};

export default ChessBoard;