import { useEffect, useRef } from 'react';

/* ============================================================
   科技线路 SVG — 还原旧版，但保持克制
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
      {/* 傩面轮廓抽象 */}
      <path d="M620,380 Q620,340 660,330 Q700,320 720,350 Q740,320 780,330 Q820,340 820,380 Q830,420 800,460 Q770,500 720,520 Q670,500 640,460 Q610,420 620,380Z" fill="none" stroke="#d4a853" strokeWidth="1.5" opacity="0.25" />
      <path d="M660,380 Q660,370 670,365 Q680,360 690,370 Q695,380 690,390 Q685,400 675,395 Q665,390 660,380Z" fill="none" stroke="#d4a853" strokeWidth="1" opacity="0.2" />
      <path d="M750,380 Q750,370 760,365 Q770,360 780,370 Q785,380 780,390 Q775,400 765,395 Q755,390 750,380Z" fill="none" stroke="#d4a853" strokeWidth="1" opacity="0.2" />
      <path d="M700,410 Q710,400 720,410 Q730,420 720,435 Q710,445 700,435 Q690,425 700,410Z" fill="none" stroke="#d4a853" strokeWidth="1.5" opacity="0.25" />
      <path d="M680,460 Q700,470 720,465 Q740,470 760,460" fill="none" stroke="#d4a853" strokeWidth="1" opacity="0.2" />
      {/* 装饰点 */}
      <circle cx="100" cy="200" r="2" fill="#d4a853" opacity="0.3" />
      <circle cx="1340" cy="200" r="2" fill="#2dd4bf" opacity="0.3" />
      <circle cx="150" cy="600" r="2" fill="#2dd4bf" opacity="0.25" />
      <circle cx="1290" cy="600" r="2" fill="#d4a853" opacity="0.25" />
    </svg>
  );
}

/* ============================================================
   Canvas 粒子系统 — 完全还原旧版
   60 粒子，金/青色，距离连线，IntersectionObserver 暂停
   ============================================================ */
function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
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
  }, []);

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
   HeroBackground 主组件
   旧版真实背景图 + Canvas 粒子 + 科技线路 + 渐变遮罩
   ============================================================ */
export default function HeroBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* z-0: 旧版真实背景图 — 全屏覆盖 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src="/hero-bg-legacy.jpg"
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.45,
          }}
        />
      </div>

      {/* z-1: 科技线路 — 极淡 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        opacity: 0.25, pointerEvents: 'none',
      }}>
        <TechCircuitSVG />
      </div>

      {/* z-2: 渐变遮罩 — 保证文字可读性 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'linear-gradient(to bottom, rgba(8,8,12,0.2) 0%, rgba(8,8,12,0.6) 60%, var(--bg) 100%)',
        pointerEvents: 'none',
      }} />

      {/* z-4: Canvas 粒子 */}
      <ParticlesCanvas />
    </div>
  );
}
