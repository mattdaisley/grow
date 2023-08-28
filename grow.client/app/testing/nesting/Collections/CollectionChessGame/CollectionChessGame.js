'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

import cloneDeep from 'lodash.clonedeep';

import Paper from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

import ChessBoard from "./ChessBoard/ChessBoard";

import { canMovePawn, canMoveKing, canMoveQueen, canMoveBishop, canMoveKnight, canMoveRook, isWhite, isBlack, moveIsEnPassant } from './game.engine';


const MAX_BOARD_SIZE = 8;
const BOARD_SIZE = 8; // 4x4. 8x8 standard board would be just 8

const NUMERICAL_INPUTS = BOARD_SIZE * BOARD_SIZE;
const CATEGORICAL_INPUTS = 2;

const INPUTS = NUMERICAL_INPUTS + CATEGORICAL_INPUTS; // pieces , turn code , fullmove number , board size
// const INPUTS = 5;
// const INPUTS = 35;
const OUTPUTS = 4;

const POPSIZE = 300;
const ELITISM = Math.ceil(0.1 * POPSIZE);
const MUTATION_RATE = 0.5;
// const START_HIDDEN_SIZE = INPUTS / 2;
const START_HIDDEN_SIZE = INPUTS + 1;
const MAX_ITERATIONS = 25;

const initialGameState = {
  board: [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
  ],
  turn: 'white', // 'white' == 0 or 'black' == 1
  castling: {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
  },
  enPassantTarget: null,
  halfmoveClock: 0,
  fullmoveNumber: 0,

  currentGeneration: 0,
  lastMove: {}
};

export default function CollectionChessGame({ pageProps, collectionProps }) {

  const [game, setGame] = useState(initialGameState);

  const handleMove = (gameState, startRow, startCol, endRow, endCol) => {
    const startPiece = gameState.board[startRow][startCol];
    const endPiece = gameState.board[endRow][endCol];

    const newBoard = cloneDeep(gameState.board);

    if (moveIsEnPassant(gameState, startRow, endRow, startCol, endCol)) {
      newBoard[startRow][endCol] = '.';
    }

    newBoard[startRow][startCol] = '.';
    newBoard[endRow][endCol] = startPiece;

    const newTurn = game.turn === 'white' ? 'black' : 'white';

    const newHalfmoveClock = game.halfmoveClock + 1;
    const newFullmoveNumber = game.fullmoveNumber + (game.turn === 'black' ? 1 : 0);
    const newLastMove = { startRow, startCol, endRow, endCol, startPiece, endPiece, newScore: 0, input: [], output: []  }

    const newGameState = {
      ...gameState,
      board: newBoard,
      turn: newTurn,
      halfmoveClock: newHalfmoveClock,
      fullmoveNumber: newFullmoveNumber,
      lastMove: newLastMove
    }

    setGame(newGameState);
  }

  const canMove = (gameState, startRow, startCol, endRow, endCol) => {

    const startPiece = gameState.board[startRow][startCol];
    const endPiece = gameState.board[endRow][endCol];

    if (isWhite(startPiece) && isWhite(endPiece)) return false;
    if (isBlack(startPiece) && isBlack(endPiece)) return false;

    switch (startPiece) {
      case '♛':
      case '♕':
        return canMoveQueen(gameState, startRow, endRow, startCol, endCol)
      case '♚':
      case '♔':
        return canMoveKing(gameState, startRow, endRow, startCol, endCol)
      case '♜':
      case '♖':
        return canMoveRook(gameState, startRow, endRow, startCol, endCol)
      case '♞':
      case '♘':
        return canMoveKnight(gameState, startRow, endRow, startCol, endCol)
      case '♝':
      case '♗':
        return canMoveBishop(gameState, startRow, endRow, startCol, endCol)
      case '♟':
      case '♙':
        return canMovePawn(gameState, startRow, endRow, startCol, endCol)
    }

    return true;
  }

  return (
    <>
      <Paper sx={{
        width: '100%',
        py: 2, px: 2
      }}>

        <Grid container spacing={1.5}>
          <Grid xs={12}>
            <ChessBoard boardSize={BOARD_SIZE} gameState={game} onMove={handleMove} canMove={canMove} />
          </Grid>
        </Grid>
      </Paper>

    </>
  );
}