"use strict";
var utils = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    color: () => color_exports,
    noise: () => noise_exports
  });

  // src/core/color.ts
  var color_exports = {};
  __export(color_exports, {
    Color: () => Color,
    lerp: () => lerp2,
    parse: () => parse
  });

  // src/core/math.ts
  function lerp(t, a, b) {
    return a + t * (b - a);
  }
  function clamp(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
  }

  // src/core/color.ts
  var Color = class {
    constructor(str) {
      if (!str) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;
        return;
      }
      if (str.startsWith("#")) {
        this.#parseHex(str.slice(1));
      } else if (str.startsWith("rgb(")) {
        this.#fromRGBA(str.slice(4, -1));
      } else if (str.startsWith("rgba(")) {
        this.#fromRGBA(str.slice(5, -1));
      } else if (str.startsWith("hsl(")) {
        this.#fromHSLA(str.slice(4, -1));
      } else if (str.startsWith("hsla(")) {
        this.#fromHSLA(str.slice(5, -1));
      } else {
        throw new Error("Unsupported color format");
      }
    }
    #parseHex(str) {
      try {
        if (str.length === 3) {
          this.r = parseInt(str[0] + str[0], 16) / 255;
          this.g = parseInt(str[1] + str[1], 16) / 255;
          this.b = parseInt(str[2] + str[2], 16) / 255;
          this.a = 1;
        } else if (str.length === 6) {
          this.r = parseInt(str.slice(0, 2), 16) / 255;
          this.g = parseInt(str.slice(2, 4), 16) / 255;
          this.b = parseInt(str.slice(4, 6), 16) / 255;
          this.a = 1;
        } else if (str.length === 8) {
          this.r = parseInt(str.slice(0, 2), 16) / 255;
          this.g = parseInt(str.slice(2, 4), 16) / 255;
          this.b = parseInt(str.slice(4, 6), 16) / 255;
          this.a = parseInt(str.slice(6, 8), 16) / 255;
        } else {
          throw new Error("Invalid hex color format");
        }
        if (!Number.isFinite(this.r) || !Number.isFinite(this.g) || !Number.isFinite(this.b) || !Number.isFinite(this.a)) {
          throw new Error("Invalid hex color format");
        }
      } catch (e) {
        throw new Error("Invalid hex color format");
      }
    }
    #fromRGBA(str) {
      let parts = str.split(",").map((p2) => p2.trim());
      if (parts.length !== 3 && parts.length !== 4) {
        parts = str.split(" ").map((p2) => p2.trim()).filter((p2) => p2 !== "/" && p2 !== "");
      }
      if (parts.length !== 3 && parts.length !== 4) {
        throw new Error("Invalid RGB color format");
      }
      try {
        this.r = this.#parseRGBChannel(parts[0]) / 255;
        this.g = this.#parseRGBChannel(parts[1]) / 255;
        this.b = this.#parseRGBChannel(parts[2]) / 255;
        if (parts.length === 4) {
          this.a = this.#parseRGBChannel(parts[3], 1);
        } else {
          this.a = 1;
        }
      } catch (e) {
        throw new Error("Invalid RGB color format");
      }
    }
    /**
     * Converts a channel value which can be either absolute (0-max) or percentage (0%-100%) of max.
     * @param value The channel value as a string.
     * @param max The maximum value of the channel (default is 255.0).
     * @returns The channel value as a number within the specified range.
     */
    #parseRGBChannel(value, max = 255) {
      if (value.endsWith("%")) {
        return this.#parsePercentChannel(value) * max;
      }
      const number = this.#strictParseFloat(value);
      return clamp(number, 0, max);
    }
    #strictParseFloat(str) {
      if (!/^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(str.trim())) {
        throw new Error(`Invalid float: "${str}"`);
      }
      const num = parseFloat(str);
      if (!Number.isFinite(num)) {
        throw new Error(`Invalid float: "${str}"`);
      }
      return num;
    }
    /**
     * Converts a percentage string (e.g., "50%") to a number between 0.0 and 1.0.
     * @param value The percentage value as a string (e.g., "50%").
     * @returns The value as a number between 0.0 and 1.0.
     */
    #parsePercentChannel(value) {
      const percent = this.#strictParseFloat(value.slice(0, -1));
      return clamp(percent / 100, 0, 1);
    }
    #fromHSLA(str) {
      let parts = str.split(",").map((p2) => p2.trim());
      if (parts.length !== 3 && parts.length !== 4) {
        parts = str.split(" ").map((p2) => p2.trim()).filter((p2) => p2 !== "/" && p2 !== "");
      }
      if (parts.length !== 3 && parts.length !== 4) {
        throw new Error("Invalid HSL color format");
      }
      try {
        const h = this.#parseAngle(parts[0]) / 360;
        const s = this.#parsePercentChannel(parts[1]);
        const l = this.#parsePercentChannel(parts[2]);
        if (parts.length === 4) {
          this.a = this.#parseRGBChannel(parts[3], 1);
        } else {
          this.a = 1;
        }
        if (s === 0) {
          this.r = l;
          this.g = l;
          this.b = l;
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p2 = 2 * l - q;
          this.r = Math.round(this.#hueToRGB(p2, q, h + 1 / 3));
          this.g = Math.round(this.#hueToRGB(p2, q, h));
          this.b = Math.round(this.#hueToRGB(p2, q, h - 1 / 3));
        }
      } catch (e) {
        throw new Error("Invalid HSL color format");
      }
    }
    #parseAngle(value) {
      if (value.endsWith("deg")) {
        const angle = this.#strictParseFloat(value.slice(0, -3));
        return (angle % 360 + 360) % 360;
      } else if (value.endsWith("rad")) {
        const radians = this.#strictParseFloat(value.slice(0, -3));
        return (radians * (180 / Math.PI) % 360 + 360) % 360;
      } else if (value.endsWith("turn")) {
        const turns = this.#strictParseFloat(value.slice(0, -4));
        return (turns * 360 % 360 + 360) % 360;
      } else {
        return (this.#strictParseFloat(value) % 360 + 360) % 360;
      }
    }
    #hueToRGB(p2, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p2 + (q - p2) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p2 + (q - p2) * (2 / 3 - t) * 6;
      return p2;
    }
    toString() {
      return this.toRGB();
    }
    toHex() {
      const r = Math.round(this.r * 255).toString(16).padStart(2, "0");
      const g = Math.round(this.g * 255).toString(16).padStart(2, "0");
      const b = Math.round(this.b * 255).toString(16).padStart(2, "0");
      if (this.a < 1) {
        const a = Math.round(this.a * 255).toString(16).padStart(2, "0");
        return `#${r}${g}${b}${a}`;
      } else {
        return `#${r}${g}${b}`;
      }
    }
    toRGB() {
      const r = (this.r * 255).toFixed(2);
      const g = (this.g * 255).toFixed(2);
      const b = (this.b * 255).toFixed(2);
      if (this.a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${this.a.toFixed(2)})`;
      } else {
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    toHSL() {
      const r = this.r;
      const g = this.g;
      const b = this.b;
      const a = this.a;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      const delta = max - min;
      if (delta === 0) {
        h = 0;
        s = 0;
      } else {
        s = l < 0.5 ? delta / (max + min) : delta / (2 - max - min);
        switch (max) {
          case r:
            h = (g - b) / delta + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / delta + 2;
            break;
          case b:
            h = (r - g) / delta + 4;
            break;
          default:
            h = 0;
        }
        h /= 6;
      }
      const hDeg = (h * 360).toFixed(2);
      const sPerc = (s * 100).toFixed(2) + "%";
      const lPerc = (l * 100).toFixed(2) + "%";
      if (a < 1) {
        return `hsla(${hDeg}, ${sPerc}, ${lPerc}, ${a.toFixed(2)})`;
      } else {
        return `hsl(${hDeg}, ${sPerc}, ${lPerc})`;
      }
    }
  };
  function parse(str) {
    return new Color(str);
  }
  function lerp2(t, c1, c2) {
    let c = new Color();
    c.r = lerp(t, c1.r, c2.r);
    c.g = lerp(t, c1.g, c2.g);
    c.b = lerp(t, c1.b, c2.b);
    c.a = lerp(t, c1.a, c2.a);
    return c;
  }

  // src/core/noise.ts
  var noise_exports = {};
  __export(noise_exports, {
    perlin: () => perlin,
    perlin2: () => perlin2,
    perlin3: () => perlin3,
    perlin3Octaves: () => perlin3Octaves
  });
  var permutation = [
    151,
    160,
    137,
    91,
    90,
    15,
    131,
    13,
    201,
    95,
    96,
    53,
    194,
    233,
    7,
    225,
    140,
    36,
    103,
    30,
    69,
    142,
    8,
    99,
    37,
    240,
    21,
    10,
    23,
    190,
    6,
    148,
    247,
    120,
    234,
    75,
    0,
    26,
    197,
    62,
    94,
    252,
    219,
    203,
    117,
    35,
    11,
    32,
    57,
    177,
    33,
    88,
    237,
    149,
    56,
    87,
    174,
    20,
    125,
    136,
    171,
    168,
    68,
    175,
    74,
    165,
    71,
    134,
    139,
    48,
    27,
    166,
    77,
    146,
    158,
    231,
    83,
    111,
    229,
    122,
    60,
    211,
    133,
    230,
    220,
    105,
    92,
    41,
    55,
    46,
    245,
    40,
    244,
    102,
    143,
    54,
    65,
    25,
    63,
    161,
    1,
    216,
    80,
    73,
    209,
    76,
    132,
    187,
    208,
    89,
    18,
    169,
    200,
    196,
    135,
    130,
    116,
    188,
    159,
    86,
    164,
    100,
    109,
    198,
    173,
    186,
    3,
    64,
    52,
    217,
    226,
    250,
    124,
    123,
    5,
    202,
    38,
    147,
    118,
    126,
    255,
    82,
    85,
    212,
    207,
    206,
    59,
    227,
    47,
    16,
    58,
    17,
    182,
    189,
    28,
    42,
    223,
    183,
    170,
    213,
    119,
    248,
    152,
    2,
    44,
    154,
    163,
    70,
    221,
    153,
    101,
    155,
    167,
    43,
    172,
    9,
    129,
    22,
    39,
    253,
    19,
    98,
    108,
    110,
    79,
    113,
    224,
    232,
    178,
    185,
    112,
    104,
    218,
    246,
    97,
    228,
    251,
    34,
    242,
    193,
    238,
    210,
    144,
    12,
    191,
    179,
    162,
    241,
    81,
    51,
    145,
    235,
    249,
    14,
    239,
    107,
    49,
    192,
    214,
    31,
    181,
    199,
    106,
    157,
    184,
    84,
    204,
    176,
    115,
    121,
    50,
    45,
    127,
    4,
    150,
    254,
    138,
    236,
    205,
    93,
    222,
    114,
    67,
    29,
    24,
    72,
    243,
    141,
    128,
    195,
    78,
    66,
    215,
    61,
    156,
    180
  ];
  var p = Array.from({ length: 512 }, () => 0);
  for (let i = 0; i < 256; i++) {
    p[i] = permutation[i];
    p[256 + i] = permutation[i];
  }
  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  function perlin(x) {
    return perlin3(x, 0, 0);
  }
  function perlin2(x, y) {
    return perlin3(x, y, 0);
  }
  function perlin3(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;
    return lerp(
      w,
      lerp(
        v,
        lerp(
          u,
          grad(p[AA], x, y, z),
          // AND ADD
          grad(p[BA], x - 1, y, z)
        ),
        // BLENDED
        lerp(
          u,
          grad(p[AB], x, y - 1, z),
          // RESULTS
          grad(p[BB], x - 1, y - 1, z)
        )
      ),
      // FROM  8
      lerp(
        v,
        lerp(
          u,
          grad(p[AA + 1], x, y, z - 1),
          // CORNERS
          grad(p[BA + 1], x - 1, y, z - 1)
        ),
        // OF CUBE
        lerp(
          u,
          grad(p[AB + 1], x, y - 1, z - 1),
          grad(p[BB + 1], x - 1, y - 1, z - 1)
        )
      )
    );
  }
  function perlin3Octaves(x, y, z, octaves, persistence) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let totalAmplitute = 0;
    for (let i = 0; i < octaves; i++) {
      total += perlin3(x * frequency, y * frequency, z * frequency) * amplitude;
      totalAmplitute += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return total / totalAmplitute;
  }
  return __toCommonJS(src_exports);
})();
