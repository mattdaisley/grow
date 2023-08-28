'use client';

import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import debounce from 'lodash.debounce';

import Grid from '@mui/material/Unstable_Grid2';

import { DndProvider } from 'react-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'
import { HTML5Backend } from 'react-dnd-html5-backend'

import BoardSquare from './BoardSquare';
import BoardSquares from './BoardSquares';

const ChessBoard = ({ boardSize, gameState, onMove, canMove }) => {

  // console.log('ChessBoard', gameState.board[0], gameState.board[1])

  // const opts = { enableMouseEvents : true }
  function getSquareName(row, col) {
    const file = String.fromCharCode('a'.charCodeAt(0) + col);
    const rank = 8 - row;
    return `${file}${rank}`;
  }

  return (
    <Grid container>
      <Grid item xs={6}>
        {/* {memoSquares} */}
        <DndProvider backend={HTML5Backend}>
          <BoardSquares gameState={gameState} boardSize={boardSize} onMove={onMove} canMove={canMove} />
        </DndProvider>
        {/* <div>
          Score: {gameState.lastMove.newScore?.toFixed(8)}
        </div> */}
      </Grid>
      <Grid item xs={4} style={{ height: 500, fontSize: 18 }}>
        {gameState.lastMove.startPiece && (<div>
          Move: {gameState.lastMove.startPiece} {getSquareName(gameState.lastMove.startRow, gameState.lastMove.startCol)} to {gameState.lastMove.endPiece === '.' ? '' : gameState.lastMove.endPiece} {getSquareName(gameState.lastMove.endRow, gameState.lastMove.endCol)}
        </div>)}
        {/* <div>{gameState.currentGeneration}</div> */}
        {/* <div style={{height:24}}>
          {gameState.lastMove.input?.map(x => Math.round(x*100)/100)}
        </div> */}
        {/* <div>
          Inputs:
          {!!gameState.lastMove.input && gameState.lastMove.input.map((x, i) => (<div key={i}>{x}</div>))}
        </div>
        <div>
          Outputs:
          {!!gameState.lastMove.output && gameState.lastMove.output.map((x, i) => (<div key={i}>{x}</div>))}
        </div> */}
      </Grid>
    </Grid>
  );
};

export default ChessBoard;