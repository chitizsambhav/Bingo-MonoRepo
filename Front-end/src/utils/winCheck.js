const isLineComplete = (line, numberSelected) => line.every(num => numberSelected.includes(num));

let rIndex = [];
let cIndex = [];
let completedLines = [];
let gameCountCheck = 0

export const checkForWin = (grid, numberSelected, gameCount) => {
    if (gameCountCheck !== gameCount){
        console.log(gameCount)
        console.log(gameCountCheck)
        rIndex = []
        cIndex = []
        completedLines = []
        gameCountCheck = gameCount
    }
    const gridSize = grid.length;
    if (grid.length ===0 || numberSelected.length===0){
        throw new Error("No number was selected")
    }

    for (let i = 0; i < gridSize; i++) {
        if (!rIndex.includes(i)) {
            const row = grid[i];
            if (isLineComplete(row, numberSelected)) {
                rIndex.push(i);
                completedLines.push({ type: 'row', index: i });
            }
        }
    }

    for (let i = 0; i < gridSize; i++) {
        if (!cIndex.includes(i)) {
            const column = grid.map(row => row[i]);
            if (isLineComplete(column, numberSelected)) {
                cIndex.push(i);
                completedLines.push({ type: 'column', index: i });
            }
        }
    }

    const diagonal1 = grid.map((row, index) => row[index]);
    const diagonal2 = grid.map((row, index) => row[gridSize - 1 - index]);

    if(!completedLines.some(line => line.direction === 'TL-BR')){
        if (isLineComplete(diagonal1, numberSelected)) {
            completedLines.push({ type: 'diagonal', direction: 'TL-BR' });
        }
    }
   
    if(!completedLines.some(line => line.direction === 'TR-BL')){
        if (isLineComplete(diagonal2, numberSelected)) {
            completedLines.push({ type: 'diagonal', direction: 'TR-BL' });
        }
    }
   

    return {
        completed: completedLines.length >= 5,
        completedLines
    };
};
