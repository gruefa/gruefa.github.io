// Get color from CSS variable
function getCSSVariableColor(variableName, fallback = '#000') {
    const str = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    if (str) {
        return utils.color.parse(str);
    } else {
        return utils.color.parse(fallback);
    }
}

function getResponsiveDimensions(canvas) {
    const width = parseInt(getComputedStyle(canvas).width, 10);
    const height = parseInt(getComputedStyle(canvas).height, 10);
    return { width: width, height: height };
}

class GameOfLife {
    load(canvas) {
        this.cell_size = 8
        const dims = getResponsiveDimensions(canvas);
        this.width = Math.ceil(dims.width / this.cell_size);
        this.height = Math.ceil(dims.height / this.cell_size);
        this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(0));

        // Update canvas size
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = this.width * this.cell_size;
        this.canvas.height = this.height * this.cell_size;

        // Keep track of time
        this.time = 0;

        // Randomly initialize the grid
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = Math.random() > 0.5 ? 1 : 0;
            }
        }

        // Update once to remove first iteration of starving cells
        this.update();
    }

    update(dt) {

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
        let colorAlive = getCSSVariableColor('--accent-color-1')
        let colorDead = getCSSVariableColor('--bg-color-1', '#fff');

        // Draw cells
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.ctx.fillStyle = this.grid[y][x] === 1 ? colorAlive.toHex() : colorDead.toHex();
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
        this.cell_size = 5
        const dims = getResponsiveDimensions(canvas);
        this.width = Math.ceil(dims.width / this.cell_size);
        this.height = Math.ceil(dims.height / this.cell_size);
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

    update(dt) {
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
        let colorDead = getCSSVariableColor('--accent-color-1');

        // Draw cells
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 1; y < this.height + 1; y++) {
            for (let x = 1; x < this.width + 1; x++) {
                if (this.grid[y][x] === 0) {
                    this.ctx.fillStyle = colorDead.toHex();
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

class Topography {
    load(canvas) {
        this.cell_size = 6;
        const dims = getResponsiveDimensions(canvas);
        this.width = Math.ceil(dims.width / this.cell_size);
        this.height = Math.ceil(dims.height / this.cell_size);

        // Update canvas size
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = this.width * this.cell_size;
        this.canvas.height = this.height * this.cell_size;

        this.t = 0.00;
        this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(0));
    }

    update(dt) {
        this.t += 0.01 * dt;

        // Update bubble value based on noise
        const octaves = 4;
        const persistence = 0.5;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const value = utils.noise.perlin3Octaves(
                    0.05 * (x - 5 * 0.01 * this.t),
                    0.05 * (y + 2 * 0.01 * this.t),
                    0.001 * this.t,
                    octaves,
                    persistence
                );
                this.grid[y][x] = 0.5 * (1 + value);
            }
        }
    }

    draw() {
        const color1 = getCSSVariableColor('--accent-color-1');
        const color2 = getCSSVariableColor('--bg-color-1', '#fff');

        // Draw high value cells
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] > 0.5) {
                    const color = utils.color.lerp((this.grid[y][x] - 0.5) / 0.5, color1, color2);
                    this.ctx.fillStyle = color.toHex();
                }
                else { continue; }
                this.ctx.beginPath();
                this.ctx.arc(
                    x * this.cell_size + this.cell_size / 2,
                    y * this.cell_size + this.cell_size / 2,
                    Math.ceil(this.cell_size / 2 - 1),
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
            }
        }

        // Draw outlines
        this.ctx.strokeStyle = color1.toHex();
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.drawOutlines(0.5);
        this.ctx.stroke();
    }

    drawOutlines(threshold = 0.5) {
        for (let y = 0; y < this.height - 1; y++) {
            for (let x = 0; x < this.width - 1; x++) {
                let state = 0;
                if (this.grid[y][x] > threshold) state |= 1;
                if (this.grid[y][x + 1] > threshold) state |= 2;
                if (this.grid[y + 1][x + 1] > threshold) state |= 4;
                if (this.grid[y + 1][x] > threshold) state |= 8;

                let cx = (x + 0.5) * this.cell_size;
                let cy = (y + 1.5) * this.cell_size; // Flip y-axis
                switch (state) {
                    case 1:
                    case 14:
                        this.ctx.moveTo(cx, cy - this.cell_size / 2);
                        this.ctx.lineTo(cx + this.cell_size / 2, cy - this.cell_size);
                        break;
                    case 2:
                    case 13:
                        this.ctx.moveTo(cx + this.cell_size / 2, cy - this.cell_size);
                        this.ctx.lineTo(cx + this.cell_size, cy - this.cell_size / 2);
                        break;
                    case 3:
                    case 12:
                        this.ctx.moveTo(cx, cy - this.cell_size / 2);
                        this.ctx.lineTo(cx + this.cell_size, cy - this.cell_size / 2);
                        break;
                    case 4:
                    case 11:
                        this.ctx.moveTo(cx + this.cell_size / 2, cy);
                        this.ctx.lineTo(cx + this.cell_size, cy - this.cell_size / 2);
                        break;
                    case 5:
                        this.ctx.moveTo(cx, cy - this.cell_size / 2);
                        this.ctx.lineTo(cx + this.cell_size / 2, cy);
                        this.ctx.moveTo(cx + this.cell_size / 2, cy - this.cell_size);
                        this.ctx.lineTo(cx + this.cell_size, cy - this.cell_size / 2);
                        break;
                    case 6:
                    case 9:
                        this.ctx.moveTo(cx + this.cell_size / 2, cy);
                        this.ctx.lineTo(cx + this.cell_size / 2, cy - this.cell_size);
                        break;
                    case 7:
                    case 8:
                        this.ctx.moveTo(cx, cy - this.cell_size / 2);
                        this.ctx.lineTo(cx + this.cell_size / 2, cy);
                        break;
                    case 10:
                        this.ctx.moveTo(cx + this.cell_size / 2, cy);
                        this.ctx.lineTo(cx + this.cell_size, cy - this.cell_size / 2);
                        this.ctx.moveTo(cx, cy - this.cell_size / 2);
                        this.ctx.lineTo(cx + this.cell_size / 2, cy - this.cell_size);
                        break;
                }
            }
        }
    }
}

class Bubbles {
    load(canvas) {
        this.cell_size = 10;
        const dims = getResponsiveDimensions(canvas);
        this.width = Math.ceil(dims.width / this.cell_size);
        this.height = Math.ceil(dims.height / this.cell_size);

        // Update canvas size
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = this.width * this.cell_size;
        this.canvas.height = this.height * this.cell_size;

        this.t = 0.00;
    }

    update(dt) {
        this.t += 0.001 * dt;
    }

    draw() {
        const color1 = getCSSVariableColor('--bg-color-2');
        const color2 = getCSSVariableColor('--accent-color-1', '#fff');

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bubbles
        const persistence = 0.5;
        const octaves = 6;
        let frequency = 1;
        let amplitude = 1;
        for (let i = 0; i < octaves; i++) {
            this.ctx.globalAlpha = amplitude;
            for (let y = 0; y < this.height + frequency; y += frequency) {
                for (let x = 0; x < this.width + frequency; x += frequency) {
                    let value = utils.noise.perlin3(0.1 * x, 0.1 * y + 0.01 * this.t, 0.01 * this.t * frequency);
                    const color = utils.color.lerp((0.5 * (1 + value)) ** 2, color1, color2);
                    this.ctx.fillStyle = color.toRGB();
                    this.ctx.beginPath();
                    this.ctx.arc(
                        x * this.cell_size,
                        y * this.cell_size,
                        0.5 * this.cell_size * frequency,
                        0,
                        2 * Math.PI
                    );
                    this.ctx.fill();
                }
            }
            frequency *= 2;
            amplitude *= persistence;
        }
    }
}

class RadialGradients {
    load(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        const dims = getResponsiveDimensions(canvas);
        this.canvas.width = dims.width;
        this.canvas.height = dims.height;

        // Initialize gradients
        this.gradients = [
            { x: 0, y: 0, color: '--accent-color-1', fallbackColor: "lightgrey", r: 0.5 },
            { x: this.canvas.width, y: this.canvas.height, color: '--accent-color-2', fallbackColor: "grey", r: 0.5 },
        ];
        this.t = 0.0;

        // Create grain texture
        this.grainTxtr = document.createElement('canvas');
        const minDim = Math.min(this.canvas.width, this.canvas.height);
        this.grainTxtr.width = minDim / 2;
        this.grainTxtr.height = minDim / 2;
        let grainCtx = this.grainTxtr.getContext('2d');
        let imageData = grainCtx.createImageData(this.grainTxtr.width, this.grainTxtr.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            let shade = Math.floor(Math.random() * 256);
            imageData.data[i] = shade;
            imageData.data[i + 1] = shade;
            imageData.data[i + 2] = shade;
            imageData.data[i + 3] = 15; // Low alpha for subtlety
        }
        grainCtx.putImageData(imageData, 0, 0);
    }

    #rotatePoint(p, o, angle) {
        let s = Math.sin(angle);
        let c = Math.cos(angle);

        // Translate point back to origin
        let px = p.x - o.x;
        let py = p.y - o.y;

        // Rotate point
        let xnew = px * c - py * s;
        let ynew = px * s + py * c;

        // Translate point back
        return { x: xnew + o.x, y: ynew + o.y };
    }

    update(dt) {
        this.t += dt;

        // Update gradient positions
        const origin = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        for (let g of this.gradients) {
            const rotated = this.#rotatePoint(g, origin, Math.cos(this.t) * 0.01);
            g.x = rotated.x;
            g.y = rotated.y;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Create radial gradient
        const bgColor = getCSSVariableColor('--bg-color-1', '#fff');
        this.ctx.globalAlpha = 0.5;
        this.ctx.globalCompositeOperation = 'multiply';
        for (let g of this.gradients) {
            let gradient = this.ctx.createRadialGradient(
                g.x, g.y, 0,
                g.x, g.y, Math.sqrt(this.canvas.width ** 2 + this.canvas.height ** 2) * g.r
            );
            const fgColor = getCSSVariableColor(g.color, g.fallbackColor);
            gradient.addColorStop(0, fgColor.toRGB());
            gradient.addColorStop(1, bgColor.toRGB());
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.ctx.globalCompositeOperation = 'source-over';

        // Draw grain texture
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = this.ctx.createPattern(this.grainTxtr, 'repeat');
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Random animation selection
let animation;
let max_fps = 60;
function chooseRandomAnimation() {
    const choice = Math.floor(Math.random() * 5);
    console.debug(`choice=${choice}`)
    switch (choice) {
        case 0:
            animation = new GameOfLife();
            max_fps = 8;
            break;
        case 1:
            animation = new MarchingSquares();
            max_fps = 10;
            break;
        case 2:
            animation = new Topography();
            max_fps = 30;
            break;
        case 3:
            animation = new Bubbles();
            max_fps = 20;
            break;
        case 4:
            animation = new RadialGradients();
            max_fps = 60;
            break;
        default:
            console.error("Animation index out of bounds. Return animation Game of Life as fallback")
            animation = new GameOfLife();
            max_fps = 8;
    }
}

// Main animation loop
let lastDraw = 0;
function loop(time) {

    // Cap max. framerate
    requestAnimationFrame(loop);
    const dt = time - lastDraw;
    if (dt <= (1000 / max_fps)) {
        return;
    }
    console.debug(`dt = ${dt}`)
    lastDraw = time;

    animation.update(dt)
    animation.draw();
}

// Initialize animation on page load
function onload() {
    const canvas = document.getElementById("banner");
    if (!canvas.getContext) {
        return;
    }

    chooseRandomAnimation();
    animation.load(canvas);
    requestAnimationFrame(loop);

    // Only reload the canvas after window resizing is complete
    let resizeTimeout;
    addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            animation.load(canvas);
        }, 100);
    });
}
addEventListener('load', onload);
