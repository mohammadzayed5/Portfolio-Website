/* Subtle space-themed particle field for the hero background.
   Mounts a canvas, animates ~80 stars with twinkle + slow parallax drift. */

function ParticleField({ density = 80, hue = 220 }) {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const mouseRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars = [];
    let shooting = null;
    let lastShoot = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      const rect = canvas.getBoundingClientRect();
      stars = Array.from({ length: density }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.2 + 0.3,
        tw: Math.random() * Math.PI * 2,
        twSpeed: 0.005 + Math.random() * 0.015,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
      }));
    }
    function spawnShooting() {
      const rect = canvas.getBoundingClientRect();
      shooting = {
        x: Math.random() * rect.width * 0.6,
        y: Math.random() * rect.height * 0.5,
        vx: 4 + Math.random() * 3,
        vy: 1 + Math.random() * 1.5,
        life: 0,
        maxLife: 60,
      };
    }
    function tick(t) {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // soft radial gradient glow near top
      const grd = ctx.createRadialGradient(
        rect.width * 0.5, rect.height * 0.3, 0,
        rect.width * 0.5, rect.height * 0.3, rect.width * 0.6
      );
      grd.addColorStop(0, `hsla(${hue}, 90%, 55%, 0.07)`);
      grd.addColorStop(1, "hsla(220, 30%, 5%, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, rect.width, rect.height);

      const mx = (mouseRef.current.x - 0.5) * 20;
      const my = (mouseRef.current.y - 0.5) * 20;

      for (const s of stars) {
        s.tw += s.twSpeed;
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -5) s.x = rect.width + 5;
        if (s.x > rect.width + 5) s.x = -5;
        if (s.y < -5) s.y = rect.height + 5;
        if (s.y > rect.height + 5) s.y = -5;
        const a = (Math.sin(s.tw) * 0.4 + 0.6) * s.z;
        const px = s.x + mx * s.z;
        const py = s.y + my * s.z;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue + (s.z > 0.6 ? 0 : -20)}, ${s.z > 0.6 ? 30 : 70}%, ${70 + s.z * 20}%, ${a})`;
        ctx.fill();
        if (s.r > 1.0 && a > 0.7) {
          ctx.beginPath();
          ctx.arc(px, py, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${a * 0.08})`;
          ctx.fill();
        }
      }

      if (!shooting && t - lastShoot > 6000 + Math.random() * 6000) {
        spawnShooting();
        lastShoot = t;
      }
      if (shooting) {
        shooting.life++;
        const tail = 80;
        const tx = shooting.x - shooting.vx * tail / 8;
        const ty = shooting.y - shooting.vy * tail / 8;
        const grad = ctx.createLinearGradient(tx, ty, shooting.x, shooting.y);
        grad.addColorStop(0, "hsla(220, 90%, 70%, 0)");
        grad.addColorStop(1, `hsla(${hue}, 90%, 75%, ${1 - shooting.life / shooting.maxLife})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(shooting.x, shooting.y);
        ctx.stroke();
        shooting.x += shooting.vx;
        shooting.y += shooting.vy;
        if (shooting.life >= shooting.maxLife) shooting = null;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    }

    resize();
    init();
    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener("resize", () => { resize(); init(); });
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
    };
  }, [density, hue]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
window.ParticleField = ParticleField;
