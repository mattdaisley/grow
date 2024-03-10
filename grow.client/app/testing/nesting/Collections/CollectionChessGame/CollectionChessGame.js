'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

import cloneDeep from 'lodash.clonedeep';

import Paper from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

import ChessBoard from "./ChessBoard/ChessBoard";

import { canMovePawn, canMoveKing, canMoveQueen, canMoveBishop, canMoveKnight, canMoveRook, isWhite, isBlack, moveIsEnPassant, getSquareNameFromRowCol, getRowColFromSquareName } from './game.engine';
import { useSubscription } from '../../useSubscription';
import logger from '../../../../../services/logger';


const MAX_BOARD_SIZE = 8;
const BOARD_SIZE = 8; // 4x4. 8x8 standard board would be just 8

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
  turn: 'w', 
  castling: {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
  },
  enPassantTarget: null,
  halfmoveClock: 0,
  fullmoveNumber: 0,

  lastMove: {}
};

export default function CollectionChessGame({ pageProps, collectionProps }) {

  const collectionFields = useSubscription({ ...pageProps, itemKey: collectionProps.keyPrefix, keyPrefix: undefined });
  const contextCollectionFields = useSubscription({ ...pageProps, itemKey: collectionProps.contextKey, keyPrefix: undefined });
  const sortOrderFieldId = useSubscription({ ...pageProps, itemKey: pageProps.keyPrefix, keyPrefix: undefined, searchSuffix: 'sort-order' });
  const sortOrderField = pageProps.itemsMethods.getTreeMapItem(`fields.${sortOrderFieldId}`)
  const sortOrder = sortOrderField?.get('name') ?? sortOrderFieldId ?? 'created_date'

  logger.log('CollectionChessGame', { pageProps, collectionProps, collectionFields, contextCollectionFields, sortOrderFieldId, sortOrder });

  const rows = useMemo(() => getCollectionRows(contextCollectionFields, sortOrder), [contextCollectionFields?.size, sortOrder])

  const [game, setGame] = useState(initialGameState);

  const handleMove = (gameState, startRow, startCol, endRow, endCol) => {

    const startPiece = gameState.board[startRow][startCol];
    const startSquare = getSquareNameFromRowCol(startRow, startCol);
    const endSquare = getSquareNameFromRowCol(endRow, endCol);
    const player = gameState.turn;
    let capture = gameState.board[endRow][endCol] !== '.' ? '1' : '0';

    if (moveIsEnPassant(gameState, startRow, endRow, startCol, endCol)) {
      capture = '1'
    }

    const itemKey = collectionProps.contextKey;

    const itemsToAdd = { [itemKey]: { start_square: startSquare, end_square: endSquare, player, capture, startPiece } };

    pageProps.itemsMethods.addItems(itemKey, itemsToAdd);
  }

  const canMove = (gameState, startRow, startCol, endRow, endCol) => {

    const startPiece = gameState.board[startRow][startCol];
    const endPiece = gameState.board[endRow][endCol];

    if (isWhite(startPiece) && gameState.turn !== 'w') return false;
    if (isBlack(startPiece) && gameState.turn !== 'b') return false;

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

  useEffect(() => {
    logger.log('CollectionChessGame useEffect', { rows, game })

    const newGameState = processMoves(initialGameState, rows);
    setGame(newGameState);

  }, [JSON.stringify(game), rows.length])

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

function getCollectionRows(contextCollectionFields, sortOrder) {
  let rows = []

  if (contextCollectionFields === undefined) {
    return rows;
  }

  contextCollectionFields.forEach((collectionField, collectionFieldKey) => {
    const row = { id: collectionFieldKey }
    collectionField.forEach((fieldValue, fieldKey) => {
      row[fieldKey] = fieldValue ?? ""
    });

    rows.push(row)
  });

  rows = rows.sort((a, b) => new Date(a[sortOrder]) - new Date(b[sortOrder]));

  return rows
}

function processMoves(gameState, rows) {

  if (rows.length === 0) {
    return gameState;
  }

  let newGameState = cloneDeep(gameState);
  for (let i = 0; i < rows.length; i++) {
    newGameState = processMove(newGameState, rows[i].start_square, rows[i].end_square);
  }

  return newGameState;
}

const processMove = (gameState, start_square, end_square) => {

  const [startRow, startCol] = getRowColFromSquareName(start_square);
  const [endRow, endCol] = getRowColFromSquareName(end_square);

  const startPiece = gameState.board[startRow][startCol];
  const endPiece = gameState.board[endRow][endCol];

  const newBoard = cloneDeep(gameState.board);

  if (moveIsEnPassant(gameState, startRow, endRow, startCol, endCol)) {
    newBoard[startRow][endCol] = '.';
  }

  newBoard[startRow][startCol] = '.';
  newBoard[endRow][endCol] = startPiece;

  const newTurn = gameState.turn === 'w' ? 'b' : 'w';

  const newHalfmoveClock = gameState.halfmoveClock + 1;
  const newFullmoveNumber = gameState.fullmoveNumber + (gameState.turn === 'b' ? 1 : 0);
  const newLastMove = { startRow, startCol, endRow, endCol, startPiece, endPiece }

  const newGameState = {
    ...gameState,
    board: newBoard,
    turn: newTurn,
    halfmoveClock: newHalfmoveClock,
    fullmoveNumber: newFullmoveNumber,
    lastMove: newLastMove
  }

  return newGameState;
}