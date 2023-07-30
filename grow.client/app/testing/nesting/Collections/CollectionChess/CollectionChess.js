'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

import debounce from 'lodash.debounce';
import cloneDeep from 'lodash.clonedeep';
import { Neat, architect, Network, methods } from 'neataptic'

import Paper from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

import ChessBoard from "./ChessBoard/ChessBoard";
import { ShowCollectionLabel } from "../../ShowCollection";
import { useSubscription } from '../../useSubscription';
import { useGridCollectionColumns } from '../useGridCollectionColumns';
import logger from '../../../../../services/logger';


const MAX_BOARD_SIZE = 4; 
const BOARD_SIZE = 4; // 4x4. 8x8 standard board would be just 8

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
  // board: [
  //   ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  //   ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  //   ['.', '.', '.', '.', '.', '.', '.', '.'],
  //   ['.', '.', '.', '.', '.', '.', '.', '.'],
  //   ['.', '.', '.', '.', '.', '.', '.', '.'],
  //   ['.', '.', '.', '.', '.', '.', '.', '.'],
  //   ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  //   ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  // ],
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
  board: [
    ['♜', '♟︎', '♟︎', '♜'],
    ['♜', '♟︎', '♟︎', '♜'],
    ['♖', '♙', '♙', '♖'],
    ['♖', '♙', '♙', '♖'],
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

export default function CollectionChess({ pageProps, collectionProps }) {

  // console.log('CollectionChess', 'pageProps:', pageProps, 'collectionProps:', collectionProps);

  const [currentEvaluation, setCurrentEvaluation] = useState({ generation: 0, games: [], iteration: 0, currentHighestScore:0, highestScore: 0 });

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const neatRef = useRef();


  const takeTurn = () => {
    setCurrentEvaluation(prevEvaluation => {

      const neat = neatRef.current

      if (prevEvaluation.iteration < MAX_ITERATIONS) {

        const newEvaluation = cloneDeep(prevEvaluation);

        for (var gameIndex in newEvaluation.games) {
          
          const game = newEvaluation.games[gameIndex];
          const board = game.gameState.board;

          for (const playerIndex in game.players) {
            const player = game.players[playerIndex];

            const currentCorrectMoves = []
            let newScore = player.brain.score;

            const input = convertToNeatapticInput(game.gameState);

            player.brain.nodes.map(node => {
              node.squash = methods.activation.RELU
              return node;
            })
            // console.log(player.brain.nodes)
            const output = player.brain.activate(input);

            let output0 = output[0];
            let output1 = output[1];
            let output2 = output[2];
            let output3 = output[3];

            let outputMin = Math.min(output0, output1, output2, output3);
            let outputMax = Math.max(output0, output1, output2, output3);
            outputMax = outputMax * 1.001; // keep max within 0-1 range

            if (outputMin > 0) {
              outputMin = 0;
            }
            
            if (outputMin < 0) {
              output0 -= outputMin;
              output1 -= outputMin;
              output2 -= outputMin;
              output3 -= outputMin;

              outputMax -= outputMin;
              outputMin = 0;
            }

            if (outputMax <= 1) {
              outputMax = 1.001
            }

            output0 = output0 / outputMax;
            output1 = output1 / outputMax;
            output2 = output2 / outputMax;
            output3 = output3 / outputMax;

            // const output0 = Math.round(output[0] * 100) / 100;
            // const output1 = Math.round(output[1] * 100) / 100;
            // const output2 = Math.round(output[2] * 100) / 100;
            // const output3 = Math.round(output[3] * 100) / 100;


            // output0 = outputMin;
            // output1 = outputMax;
            // output2 = output2;
            // output3 = outputMax;

            let startRow = Math.floor(output0 * BOARD_SIZE);
            let startCol = Math.floor(output1 * BOARD_SIZE);
            let endRow = Math.floor(output2 * BOARD_SIZE);
            let endCol = Math.floor(output3 * BOARD_SIZE);

            const lastMove = game.gameState.lastMove;

            let startPiece = 'X';
            let endPiece = 'X';


            // console.log(neat.generation, newEvaluation.iteration, gameIndex, playerIndex, input, player.brain);

            // Don't reward if any move is outside of the board
            if (output0 < 0 || output0 >= 1 || output1 < 0 || output1 >= 1 || output2 < 0 || output2 >= 1 || output3 < 0 || output3 >= 1) {

              // But if the start or end move is valid, show the correct piece
              if (output0 >= 0 && output0 < 1 && output1 >= 0 && output1 < 1) {
                startPiece = board[startRow][startCol];
                newScore *= .9;
              }
              else if (output2 >= 0 && output2 < 1 && output3 >= 0 && output3 < 1) {
                endPiece = board[endRow][endCol];
                newScore *= .9;
              }
              else {
                // Neither piece is valid so punish heavily
                newScore = 0;
              }
            } 
            else if (startRow >= BOARD_SIZE || startCol >= BOARD_SIZE || endRow >= BOARD_SIZE || endCol >= BOARD_SIZE) {
              // const maxDifference = Math.sum(startRow - BOARD_SIZE, startCol - BOARD_SIZE, endRow - BOARD_SIZE, endCol - BOARD_SIZE);
              // newScore += BOARD_SIZE - (maxDifference > BOARD_SIZE ? 0 : maxDifference);

              const averageDifference = (startRow - BOARD_SIZE + startCol - BOARD_SIZE + endRow - BOARD_SIZE + endCol - BOARD_SIZE)/BOARD_SIZE;
              newScore += BOARD_SIZE - (averageDifference > BOARD_SIZE ? BOARD_SIZE : averageDifference);
            } 
            else {

              startPiece = board[startRow][startCol];
              endPiece = board[endRow][endCol];

              const isSameAsLastMove = startRow === lastMove.startRow && startCol === lastMove.startCol && endRow === lastMove.endRow && endCol === lastMove.endCol;
              // console.log(isSameAsLastMove, startRow, lastMove.startRow, startCol, lastMove.startCol, endRow, lastMove.endRow, endCol, lastMove.endCol)

              if (isSameAsLastMove) {
                // console.log('same as last move')
                newScore *= .988;
              }
              else if (startRow === endRow && startCol === endCol) {
                // console.log('same start and end');
                newScore *= .988;
              }
              else if (startPiece !== '.') {

                if (endPiece !== '.') {
                  newScore += 2;
                }

                const turn = game.gameState.fullmoveNumber % 2 ? 0 : 1;

                switch (startPiece) {
                  case '♜':
                  case '♟︎':

                    if (turn === 0) {
                      newScore -= 5;
                    }
                    else {
                      newScore += 5;
                    }
                    break;
                  case '♖':
                  case '♙':

                    if (turn === 1) {
                      newScore -= 5;
                    }
                    else {
                      newScore += 5;
                    }
                    break;
                }

                const isValid = isValidMove(board, turn, startRow, startCol, endRow, endCol);

                if (isValid.valid) {
                  if (isValid.capture) {
                    newScore += 500;
                  }
                  else {
                    newScore += 100;
                  }

                  currentCorrectMoves.push({ generation: neat.generation, gameIndex, playerIndex, score: newScore, startRow, startCol, endRow, endCol });
                }
              }
              else {
                newScore += .5;
              }
            }

            // console.log(neat.generation, newEvaluation.iteration, gameIndex, playerIndex, newScore, output0, startRow, output1, startCol, output2, endRow, output3, endCol, game.gameState, player.brain);

            lastMove.input = input;
            lastMove.output = [output0, output1, output2, output3];
            lastMove.newScore = newScore;
            lastMove.startPiece = startPiece;
            lastMove.startRow = startRow;
            lastMove.startCol = startCol;
            // lastMove.startRow = `${output0 < 0 ? '-' : ' '}${startRow}`;
            // lastMove.startCol = `${output1 < 0 ? '-' : ' '}${startCol}`;
            lastMove.endPiece = endPiece;
            lastMove.endRow = endRow;
            lastMove.endCol = endCol;
            // lastMove.endRow = `${output2 < 0 ? '-' : ' '}${endRow}`;
            // lastMove.endCol = `${output3 < 0 ? '-' : ' '}${endCol}`;
            lastMove.iteration = newEvaluation.iteration;

            // console.log(neat.generation, newEvaluation.iteration, gameIndex, playerIndex, newScore, startRow, startCol, endRow, endCol, player.brain);
            // game.gameState.lastMove = {iteration: newEvaluation.iteration, input, newScore, startPiece, startRow, startCol, endPiece, endRow, endCol}
            game.gameState.lastMove = lastMove;
            game.gameState.fullmoveNumber = newEvaluation.iteration;

            if (newScore > newEvaluation.currentHighestScore) {
              newEvaluation.currentHighestScore = newScore;
            }
            if (newScore > newEvaluation.highestScore) {
              newEvaluation.highestScore = newScore;
            }

            if (currentCorrectMoves.length > 0) {
              const selectedMove = currentCorrectMoves[Math.floor(Math.random() * (currentCorrectMoves.length - 1))]

              startPiece = board[selectedMove.startRow][selectedMove.startCol];
              endPiece = board[selectedMove.endRow][selectedMove.endCol];

              board[selectedMove.endRow][selectedMove.endCol] = startPiece;
              board[selectedMove.startRow][selectedMove.startCol] = '.';

              // console.log(neat.generation, newEvaluation.iteration, gameIndex, playerIndex, newScore, startRow, startCol, startPiece, endRow, endCol, endPiece);
            }

            const newCorrectMoves = [...currentCorrectMoves, ...player.correctMoves].slice(0, 200)

            player.brain.score = newScore;
            player.correctMoves = newCorrectMoves;
          }

          game.currentGeneration = neat.generation;
        }

        newEvaluation.iteration++;
        return newEvaluation
      }
      
      else {
        // console.log(neat, 'Generation:', neat.generation, '- average score:', neat.getAverage());

        neat.sort();
        var newPopulation = [];

        // Elitism
        for (var i = 0; i < neat.elitism; i++) {
          newPopulation.push(neat.population[i]);
        }

        // Breed the next individuals
        for (var i = 0; i < neat.popsize - neat.elitism; i++) {
          newPopulation.push(neat.getOffspring());
        }

        // Replace the old population with the new population
        neat.population = newPopulation;
        neat.mutate();
        neat.generation++;

        const newEvaluation = { generation: neat.generation, games: [], iteration: 0, currentHighestScore: 0, highestScore: prevEvaluation.highestScore };

        for (const genomeIndex in neat.population) {
          let genome = neat.population[genomeIndex];
          genome.score = 1;

          const newGameState = cloneDeep(initialGameState);
          newGameState.currentGeneration = neat.generation;

          newEvaluation.games.push({
            players: [{
              brain: genome,
              correctMoves: []
            }],
            gameState: newGameState
          });
        }

        return newEvaluation;
      }

    })
  };

  const animate = (time) => {
    // console.log('in animate')
    if (previousTimeRef.current != undefined) {
      takeTurn();
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);

    // setTimeout(() => {
    //   previousTimeRef.current = time;
    //   requestRef.current = requestAnimationFrame(animate);
    // }, 4000)
  }

  useEffect(() => {
    const neat = new Neat(
      INPUTS,
      OUTPUTS,
      null,
      {
        popsize: POPSIZE,
        elitism: ELITISM,
        mutationRate: MUTATION_RATE,

        mutation: methods.mutation.FFW,
        network: new architect.Perceptron(
          INPUTS,
          START_HIDDEN_SIZE / 2,
          // START_HIDDEN_SIZE,
          // START_HIDDEN_SIZE,
          // START_HIDDEN_SIZE,
          OUTPUTS
        )

        // network: new architect.Random(
        //   INPUTS,
        //   START_HIDDEN_SIZE/2,
        //   OUTPUTS
        // )
      }
    );


    const initialEvaluation = { generation: 0, games: [], iteration: 0, currentHighestScore: 0, highestScore: 0 };

    for (const genomeIndex in neat.population) {
      let genome = neat.population[genomeIndex];
      genome.score = 0;

      initialEvaluation.games.push({
        players: [{
          brain: genome,
          correctMoves: [] 
        }], 
        gameState: cloneDeep(initialGameState) 
      });
    }

    setCurrentEvaluation(initialEvaluation);

    neatRef.current = neat
  }, []);

  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (running) {
      requestRef.current = requestAnimationFrame(animate);
    }
    else {
      cancelAnimationFrame(requestRef?.current);
    }

    return () => cancelAnimationFrame(requestRef?.current);
  }, [running]);

  return (
    <>
      <Paper sx={{
        width: '100%',
        py: 2, px: 2
      }}>
        <div>
          <button onClick={() => setRunning(!running)}>{running ? 'Stop' : 'Start'}</button>
        </div>
        <div>Population: {POPSIZE} | Inputs: {INPUTS} | Outputs: {OUTPUTS} | Elitism {ELITISM} | Mutation Rate {MUTATION_RATE}</div>
        <div>Generation: {currentEvaluation.generation} | Turn: {currentEvaluation.iteration}/{MAX_ITERATIONS} | Highest Score: {currentEvaluation.highestScore} | Current Highest Score: {currentEvaluation.currentHighestScore}</div>
        
        {POPSIZE < 1000 && (
          <Grid container spacing={1.5}>
            {currentEvaluation.games.sort((a, b) => b.gameState.lastMove.newScore - a.gameState.lastMove.newScore).slice(0,6).map((game, index) => (
              <Grid item xs={4} key={index}>
                <ChessBoard boardSize={BOARD_SIZE} gameState={game.gameState} />
              </Grid>
            ))}
            {/* <Grid item xs={6}>
            <ChessBoard />
          </Grid> */}
          </Grid>
        )}
      </Paper>

    </>
  );
}







// Convert the game state to NeuroJS input
function convertToNeatapticInput(gameState) {
  const input = [];

  // Convert board state
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = gameState.board[row][col];
      const pieceCode = pieceToNumericCode(piece, gameState.fullmoveNumber);
      input.push(pieceCode);
    }
  }

  // Convert turn
  // const turnCode = gameState.turn === 'white' ? 0 : 1;
  const turnCode = gameState.fullmoveNumber % 2;
  input.push(turnCode);

  // Convert fullmove number
  // input.push(gameState.fullmoveNumber / MAX_ITERATIONS);

  // Convert castling availability
  // const castling = gameState.castling;
  // input.push(castling.white.kingSide ? 1 : 0);
  // input.push(castling.white.queenSide ? 1 : 0);
  // input.push(castling.black.kingSide ? 1 : 0);
  // input.push(castling.black.queenSide ? 1 : 0);

  // Convert en passant target
  // input.push(gameState.enPassantTarget ? 1 : 0);

  // Convert halfmove clock
  // input.push(gameState.halfmoveClock);


  input.push(BOARD_SIZE / MAX_BOARD_SIZE);

  return input;
}

// Helper function to convert piece notation to numeric code
function pieceToNumericCode(piece, fullmoveNumber) {
  const pieceCodes = {
    '.': 1,
    '♖': 2, 'n': 3, 'b': 4, 'q': 5, 'k': 6, '♙': 7,
    '♜': 8, 'N': 9, 'B': 10, 'Q': 11, 'K': 12, '♟︎': 13
  };

  return pieceCodes[piece] / Object.keys(pieceCodes).length;

  const possiblePiecesNum = Object.keys(pieceCodes).length
  return (pieceCodes[piece] + (fullmoveNumber * possiblePiecesNum)) / (possiblePiecesNum * MAX_ITERATIONS);
}


function isValidMove(board, turn, startRow, startCol, endRow, endCol) {

  const startPiece = board[startRow][startCol];
  const endPiece = board[endRow][endCol];

  switch (startPiece) {
    case '♜':
    case '♟︎':

      if (turn === 0) {
        return { valid: false, capture: false };
      }

      if (endRow > startRow && endCol === startCol) {
        if (endPiece === '.') {
          return { valid: true, capture: false };
        }
        if (endPiece === '♙' || endPiece === '♖') {
          return { valid: true, capture: true };
        }
        if (endPiece === '♟︎' || endPiece === '♜') {
          return { valid: false, capture: false };
        }
      }
      break;
    case '♖':
    case '♙':

      if (turn === 1) {
        return { valid: false, capture: false };
      }

      if (endRow < startRow && endCol === startCol) {
        if (endPiece === '.') {
          return { valid: true, capture: false };
        }
        if (endPiece === '♟︎' || endPiece === '♜') {
          return { valid: true, capture: true };
        }
        if (endPiece === '♙' || endPiece === '♖') {
          return { valid: false, capture: false };
        }
      }
      break;
  }

  return { valid: false, capture: false };
}