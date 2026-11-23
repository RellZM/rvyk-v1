'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Renderer, Program, Mesh, Triangle, Plane, Texture, RenderTarget } from 'ogl';

type BendPreset = 'liquid';
type CurlMode = 'twist' | 'rise' | 'fall';
type CardFit = 'natural' | 'portrait' | 'square' | 'landscape';

export interface FlexCarouselItem {
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  alignX?: number;
  alignY?: number;
}

interface PresetValues {
  lensWidth: number;
  lensHeight: number;
  tilt: number;
  roundness: number;
  bend: number;
  reach: number;
  curl: CurlMode;
  dispersion: number;
  liquid: number;
  followCursor: boolean;
}

export interface FlexCarouselProps extends Partial<PresetValues> {
  items?: FlexCarouselItem[];
  preset?: BendPreset;
  cardHeight?: number;
  gap?: number;
  radius?: number;
  fit?: CardFit;
  squeeze?: number;
  focusOnClick?: boolean;
  captions?: boolean;
  captureWheel?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface Settings extends PresetValues {
  cardHeight: number;
  gap: number;
  radius: number;
  fit: CardFit;
  squeeze: number;
  focusOnClick: boolean;
  captureWheel: boolean;
}

interface Slot {
  item: FlexCarouselItem;
  index: number;
  texture: Texture;
  aspect: number;
  loaded: boolean;
  failed: boolean;
  ready: number;
  color: number[];
  image: number[];
  dispose: () => void;
}

interface Metrics {
  cardH: number;
  widths: number[];
  centers: number[];
  gap: number;
  loop: number;
}

interface Instance {
  index: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface Draw {
  i: number;
  rel: number;
  x: number;
  y: number;
  cw: number;
  ch: number;
  alpha: number;
}

interface Engine {
  wake: () => void;
  setItems: (items: FlexCarouselItem[]) => void;
}

const BEND_PRESETS: Record<BendPreset, PresetValues> = {
  liquid: {
    lensWidth: 0.74,
    lensHeight: 1.18,
    tilt: 62,
    roundness: 1,
    bend: 0.34,
    reach: 0.38,
    curl: 'twist',
    dispersion: 0.45,
    liquid: 0,
    followCursor: false
  }
};

const STYLE = `
@keyframes flex-carousel-title { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes flex-carousel-reveal { from { opacity: 0; } to { opacity: 1; } }
`;

const FIT_ASPECT: Record<string, number> = { portrait: 0.75, square: 1, landscape: 1.45 };
const TAPS = 12;
const PIXEL_BUDGET = 4.5e6;

const wrap = (value: number, size: number) => ((((value + size / 2) % size) + size) % size) - size / 2;
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const easeInOut = (value: number) => {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const cardVertex = `#version 300 es
in vec3 position;
in vec2 uv;
uniform vec4 uRect;
uniform vec2 uResolution;
out vec2 vUv;
out vec2 vLocal;
void main() {
  vUv = uv;
  vLocal = vec2(position.x, -position.y) * uRect.zw;
  vec2 px = uRect.xy + vLocal;
  gl_Position = vec4(px.x / uResolution.x * 2.0 - 1.0, 1.0 - px.y / uResolution.y * 2.0, 0.0, 1.0);
}
`;

const cardFragment = `#version 300 es
precision highp float;
uniform sampler2D tMap;
uniform vec2 uSize;
uniform vec2 uImage;
uniform float uRadius;
uniform float uAlpha;
uniform float uReady;
uniform float uShift;
uniform float uAlignX;
uniform float uAlignY;
uniform float uDpr;
uniform vec3 uPlaceholder;
in vec2 vUv;
in vec2 vLocal;
out vec4 fragColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float sd = roundedBox(vLocal, uSize * 0.5, min(uRadius, min(uSize.x, uSize.y) * 0.5));
  float mask = clamp(0.5 - sd * uDpr, 0.0, 1.0);
  vec2 local = vLocal / uSize + 0.5;
  float cardAspect = uSize.x / uSize.y;
  float imageAspect = uImage.x / max(uImage.y, 1.0);
  vec2 scale = imageAspect > cardAspect ? vec2(cardAspect / imageAspect, 1.0) : vec2(1.0, imageAspect / cardAspect);
  scale /= 1.08;
  vec2 uv = vec2(local.x, 1.0 - local.y);
  uv = (uv - 0.5) * scale + 0.5;
  uv.x += (uShift + uAlignX) * (1.0 - scale.x) * 0.5;
  uv.y += uAlignY * (1.0 - scale.y) * 0.5;
  uv = clamp(uv, 0.0, 1.0);
  vec3 image = texture(tMap, uv).rgb;
  vec3 color = mix(uPlaceholder, image, uReady);
  float alpha = mask * uAlpha;
  fragColor = vec4(color * alpha, alpha);
}
`;

const lensVertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const lensFragment = `#version 300 es
precision highp float;
uniform sampler2D tScene;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uAngle;
uniform float uExponent;
uniform float uInner;
uniform float uOuter;
uniform float uFlow;
uniform float uCurl;
uniform float uDispersion;
uniform float uStrength;
uniform float uSceneAlpha;
out vec4 fragColor;

void main() {
  vec2 frag = gl_FragCoord.xy / uDpr;
  vec2 uv = frag / uResolution;
  vec2 rel = frag - vec2(uCenter.x, uResolution.y - uCenter.y);
  float ca = cos(uAngle);
  float sa = sin(uAngle);
  vec2 local = vec2(ca * rel.x + sa * rel.y, -sa * rel.x + ca * rel.y);
  vec2 k = max(abs(local) / uHalf, vec2(1e-5));
  float nd = pow(pow(k.x, uExponent) + pow(k.y, uExponent), 1.0 / uExponent);
  vec2 grad = pow(k, vec2(uExponent - 1.0)) * sign(local) / uHalf * pow(nd, 1.0 - uExponent);
  float glen = max(length(grad), 1e-6);
  float edge = (nd - 1.0) / glen;
  vec2 outward = grad / glen;
  vec2 normal = vec2(ca * outward.x - sa * outward.y, sa * outward.x + ca * outward.y);
  vec2 along = vec2(-normal.y, normal.x);

  float t = clamp((edge + uInner) / (uInner + uOuter), 0.0, 1.0);
  float ramp = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  float slope = 16.0 * t * t * (1.0 - t) * (1.0 - t);
  float reachX = rel.x / (uResolution.x * 0.5);
  float side = smoothstep(0.02, 0.3, abs(reachX)) * (uCurl == 0.0 ? sign(reachX) : uCurl);
  float lift = ramp * side * uFlow * uStrength;
  vec2 swirl = along * along.y * side * slope * uFlow * uStrength * 0.35;
  vec2 drift = vec2(0.0, -lift) - swirl;
  vec2 shifted = uv + drift / uResolution;

  vec2 texels = uResolution * uDpr;
  vec2 gx = dFdx(shifted);
  vec2 gy = dFdy(shifted);
  gx *= min(1.0, 3.0 / max(length(gx * texels), 1e-4));
  gy *= min(1.0, 3.0 / max(length(gy * texels), 1e-4));

  vec4 color = textureGrad(tScene, shifted, gx, gy);
  vec2 spread = vec2(0.0, side * slope * uFlow * uStrength) / uResolution * uDispersion;
  float spreadPx = length(spread * texels);
  if (color.a > 0.002 && spreadPx > 0.25) {
    vec3 base = color.rgb / color.a;
    vec3 sumColor = vec3(0.0);
    vec3 sumWeight = vec3(0.0);
    for (int i = 0; i < ${TAPS}; i++) {
      float s = (float(i) + 0.5) / float(${TAPS});
      vec4 c = textureGrad(tScene, shifted + spread * (s - 0.5), gx, gy);
      vec3 w = max(1.0 - abs(vec3(s) - vec3(0.15, 0.5, 0.85)) * 2.6, 0.0) * c.a;
      sumColor += c.rgb * (w / max(c.a, 0.002));
      sumWeight += w;
    }
    vec3 split = mix(base, sumColor / max(sumWeight, vec3(1e-4)), clamp(sumWeight * 2.0, 0.0, 1.0));
    color.rgb = mix(color.rgb, clamp(split, 0.0, 1.0) * color.a, smoothstep(0.25, 1.5, spreadPx));
  }

  fragColor = color * uSceneAlpha;
}
`;

const Digits = ({ value }: { value: number }) => (
  <span className="inline-flex">
    {String(value)
      .padStart(2, '0')
      .split('')
      .map((digit, index) => (
        <span key={index} className="inline-block h-[1em] overflow-hidden">
          <span
            className="flex flex-col transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ transform: `translateY(${-Number(digit) * 10}%)` }}
          >
            {'0123456789'.split('').map(n => (
              <span key={n} className="h-[1em]">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
  </span>
);

const FlexCarousel = ({
  items = [],
  preset = 'liquid',
  cardHeight = 0.5,
  gap = 12,
  radius = 0,
  fit = 'natural',
  lensWidth,
  lensHeight,
  tilt,
  roundness,
  bend,
  reach,
  curl,
  dispersion,
  liquid,
  followCursor,
  squeeze = 0.2,
  focusOnClick = true,
  captions = true,
  captureWheel = true,
  className = '',
  style
}: FlexCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<Settings | null>(null);
  const itemsRef = useRef<FlexCarouselItem[]>(items);
  const engineRef = useRef<Engine | null>(null);
  const [active, setActive] = useState(0);
  const [focusOpen, setFocusOpen] = useState(false);

  const base = BEND_PRESETS[preset] || BEND_PRESETS.liquid;
  const pick = <K extends keyof PresetValues>(value: PresetValues[K] | undefined, key: K): PresetValues[K] =>
    value === undefined || value === null ? base[key] : value;

  const list = items;
  const itemsKey = list.map(item => item.src).join('|');

  useEffect(() => {
    itemsRef.current = list;
    settingsRef.current = {
      cardHeight,
      gap,
      radius,
      fit,
      lensWidth: pick(lensWidth, 'lensWidth'),
      lensHeight: pick(lensHeight, 'lensHeight'),
      tilt: pick(tilt, 'tilt'),
      roundness: pick(roundness, 'roundness'),
      bend: pick(bend, 'bend'),
      reach: pick(reach, 'reach'),
      curl: pick(curl, 'curl'),
      dispersion: pick(dispersion, 'dispersion'),
      liquid: pick(liquid, 'liquid'),
      followCursor: pick(followCursor, 'followCursor'),
      squeeze,
      focusOnClick,
      captureWheel
    };
    engineRef.current?.wake();
  });

  useEffect(() => {
    engineRef.current?.setItems(itemsRef.current);
  }, [itemsKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false
    });
    const gl = renderer.gl;
    if (!renderer.isWebgl2) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return undefined;
    }
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.setAttribute('aria-hidden', 'true');
    container.prepend(canvas);

    const cardProgram = new Program(gl, {
      vertex: cardVertex,
      fragment: cardFragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tMap: { value: new Texture(gl) },
        uRect: { value: [0, 0, 1, 1] },
        uResolution: { value: [1, 1] },
        uSize: { value: [1, 1] },
        uImage: { value: [1, 1] },
        uRadius: { value: 16 },
        uAlpha: { value: 1 },
        uReady: { value: 0 },
        uShift: { value: 0 },
        uAlignX: { value: 0 },
        uAlignY: { value: 0 },
        uDpr: { value: 1 },
        uPlaceholder: { value: [0.5, 0.5, 0.5] }
      }
    });
    cardProgram.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const cardMesh = new Mesh(gl, { geometry: new Plane(gl), program: cardProgram });

    const target = new RenderTarget(gl, {
      width: 2,
      height: 2,
      depth: false,
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      magFilter: gl.LINEAR
    });

    const lensUniforms = {
      tScene: { value: target.texture },
      uResolution: { value: [1, 1] },
      uDpr: { value: 1 },
      uCenter: { value: [0, 0] },
      uHalf: { value: [1, 1] },
      uAngle: { value: 0 },
      uExponent: { value: 2 },
      uInner: { value: 60 },
      uOuter: { value: 80 },
      uFlow: { value: 0 },
      uCurl: { value: 0 },
      uDispersion: { value: 0 },
      uStrength: { value: 0 },
      uSceneAlpha: { value: 1 }
    };
    const lensMesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, {
        vertex: lensVertex,
        fragment: lensFragment,
        uniforms: lensUniforms,
        depthTest: false,
        depthWrite: false
      })
    });

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const anisotropy = renderer.getExtension('EXT_texture_filter_anisotropic') ? 8 : 0;

    let slots: Slot[] = [];
    let width = 1;
    let height = 1;
    let pos = 0;
    let vel = 0;
    let goal = 0;
    let mode = 'spring';
    let wheelAt = 0;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let alive = true;
    let dirty = true;
    let activeIndex = -1;
    let deform = 0;
    let deformVel = 0;
    let layout: Metrics | null = null;
    let resnap = false;
    let hover = '';
    let lift = 1;
    let energy = 0;
    let lastPos = 0;
    const lens = { x: 0, y: 0, vx: 0, vy: 0, ready: false };
    const pointer = {
      x: 0,
      y: 0,
      over: false,
      down: false,
      id: -1,
      startX: 0,
      startY: 0,
      startPos: 0,
      dragging: false,
      touch: false,
      samples: [] as { x: number; t: number }[]
    };
    const focus = { index: -1, pending: -1, t: 0, v: 0, target: 0 };
    let instances: Instance[] = [];

    const loadSlot = (item: FlexCarouselItem, index: number): Slot => {
      const texture = new Texture(gl, {
        generateMipmaps: true,
        minFilter: gl.LINEAR_MIPMAP_LINEAR,
        magFilter: gl.LINEAR,
        anisotropy
      });
      const slot: Slot = {
        item,
        index,
        texture,
        aspect: 0.8,
        loaded: false,
        failed: false,
        ready: 0,
        color: [0.5, 0.5, 0.5],
        image: [1, 1],
        dispose: () => {}
      };
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.onload = () => {
        if (!alive || !slots.includes(slot)) return;
        texture.image = image;
        texture.update();
        slot.image = [image.naturalWidth || 1, image.naturalHeight || 1];
        slot.aspect = slot.image[0] / slot.image[1];
        try {
          const probe = document.createElement('canvas');
          probe.width = 8;
          probe.height = 8;
          const ctx = probe.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(image, 0, 0, 8, 8);
            const data = ctx.getImageData(0, 0, 8, 8).data;
            const avg = [0, 0, 0];
            for (let i = 0; i < data.length; i += 4) {
              avg[0] += data[i];
              avg[1] += data[i + 1];
              avg[2] += data[i + 2];
            }
            slot.color = avg.map(v => v / 64 / 255);
          }
        } catch {
          slot.color = [0.5, 0.5, 0.5];
        }
        slot.loaded = true;
        dirty = true;
        start();
      };
      image.onerror = () => {
        if (!alive) return;
        slot.failed = true;
        dirty = true;
        start();
      };
      image.src = item.src;
      slot.dispose = () => {
        image.onload = null;
        image.onerror = null;
        gl.deleteTexture(texture.texture);
      };
      return slot;
    };

    const setItems = (next: FlexCarouselItem[]) => {
      slots.forEach(slot => slot.dispose());
      slots = next.map(loadSlot);
      activeIndex = -1;
      layout = null;
      resnap = true;
      focus.target = 0;
      focus.t = 0;
      focus.v = 0;
      focus.pending = -1;
      setFocusOpen(false);
      dirty = true;
      start();
    };

    const metrics = (s: Settings): Metrics => {
      let cardH = Math.max(24, s.cardHeight * height);
      const fixed = FIT_ASPECT[s.fit];

      // Keep cards prominent & bold while ensuring they fit mobile viewports (~84% width max)
      const maxCardW = Math.min(width * 0.84, 580);
      for (const slot of slots) {
        const aspect = fixed || slot.aspect;
        if (aspect * cardH > maxCardW) {
          cardH = maxCardW / aspect;
        }
      }

      const widths = slots.map(slot => (fixed || slot.aspect) * cardH);
      const centers: number[] = [];
      let cursor = 0;
      for (let i = 0; i < widths.length; i++) {
        centers.push(cursor + widths[i] / 2);
        cursor += widths[i] + s.gap;
      }
      return { cardH, widths, centers, gap: s.gap, loop: Math.max(cursor, 1) };
    };

    const nearest = (m: Metrics, at: number) => {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < m.centers.length; i++) {
        const dist = Math.abs(wrap(m.centers[i] - at, m.loop));
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      return best;
    };

    const snapPoint = (m: Metrics, at: number) => {
      const i = nearest(m, at);
      return at + wrap(m.centers[i] - at, m.loop);
    };

    const remap = (from: Metrics, to: Metrics, at: number) => {
      const i = nearest(from, at);
      const offset = wrap(at - from.centers[i], from.loop);
      const cycles = Math.round((at - offset - from.centers[i]) / from.loop);
      return cycles * to.loop + to.centers[i] + offset * (to.widths[i] / from.widths[i]);
    };

    const step = (m: Metrics, delta: number) => {
      let at = snapPoint(m, goal);
      let index = nearest(m, at);
      const n = m.centers.length;
      for (let k = 0; k < Math.abs(delta); k++) {
        const next = (index + (delta > 0 ? 1 : n - 1)) % n;
        const distance =
          delta > 0
            ? m.widths[index] / 2 + m.gap + m.widths[next] / 2
            : -(m.widths[next] / 2 + m.gap + m.widths[index] / 2);
        at += distance;
        index = next;
      }
      goal = at;
      mode = 'spring';
      dirty = true;
      start();
    };

    const goTo = (m: Metrics, index: number) => {
      const i = ((index % m.centers.length) + m.centers.length) % m.centers.length;
      goal = goal + wrap(m.centers[i] - goal, m.loop);
      mode = 'spring';
      dirty = true;
      start();
    };

    const openFocus = (index: number) => {
      focus.index = index;
      focus.pending = -1;
      focus.target = 1;
      if (layout) {
        goal = pos + wrap(layout.centers[index] - pos, layout.loop);
      }
      setFocusOpen(true);
      dirty = true;
      start();
    };

    const closeFocus = () => {
      focus.pending = -1;
      if (focus.target === 0) return false;
      focus.target = 0;
      setFocusOpen(false);
      dirty = true;
      start();
      return true;
    };

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));
      renderer.setSize(width, height);
      target.setSize(Math.max(2, Math.round(width * renderer.dpr)), Math.max(2, Math.round(height * renderer.dpr)));
      lensUniforms.tScene.value = target.texture;
      dirty = true;
      start();
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (!s || !slots.length) {
        if (visible) raf = requestAnimationFrame(frame);
        return;
      }

      const m = metrics(s);
      const n = slots.length;
      let animating = false;

      if (resnap) {
        goal = snapPoint(m, goal);
        pos = goal;
        vel = 0;
        resnap = false;
      } else if (layout && layout.loop !== m.loop) {
        pos = remap(layout, m, pos);
        goal = remap(layout, m, goal);
        pointer.startPos = pos + (pointer.x - pointer.startX);
        animating = true;
      }
      layout = m;

      if (mode === 'wheel' && now - wheelAt > 150) {
        goal = snapPoint(m, goal);
        mode = 'spring';
      }
      if (!pointer.dragging) {
        const stiffness = mode === 'wheel' ? 80 : 55;
        const damping = 2 * Math.sqrt(stiffness);
        const steps = Math.ceil(dt / (1 / 240));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          const acc = stiffness * (goal - pos) - damping * vel;
          vel += acc * h;
          pos += vel * h;
        }
        if (Math.abs(goal - pos) < 0.05 && Math.abs(vel) < 0.5) {
          pos = goal;
          vel = 0;
        } else {
          animating = true;
        }
      } else {
        animating = true;
      }

      if (Math.abs(pos) > m.loop * 8) {
        const shift = Math.round(pos / m.loop) * m.loop;
        pos -= shift;
        goal -= shift;
        pointer.startPos -= shift;
      }

      const current = nearest(m, pos);
      if (current !== activeIndex) {
        activeIndex = current;
        setActive(current);
      }

      if (focus.pending >= 0 && mode === 'spring' && Math.abs(goal - pos) < 1.5 && Math.abs(vel) < 30) {
        if (current === focus.pending) openFocus(current);
        else focus.pending = -1;
      }


      const travel = Math.abs(pos - lastPos) / dt;
      lastPos = pos;
      const energyTarget = reducedMotion ? 0 : Math.min(travel / 2600, 1);
      energy += (energyTarget - energy) * (1 - Math.exp(-dt / (energyTarget > energy ? 0.07 : 0.35)));
      if (energy > 0.001) animating = true;
      const liquidAmount = reducedMotion ? 0 : s.liquid;
      const push = Math.max(-1, Math.min(1, vel / 2200));
      const deformStiffness = 120;
      const deformDamping = 2 * Math.sqrt(deformStiffness) * 0.32;
      deformVel += (deformStiffness * (push - deform) - deformDamping * deformVel) * dt;
      deform += deformVel * dt;
      if (Math.abs(deform) > 0.0005 || Math.abs(deformVel) > 0.005) animating = true;

      const focusStiffness = 64;
      focus.v += (focusStiffness * (focus.target - focus.t) - 2 * Math.sqrt(focusStiffness) * focus.v) * dt;
      focus.t += focus.v * dt;
      if (Math.abs(focus.target - focus.t) < 0.0005 && Math.abs(focus.v) < 0.001) {
        focus.t = focus.target;
        focus.v = 0;
      } else {
        animating = true;
      }
      const focusAmount = clamp01(focus.t);
      const focusEase = easeInOut(focusAmount);
      const focusW = focus.index >= 0 && focus.index < n ? m.widths[focus.index] : m.cardH;
      const focusScale = Math.max(1, Math.min(1.3, (height * 0.84) / m.cardH, (width * 0.92) / focusW));
      const nextLift = 1 + (focusScale - 1) * focusEase;
      if (Math.abs(nextLift - lift) > 0.0005) {
        lift = nextLift;
        container.style.setProperty('--flex-carousel-lift', lift.toFixed(4));
      }

      const isMobile = width < 640;
      const homeX = width / 2;
      const homeY = isMobile
        ? Math.max(m.cardH * 0.58, height * 0.32) // sit high so the caption below isn't clipped on short phones
        : height * 0.42;
      const centerPct = ((homeY / height) * 100).toFixed(2);
      container.style.setProperty('--flex-carousel-half', `${((m.cardH / height) * 50).toFixed(2)}%`);
      container.style.setProperty('--flex-carousel-center', `${centerPct}%`);

      const follow = s.followCursor && pointer.over && !pointer.dragging && !pointer.touch && focus.target === 0;
      const aimX = follow ? pointer.x : homeX;
      const aimY = follow ? pointer.y : homeY;
      if (!lens.ready) {
        lens.x = homeX;
        lens.y = homeY;
        lens.ready = true;
      }
      const lensK = 110;
      const lensC = 2 * Math.sqrt(lensK) * 0.8;
      lens.vx += (lensK * (aimX - lens.x) - lensC * lens.vx) * dt;
      lens.vy += (lensK * (aimY - lens.y) - lensC * lens.vy) * dt;
      lens.x += lens.vx * dt;
      lens.y += lens.vy * dt;
      if (Math.abs(aimX - lens.x) + Math.abs(aimY - lens.y) > 0.2 || Math.abs(lens.vx) + Math.abs(lens.vy) > 0.5)
        animating = true;

      const cardH = m.cardH;
      let halfW = (s.lensWidth * width) / 2;
      let halfH = (s.lensHeight * width) / 2;
      const squash = Math.abs(deform) * liquidAmount;
      halfW *= 1 + squash * 0.16;
      halfH *= 1 - squash * 0.08;
      const lensX = lens.x - deform * 14 * liquidAmount;

      for (let i = 0; i < n; i++) {
        const slot = slots[i];
        if (slot.loaded && slot.ready < 1) {
          slot.ready = Math.min(1, slot.ready + dt / 0.45);
          animating = true;
        }
      }

      if (dirty || animating || pointer.dragging) {
        dirty = false;
        instances = [];
        const dpr = renderer.dpr;
        cardProgram.uniforms.uResolution.value = [width, height];
        cardProgram.uniforms.uDpr.value = dpr;
        cardProgram.uniforms.uRadius.value = s.radius;
        const shrink = 1 - clamp01(s.squeeze) * energy;
        const draws: Draw[] = [];
        for (let i = 0; i < n; i++) {
          const w = m.widths[i];
          const baseRel = wrap(m.centers[i] - pos, m.loop);
          for (let k = -3; k <= 3; k++) {
            const rel = baseRel + k * m.loop;
            if (Math.abs(rel) - w / 2 > width + 40) continue;
            let x = homeX + rel;
            let scale = shrink;
            let alpha = 1;
            if (focusAmount > 0) {
              if (i === focus.index && Math.abs(rel) < w) {
                scale *= 1 + (focusScale - 1) * focusEase;
                x = homeX + rel * (1 - focusEase);
              } else {
                const order = Math.min(Math.abs(rel) / width, 1) * 0.25;
                const part = easeInOut(focusAmount * 1.25 - order);
                x += Math.sign(rel) * part * width * 0.7;
                alpha *= 1 - part;
              }
            }
            const cw = w * scale;
            if (alpha <= 0.001 || x + cw / 2 < -40 || x - cw / 2 > width + 40) continue;
            draws.push({ i, rel, x, y: homeY, cw, ch: cardH * scale, alpha });
          }
        }
        draws.sort((a, b) => Math.abs(b.rel) - Math.abs(a.rel));
        let first = true;
        for (const draw of draws) {
          const slot = slots[draw.i];
          cardProgram.uniforms.tMap.value = slot.texture;
          cardProgram.uniforms.uRect.value = [draw.x, draw.y, draw.cw + 2, draw.ch + 2];
          cardProgram.uniforms.uSize.value = [draw.cw, draw.ch];
          cardProgram.uniforms.uImage.value = slot.image;
          cardProgram.uniforms.uAlpha.value = draw.alpha;
          cardProgram.uniforms.uReady.value = slot.ready;
          const shiftVal = reducedMotion ? 0 : Math.max(-1, Math.min(1, draw.rel / (width * 0.75)));
          cardProgram.uniforms.uShift.value = shiftVal * (1 - (draw.i === focus.index ? focusEase : 0));
          cardProgram.uniforms.uAlignX.value = slot.item.alignX ?? 0;
          cardProgram.uniforms.uAlignY.value = slot.item.alignY ?? 0;
          cardProgram.uniforms.uPlaceholder.value = slot.color;
          renderer.render({ scene: cardMesh, target, clear: first });
          first = false;
          instances.push({
            index: draw.i,
            x0: draw.x - draw.cw / 2,
            x1: draw.x + draw.cw / 2,
            y0: draw.y - draw.ch / 2,
            y1: draw.y + draw.ch / 2
          });
        }
        if (first) {
          renderer.bindFramebuffer(target);
          gl.viewport(0, 0, target.width, target.height);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        renderer.bindFramebuffer();
        target.texture.bind();
        gl.generateMipmap(gl.TEXTURE_2D);

        lensUniforms.uResolution.value = [width, height];
        lensUniforms.uDpr.value = dpr;
        lensUniforms.uCenter.value = [lensX, lens.y];
        lensUniforms.uHalf.value = [Math.max(halfW, 1), Math.max(halfH, 1)];
        lensUniforms.uAngle.value = (s.tilt * Math.PI) / 180;
        lensUniforms.uExponent.value = 2 + Math.pow(1 - clamp01(s.roundness), 1.5) * 10;
        const spanW = Math.max(halfW, 1);
        const spanH = Math.max(halfH, 1);
        const inner = Math.max(4, s.reach * (spanW + spanH) * 0.5);
        lensUniforms.uInner.value = inner;
        lensUniforms.uOuter.value = inner * 1.6;
        lensUniforms.uFlow.value = s.bend * (spanW + spanH) * 0.45;
        lensUniforms.uCurl.value = s.curl === 'rise' ? 1 : s.curl === 'fall' ? -1 : 0;
        lensUniforms.uDispersion.value = s.dispersion * 0.12 * (1 + Math.abs(deform) * liquidAmount * 1.2);
        lensUniforms.uStrength.value = 1 - focusEase;
        renderer.render({ scene: lensMesh });
      }

      let nextHover = '';
      if (pointer.over && !pointer.dragging && s.focusOnClick) {
        const hit = instances.find(
          inst => pointer.x >= inst.x0 && pointer.x <= inst.x1 && pointer.y >= inst.y0 && pointer.y <= inst.y1
        );
        if (focus.target > 0) nextHover = 'close';
        else if (hit) nextHover = 'open';
      }
      if (nextHover !== hover) {
        hover = nextHover;
        if (hover) container.setAttribute('data-hover', hover);
        else container.removeAttribute('data-hover');
      }

      if (visible && (animating || dirty || pointer.down)) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const localPoint = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== undefined && e.button > 0) return;
      const [x, y] = localPoint(e);
      pointer.down = true;
      pointer.id = e.pointerId;
      pointer.touch = e.pointerType === 'touch';
      pointer.startX = x;
      pointer.startY = y;
      pointer.x = x;
      pointer.y = y;
      pointer.startPos = pos;
      pointer.dragging = false;
      pointer.samples = [{ x, t: performance.now() }];
      if (Math.abs(vel) > 40) {
        goal = pos;
        vel = 0;
      }
      dirty = true;
      start();
    };

    const onPointerMove = (e: PointerEvent) => {
      const [x, y] = localPoint(e);
      pointer.x = x;
      pointer.y = y;
      pointer.over = true;
      if (pointer.down && e.pointerId === pointer.id) {
        const dx = x - pointer.startX;
        const dy = y - pointer.startY;
        const slop = pointer.touch ? 10 : 5;
        if (!pointer.dragging) {
          if (pointer.touch && Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) {
            pointer.down = false;
            return;
          }
          if (Math.abs(dx) > slop) {
            pointer.dragging = true;
            pointer.startX = x;
            pointer.startPos = pos;
            closeFocus();
            try {
              container.setPointerCapture(e.pointerId);
            } catch {
              pointer.dragging = true;
            }
            container.setAttribute('data-dragging', '');
          }
        }
        if (pointer.dragging) {
          pos = pointer.startPos - (x - pointer.startX);
          goal = pos;
          vel = 0;
          const now = performance.now();
          pointer.samples.push({ x, t: now });
          while (pointer.samples.length > 2 && now - pointer.samples[0].t > 100) pointer.samples.shift();
        }
      }
      dirty = true;
      start();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointer.down || e.pointerId !== pointer.id) return;
      pointer.down = false;
      container.removeAttribute('data-dragging');
      const s = settingsRef.current;
      if (!s) return;
      const m = metrics(s);
      if (pointer.dragging) {
        pointer.dragging = false;
        const now = performance.now();
        const first = pointer.samples[0];
        const lastSample = pointer.samples[pointer.samples.length - 1];
        let velocity = 0;
        if (first && lastSample && lastSample.t > first.t && now - lastSample.t < 70) {
          velocity = -((lastSample.x - first.x) / (lastSample.t - first.t)) * 1000;
        }
        vel = velocity;
        const landing = snapPoint(m, pos + velocity * 0.32);
        goal = landing;
        if (Math.abs(velocity) > 400 && Math.abs(landing - pos) < 1) step(m, velocity > 0 ? 1 : -1);
        mode = 'spring';
        start();
        return;
      }
      if (closeFocus()) return;
      const [x, y] = localPoint(e);
      const hit = instances.find(inst => x >= inst.x0 && x <= inst.x1 && y >= inst.y0 && y <= inst.y1);
      if (!hit) return;
      if (hit.index === activeIndex && Math.abs(goal - pos) < 2) {
        if (s.focusOnClick) openFocus(hit.index);
      } else {
        goal = pos + wrap(m.centers[hit.index] - pos, m.loop);
        mode = 'spring';
        if (s.focusOnClick) focus.pending = hit.index;
        start();
      }
    };

    const onPointerLeave = () => {
      pointer.over = false;
      dirty = true;
      start();
    };

    const onPointerCancel = () => {
      pointer.down = false;
      pointer.dragging = false;
      container.removeAttribute('data-dragging');
      const s = settingsRef.current;
      if (!s) return;
      goal = snapPoint(metrics(s), pos);
      mode = 'spring';
      start();
    };

    const onWheel = (e: WheelEvent) => {
      const s = settingsRef.current;
      if (!s || e.ctrlKey) return;
      let dx = e.deltaX;
      let dy = e.deltaY;
      if (e.shiftKey && Math.abs(dx) < Math.abs(dy)) {
        dx = dy;
        dy = 0;
      }
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height : 1;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      if (!horizontal && !s.captureWheel) return;
      e.preventDefault();
      if (closeFocus()) return;
      const delta = Math.max(-120, Math.min(120, (horizontal ? dx : dy) * unit));
      goal += delta * 1.25;
      mode = 'wheel';
      wheelAt = performance.now();
      start();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const s = settingsRef.current;
      if (!s) return;
      const m = metrics(s);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        closeFocus();
        step(m, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        closeFocus();
        step(m, -1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        closeFocus();
        goTo(m, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        closeFocus();
        goTo(m, slots.length - 1);
      } else if (e.key === 'Escape') {
        if (closeFocus()) e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (closeFocus() || activeIndex < 0) return;
        if (s.focusOnClick) openFocus(activeIndex);
      }
    };

    const onVisibility = () => {
      if (!document.hidden) start();
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointercancel', onPointerCancel);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibility);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    intersectionObserver.observe(container);

    engineRef.current = {
      wake: () => {
        dirty = true;
        start();
      },
      setItems
    };

    resize();
    setItems(itemsRef.current);

    return () => {
      alive = false;
      visible = false;
      engineRef.current = null;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointercancel', onPointerCancel);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibility);
      slots.forEach(slot => slot.dispose());
      slots = [];
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  const current = list[active] || list[0];
  const label = current ? current.title || current.alt || `Image ${active + 1}` : '';

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full cursor-grab touch-pan-y select-none overflow-hidden overscroll-contain outline-none [-webkit-tap-highlight-color:transparent] focus-visible:shadow-[inset_0_0_0_2px_rgba(128,128,140,0.55)] data-[hover=open]:cursor-zoom-in data-[hover=close]:cursor-zoom-out data-[dragging]:cursor-grabbing ${className}`.trim()}
      style={{ ...style, '--flex-carousel-half': `${Math.min(Math.max(cardHeight, 0.05), 1) * 50}%` } as CSSProperties}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      tabIndex={0}
    >
      <style>{STYLE}</style>
      {captions && current && (
        <div
          className="pointer-events-none absolute inset-x-0 top-[calc(var(--flex-carousel-center,50%)_+_var(--flex-carousel-half)_*_var(--flex-carousel-lift,1)_+_52px)] sm:top-[calc(var(--flex-carousel-center,50%)_+_var(--flex-carousel-half)_*_var(--flex-carousel-lift,1)_+_44px)] lg:top-[calc(var(--flex-carousel-center,50%)_+_var(--flex-carousel-half)_*_var(--flex-carousel-lift,1)_+_24px)] flex flex-col items-center gap-2 px-4 text-center animate-[flex-carousel-reveal_900ms_ease_both] motion-reduce:animate-none"
          aria-hidden="true"
        >
          <span
            key={active}
            className="flex max-w-full flex-col items-center text-[15px] font-medium leading-[1.35] animate-[flex-carousel-title_520ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none"
          >
            {current.title || current.alt}
            {current.subtitle && <span className="font-normal opacity-60">{current.subtitle}</span>}
          </span>
          {current.description && (
            <p
              key={`d${active}`}
              className="max-w-md text-[13px] leading-snug opacity-70 animate-[flex-carousel-title_520ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none"
            >
              {current.description}
            </p>
          )}
          {current.href && (
            <a
              href={current.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#6A00FF] dark:text-[#a855f7] hover:underline underline-offset-4 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{current.linkLabel || 'View project'}</span>
              <span className="text-[10px]">↗</span>
            </a>
          )}
          <span
            className="inline-flex items-center gap-[3px] text-[12px] leading-none tabular-nums opacity-50 transition-opacity duration-[400ms] data-[hidden]:opacity-0"
            data-hidden={focusOpen ? '' : undefined}
          >
            <Digits value={active + 1} />
            <span className="opacity-60">/</span>
            <span>{String(list.length).padStart(2, '0')}</span>
          </span>
        </div>
      )}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`${label}, ${active + 1} of ${list.length}`}
      </div>
    </div>
  );
};

export default FlexCarousel;
