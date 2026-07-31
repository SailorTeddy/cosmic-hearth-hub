import { useEffect, useMemo, useRef, useState } from "react";
import {
  clusterAnchor,
  clusterSpread,
  colorToRgb,
  FAMILY_SIDE_LABELS,
  hashString,
  memberLocalOffset,
  type BlessingStar,
} from "@/lib/blessing-stars";

type Star = {
  x: number;
  y: number;
  /** Apparent brightness 0–1 (not linear — brighter stars are rare) */
  mag: number;
  r: number;
  a: number;
  tw: number;
  depth: number;
  /** Spectral type weight: 0 = M (red), 0.5 = G (yellow-white), 1 = O/B (blue) */
  spectral: number;
  spike: boolean;
};

type Gas = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  temp: number;
  a: number;
};

type Props = {
  blessings?: BlessingStar[];
};

/**
 * Physically inspired black-hole field (2D approximation of
 * Schwarzschild lensing + thin accretion disk + Doppler beaming).
 * Not a GR ray-tracer — tuned to read like EHT / Interstellar imagery.
 */
export function CosmicBackground({ blessings = [] }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blessingsRef = useRef(blessings);
  blessingsRef.current = blessings;

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const hotspots = useMemo(() => {
    const w = viewport.w || (typeof window !== "undefined" ? window.innerWidth : 0);
    const h = viewport.h || (typeof window !== "undefined" ? window.innerHeight : 0);
    if (!w || !h) return [];

    return blessings.flatMap((cluster) => {
      const { nx, ny } = clusterAnchor(cluster.id, cluster.family_side);
      const cx = nx * w;
      const cy = ny * h;
      const members = cluster.members?.length
        ? cluster.members
        : [{ name: cluster.name, personality: "", color: cluster.color }];
      const count = members.length;
      const spread = clusterSpread(w, h, count);

      return members.map((member, index) => {
        const off = memberLocalOffset(cluster.id, index, count);
        return {
          key: `${cluster.id}:${index}`,
          clusterId: cluster.id,
          clusterName: cluster.name,
          clusterMessage: cluster.message,
          family_side: cluster.family_side,
          memberIndex: index,
          members,
          name: member.name,
          personality: member.personality,
          color: member.color || cluster.color,
          x: cx + off.dx * spread,
          y: cy + off.dy * spread,
        };
      });
    });
  }, [blessings, viewport.w, viewport.h]);

  const active = hotspots.find((h) => h.key === activeKey) ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings);
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = () => window.innerWidth < 768;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let gas: Gas[] = [];
    let raf = 0;
    let running = true;
    let t = 0;
    let last = performance.now();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const dprCap = () => {
      const n = window.devicePixelRatio || 1;
      return mobile() ? Math.min(n, 2) : Math.min(n, 3);
    };

    const build = () => {
      const dpr = dprCap();
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      setViewport({ w: width, h: height });

      const area = width * height;
      const starN = Math.min(mobile() ? 520 : 1600, Math.round(area / (mobile() ? 1400 : 750)));
      const gasN = Math.min(mobile() ? 160 : 420, Math.round(area / (mobile() ? 10000 : 5500)));

      // Milky Way band: denser star cloud across a tilted ellipse
      const bandAngle = -0.35;
      const bandCx = width * 0.42;
      const bandCy = height * 0.4;
      const bandRx = Math.max(width, height) * 0.72;
      const bandRy = Math.min(width, height) * 0.14;

      const sampleSpectral = () => {
        // Approximate field-star mix: mostly K/M, some G/F, rare A/B/O
        const r = Math.random();
        if (r < 0.42) return 0.08 + Math.random() * 0.18; // M — red
        if (r < 0.68) return 0.28 + Math.random() * 0.15; // K — orange
        if (r < 0.86) return 0.48 + Math.random() * 0.12; // G — yellow-white
        if (r < 0.95) return 0.66 + Math.random() * 0.12; // F/A — white
        return 0.85 + Math.random() * 0.15; // B/O — blue-white
      };

      stars = [];
      for (let i = 0; i < starN; i++) {
        // Salpeter-ish: many dim, few bright
        const mag = Math.pow(Math.random(), 2.8);
        const inBand = Math.random() < 0.38;
        let x: number;
        let y: number;
        if (inBand) {
          const u = (Math.random() * 2 - 1) * bandRx;
          const v = (Math.random() * 2 - 1) * bandRy * (0.35 + Math.random() * 0.65);
          const ca = Math.cos(bandAngle);
          const sa = Math.sin(bandAngle);
          x = bandCx + u * ca - v * sa;
          y = bandCy + u * sa + v * ca;
          x = ((x % width) + width) % width;
          y = ((y % height) + height) % height;
        } else {
          x = Math.random() * width;
          y = Math.random() * height;
        }

        const spectral = sampleSpectral();
        // Hot luminous stars skew brighter; red dwarfs stay faint
        const brightBias = spectral > 0.75 ? 0.15 : 0;
        const m = Math.min(1, mag + brightBias * Math.random());
        stars.push({
          x,
          y,
          mag: m,
          r: 0.12 + m * m * 2.1,
          a: 0.08 + m * 0.9,
          tw: 0.15 + Math.random() * (0.4 + m * 1.2),
          depth: 0.15 + m * 0.85,
          spectral,
          spike: m > 0.72 && Math.random() < 0.55,
        });
      }

      // A handful of "landmark" stars — brighter, with spikes
      const landmarks = mobile() ? 4 : 9;
      for (let i = 0; i < landmarks; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          mag: 0.82 + Math.random() * 0.18,
          r: 1.6 + Math.random() * 1.4,
          a: 0.85 + Math.random() * 0.15,
          tw: 0.3 + Math.random() * 0.6,
          depth: 0.9,
          spectral: sampleSpectral(),
          spike: true,
        });
      }

      gas = Array.from({ length: gasN }, () => {
        const radius = 0.55 + Math.pow(Math.random(), 0.7) * 1.55;
        return {
          angle: Math.random() * Math.PI * 2,
          radius,
          // Keplerian-ish: inner orbits faster
          speed: (0.55 / Math.pow(radius, 1.4)) * (0.7 + Math.random() * 0.6),
          size: 0.5 + Math.random() * 2.2,
          temp: Math.max(0, 1.15 - radius * 0.45) + Math.random() * 0.15,
          a: 0.2 + Math.random() * 0.55,
        };
      });
    };

    /** Map spectral type → RGB (approximate stellar classification colors) */
    const spectralRgb = (s: number): [number, number, number] => {
      if (s < 0.2) return [255, 160, 120]; // M
      if (s < 0.35) return [255, 190, 140]; // K
      if (s < 0.5) return [255, 236, 200]; // G
      if (s < 0.65) return [255, 248, 235]; // F
      if (s < 0.8) return [235, 240, 255]; // A
      if (s < 0.92) return [190, 210, 255]; // B
      return [170, 195, 255]; // O
    };

    const starColor = (spectral: number, alpha: number) => {
      const [r, g, b] = spectralRgb(spectral);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const drawStarSpike = (x: number, y: number, len: number, rgb: [number, number, number], alpha: number, rot = 0) => {
      const [r, g, b] = rgb;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 2; i++) {
        ctx.rotate(i === 0 ? 0 : Math.PI / 2);
        const grad = ctx.createLinearGradient(-len, 0, len, 0);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.42, `rgba(${r},${g},${b},${alpha * 0.55})`);
        grad.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.58, `rgba(${r},${g},${b},${alpha * 0.55})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(-len, -1.1, len * 2, 2.2);
      }
      ctx.rotate(Math.PI / 4);
      for (let i = 0; i < 2; i++) {
        ctx.rotate(i === 0 ? 0 : Math.PI / 2);
        const grad = ctx.createLinearGradient(-len * 0.6, 0, len * 0.6, 0);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.28})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(-len * 0.6, -0.5, len * 1.2, 1);
      }
      ctx.restore();
    };

    const drawPopStar = (
      x: number,
      y: number,
      rgb: [number, number, number],
      size: number,
      pulse: number,
      spin: number,
    ) => {
      const [r, g, b] = rgb;
      const s = size * pulse;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // Outer color bloom — this is what makes it "pop"
      const outer = ctx.createRadialGradient(x, y, 0, x, y, s * 10);
      outer.addColorStop(0, `rgba(${r},${g},${b},1)`);
      outer.addColorStop(0.12, `rgba(${Math.floor(r * 0.75)},${Math.floor(g * 0.55)},${Math.floor(b * 0.95)},0.75)`);
      outer.addColorStop(0.35, `rgba(${Math.floor(r * 0.45)},${Math.floor(g * 0.25)},${Math.floor(b * 0.7)},0.28)`);
      outer.addColorStop(0.65, `rgba(${Math.floor(r * 0.25)},${Math.floor(g * 0.1)},${Math.floor(b * 0.45)},0.1)`);
      outer.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(x, y, s * 10, 0, Math.PI * 2);
      ctx.fill();

      drawStarSpike(x, y, s * 14, rgb, 0.95, spin);

      // Dense jewel core — deep color with a small white pinpoint
      const core = ctx.createRadialGradient(x, y, 0, x, y, s * 2.4);
      core.addColorStop(0, "rgba(255,255,255,1)");
      core.addColorStop(0.22, `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 30)},${Math.min(255, b + 40)},1)`);
      core.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
      core.addColorStop(0.82, `rgba(${Math.floor(r * 0.55)},${Math.floor(g * 0.35)},${Math.floor(b * 0.75)},0.7)`);
      core.addColorStop(1, `rgba(${Math.floor(r * 0.2)},${Math.floor(g * 0.1)},${Math.floor(b * 0.4)},0)`);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(x, y, s * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Saturated mid jewel
      ctx.fillStyle = `rgba(${r},${g},${b},1)`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2, s * 0.7), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(x - s * 0.18, y - s * 0.18, Math.max(0.9, s * 0.2), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    /** Personal clusters claimed by people who sent a blessing */
    const drawBlessingClusters = () => {
      const list = blessingsRef.current;
      if (!list.length) return;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (const blessing of list) {
        const { nx, ny } = clusterAnchor(blessing.id, blessing.family_side);
        // No pointer parallax here — keeps HTML hotspots aligned with painted stars
        const cx = nx * width;
        const cy = ny * height;
        const [cr, cg, cb] = colorToRgb(blessing.color);
        const seed = hashString(blessing.id);
        const pulse = reduced ? 1 : 0.88 + 0.12 * Math.sin(t * 1.4 + (seed % 100) * 0.07);
        const members = blessing.members?.length
          ? blessing.members
          : [{ name: blessing.name, personality: "", color: blessing.color }];
        const count = members.length;
        const spread = clusterSpread(width, height, count);

        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, spread * 3.2);
        halo.addColorStop(0, `rgba(${cr},${cg},${cb},${0.22 * pulse})`);
        halo.addColorStop(0.45, `rgba(${cr},${cg},${cb},${0.08 * pulse})`);
        halo.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, spread * 3.2, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < count; i++) {
          const member = members[i];
          const [r, g, b] = colorToRgb(member.color || blessing.color);
          const off = memberLocalOffset(blessing.id, i, count);
          const sx = cx + off.dx * spread;
          const sy = cy + off.dy * spread;
          const bit = hashString(`${blessing.id}:${i}`);
          const sr = 0.75 + ((bit >>> 16) % 10) * 0.18;
          const tw = reduced ? 1 : 0.7 + 0.3 * Math.sin(t * (2 + i * 0.35) + i);

          const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 4);
          core.addColorStop(0, `rgba(255,255,255,${0.95 * tw})`);
          core.addColorStop(0.35, `rgba(${r},${g},${b},${0.85 * tw})`);
          core.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(sx, sy, sr * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    /** Binary marriage stars — shared plane, Keplerian inspiral, vivid blue & violet */
    const drawMarriageBinary = () => {
      const cx = width * 0.2 + pointer.x * 8;
      const cy = height * 0.18 + pointer.y * 6;
      const minDim = Math.min(width, height);

      // Match the black-hole disk inclination so the orbit sits in the same space
      const incline = 0.32;
      const planeRot = -0.2;

      // Smooth separation cycle: wide → close (collision) → wide (kept leisurely)
      const cycle = reduced ? 0.45 : 0.5 + 0.5 * Math.sin(t * 0.22);
      // Closer = smaller orbit + faster spin (Kepler feel)
      const sep = 0.22 + 0.78 * cycle; // 1 = wide, ~0.22 = near-collision
      const a = minDim * (0.012 + 0.048 * sep);
      const spinRate = reduced ? 0 : 0.22 + (1 - sep) * 1.0;
      const ang = t * spinRate;

      const orbitPoint = (theta: number, radius: number) => {
        // Circle in disk plane, then tilt + rotate into view
        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * radius * incline;
        const ca = Math.cos(planeRot);
        const sa = Math.sin(planeRot);
        return {
          x: cx + x * ca - y * sa,
          y: cy + x * sa + y * ca,
        };
      };

      const blue = orbitPoint(ang, a);
      const purple = orbitPoint(ang + Math.PI, a);

      // Layla — soft pink star caught in Monica's (purple) orbit, like a moon
      const laylaAng = ang * 2.4 + t * 0.7;
      const laylaRad = a * (0.22 + 0.06 * Math.sin(t * 0.45));
      const laylaLocal = {
        x: Math.cos(laylaAng) * laylaRad,
        y: Math.sin(laylaAng) * laylaRad * incline,
      };
      const lca = Math.cos(planeRot);
      const lsa = Math.sin(planeRot);
      const layla = {
        x: purple.x + laylaLocal.x * lca - laylaLocal.y * lsa,
        y: purple.y + laylaLocal.x * lsa + laylaLocal.y * lca,
      };

      const dist = Math.hypot(blue.x - purple.x, blue.y - purple.y);
      const collide = Math.max(0, 1 - dist / (minDim * 0.07));
      const pulse = 1 + collide * 0.7;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // Faint orbital rail — sells the plane in 3D space
      ctx.strokeStyle = `rgba(140, 120, 200, ${0.12 + (1 - sep) * 0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const p = orbitPoint((i / 64) * Math.PI * 2, a);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Motion trails along the real orbit
      for (let i = 1; i <= 12; i++) {
        const fade = 1 - i / 13;
        const past = ang - i * 0.14;
        const tb = orbitPoint(past, a);
        const tp = orbitPoint(past + Math.PI, a);
        ctx.fillStyle = `rgba(25, 80, 210, ${0.16 * fade})`;
        ctx.beginPath();
        ctx.arc(tb.x, tb.y, (1.8 + pulse) * fade, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(145, 40, 255, ${0.2 * fade})`;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, (1.8 + pulse) * fade, 0, Math.PI * 2);
        ctx.fill();

        // Layla's pink trail around Monica's past position
        const pastLaylaAng = past * 2.4 + t * 0.7 - i * 0.2;
        const lr = a * (0.22 + 0.06 * Math.sin(t * 0.45));
        const lx = Math.cos(pastLaylaAng) * lr;
        const ly = Math.sin(pastLaylaAng) * lr * incline;
        const lpx = tp.x + lx * lca - ly * lsa;
        const lpy = tp.y + lx * lsa + ly * lca;
        ctx.fillStyle = `rgba(255, 120, 150, ${0.16 * fade})`;
        ctx.beginPath();
        ctx.arc(lpx, lpy, 1.4 * fade, 0, Math.PI * 2);
        ctx.fill();
      }

      const midX = (blue.x + purple.x) / 2;
      const midY = (blue.y + purple.y) / 2;

      // Collision flare when they rush together
      if (collide > 0.1) {
        const flashR = a * (0.9 + collide * 2.2);
        const flash = ctx.createRadialGradient(midX, midY, 0, midX, midY, flashR);
        flash.addColorStop(0, `rgba(255, 255, 255, ${0.45 * collide})`);
        flash.addColorStop(0.3, `rgba(145, 40, 255, ${0.45 * collide})`);
        flash.addColorStop(0.65, `rgba(40, 90, 210, ${0.22 * collide})`);
        flash.addColorStop(1, "rgba(40, 20, 80, 0)");
        ctx.fillStyle = flash;
        ctx.beginPath();
        ctx.arc(midX, midY, flashR, 0, Math.PI * 2);
        ctx.fill();

        const sparks = mobile() ? 8 : 14;
        for (let i = 0; i < sparks; i++) {
          const sa = ang * 3 + (i / sparks) * Math.PI * 2;
          const d = a * (0.4 + collide * 1.8) * (0.6 + (i % 4) * 0.12);
          const sx = midX + Math.cos(sa) * d;
          const sy = midY + Math.sin(sa) * d * incline * 2.2;
          ctx.fillStyle =
            i % 2 === 0
              ? `rgba(30, 90, 210, ${0.35 + collide * 0.5})`
              : `rgba(145, 40, 255, ${0.4 + collide * 0.5})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1 + collide * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      const size = mobile() ? 3.2 : 4.6;
      const laylaSize = mobile() ? 1.7 : 2.35;
      // Draw Layla first so Monica sits in front when they overlap
      // Layla = rose/coral pink; Monica = electric violet (clearly different hues)
      drawPopStar(layla.x, layla.y, [255, 120, 150], laylaSize, 1 + collide * 0.25, laylaAng);
      drawPopStar(blue.x, blue.y, [25, 80, 220], size, pulse, ang);
      drawPopStar(purple.x, purple.y, [145, 40, 255], size, pulse, ang + Math.PI);
    };

    const gasColor = (temp: number, alpha: number, boost = 1) => {
      const a = Math.min(1, alpha * boost);
      // Thermal disk continuum
      if (temp > 0.85) return `rgba(255, 248, 240, ${a})`;
      if (temp > 0.65) return `rgba(255, 220, 150, ${a})`;
      if (temp > 0.4) return `rgba(255, 150, 70, ${a})`;
      if (temp > 0.22) return `rgba(220, 80, 35, ${a})`;
      return `rgba(120, 40, 25, ${a})`;
    };

    /** Approximate light deflection toward the hole */
    const lensPoint = (
      px: number,
      py: number,
      cx: number,
      cy: number,
      rs: number,
    ): { x: number; y: number; swallow: boolean; stretch: number } => {
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < rs * 0.92) return { x: px, y: py, swallow: true, stretch: 0 };
      const u = rs / dist;
      // Deflection grows sharply near the photon sphere
      const defl = u * u * (1.1 + 2.4 * u);
      const nx = dx / dist;
      const ny = dy / dist;
      // Radial push + tangential shear (Einstein-ring tendency)
      const tx = -ny;
      const ty = nx;
      return {
        x: px + nx * defl * rs * 0.35 + tx * defl * rs * 0.55,
        y: py + ny * defl * rs * 0.35 + ty * defl * rs * 0.55,
        swallow: false,
        stretch: defl,
      };
    };

    const drawDiskBand = (
      cx: number,
      cy: number,
      scale: number,
      incline: number,
      opts: { secondary?: boolean; alphaScale?: number },
    ) => {
      const secondary = opts.secondary ?? false;
      const alphaScale = opts.alphaScale ?? 1;
      const rs = scale * 0.38; // event horizon radius
      const rin = rs * 1.15; // ISCO-ish
      const rout = scale * 1.75;

      // Continuous disk as many Keplerian blobs (reads like turbulent plasma)
      const ordered = [...gas].sort((a, b) => {
        const ay = Math.sin(a.angle + t * a.speed) * (secondary ? -1 : 1);
        const by = Math.sin(b.angle + t * b.speed) * (secondary ? -1 : 1);
        return ay - by;
      });

      for (const g of ordered) {
        const ang = g.angle + t * g.speed * (secondary ? 0.92 : 1);
        const r = scale * g.radius;
        if (r < rin || r > rout) continue;

        // Thin disk coordinates
        let ex = Math.cos(ang) * r;
        let ey = Math.sin(ang) * r * incline;

        if (secondary) {
          // Lensed far-side image appears ABOVE the hole (Interstellar / GR classic)
          ey = -Math.abs(ey) - rs * 0.55 - (r - rin) * 0.08;
          ex *= 0.92;
        } else {
          // Hide far-side portion behind the shadow (front disk only below / sides)
          if (ey < -rs * 0.05 && Math.hypot(ex, ey) < rs * 1.35) continue;
        }

        // Doppler + gravitational redshift approximation
        // Approaching side (cos>0) beamed brighter & hotter; receding dimmer/redder
        const approach = Math.cos(ang);
        const beaming = secondary
          ? 0.55 + 0.25 * Math.max(0, approach)
          : Math.pow(1 / (1 - 0.42 * approach), 2.2);
        const redshift = secondary ? 0.75 : 1 - 0.18 * Math.max(0, -approach);
        const temp = Math.min(1, g.temp * redshift * (0.85 + 0.2 * Math.max(0, approach)));

        const worldX = cx + ex;
        const worldY = cy + ey;
        const lensed = lensPoint(worldX, worldY, cx, cy, rs);
        if (lensed.swallow) continue;

        const bloom = g.size * (mobile() ? 3.8 : 5.5) * (secondary ? 0.85 : 1);
        const alpha = g.a * alphaScale * Math.min(1.8, beaming) * (secondary ? 0.55 : 1);
        const grad = ctx.createRadialGradient(
          lensed.x,
          lensed.y,
          0,
          lensed.x,
          lensed.y,
          bloom,
        );
        const c0 = gasColor(temp, Math.min(1, alpha));
        const c1 = gasColor(temp * 0.7, 0);
        grad.addColorStop(0, c0);
        grad.addColorStop(0.4, gasColor(temp, alpha * 0.35));
        grad.addColorStop(1, c1);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(
          lensed.x,
          lensed.y,
          bloom * (1 + lensed.stretch * 0.35),
          bloom * (0.55 + lensed.stretch * 0.2),
          ang,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    };

    const drawBlackHole = (cx: number, cy: number, scale: number) => {
      const rs = scale * 0.38;
      const incline = 0.28; // ~16° from edge-on — classic cinematic angle
      const rot = -0.22 + Math.sin(t * 0.15) * 0.02;

      // Interstellar dust extinction near the hole
      ctx.fillStyle = (() => {
        const g = ctx.createRadialGradient(cx, cy, rs * 0.2, cx, cy, scale * 2.8);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.35, "rgba(0,0,0,0.55)");
        g.addColorStop(0.65, "rgba(5,3,10,0.15)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        return g;
      })();
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy);

      // 1) Lensed secondary image of the far disk (above the shadow)
      ctx.globalCompositeOperation = "lighter";
      drawDiskBand(cx, cy, scale, incline, { secondary: true, alphaScale: 0.9 });

      // 2) Primary front disk
      drawDiskBand(cx, cy, scale, incline, { secondary: false, alphaScale: 1 });
      ctx.globalCompositeOperation = "source-over";

      // Photon ring — unstable photon orbit (~1.5 Rs), thin and sharp
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.72);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(255, 236, 210, 0.75)";
      ctx.lineWidth = Math.max(1.1, scale * 0.012);
      ctx.shadowColor = "rgba(255, 200, 140, 0.9)";
      ctx.shadowBlur = scale * 0.07;
      ctx.beginPath();
      ctx.arc(0, 0, rs * 1.52, 0, Math.PI * 2);
      ctx.stroke();
      // Inner shadow edge of photon ring
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = Math.max(0.6, scale * 0.005);
      ctx.beginPath();
      ctx.arc(0, 0, rs * 1.48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Event-horizon shadow (true silhouette — no light escapes)
      // EHT-style: slightly larger dark region than geometric Rs due to lensing
      const shadowR = rs * 1.05;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(cx, cy, shadowR, 0, Math.PI * 2);
      ctx.fill();

      // Soft contact of disk light wrapping the silhouette (lower crescent brighter)
      ctx.globalCompositeOperation = "lighter";
      const crescent = ctx.createRadialGradient(
        cx + rs * 0.35,
        cy + rs * 0.15,
        rs * 0.2,
        cx,
        cy,
        shadowR * 1.15,
      );
      crescent.addColorStop(0, "rgba(255, 200, 120, 0.0)");
      crescent.addColorStop(0.72, "rgba(255, 170, 80, 0.0)");
      crescent.addColorStop(0.9, "rgba(255, 160, 70, 0.18)");
      crescent.addColorStop(1, "rgba(255, 140, 50, 0)");
      ctx.fillStyle = crescent;
      ctx.beginPath();
      ctx.arc(cx, cy, shadowR * 1.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      ctx.restore();
    };

    const draw = (now: number) => {
      const dt = Math.min(33, now - last);
      last = now;
      t += reduced ? 0 : dt * 0.00038;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      // Space is black — residual CMB-like tint is negligible
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Extremely faint galactic dust / unresolved starlight along the band
      ctx.save();
      ctx.translate(width * 0.42, height * 0.4);
      ctx.rotate(-0.35);
      const band = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(width, height) * 0.7);
      band.addColorStop(0, "rgba(40, 36, 48, 0.14)");
      band.addColorStop(0.35, "rgba(22, 20, 32, 0.08)");
      band.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = band;
      ctx.scale(1, 0.22);
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(width, height) * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const bhX = width * (0.68 + pointer.x * 0.015);
      const bhY = height * (0.55 + pointer.y * 0.01);
      const scale = Math.min(width, height) * (mobile() ? 0.32 : 0.4);
      const rs = scale * 0.38;

      // Background stars — spectral colors, spikes, lensing
      for (const s of stars) {
        // Faint stars barely scintillate; bright ones twinkle more
        const tw = reduced
          ? 1
          : 0.72 + 0.28 * Math.sin(t * (2.2 + s.mag * 4) * s.tw + s.x * 0.02);
        const px0 = s.x + pointer.x * (1.5 + s.depth * 18);
        const py0 = s.y + pointer.y * (1.5 + s.depth * 18);
        const lensed = lensPoint(px0, py0, bhX, bhY, rs);
        if (lensed.swallow) continue;

        const dist = Math.hypot(px0 - bhX, py0 - bhY);
        let ringBoost = 1;
        if (dist < rs * 3.4 && dist > rs * 1.35) {
          ringBoost = 0.75 + 0.9 * Math.exp(-Math.pow((dist - rs * 2.15) / (rs * 0.4), 2));
        }

        const alpha = Math.min(1, s.a * tw * ringBoost);
        const px = lensed.x;
        const py = lensed.y;
        const stretch = 1 + lensed.stretch * 0.5;

        // Diffraction spikes on bright stars
        if (s.spike && s.mag > 0.7) {
          drawStarSpike(px, py, s.r * (mobile() ? 7 : 11), spectralRgb(s.spectral), alpha * 0.85);
        }

        // Halo for brighter stars (atmospheric / optics)
        if (s.mag > 0.45) {
          const haloR = s.r * (mobile() ? 3.2 : 5) * stretch;
          const halo = ctx.createRadialGradient(px, py, 0, px, py, haloR);
          halo.addColorStop(0, starColor(s.spectral, alpha * 0.55));
          halo.addColorStop(0.35, starColor(s.spectral, alpha * 0.12));
          halo.addColorStop(1, starColor(s.spectral, 0));
          ctx.globalAlpha = 1;
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(px, py, haloR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core
        ctx.globalAlpha = alpha;
        ctx.fillStyle = starColor(s.spectral, 1);
        ctx.beginPath();
        if (s.mag > 0.55) {
          // Slightly soft core
          const core = ctx.createRadialGradient(px, py, 0, px, py, s.r * 1.4 * stretch);
          const [r, g, b] = spectralRgb(s.spectral);
          core.addColorStop(0, `rgba(255,255,255,1)`);
          core.addColorStop(0.45, `rgba(${r},${g},${b},0.95)`);
          core.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = core;
          ctx.arc(px, py, Math.max(0.5, s.r * 1.4 * stretch), 0, Math.PI * 2);
        } else {
          // Unresolved point
          ctx.arc(px, py, Math.max(0.35, s.r * stretch), 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      drawBlessingClusters();
      drawMarriageBinary();

      drawBlackHole(bhX, bhY, scale);

      // Optical vignette (telescope / eye)
      const vig = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.22,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8,
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(0.65, "rgba(0,0,0,0.25)");
      vig.addColorStop(1, "rgba(0,0,0,0.88)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);

      if (running) raf = requestAnimationFrame(draw);
    };

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };

    build();
    last = performance.now();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black" aria-hidden="true">
        <canvas ref={canvasRef} className="h-full w-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_55%,transparent_10%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      {/* Tiny hotspots — only the stars capture clicks; page content sits above at z-10 */}
      <div className="pointer-events-none fixed inset-0 z-[1]">
        {hotspots.map((star) => (
          <button
            key={star.key}
            type="button"
            aria-label={`${star.name}${star.personality ? ` — ${star.personality}` : ""}`}
            title={star.name}
            onClick={() => setActiveKey((key) => (key === star.key ? null : star.key))}
            className="pointer-events-auto absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            style={{ left: star.x, top: star.y }}
          />
        ))}

        {active && (
          <div
            role="dialog"
            aria-label={`Star ${active.name} from ${active.clusterName}`}
            className="pointer-events-auto absolute z-10 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-gold/40 bg-black/85 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md"
            style={{
              left: Math.min(Math.max(active.x, 160), (viewport.w || window.innerWidth) - 160),
              top: Math.min(active.y + 28, (viewport.h || window.innerHeight) - 160),
            }}
          >
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">Named star</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-champagne">
              <span
                className="inline-block size-2.5 rounded-full border border-white/30"
                style={{ backgroundColor: active.color }}
              />
              {active.name}
            </p>
            {active.personality ? (
              <p className="mt-1 text-xs italic leading-relaxed text-champagne/80">
                “{active.personality}”
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              {active.clusterName} · {FAMILY_SIDE_LABELS[active.family_side]}
            </p>
            {active.clusterMessage ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {active.clusterMessage}
              </p>
            ) : null}
            {active.members.length > 1 ? (
              <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto border-t border-glass-border pt-2">
                {active.members.map((m, i) => (
                  <li key={`${active.clusterId}-m-${i}`}>
                    <button
                      type="button"
                      onClick={() => setActiveKey(`${active.clusterId}:${i}`)}
                      className={
                        i === active.memberIndex
                          ? "text-left text-xs text-gold"
                          : "text-left text-xs text-muted-foreground hover:text-champagne"
                      }
                    >
                      ✦ {m.name}
                      {m.personality ? ` — ${m.personality}` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              className="mt-2 text-xs text-gold/80 underline-offset-2 hover:underline"
              onClick={() => setActiveKey(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}
