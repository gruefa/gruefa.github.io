// Get color from CSS variable
function getCSSVariableColor(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function getResponsiveDimensions() {
    const width = window.innerWidth;
    if (width > 1200) {
        return { width: Math.round(width / 8), height: 40, cellSize: 8 };
    } else {
        return { width: 150, height: Math.round(220 * 150 / width), cellSize: 8 };
    }
}

function getTextMask(text, width, height, cell_size) {
    // Draw text on offscreen canvas and get pixel data
    const canvas = document.createElement("canvas");
    canvas.width = width * cell_size;
    canvas.height = height * cell_size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.font = `${cell_size * 26}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create mask based on alpha channel
    let mask = Array.from({ length: height }, () => Array(width).fill(0));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let pixelIndex = ((y * cell_size) * canvas.width + (x * cell_size)) * 4;
            let alpha = data[pixelIndex + 3];
            if (alpha > 128) {
                mask[y][x] = 1;
            }
        }
    }
    return mask;
}

class GameOfLife {
    load(canvas, text) {
        const dims = getResponsiveDimensions();
        this.width = dims.width;
        this.height = dims.height;
        this.cell_size = dims.cellSize;
        this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(0));
        this.mask = getTextMask(text.innerHTML || "Hello!", this.width, this.height, this.cell_size);

        // Update canvas size
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = this.width * this.cell_size;
        this.canvas.height = this.height * this.cell_size;

        // Set text invisible
        text.style.color = "#fff0";

        // Randomly initialize the grid
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = Math.random() > 0.5 ? 1 : 0;
            }
        }
    }

    update() {
        // Set random cells to alive
        for (let i = 0; i < 5; i++) {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);
            this.grid[y][x] = 1;
        }

        // Apply Game of Life rules
        let newGrid = this.grid.map(arr => arr.slice());
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let N = this.count_neighbors(this.grid, x, y, this.width, this.height);
                if (N === 3) {
                    newGrid[y][x] = 1;
                } else if (N < 2 || N > 3) {
                    newGrid[y][x] = 0;
                } else {
                    newGrid[y][x] = this.grid[y][x];
                }
            }
        }
        this.grid = newGrid;
    }

    count_neighbors(grid, x, y, width, height) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                let nx = (width + x + dx) % width;
                let ny = (height + y + dy) % height;
                count += grid[ny][nx];
            }
        }
        return count;
    }

    draw() {
        // Get current theme colors
        let colorAliveMask = getCSSVariableColor('--accent-color-2') || "darkred";
        let colorAlive = getCSSVariableColor('--accent-color-1') || "orangered";
        let colorDeadMask = getCSSVariableColor('--text-color') || "#8888af";
        let colorDead = getCSSVariableColor('--bg-color-2') || "#eeeef8";

        // Draw cells
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === 1) {
                    this.ctx.fillStyle = this.mask[y][x] === 1 ? colorAliveMask : colorAlive;

                } else {
                    this.ctx.fillStyle = this.mask[y][x] === 1 ? colorDeadMask : colorDead;
                }
                this.ctx.beginPath();
                this.ctx.arc(
                    x * this.cell_size + this.cell_size / 2 + Math.random() - 0.5,
                    y * this.cell_size + this.cell_size / 2 + Math.random() - 0.5,
                    this.cell_size / 2,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
            }
        }
    }
}

class MarchingSquares {
    load(canvas, text) {
        const dims = getResponsiveDimensions();
        this.width = dims.width;
        this.height = dims.height;
        this.cell_size = dims.cellSize;
        this.grid = Array.from({ length: this.height + 2 }, () => Array(this.width + 2).fill(0));
        this.mask = getTextMask(text.innerHTML || "Hello!", this.width, this.height, this.cell_size);

        // Update canvas size
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = this.width * this.cell_size;
        this.canvas.height = this.height * this.cell_size;

        // Set text invisible
        text.style.color = "#fff0";

        // Randomly initialize the grid
        for (let y = 0; y < this.height + 2; y++) {
            for (let x = 0; x < this.width + 2; x++) {
                this.grid[y][x] = Math.random() > 0.5 ? 1 : 0;
            }
        }

        // Set outer border to alive
        for (let x = 0; x < this.width + 2; x++) {
            this.grid[0][x] = 1;
            this.grid[this.height + 1][x] = 1;
        }
        for (let y = 0; y < this.height + 2; y++) {
            this.grid[y][0] = 1;
            this.grid[y][this.width + 1] = 1;
        }
    }

    update() {
        // Apply Marching Squares Rules
        let newGrid = this.grid.map(arr => arr.slice());
        for (let y = 1; y < this.height + 1; y++) {
            for (let x = 1; x < this.width + 1; x++) {
                let N = this.count_neighbors(this.grid, x, y, this.width, this.height);
                if (N > 4) {
                    newGrid[y][x] = 1;
                } else if (N < 4) {
                    newGrid[y][x] = 0;
                } else {
                    newGrid[y][x] = this.grid[y][x];
                }
            }
        }
        this.grid = newGrid;
    }

    count_neighbors(grid, x, y, width, height) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                count += grid[y + dy][x + dx];
            }
        }
        return count;
    }

    draw() {
        // Get current theme colors
        let colorAliveMask = getCSSVariableColor('--accent-color-2') || "darkred";
        let colorAlive = getCSSVariableColor('--accent-color-1') || "orangered";
        let colorDeadMask = getCSSVariableColor('--text-color') || "#8888af";
        let colorDead = getCSSVariableColor('--bg-color-2') || "#eeeef8";

        // Draw cells
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 1; y < this.height + 1; y++) {
            for (let x = 1; x < this.width + 1; x++) {
                if (this.grid[y][x] === 1) {
                    this.ctx.fillStyle = this.mask[y - 1][x - 1] === 1 ? colorDeadMask : colorDead;
                } else {
                    this.ctx.fillStyle = this.mask[y - 1][x - 1] === 1 ? colorAliveMask : colorAlive;
                }
                this.ctx.beginPath();
                // this.ctx.rect(
                //     x * this.cell_size,
                //     y * this.cell_size,
                //     this.cell_size,
                //     this.cell_size
                // );
                this.ctx.arc(
                    (x - 1) * this.cell_size + this.cell_size / 2 + Math.random() - 0.5,
                    (y - 1) * this.cell_size + this.cell_size / 2 + Math.random() - 0.5,
                    this.cell_size / 2,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
            }
        }
    }
}

// Initialize the animation when the window loads
window.onload = function () {
    const canvas = document.getElementById("animation");
    const text = document.getElementById("text");
    if (canvas.getContext) {
        const anim = Math.random() > 0.5 ? new GameOfLife() : new MarchingSquares();
        anim.load(canvas, text);
        this.intervalId = setInterval(() => {
            anim.update()
            anim.draw();
        }, 100);

        addEventListener('resize', () => {
            if (canvas.getContext) {
                anim.load(canvas, text);
            }
        });

        addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(this.intervalId);
            } else {
                this.intervalId = setInterval(() => {
                    anim.update()
                    anim.draw();
                }, 100);
            }
        });
    }

}