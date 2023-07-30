'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

import debounce from 'lodash.debounce';
import cloneDeep from 'lodash.clonedeep';

import Paper from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

import ChessBoard from "./ChessBoard/ChessBoard";
import { ShowCollectionLabel } from "../../ShowCollection";
import { useSubscription } from '../../useSubscription';
import { useGridCollectionColumns } from '../useGridCollectionColumns';
import logger from '../../../../../services/logger';


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
  // board: [
  //   ['♜', '.', '.', '.', '.', '.', '.', '♜'],
  //   ['.', '♟︎', '.', '♟︎', '.', '♟︎', '.', '♟︎'],
  //   ['.', '.', '.', '.', '.', '.', '.', '.'],
  //   ['.', '.', '.', '.', '.', '.', '.', '.'],
  //   ['.', '.', '.', '.', '.', '.', '.', '.'],
  //   ['.', '.', '.', '.', '.', '.', '.', '.'],
  //   ['♙', '.', '♙', '.', '♙', '.', '♙', '.'],
  //   ['♖', '.', '.', '.', '.', '.', '.', '♖'],
  // ],
  // board: [
  //   ['♜', '♟︎', '♟︎', '♜'],
  //   ['♜', '♟︎', '♟︎', '♜'],
  //   ['♖', '♙', '♙', '♖'],
  //   ['♖', '♙', '♙', '♖'],
  // ],
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

  return (
    <>
      <Paper sx={{
        width: '100%',
        py: 2, px: 2
      }}>

          <Grid container spacing={1.5}>
            <Grid sx={6}>
              <ChessBoard boardSize={BOARD_SIZE} gameState={game} />
            </Grid>
          </Grid>
      </Paper>

    </>
  );
}