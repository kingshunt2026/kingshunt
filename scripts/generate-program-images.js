const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Color palette matching the component (gold/beige theme)
const colors = {
  gold: '#c9a24d',
  goldLight: '#e8d8a3',
  goldDark: '#a27f3d',
  beige: '#f7f4ec',
  beigeDark: '#efe7d7',
  dark: '#0b0b0b',
  white: '#ffffff',
  boardLight: '#f0d9b5',
  boardDark: '#b58863',
};

// Helper function to draw a chess piece
function drawPiece(ctx, x, y, type, color) {
  ctx.save();
  ctx.translate(x, y);
  
  // Base
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  
  // Piece body
  ctx.fillStyle = color === colors.white ? colors.white : colors.dark;
  ctx.beginPath();
  ctx.arc(0, -8, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Crown for king/queen
  if (type === 'king' || type === 'queen') {
    ctx.fillStyle = colors.gold;
    ctx.beginPath();
    ctx.moveTo(-6, -20);
    ctx.lineTo(0, -28);
    ctx.lineTo(6, -20);
    ctx.lineTo(4, -20);
    ctx.lineTo(4, -16);
    ctx.lineTo(-4, -16);
    ctx.lineTo(-4, -20);
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.restore();
}

// Helper function to draw chess board
function drawChessBoard(ctx, startX, startY, size, squareSize) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const x = startX + col * squareSize;
      const y = startY + row * squareSize;
      const isLight = (row + col) % 2 === 0;
      
      ctx.fillStyle = isLight ? colors.boardLight : colors.boardDark;
      ctx.fillRect(x, y, squareSize, squareSize);
    }
  }
}

// Image 1: Chess board with pieces in starting position
function createImage1() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 600);
  gradient.addColorStop(0, colors.beige);
  gradient.addColorStop(1, colors.beigeDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 600);
  
  // Draw chess board
  const boardSize = 320;
  const squareSize = boardSize / 8;
  const startX = (800 - boardSize) / 2;
  const startY = (600 - boardSize) / 2;
  drawChessBoard(ctx, startX, startY, boardSize, squareSize);
  
  // Draw pieces
  const pieces = [
    { x: 0, y: 0, type: 'rook', color: colors.dark },
    { x: 1, y: 0, type: 'knight', color: colors.dark },
    { x: 4, y: 0, type: 'king', color: colors.dark },
    { x: 3, y: 0, type: 'queen', color: colors.dark },
    { x: 0, y: 7, type: 'rook', color: colors.white },
    { x: 1, y: 7, type: 'knight', color: colors.white },
    { x: 4, y: 7, type: 'king', color: colors.white },
    { x: 3, y: 7, type: 'queen', color: colors.white },
  ];
  
  pieces.forEach(piece => {
    const x = startX + piece.x * squareSize + squareSize / 2;
    const y = startY + piece.y * squareSize + squareSize / 2;
    drawPiece(ctx, x, y, piece.type, piece.color);
  });
  
  return canvas;
}

// Image 2: Strategic position with highlighted squares
function createImage2() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Background
  const gradient = ctx.createLinearGradient(0, 0, 800, 600);
  gradient.addColorStop(0, '#f4ecde');
  gradient.addColorStop(1, colors.beige);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 600);
  
  // Draw chess board
  const boardSize = 400;
  const squareSize = boardSize / 8;
  const startX = (800 - boardSize) / 2;
  const startY = (600 - boardSize) / 2;
  drawChessBoard(ctx, startX, startY, boardSize, squareSize);
  
  // Highlight some squares
  ctx.fillStyle = 'rgba(201, 162, 77, 0.4)';
  ctx.fillRect(startX + 3 * squareSize, startY + 3 * squareSize, squareSize, squareSize);
  ctx.fillRect(startX + 4 * squareSize, startY + 4 * squareSize, squareSize, squareSize);
  
  // Draw pieces in strategic position
  drawPiece(ctx, startX + 3 * squareSize + squareSize / 2, startY + 3 * squareSize + squareSize / 2, 'king', colors.dark);
  drawPiece(ctx, startX + 4 * squareSize + squareSize / 2, startY + 4 * squareSize + squareSize / 2, 'queen', colors.white);
  
  return canvas;
}

// Image 3: Close-up of chess pieces
function createImage3() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = colors.beige;
  ctx.fillRect(0, 0, 800, 600);
  
  // Draw large pieces
  const centerX = 400;
  const centerY = 300;
  
  // King
  ctx.save();
  ctx.scale(2, 2);
  drawPiece(ctx, centerX / 2 - 100, centerY / 2, 'king', colors.dark);
  ctx.restore();
  
  // Queen
  ctx.save();
  ctx.scale(2, 2);
  drawPiece(ctx, centerX / 2 + 100, centerY / 2, 'queen', colors.white);
  ctx.restore();
  
  // Add decorative elements
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 5]);
  ctx.strokeRect(50, 50, 700, 500);
  
  return canvas;
}

// Image 4: Chess board with golden overlay
function createImage4() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Background
  const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
  gradient.addColorStop(0, colors.goldLight);
  gradient.addColorStop(1, colors.beige);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 600);
  
  // Draw chess board
  const boardSize = 360;
  const squareSize = boardSize / 8;
  const startX = (800 - boardSize) / 2;
  const startY = (600 - boardSize) / 2;
  drawChessBoard(ctx, startX, startY, boardSize, squareSize);
  
  // Draw pieces
  for (let i = 0; i < 8; i++) {
    drawPiece(ctx, startX + i * squareSize + squareSize / 2, startY + squareSize / 2, 'pawn', i % 2 === 0 ? colors.dark : colors.white);
  }
  
  return canvas;
}

// Image 5: Abstract chess pattern
function createImage5() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = colors.beigeDark;
  ctx.fillRect(0, 0, 800, 600);
  
  // Draw multiple small boards
  const boards = [
    { x: 100, y: 100, size: 150 },
    { x: 550, y: 100, size: 150 },
    { x: 325, y: 350, size: 150 },
  ];
  
  boards.forEach((board, idx) => {
    const squareSize = board.size / 8;
    drawChessBoard(ctx, board.x, board.y, board.size, squareSize);
    
    // Add a piece
    const pieceColor = idx % 2 === 0 ? colors.dark : colors.white;
    drawPiece(ctx, board.x + board.size / 2, board.y + board.size / 2, idx === 1 ? 'queen' : 'king', pieceColor);
  });
  
  return canvas;
}

// Image 6: Elegant chess scene
function createImage6() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 600);
  gradient.addColorStop(0, colors.white);
  gradient.addColorStop(0.5, colors.beige);
  gradient.addColorStop(1, colors.beigeDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 600);
  
  // Draw chess board
  const boardSize = 380;
  const squareSize = boardSize / 8;
  const startX = (800 - boardSize) / 2;
  const startY = (600 - boardSize) / 2;
  drawChessBoard(ctx, startX, startY, boardSize, squareSize);
  
  // Draw elegant pieces arrangement
  const pieces = [
    { x: 2, y: 2, type: 'king', color: colors.dark },
    { x: 5, y: 5, type: 'queen', color: colors.white },
    { x: 1, y: 1, type: 'knight', color: colors.dark },
    { x: 6, y: 6, type: 'knight', color: colors.white },
  ];
  
  pieces.forEach(piece => {
    const x = startX + piece.x * squareSize + squareSize / 2;
    const y = startY + piece.y * squareSize + squareSize / 2;
    drawPiece(ctx, x, y, piece.type, piece.color);
  });
  
  // Add golden border
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(startX - 10, startY - 10, boardSize + 20, boardSize + 20);
  
  return canvas;
}

// Generate all images
const images = [
  { name: 'kidsplaying-chess-low.jpg', create: createImage1 },
];

console.log('Generating program images...');

images.forEach((img, index) => {
  try {
    const canvas = img.create();
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(imagesDir, img.name);
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Created ${img.name}`);
  } catch (error) {
    console.error(`✗ Error creating ${img.name}:`, error.message);
  }
});

console.log('All images generated successfully!');


