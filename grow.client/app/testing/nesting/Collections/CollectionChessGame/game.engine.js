

export function isWhite(piece) {
  return piece === '♔' || piece === '♕' || piece === '♖' || piece === '♗' || piece === '♘' || piece === '♙';
}

export function isBlack(piece) {
  return piece === '♚' || piece === '♛' || piece === '♜' || piece === '♝' || piece === '♞' || piece === '♟';
}

export function canMoveQueen(gameState, startRow, endRow, startCol, endCol) {
  return canMoveRook(gameState, startRow, endRow, startCol, endCol) || canMoveBishop(gameState, startRow, endRow, startCol, endCol);
}

export function canMoveKing(gameState, startRow, endRow, startCol, endCol) {
  const rowDiff = Math.abs(startRow - endRow);
  const colDiff = Math.abs(startCol - endCol);
  return rowDiff <= 1 && colDiff <= 1;
}

export function canMoveRook(gameState, startRow, endRow, startCol, endCol) {
  if (startRow !== endRow && startCol !== endCol) return false;
  if (startRow === endRow) {
    const min = Math.min(startCol, endCol);
    const max = Math.max(startCol, endCol);
    for (let col = min + 1; col < max; col++) {
      if (gameState.board[startRow][col] !== '.') return false;
    }
    for (let col = min - 1; col > max; col--) {
      if (gameState.board[startRow][col] !== '.') return false;
    }
  }

  if (startCol === endCol) {
    const min = Math.min(startRow, endRow);
    const max = Math.max(startRow, endRow);
    for (let row = min + 1; row < max; row++) {
      if (gameState.board[row][startCol] !== '.') return false;
    }
    for (let row = min - 1; row > max; row--) {
      if (gameState.board[row][startCol] !== '.') return false;
    }
  }

  return true;
}

export function canMoveKnight(gameState, startRow, endRow, startCol, endCol) {
  const rowDiff = Math.abs(startRow - endRow);
  const colDiff = Math.abs(startCol - endCol);
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

export function canMoveBishop(gameState, startRow, endRow, startCol, endCol) {
  // Check if the bishop is moving diagonally
  if (Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) {
    return false;
  }

  // Check if there are any pieces blocking the bishop's path
  const rowDir = endRow > startRow ? 1 : -1;
  const colDir = endCol > startCol ? 1 : -1;
  let row = startRow + rowDir;
  let col = startCol + colDir;
  while (row !== endRow && col !== endCol) {
    if (gameState.board[row][col] !== '.') {
      return false;
    }
    row += rowDir;
    col += colDir;
  }

  return true;
}

export function canMovePawn(gameState, startRow, endRow, startCol, endCol) {
  const piece = gameState.board[startRow][startCol];
  const direction = isBlack(piece) ? 1 : -1; // Pawns move upwards for white and downwards for black
  const rowDiff = endRow - startRow;
  const colDiff = Math.abs(endCol - startCol);

  // Check if the pawn is moving forward
  if (rowDiff * direction <= 0) {
    return false;
  }

  // Check if the pawn is moving straight ahead
  if (colDiff === 0) {
    // Check if there are any pieces blocking the pawn's path
    if (gameState.board[endRow][endCol] !== '.') {
      return false;
    }

    // Check if the pawn is moving one or two squares forward
    if (Math.abs(rowDiff) === 1 || (Math.abs(rowDiff) === 2 && startRow === (isBlack(piece) ? 1 : 6))) {
      return true;
    }

    return false;
  }

  // Check if the pawn is capturing a piece diagonally
  if (colDiff === 1 && Math.abs(rowDiff) === 1) {
    // Check if there is a piece to capture
    if (gameState.board[endRow][endCol] === '.') {
      return moveIsEnPassant(gameState, startRow, endRow, startCol, endCol);
    }

    return true;
  }

  return false;
}

export function moveIsEnPassant(gameState, startRow, endRow, startCol, endCol) {
  // Check for en passant capture
  const lastMove = gameState.lastMove;
  const piece = gameState.board[startRow][startCol];
  const direction = isBlack(piece) ? -1 : 1; // Pawns move upwards for white and downwards for black
  
  if (lastMove.startPiece === '♙' || lastMove.startPiece === '♟') {
    if (lastMove.endRow === startRow && lastMove.endCol === endCol) {
      if (lastMove.endRow - lastMove.startRow === 2 * direction) {
        return true;
      }
    }
  }
  return false;
}

export function getSquareNameFromRowCol(row, col) {
  const file = String.fromCharCode('a'.charCodeAt(0) + col);
  const rank = 8 - row;
  return `${file}${rank}`;
}

export function getRowColFromSquareName(squareName) {
  const file = squareName[0];
  const rank = squareName[1];
  const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(rank);
  return [row, col];
}