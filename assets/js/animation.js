// Get color from CSS variable
function getCSSVariableColor(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function getResponsiveDimensions(canvas) {
    const width = document.body.clientWidth;
    const height = 400; // Fixed height for banner
    return { width: Math.ceil(width / 5), height: Math.ceil(height / 5), cellSize: 5 };
}

class GameOfLife {
    load(canvas) {
        const dims = getResponsiveDimensions(canvas);
        this.width = dims.width;
        this.height = dims.height;
        this.cell_size = dims.cellSize;
        this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(0));

        // Update canvas size
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = this.width * this.cell_size;
        this.canvas.height = this.height * this.cell_size;

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
        let colorAlive = getCSSVariableColor('--accent-color-1') || "black";
        let colorDead = getCSSVariableColor('--bg-color-1') || "white";

        // Draw cells
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.ctx.fillStyle = this.grid[y][x] === 1 ? colorAlive : colorDead;
                this.ctx.beginPath();
                this.ctx.arc(
                    x * this.cell_size + this.cell_size / 2,
                    y * this.cell_size + this.cell_size / 2,
                    Math.floor(this.cell_size / 2),
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
            }
        }
    }
}

class MarchingSquares {
    load(canvas) {
        const dims = getResponsiveDimensions(canvas);
        this.width = dims.width;
        this.height = dims.height;
        this.cell_size = dims.cellSize;
        this.grid = Array.from({ length: this.height + 2 }, () => Array(this.width + 2).fill(0));

        // Update canvas size
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = this.width * this.cell_size;
        this.canvas.height = this.height * this.cell_size;

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

        // update once to start with some dead cells
        this.update();
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
        let colorDead = getCSSVariableColor('--accent-color-1') || "black";

        // Draw cells
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 1; y < this.height + 1; y++) {
            for (let x = 1; x < this.width + 1; x++) {
                if (this.grid[y][x] === 0) {
                    this.ctx.fillStyle = colorDead;
                    this.ctx.beginPath();
                    this.ctx.rect(
                        (x + Math.random() / 4) * this.cell_size,
                        (y + Math.random() / 4) * this.cell_size,
                        this.cell_size / 2,
                        this.cell_size / 2
                    );
                    this.ctx.fill();
                }
            }
        }
    }
}

class Noise {
    load(canvas) {
        const dims = getResponsiveDimensions(canvas);
        this.width = dims.width;
        this.height = dims.height;
        this.cell_size = dims.cellSize;

        // Update canvas size
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = this.width * this.cell_size;
        this.canvas.height = this.height * this.cell_size;
    }

    update() {
        this.time += 0.1;
    }

    draw() {
        let color1 = getCSSVariableColor('--bg-color-1') || "black";
        let color2 = getCSSVariableColor('--accent-color-1') || "white";

        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = color1;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw noise
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let value = Math.random(); // Placeholder for actual Perlin noise function
                let color = value > 0.5 ? color2 : color1;
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.rect(
                    x * this.cell_size,
                    y * this.cell_size,
                    this.cell_size,
                    this.cell_size
                );
                this.ctx.fill();
            }
        }
    }
}

// Initialize the animation when the window loads
window.onload = function () {
    const canvas = document.getElementById("banner");
    if (canvas.getContext) {
        const anim = Math.random() > 1 / 3 ? (Math.random() > 1 / 2 ? new GameOfLife() : new MarchingSquares()) : new Noise();
        anim.load(canvas);
        setInterval(() => {
            anim.update()
            anim.draw();
        }, 100);

        addEventListener('resize', () => {
            if (canvas.getContext) {
                anim.load(canvas);
                anim.draw()
            }
        });
    }

}