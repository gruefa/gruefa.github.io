// Get color from CSS variable
function getCSSVariableColor(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function getResponsiveDimensions(canvas) {
    const width = parseInt(getComputedStyle(canvas).width, 10);
    const height = parseInt(getComputedStyle(canvas).height, 10);
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

        // Update once to remove first iteration of starving cells
        this.update();
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

        // Update once to start with some dead cells
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

class Color {
    lerpColor(color1, color2, t) {
        let c1 = this.stringToRGB(color1);
        let c2 = this.stringToRGB(color2);
        let r = Math.round(this.lerp(c1[0], c2[0], t));
        let g = Math.round(this.lerp(c1[1], c2[1], t));
        let b = Math.round(this.lerp(c1[2], c2[2], t));
        return `rgb(${r},${g},${b})`;
    }
    stringToRGB(color) {
        if (color.startsWith('#')) {
            let bigint = parseInt(color.slice(1), 16);
            return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
        } else if (color.startsWith('rgb')) {
            return color.match(/\d+/g).map(Number);
        }
        return [0, 0, 0]; // Default to black if unknown format
    }
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
}

// Found at https://asserttrue.blogspot.com/2011/12/perlin-noise-in-javascript_31.html on 2025-09-12
class PerlinNoise {
    noise(x, y, z) {
        let p = new Array(512)
        let permutation = [151, 160, 137, 91, 90, 15,
            131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
            190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
            88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
            77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
            102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
            135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
            5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
            223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
            129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
            251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
            49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
            138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
        ];
        for (let i = 0; i < 256; i++)
            p[256 + i] = p[i] = permutation[i];

        let X = Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
            Y = Math.floor(y) & 255,                  // CONTAINS POINT.
            Z = Math.floor(z) & 255;
        x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
        y -= Math.floor(y);                                // OF POINT IN CUBE.
        z -= Math.floor(z);
        let u = this.fade(x),                                // COMPUTE FADE CURVES
            v = this.fade(y),                                // FOR EACH OF X,Y,Z.
            w = this.fade(z);
        let A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z,      // HASH COORDINATES OF
            B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;      // THE 8 CUBE CORNERS,

        return this.scale(this.lerp(w, this.lerp(v, this.lerp(u, this.grad(p[AA], x, y, z),  // AND ADD
            this.grad(p[BA], x - 1, y, z)), // BLENDED
            this.lerp(u, this.grad(p[AB], x, y - 1, z),  // RESULTS
                this.grad(p[BB], x - 1, y - 1, z))),// FROM  8
            this.lerp(v, this.lerp(u, this.grad(p[AA + 1], x, y, z - 1),  // CORNERS
                this.grad(p[BA + 1], x - 1, y, z - 1)), // OF CUBE
                this.lerp(u, this.grad(p[AB + 1], x, y - 1, z - 1),
                    this.grad(p[BB + 1], x - 1, y - 1, z - 1)))));
    }
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y, z) {
        let h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
        let u = h < 8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
            v = h < 4 ? y : h == 12 || h == 14 ? x : z;
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
    }
    scale(n) { return (1 + n) / 2; }
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

        this.t = 0.00;
        this.noise = new PerlinNoise();
        this.c = new Color();
    }

    update() {
        this.t += 0.02;
    }

    draw() {
        let color1 = getCSSVariableColor('--bg-color-2') || "white";
        let color2 = getCSSVariableColor('--accent-color-1') || "black";

        // Draw noise
        const N = 6;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = N; i > 0; i--) {
            let inc = 2 ** i;
            this.ctx.globalAlpha = i / N;
            for (let y = 0; y < this.height / inc + 1; y++) {
                for (let x = 0; x < this.width / inc + 1; x++) {
                    let value = this.noise.noise(x + 3.141, y + 5.926 - this.t, this.t / inc);
                    let color = this.c.lerpColor(color1, color2, value)
                    this.ctx.fillStyle = color;
                    this.ctx.beginPath();
                    this.ctx.arc(
                        x * inc * this.cell_size,
                        y * inc * this.cell_size,
                        0.5 * (inc * this.cell_size),
                        0,
                        2 * Math.PI
                    );
                    this.ctx.fill();
                }
            }
        }
    }
}

function chooseRandomAnimation() {
    const animations = [
        { instance: new GameOfLife(), interval: 100 },
        { instance: new MarchingSquares(), interval: 100 },
        { instance: new Noise(), interval: 100 }
    ];
    return animations[Math.floor(Math.random() * animations.length)];
}

function onload() {
    const canvas = document.getElementById("banner");
    if (!canvas.getContext) return;

    const { instance: anim, interval } = chooseRandomAnimation();
    anim.load(canvas);
    anim.draw();

    const timer = setInterval(() => {
        anim.update();
        anim.draw();
    }, interval);

    let resizeTimeout;
    addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            anim.load(canvas);
            anim.draw();
        }, 100);
    });
}
addEventListener('load', onload);