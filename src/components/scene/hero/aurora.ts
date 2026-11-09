/**
 * Aurora curtains for the hero sky. A full-screen triangle; the fragment
 * shader draws two diagonal curtains with a bright lower fringe, vertical
 * rays and a long fading upper tail (the "Aurora Forest" reference).
 *
 * `uScroll` (0 at the top of the page, 1 after one hero height) shifts the
 * curtains' phase and lifts them, so the sky moves as the page scrolls.
 * Rendered at a reduced buffer size: the light is soft, so it upscales cleanly.
 */
export const AURORA_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const AURORA_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uScroll;
  uniform float uAspect;
  uniform float uNarrow;
  uniform vec3 uAccent;
  uniform vec3 uGlow;
  uniform vec3 uDeep;
  uniform vec3 uIce;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  // One curtain: centre line y = c0 + tilt * x, wobbling with noise.
  // Returns x = body intensity, y = how close to the lower fringe (0..1).
  vec2 curtain(vec2 p, float t, float c0, float tilt, float tail, float seed, float soft) {
    float wobble = 0.07 * sin(p.x * 2.1 + t * 0.21 + seed)
                 + 0.16 * (fbm(vec2(p.x * 1.3 + t * 0.06 + seed, t * 0.04)) - 0.5);
    float d = p.y - (c0 + tilt * p.x + wobble);
    float lower = smoothstep(-0.03 - soft, 0.02 + soft * 0.5, d);
    float upper = exp(-max(d, 0.0) / tail);
    float fringe = exp(-abs(d) * 34.0);
    float rays = fbm(vec2(p.x * 10.0 + t * 0.09 + seed * 3.0, d * 1.2 - t * 0.05));
    rays = 0.15 + 1.45 * pow(rays, 1.9);
    float body = lower * upper * rays;
    return vec2(body + fringe * 0.55 * rays, fringe);
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    float t = uTime + uScroll * 7.0;
    float lift = uScroll * 0.45;

    // Main curtain: from the top centre sweeping down to the right edge.
    float x0 = mix(0.45, 0.15, uNarrow) * uAspect;
    float tiltA = -0.62 / max(uAspect - x0, 0.3);
    vec2 a = curtain(p, t, 1.08 - tiltA * x0 + lift, tiltA, 0.42, 1.7, 0.0);

    // Second curtain: lower and softer, across the left.
    vec2 b = curtain(p, t * 0.8, 0.74 + lift * 0.8, -0.3 / uAspect, 0.2, 5.3, 0.12);

    float ia = a.x;
    float ib = b.x * 0.32;
    // Soft glow along the horizon.
    float horizon = exp(-max(vUv.y - 0.04, 0.0) * 6.0) * (0.32 + 0.06 * sin(t * 0.35));
    float intensity = ia + ib;

    vec3 body = mix(uDeep, uGlow, clamp(intensity * 1.2, 0.0, 1.0));
    vec3 colour = mix(body, uAccent, clamp(a.y + b.y * 0.6, 0.0, 1.0) * 0.85);
    colour = mix(colour, uIce, clamp(a.y * ia - 0.55, 0.0, 1.0));

    vec3 horizonColour = mix(uDeep, uGlow, 0.45);
    float total = clamp(intensity + horizon, 0.0, 1.0);
    vec3 mixed = (colour * clamp(intensity, 0.0, 1.0) + horizonColour * horizon) / max(intensity + horizon, 0.0001);
    float alpha = total * (1.0 - uScroll * 0.35);
    gl_FragColor = vec4(mixed * alpha, alpha);
  }
`;
