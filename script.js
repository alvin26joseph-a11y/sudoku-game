let timerInterval;
let seconds = 0;
let isGameComplete = false;

const initialPuzzle = [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
];

let currentBoard = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    startTimer();
});

function initializeGame() {
    currentBoard = initialPuzzle.map(r => [...r]);
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            const input = document.createElement('input');
            input.maxLength = 1;

            if (initialPuzzle[r][c] !== 0) {
                input.value = initialPuzzle[r][c];
                input.disabled = true;
                cell.classList.add('prefilled');
            } else {
                input.addEventListener('input', e => handleInput(e, r, c));
            }

            cell.appendChild(input);
            grid.appendChild(cell);
        }
    }

    hideMessage();
    hideModal();
    isGameComplete = false;
}

function handleInput(event, row, col) {
    const input = event.target;
    const cell = input.parentElement;

    if (!/^[1-9]$/.test(input.value)) {
        input.value = '';
        currentBoard[row][col] = 0;
        return;
    }

    currentBoard[row][col] = Number(input.value);

    if (!isValidPlacement(row, col, currentBoard[row][col])) {
        rejectInvalidInput(cell, row, col);
        return;
    }

    hideMessage();
}

function rejectInvalidInput(cell, row, col) {
    cell.classList.add('error');
    showMessage('Invalid move: duplicate number!', 'error');

    setTimeout(() => {
        cell.classList.remove('error');
        cell.querySelector('input').value = '';
        currentBoard[row][col] = 0;
        hideMessage();
    }, 600);
}

function isValidPlacement(row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (i !== col && currentBoard[row][i] === num) return false;
        if (i !== row && currentBoard[i][col] === num) return false;
    }

    const sr = Math.floor(row / 3) * 3;
    const sc = Math.floor(col / 3) * 3;

    for (let r = sr; r < sr + 3; r++) {
        for (let c = sc; c < sc + 3; c++) {
            if ((r !== row || c !== col) && currentBoard[r][c] === num) {
                return false;
            }
        }
    }
    return true;
}

function checkSolution() {
    if (currentBoard.flat().includes(0)) {
        showMessage('Fill all cells first!', 'error');
        return;
    }

    isGameComplete = true;
    stopTimer();
    showSuccessModal();
}

function startTimer() {
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById('timer').textContent =
            `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function showMessage(text, type) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.className = `message ${type}`;
    msg.classList.remove('hidden');
}

function hideMessage() {
    document.getElementById('message').classList.add('hidden');
}

function showSuccessModal() {
    document.getElementById('final-time').textContent = `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    document.getElementById('success-modal').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

function resetGame() {
    stopTimer();
    initializeGame();
    startTimer();
}

function setupEventListeners() {
    document.getElementById('check-btn').addEventListener('click', checkSolution);
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    document.getElementById('new-game-btn').addEventListener('click', resetGame);
}
