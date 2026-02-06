// ===========================
// Global Variables
// ===========================

let timerInterval;
let seconds = 0;
let isGameComplete = false;

// Valid Sudoku puzzle (solution exists)
const initialPuzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

// Solution for validation (optional - for auto-check)
const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

// Current board state
let currentBoard = [];

// ===========================
// Initialization
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    startTimer();
});

/**
 * Initialize the game board
 */
function initializeGame() {
    // Deep copy the initial puzzle
    currentBoard = initialPuzzle.map(row => [...row]);
    
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = ''; // Clear existing cells
    
    // Create 81 cells (9x9 grid)
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = createCell(row, col);
            grid.appendChild(cell);
        }
    }
    
    // Reset game state
    isGameComplete = false;
    hideMessage();
    hideModal();
}

/**
 * Create a single cell element
 */
function createCell(row, col) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.row = row;
    cell.dataset.col = col;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    
    const value = initialPuzzle[row][col];
    
    if (value !== 0) {
        // Prefilled cell (immutable)
        input.value = value;
        input.disabled = true;
        cell.classList.add('prefilled');
    } else {
        // Editable cell
        input.addEventListener('input', (e) => handleInput(e, row, col));
        input.addEventListener('keydown', handleKeyNavigation);
    }
    
    cell.appendChild(input);
    return cell;
}

/**
 * Handle user input in cells
 */
function handleInput(event, row, col) {
    const input = event.target;
    let value = input.value;
    
    // Only allow numbers 1-9
    if (!/^[1-9]$/.test(value)) {
        input.value = '';
        currentBoard[row][col] = 0;
        return;
    }
    
    // Update current board
    currentBoard[row][col] = parseInt(value);
    
    // Validate the input
    const cell = input.parentElement;
    if (!isValidPlacement(row, col, parseInt(value))) {
        cell.classList.add('error');
    } else {
        cell.classList.remove('error');
    }
    
    // Check if puzzle is complete
    if (isBoardFull()) {
        checkSolution();
    }
}

/**
 * Handle keyboard navigation (arrow keys)
 */
function handleKeyNavigation(event) {
    const currentInput = event.target;
    const currentCell = currentInput.parentElement;
    let row = parseInt(currentCell.dataset.row);
    let col = parseInt(currentCell.dataset.col);
    
    let newRow = row;
    let newCol = col;
    
    switch(event.key) {
        case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            event.preventDefault();
            break;
        case 'ArrowDown':
            newRow = Math.min(8, row + 1);
            event.preventDefault();
            break;
        case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            event.preventDefault();
            break;
        case 'ArrowRight':
            newCol = Math.min(8, col + 1);
            event.preventDefault();
            break;
        default:
            return;
    }
    
    // Focus on the new cell
    const newIndex = newRow * 9 + newCol;
    const cells = document.querySelectorAll('.cell');
    const newInput = cells[newIndex].querySelector('input');
    if (newInput && !newInput.disabled) {
        newInput.focus();
        newInput.select();
    }
}

// ===========================
// Validation Logic
// ===========================

/**
 * Check if a number placement is valid
 */
function isValidPlacement(row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
        if (c !== col && currentBoard[row][c] === num) {
            return false;
        }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
        if (r !== row && currentBoard[r][col] === num) {
            return false;
        }
    }
    
    // Check 3x3 sub-grid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    
    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if ((r !== row || c !== col) && currentBoard[r][c] === num) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Check if the board is completely filled
 */
function isBoardFull() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (currentBoard[row][col] === 0) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Validate the entire board
 */
function isValidBoard() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const num = currentBoard[row][col];
            if (num === 0 || !isValidPlacement(row, col, num)) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Check if the solution is correct
 */
function checkSolution() {
    if (!isBoardFull()) {
        showMessage('Please fill all cells before checking!', 'error');
        return;
    }
    
    if (isValidBoard()) {
        // Puzzle solved!
        isGameComplete = true;
        stopTimer();
        showSuccessModal();
    } else {
        showMessage('The solution is incorrect. Keep trying!', 'error');
    }
}

// ===========================
// Timer Functions
// ===========================

/**
 * Start the game timer
 */
function startTimer() {
    seconds = 0;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (!isGameComplete) {
            seconds++;
            updateTimerDisplay();
        }
    }, 1000);
}

/**
 * Stop the timer
 */
function stopTimer() {
    clearInterval(timerInterval);
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById('timer').textContent = timeString;
}

/**
 * Get formatted time string
 */
function getFormattedTime() {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

// ===========================
// UI Functions
// ===========================

/**
 * Show message to user
 */
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
}

/**
 * Hide message
 */
function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.classList.add('hidden');
}

/**
 * Show success modal
 */
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    const finalTime = document.getElementById('final-time');
    finalTime.textContent = getFormattedTime();
    modal.classList.remove('hidden');
}

/**
 * Hide success modal
 */
function hideModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('hidden');
}

/**
 * Reset the game
 */
function resetGame() {
    stopTimer();
    initializeGame();
    startTimer();
}

// ===========================
// Event Listeners
// ===========================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Check solution button
    document.getElementById('check-btn').addEventListener('click', checkSolution);
    
    // Reset/New game button
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    
    // New game button in modal
    document.getElementById('new-game-btn').addEventListener('click', () => {
        hideModal();
        resetGame();
    });
    
    // Close modal on background click
    document.getElementById('success-modal').addEventListener('click', (e) => {
        if (e.target.id === 'success-modal') {
            hideModal();
            resetGame();
        }
    });
}