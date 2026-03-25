import { useState, useEffect, useRef } from "react";
import { supabase } from "./Supabase";

const caveDrawings = [
  // Human figures
  "M40,80 L40,55 M40,55 L30,65 M40,55 L50,65 M40,55 L40,45 Q40,42 43,40 Q46,38 43,36 Q40,34 37,36 Q34,38 37,40 Q40,42 40,45",
  "M120,70 L120,48 M120,48 L110,58 M120,48 L130,58 M120,48 L120,38 Q120,35 123,33 Q126,31 123,29 Q120,27 117,29 Q114,31 117,33 Q120,35 120,38",
  // Animals
  "M200,60 Q210,55 220,58 Q228,55 235,60 L238,70 L230,70 M200,60 L195,70 L205,70 M210,55 L210,48 M220,58 L220,48",
  "M300,65 Q315,58 330,62 Q340,58 348,65 L350,75 L340,72 M300,65 L295,75 L308,75 M315,58 L312,50 M328,62 L328,50",
  // Sun
  "M420,45 Q420,35 430,35 Q440,35 440,45 Q440,55 430,55 Q420,55 420,45 M430,28 L430,22 M430,62 L430,68 M413,35 L408,30 M452,35 L457,30 M413,55 L408,60 M452,55 L457,60 M407,45 L401,45 M459,45 L465,45",
  // Group of people
  "M520,75 L520,55 M520,55 L512,63 M520,55 L528,63 M520,45 Q523,40 520,37 Q517,40 520,45 M540,75 L540,55 M540,55 L532,63 M540,55 L548,63 M540,45 Q543,40 540,37 Q537,40 540,45 M560,75 L560,55 M560,55 L552,63 M560,55 L568,63 M560,45 Q563,40 560,37 Q557,40 560,45",
  // Handprint
  "M80,160 Q75,155 72,148 L70,138 L74,138 L76,148 M80,160 Q82,154 82,146 L82,136 L86,136 L86,146 M80,160 Q86,156 88,148 L90,138 L94,138 L90,148 M80,160 Q88,158 92,152 L96,144 L99,145 L94,154 M80,160 L68,168 Q64,172 66,176 Q70,180 74,175 L80,160",
  // Mountains
  "M160,180 L185,140 L210,180 M195,180 L225,135 L255,180",
  // Trees
  "M350,180 L350,155 M340,168 L350,155 L360,168 M338,175 L350,160 L362,175",
  // Stars/dots pattern
  "M450,130 L452,126 L454,130 L458,130 L455,133 L456,137 L452,135 L448,137 L449,133 L446,130 Z",
  // Arrow/direction
  "M40,220 L80,220 L72,212 M80,220 L72,228",
  // Waves/water
  "M100,230 Q115,222 130,230 Q145,238 160,230 Q175,222 190,230",
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frame = 0;
    let animId;

    function drawFlicker(ctx, w, h, frame) {
      ctx.clearRect(0, 0, w, h);

      // Cave wall base
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.6, 0, w * 0.5, h * 0.5, w * 0.8);
      grad.addColorStop(0, "#2a1f0e");
      grad.addColorStop(0.4, "#1a1208");
      grad.addColorStop(1, "#0a0804");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Torch glow — flickers
      const flicker = 0.85 + Math.sin(frame * 0.13) * 0.08 + Math.sin(frame * 0.31) * 0.07;
      const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, w * 0.55 * flicker);
      glow.addColorStop(0, "rgba(180,100,20,0.18)");
      glow.addColorStop(0.4, "rgba(140,70,10,0.10)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Cave texture cracks
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      const cracks = [[50, 30, 120, 90], [w - 80, 20, w - 40, 100], [30, h - 100, 100, h - 30], [w - 60, h - 80, w - 20, h - 20]];
      cracks.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo((x1 + x2) / 2 + 15, (y1 + y2) / 2 - 10, x2, y2);
        ctx.stroke();
      });

      // Cave drawings — etched, aged look
      const alpha = 0.18 + Math.sin(frame * 0.07) * 0.03;
      ctx.strokeStyle = `rgba(200,160,80,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const scaleX = w / 600;
      const scaleY = h / 400;

      caveDrawings.forEach((d) => {
        ctx.save();
        ctx.scale(scaleX, scaleY);
        const p = new Path2D(d);
        ctx.stroke(p);
        ctx.restore();
      });

      // Vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.9);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      frame++;
      animId = requestAnimationFrame(() => drawFlicker(ctx, w, h, frame));
    }

    drawFlicker(ctx, canvas.width, canvas.height, 0);
    return () => cancelAnimationFrame(animId);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", fontFamily: "'Georgia', serif" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100%", padding: "2rem",
      }}>
        {!sent ? (
          <div style={{ textAlign: "center", maxWidth: 420, width: "100%" }}>
            {/* Title */}
            <div style={{ marginBottom: "2.5rem" }}>
              <h1 style={{
                fontSize: "clamp(2rem, 6vw, 3.2rem)",
                fontWeight: 400,
                color: "#e8c87a",
                letterSpacing: "0.08em",
                margin: 0,
                textShadow: "0 0 40px rgba(200,140,40,0.5)",
                fontFamily: "'Georgia', 'Times New Roman', serif",
              }}>
                Dunbar's Band
              </h1>
              <p style={{
                fontSize: "0.85rem",
                color: "rgba(200,160,80,0.55)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginTop: "0.6rem",
                fontFamily: "Georgia, serif",
              }}>
                150 is the limit. make them count.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(200,160,80,0.3)",
                  borderRadius: 4,
                  padding: "0.9rem 1.2rem",
                  color: "#e8d5a0",
                  fontSize: "1rem",
                  fontFamily: "Georgia, serif",
                  letterSpacing: "0.04em",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? "rgba(200,160,80,0.15)" : "rgba(200,160,80,0.2)",
                  border: "1px solid rgba(200,160,80,0.5)",
                  borderRadius: 4,
                  padding: "0.9rem",
                  color: "#e8c87a",
                  fontSize: "0.9rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontFamily: "Georgia, serif",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Sending..." : "Enter the cave →"}
              </button>
            </form>

            {error && (
              <p style={{ color: "#e07070", fontSize: "0.85rem", marginTop: "1rem" }}>{error}</p>
            )}

            <p style={{
              fontSize: "0.75rem",
              color: "rgba(200,160,80,0.3)",
              marginTop: "2rem",
              letterSpacing: "0.1em",
            }}>
              No password. Just a link.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center", maxWidth: 360 }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔥</p>
            <h2 style={{
              color: "#e8c87a",
              fontWeight: 400,
              fontSize: "1.5rem",
              fontFamily: "Georgia, serif",
              marginBottom: "0.75rem",
            }}>
              Check your email
            </h2>
            <p style={{ color: "rgba(200,160,80,0.6)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              We sent a magic link to <strong style={{ color: "#e8c87a" }}>{email}</strong>.<br />
              Click it to enter Dunbar's Band.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
