// Animation object with functions
// function load(cvs)
// function update()
// function draw()


// Convert text into pixel mask. 1 for filled pixel, 0 for empty pixel
function getTextMask(text, width, height, cell_size) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width * cell_size;
    canvas.height = height * cell_size;

    ctx.fillStyle = "black";
    ctx.font = `${cell_size * 30}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height * 4 / 7);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

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
    constructor() {
        this.width = 120;
        this.height = 40;
        this.cell_size = 8;
        this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(0));
        this.mask = getTextMask("Hello!", this.width, this.height, this.cell_size);
    }

    load(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Update canvas size
        this.canvas.width = this.width * this.cell_size;
        this.canvas.height = this.height * this.cell_size;

        // Randomly initialize the grid
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = Math.random() > 0.35 ? 1 : 0;
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

        let newGrid = this.grid.map(arr => arr.slice());
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let N = this.count_neighbors(this.grid, x, y);
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

        this.draw();
    }

    count_neighbors(grid, x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                let nx = (this.width + x + dx) % this.width;
                let ny = (this.height + y + dy) % this.height;
                count += grid[ny][nx];
            }
        }
        return count;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === 1) {
                    this.ctx.fillStyle = this.mask[y][x] === 1 ? "darkred" : "orangered";
                    this.ctx.beginPath();
                    this.ctx.arc(
                        x * this.cell_size + this.cell_size / 2 + Math.random() * 2 - 1,
                        y * this.cell_size + this.cell_size / 2 + Math.random() * 2 - 1,
                        this.cell_size / 2,
                        0,
                        2 * Math.PI
                    );
                    this.ctx.fill();
                } else if (this.mask[y][x] === 1) {
                    this.ctx.fillStyle = "lightgray";
                    this.ctx.beginPath();
                    this.ctx.arc(
                        x * this.cell_size + this.cell_size / 2 + Math.random() * 2 - 1,
                        y * this.cell_size + this.cell_size / 2 + Math.random() * 2 - 1,
                        this.cell_size / 2,
                        0,
                        2 * Math.PI
                    );
                    this.ctx.fill();
                }
            }
        }
    }
}

// Initialize the animation when the window loads
window.onload = function () {
    const canvas = document.getElementById("animation");
    if (canvas.getContext) {
        const anim = new GameOfLife();
        anim.load(canvas);
        // Start the animation loop
        this.intervalId = setInterval(() => {
            anim.update()
            anim.update();
        }, 100);
    }
}