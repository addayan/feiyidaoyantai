import { useEffect, useRef, useState } from 'react';

/* ============================================================
   科技线路 SVG — 仅保留线路和节点，去掉傩面脸轮廓
   ============================================================ */
function TechCircuitSVG() {
  return (
    <svg
      className="hero-circuit"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="c1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a853" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {/* 主干线路 */}
      <path d="M200,100 L200,300 L400,300 L400,500 L600,500" fill="none" stroke="url(#c1)" strokeWidth="1" opacity="0.4" />
      <path d="M1240,100 L1240,300 L1040,300 L1040,500 L840,500" fill="none" stroke="url(#c1)" strokeWidth="1" opacity="0.4" />
      <path d="M100,700 L300,700 L300,500 L500,500 L500,350" fill="none" stroke="url(#c1)" strokeWidth="1" opacity="0.3" />
      <path d="M1340,700 L1140,700 L1140,500 L940,500 L940,350" fill="none" stroke="url(#c1)" strokeWidth="1" opacity="0.3" />
      {/* 节点 */}
      <circle cx="200" cy="300" r="4" fill="#d4a853" opacity="0.5" />
      <circle cx="400" cy="500" r="4" fill="#d4a853" opacity="0.5" />
      <circle cx="1240" cy="300" r="4" fill="#2dd4bf" opacity="0.5" />
      <circle cx="1040" cy="500" r="4" fill="#2dd4bf" opacity="0.5" />
      <circle cx="300" cy="700" r="3" fill="#d4a853" opacity="0.4" />
      <circle cx="1140" cy="700" r="3" fill="#2dd4bf" opacity="0.4" />
      {/* 装饰点 */}
      <circle cx="100" cy="200" r="2" fill="#d4a853" opacity="0.3" />
      <circle cx="1340" cy="200" r="2" fill="#2dd4bf" opacity="0.3" />
      <circle cx="150" cy="600" r="2" fill="#2dd4bf" opacity="0.25" />
      <circle cx="1290" cy="600" r="2" fill="#d4a853" opacity="0.25" />
    </svg>
  );
}

/* ============================================================
   Canvas 粒子系统 — 60 粒子，金/青色，距离连线
   ============================================================ */
function ParticlesCanvas({ reduceMotion }: { reduceMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number; y: number; size: number;
      speedX: number; speedY: number;
      opacity: number; hue: number;
      reset: () => void; update: () => void; draw: () => void;
    }> = [];
    let animationId: number | null = null;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      x: number; y: number; size: number;
      speedX: number; speedY: number;
      opacity: number; hue: number;
      constructor() {
        this.x = 0; this.y = 0; this.size = 0;
        this.speedX = 0; this.speedY = 0;
        this.opacity = 0; this.hue = 0;
        this.reset();
      }
      reset() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.hue = Math.random() > 0.5 ? 43 : 170;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (!canvas) return;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + this.hue + ', 70%, 60%, ' + this.opacity + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < 60; i++) {
      particles.push(new Particle());
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) { p.update(); p.draw(); });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(212, 168, 83, ' + (0.08 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!animationId) animate();
        } else {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        }
      });
    }, { threshold: 0.1 });
    observer.observe(canvas);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}

/* ============================================================
   响应式断点 hook
   ============================================================ */
function useViewport() {
  const [vw, setVw] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return vw;
}

/* ============================================================
   HeroBackground 主组件
   柳树妈妈线描轮廓（右侧融入，无硬边界）+ 粒子 + 线路 + 渐变遮罩
   ============================================================ */
export default function HeroBackground() {
  const vw = useViewport();
  const isMobile = vw < 768;
  const isTablet = vw >= 768 && vw < 1200;

  // 轮廓图透明度
  const mamaOpacity = isMobile ? 0.12 : isTablet ? 0.2 : 0.28;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* z-0: 柳树妈妈线描轮廓 — 右侧融入，mask 淡出消除硬边 */}
      <div
        style={{
          position: 'absolute',
          top: isMobile ? '8%' : '-2%',
          right: isMobile ? '-15%' : '-3%',
          height: isMobile ? '85%' : '105%',
          width: 'auto',
          zIndex: 0,
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
          opacity: mamaOpacity,
          pointerEvents: 'none',
        }}
      >
        <img
          src="/hero-liushu-mama.png"
          alt=""
          style={{
            height: '100%',
            width: 'auto',
            display: 'block',
          }}
        />
      </div>

      {/* z-1: 科技线路 — 极淡，手机端隐藏 */}
      {!isMobile && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: isTablet ? 0.1 : 0.15, pointerEvents: 'none',
        }}>
          <TechCircuitSVG />
        </div>
      )}

      {/* z-3: 渐变遮罩 — 左侧文字区压暗 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: [
          'linear-gradient(to bottom, rgba(8,8,12,0.55) 0%, rgba(8,8,12,0.25) 40%, rgba(8,8,12,0.5) 80%, var(--bg) 100%)',
          isMobile
            ? 'linear-gradient(180deg, rgba(8,8,12,0.5) 0%, rgba(8,8,12,0.15) 50%, rgba(8,8,12,0.4) 100%)'
            : 'linear-gradient(100deg, rgba(8,8,12,0.7) 0%, rgba(8,8,12,0.35) 40%, rgba(8,8,12,0.05) 70%, rgba(8,8,12,0.15) 100%)',
        ].join(', '),
        pointerEvents: 'none',
      }} />

      {/* z-4: Canvas 粒子 */}
      <ParticlesCanvas reduceMotion={isMobile} />
    </div>
  );
}
