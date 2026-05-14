import confetti from "canvas-confetti";

export function celebrateSuccess() {
  const duration = 2500;
  const end = Date.now() + duration;

  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });

    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
