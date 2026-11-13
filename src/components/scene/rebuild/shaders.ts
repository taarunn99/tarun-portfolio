/**
 * The rebuild tiles. Every tile's whole journey is worked out here from the
 * story progress, so the CPU sends one number a frame:
 *
 *   p 0.05 to 0.13   the old page shudders
 *   p 0.10 to 0.36   it tips back and blows apart toward the viewer
 *   p 0.30 to 0.55   the tiles orbit as a storm
 *   p 0.50 to 0.80   they arc into the 62 clean blocks of the new site
 *   p 0.80 to 0.95   a light sweeps down the finished page
 *
 * Positions are in CSS px around the page box centre (z = 0 is the screen
 * plane at 1 unit per px), so the tiles line up with the HTML browser frame.
 */

export const REBUILD_VERTEX = /* glsl */ `
  attribute vec2 aOld;
  attribute float aOldSize;
  attribute float aOldRole;
  attribute vec2 aNew;
  attribute float aNewSize;
  attribute float aNewRole;
  attribute vec4 aSeed;

  uniform float uP;
  uniform float uTime;
  uniform float uW;        // page box width, px
  uniform float uAspect;   // page box width / height
  uniform vec2 uCenter;    // page box centre, px from the stage centre
  uniform float uPx;
  uniform float uCam;      // camera distance, px
  uniform vec3 uColors[8];
  uniform vec3 uAccent;
  uniform vec3 uIce;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vStorm;
  varying float vGather;

  vec3 roleColor(float r) {
    if (r < 0.5) return uColors[0];
    if (r < 1.5) return uColors[1];
    if (r < 2.5) return uColors[2];
    if (r < 3.5) return uColors[3];
    if (r < 4.5) return uColors[4];
    if (r < 5.5) return uColors[5];
    if (r < 6.5) return uColors[6];
    return uColors[7];
  }

  void main() {
    float p = uP;
    float boom = smoothstep(0.10 + aSeed.x * 0.08, 0.30 + aSeed.x * 0.06, p);
    float gather = smoothstep(0.50 + aSeed.y * 0.12, 0.70 + aSeed.y * 0.10, p);
    float shake = smoothstep(0.05, 0.13, p) * (1.0 - boom);

    // the old page, shuddering, then tipping back as it breaks
    vec3 old = vec3(aOld * uW, 0.0);
    old.xy += shake * vec2(sin(uTime * 47.0 + aSeed.z * 30.0), cos(uTime * 53.0 + aSeed.w * 30.0)) * 3.0;
    float tilt = boom * 0.9;
    old = vec3(old.x, old.y * cos(tilt), -old.y * sin(tilt));

    // the storm: a spinning disc tilted toward the viewer, faster near the
    // middle (like a galaxy), with a little height so it has body
    float rr = pow(aSeed.x, 0.7);
    float r = uW * (0.1 + 0.55 * rr);
    float a = aSeed.y * 6.2832 + (uTime * 0.25 + p * 7.0) * (1.3 - rr);
    vec3 storm = vec3(cos(a) * r, (aSeed.w - 0.5) * uW * 0.08 * (1.2 - rr), sin(a) * r);
    float lean = 0.42;
    storm = vec3(storm.x, storm.y * cos(lean) - storm.z * sin(lean), storm.y * sin(lean) + storm.z * cos(lean));
    float turn = p * 1.2;
    storm = vec3(storm.x * cos(turn) + storm.y * sin(turn), -storm.x * sin(turn) + storm.y * cos(turn), storm.z);

    // the new page
    vec3 fresh = vec3(aNew * uW, 0.0);

    vec3 pos = mix(old, storm, boom);
    pos.z += sin(boom * 3.1416) * uW * (0.15 + 0.35 * aSeed.z) * (1.0 - gather); // burst toward the viewer
    pos = mix(pos, fresh, gather);
    pos.z += sin(gather * 3.1416) * uW * 0.18 * aSeed.w; // arc in
    pos.xy += uCenter;

    // colour: dull old page, bright storm, clean new page
    vec3 oldC = roleColor(aOldRole) * 0.8;
    vec3 stormC = mix(uAccent, uIce, aSeed.z * aSeed.z) * (0.75 + 0.5 * (1.0 - rr));
    vec3 newC = roleColor(aNewRole);
    vec3 col = mix(mix(oldC, stormC, boom), newC, gather);

    // finished: a light sweeps down the page
    float settle = smoothstep(0.80, 0.95, p);
    float v = 0.5 - aNew.y * uAspect;
    float sweep = exp(-pow((settle * 1.3 - 0.15 - v) * 7.0, 2.0)) * step(0.001, settle);
    col += uAccent * 0.55 * sweep;

    vColor = col;
    vStorm = boom * (1.0 - gather);
    vGather = gather;
    vAlpha = mix(0.92, 1.0, boom);

    float size = mix(aOldSize, aOldSize * 1.15, boom);
    size = mix(size, aNewSize, gather) * uW;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(1.0, size * uPx * (uCam / -mv.z));
  }
`;

export const REBUILD_FRAGMENT = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vStorm;
  varying float vGather;

  void main() {
    // a square tile with softly rounded corners; in the storm, a faint glow;
    // on the new page the gaps close so the blocks read as solid
    vec2 c = gl_PointCoord - 0.5;
    vec2 q = abs(c) - mix(0.36, 0.42, vGather);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    float tile = 1.0 - smoothstep(0.08, 0.14, d);
    float glow = exp(-dot(c, c) * 9.0) * 0.35 * vStorm;
    float a = max(tile * vAlpha, glow);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * a, a);
  }
`;
