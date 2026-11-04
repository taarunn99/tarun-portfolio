/**
 * Point-sprite shaders for the hero signal field. Each point carries a
 * scattered origin (`aNoise`) and its resting place on the skyline
 * (`position`); `uProgress` morphs between the two with a per-point stagger
 * so the city resolves wave by wave rather than all at once.
 */
export const POINT_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aNoise;
  attribute float aScale;
  attribute float aPhase;
  attribute float aTint;
  varying float vAlpha;
  varying float vTint;

  void main() {
    float delay = aPhase / 6.2831853;
    float p = clamp((uProgress - delay * 0.4) / 0.6, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);

    vec3 from = aNoise;
    from.x += sin(uTime * 0.6 + aPhase) * 0.18;
    from.y += cos(uTime * 0.5 + aPhase * 1.3) * 0.18;
    from.z += sin(uTime * 0.4 + aPhase * 0.7) * 0.18;

    vec3 pos = mix(from, position, p);
    pos.z += sin(uTime * 0.45 + aPhase) * 0.03 * p;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * aScale * uPixelRatio / -mvPosition.z;

    float twinkle = 0.7 + 0.3 * sin(uTime * 1.4 + aPhase * 5.0);
    float depth = smoothstep(-11.0, -4.5, mvPosition.z);
    vAlpha = twinkle * mix(0.35, 1.0, depth) * mix(0.3, 1.0, p);
    vTint = aTint;
  }
`;

export const POINT_FRAGMENT = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uFg;
  varying float vAlpha;
  varying float vTint;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float halo = smoothstep(0.5, 0.1, d) * 0.6;
    float core = smoothstep(0.2, 0.0, d) * 0.9;
    vec3 colour = mix(uAccent, uFg, vTint);
    gl_FragColor = vec4(colour, (halo + core) * vAlpha);
  }
`;
