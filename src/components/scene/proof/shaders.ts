/**
 * Particle numbers. Every particle has a home in each of the six numbers
 * (aT0..aT5). `uF` is the morph position (2.4 = 40% of the way from number
 * 2 to number 3); each particle leaves on its own small delay and bursts
 * outward mid-flight. `uForm` gathers them from a loose cloud as the
 * section arrives. The pointer pushes particles away; they spring back as it
 * leaves because the push is a function of distance, not stored state.
 *
 * Coordinates are CSS pixels with the origin at the viewport centre, y up.
 */
export const PROOF_VERTEX = /* glsl */ `
attribute vec2 aT0;
attribute vec2 aT1;
attribute vec2 aT2;
attribute vec2 aT3;
attribute vec2 aT4;
attribute vec2 aT5;
attribute vec4 aSeed;

uniform float uF;
uniform float uForm;
uniform float uTime;
uniform vec2 uCenter;
uniform vec2 uBox;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uRadius;
uniform float uSize;
uniform float uPx;

varying float vAlpha;
varying float vTone;
varying float vHeat;

vec2 home(float k) {
  if (k < 0.5) return aT0;
  if (k < 1.5) return aT1;
  if (k < 2.5) return aT2;
  if (k < 3.5) return aT3;
  if (k < 4.5) return aT4;
  return aT5;
}

void main() {
  float a = floor(uF);
  float t = uF - a;
  float tt = clamp((t - aSeed.x * 0.4) / 0.6, 0.0, 1.0);
  tt = tt * tt * (3.0 - 2.0 * tt);

  vec2 from = home(a);
  vec2 to = home(min(a + 1.0, 5.0));
  vec2 pos = mix(from, to, tt);

  // burst outward mid-flight
  float flight = sin(3.14159265 * tt);
  pos += aSeed.zw * flight * uBox.x * 0.32;

  // gather from a loose cloud as the section arrives
  float form = clamp((uForm - aSeed.x * 0.35) / 0.65, 0.0, 1.0);
  form = form * form * (3.0 - 2.0 * form);
  vec2 cloud = aSeed.zw * uBox.x * 0.9 + vec2(0.0, -uBox.y * 0.6);
  pos = mix(cloud, pos, form);

  // idle shimmer
  pos += vec2(sin(uTime * 1.3 + aSeed.x * 40.0), cos(uTime * 1.1 + aSeed.y * 30.0)) * 0.9;

  vec2 world = pos + uCenter;

  // pointer pushes particles aside
  vec2 d = world - uMouse;
  float dist = length(d);
  float push = uMouseOn * (1.0 - smoothstep(0.0, uRadius, dist));
  world += (d / max(dist, 0.001)) * push * uRadius * 0.45;

  gl_Position = projectionMatrix * vec4(world, 0.0, 1.0);
  gl_PointSize = uSize * uPx * (0.55 + aSeed.y * 0.9) * (1.0 + flight * 0.35);

  vAlpha = (0.55 + aSeed.y * 0.45) * mix(0.25, 1.0, form);
  vTone = aSeed.y;
  vHeat = clamp(flight + push, 0.0, 1.0);
}
`;

export const PROOF_FRAGMENT = /* glsl */ `
uniform vec3 uAccent;
uniform vec3 uIce;

varying float vAlpha;
varying float vTone;
varying float vHeat;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.08, d) * vAlpha;
  if (a < 0.01) discard;
  vec3 col = mix(uAccent, uIce, vTone * 0.45 + vHeat * 0.5);
  gl_FragColor = vec4(col * a, a);
}
`;
