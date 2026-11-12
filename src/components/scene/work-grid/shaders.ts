/**
 * GLSL for the work grid. Two programs:
 *  - tile: the instanced grid itself (atlas sample, hover glow, intro opacity)
 *  - lens: the full-screen barrel-distortion + vignette pass
 *
 * `#include <colorspace_fragment>` lets three encode to sRGB only when the
 * draw targets the screen; into the intermediate render target it is a no-op.
 */

export const TILE_VERTEX = /* glsl */ `
  attribute float aTile;
  attribute float aIndex;
  uniform float uCells;
  varying vec2 vUv;
  varying vec2 vCell;
  varying float vIndex;

  void main() {
    vUv = uv;
    vIndex = aIndex;
    float cx = mod(aTile, uCells);
    float cy = floor(aTile / uCells);
    // Atlas rows are painted top-down on the canvas; texture v runs bottom-up.
    vCell = vec2(cx, uCells - 1.0 - cy) / uCells;
    vec4 world = instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * world;
  }
`;

export const TILE_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uAtlas;
  uniform float uCells;
  uniform vec2 uMediaOrigin;
  uniform vec2 uMediaSize;
  uniform float uActive[2];
  uniform float uIntensity[2];
  uniform float uOpacity;
  uniform vec3 uBg;
  varying vec2 vUv;
  varying vec2 vCell;
  varying float vIndex;

  void main() {
    float cell = 1.0 / uCells;
    float hov = 0.0;
    if (abs(vIndex - uActive[0]) < 0.5) hov = uIntensity[0];
    else if (abs(vIndex - uActive[1]) < 0.5) hov = uIntensity[1];

    // Tile background + label strip straight from the atlas cell.
    vec3 color = texture2D(uAtlas, vCell + vUv * cell).rgb;

    // Hovered tile: a blurred, 20x-zoomed sample of its own cover lights the
    // tile behind the media (LOD bias stands in for the box blur).
    if (hov > 0.001) {
      vec2 mc = uMediaOrigin + uMediaSize * 0.5;
      vec2 g = mc + (vUv - 0.5) * 0.05;
      vec3 glow = texture2D(uAtlas, vCell + g * cell, 6.0).rgb;
      glow += texture2D(uAtlas, vCell + (g + vec2(0.012, 0.0)) * cell, 6.0).rgb;
      glow += texture2D(uAtlas, vCell + (g - vec2(0.012, 0.0)) * cell, 6.0).rgb;
      glow += texture2D(uAtlas, vCell + (g + vec2(0.0, 0.012)) * cell, 6.0).rgb;
      glow += texture2D(uAtlas, vCell + (g - vec2(0.0, 0.012)) * cell, 6.0).rgb;
      glow *= 0.2;
      float edge = 1.0 - smoothstep(0.34, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
      color += glow * 0.7 * hov * edge;
    }

    // Media window: 70% of the tile, scaled 1.0 -> 1.04 and brightened on hover.
    float s = 1.0 + 0.04 * hov;
    vec2 mc2 = uMediaOrigin + uMediaSize * 0.5;
    vec2 mUv = (vUv - mc2) / (uMediaSize * s) + 0.5;
    vec2 inside = step(vec2(0.0), mUv) * step(mUv, vec2(1.0));
    float inMedia = inside.x * inside.y;
    vec2 mediaUv = vCell + (uMediaOrigin + clamp(mUv, 0.0, 1.0) * uMediaSize) * cell;
    vec3 media = texture2D(uAtlas, mediaUv).rgb;
    // At rest the covers sit in nickel greyscale so the wall reads black;
    // the hovered tile comes back to full colour.
    float lum = dot(media, vec3(0.299, 0.587, 0.114));
    media = mix(vec3(lum) * 0.82, media, 0.18 + 0.82 * hov) * (1.0 + 0.12 * hov);
    color = mix(color, media, inMedia);

    color = mix(uBg, color, uOpacity);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const LENS_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const LENS_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform float uK;
  uniform vec3 uBg;
  varying vec2 vUv;

  void main() {
    vec2 m = 2.0 * (vUv - 0.5);
    vec2 uv = ((0.88 + uK * dot(m, m)) * m) * 0.5 + 0.5;
    vec3 color;
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) {
      color = uBg;
    } else {
      color = texture2D(tDiffuse, uv).rgb;
    }
    float d = distance(vUv, vec2(0.5)) * 1.2;
    float vignette = smoothstep(0.8, 0.6 * 0.799, d);
    color = mix(uBg, color, vignette);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;
