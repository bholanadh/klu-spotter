// EntryPage — KLU Spotter animated entry: dual red panels + ROAR burst login popup
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type AnimState = "idle" | "sliding" | "popup" | "authenticating";

// Spring: cubic-bezier(0.34, 1.56, 0.64, 1) — aggressive pop
const BURST_EASE = [0.34, 1.56, 0.64, 1] as const;

// Starburst jagged clip-path — 16-point star polygon for aggressive KLU "ROAR" effect
const BURST_CLIP =
  "polygon(50% 0%,55% 15%,65% 5%,63% 20%,78% 14%,72% 28%,88% 26%,79% 38%,96% 42%,84% 51%,96% 58%,82% 63%,90% 76%,75% 77%,78% 92%,64% 88%,62% 100%,50% 90%,38% 100%,36% 88%,22% 92%,25% 77%,10% 76%,18% 63%,4% 58%,16% 51%,4% 42%,21% 38%,12% 26%,28% 28%,22% 14%,37% 20%,35% 5%,45% 15%)";

export default function EntryPage() {
  const [animState, setAnimState] = useState<AnimState>("idle");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const centerBtnControls = useAnimationControls();

  // Pulse the center button on idle
  useEffect(() => {
    if (animState === "idle") {
      centerBtnControls.start({
        scale: [1, 1.08, 1],
        transition: {
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
      });
    } else {
      centerBtnControls.stop();
    }
  }, [animState, centerBtnControls]);

  // Redirect if already authenticated on mount
  useEffect(() => {
    if (isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  // Navigate on successful auth during popup
  useEffect(() => {
    if (
      isAuthenticated &&
      animState === "authenticating" &&
      !hasNavigated.current
    ) {
      hasNavigated.current = true;
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, animState, navigate]);

  const handleIconClick = () => {
    if (animState !== "idle") return;
    setAnimState("sliding");
    setTimeout(() => setAnimState("popup"), 700);
  };

  const handleLogin = async () => {
    setAnimState("authenticating");
    try {
      await login();
    } catch {
      toast.error("Login failed. Please try again.");
      setAnimState("popup");
    }
  };

  const handleClosePopup = () => {
    setAnimState("idle");
  };

  const showPanels = animState === "idle" || animState === "sliding";
  const showPopup = animState === "popup" || animState === "authenticating";

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{ background: "oklch(0.08 0 0)" }}
    >
      {/* Background texture — subtle grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0 0 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0 / 0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ─── LEFT RED PANEL ─── */}
      <AnimatePresence>
        {showPanels && (
          <motion.div
            className="absolute inset-y-0 left-0 z-10"
            style={{
              width: "calc(50% - 4px)",
              background:
                "linear-gradient(135deg, oklch(0.48 0.22 25) 0%, oklch(0.38 0.24 22) 100%)",
            }}
            initial={{ x: 0 }}
            animate={animState === "sliding" ? { x: "-105%" } : { x: 0 }}
            exit={{ x: "-105%" }}
            transition={
              animState === "sliding"
                ? { type: "spring", stiffness: 260, damping: 20 }
                : { duration: 0 }
            }
            data-ocid="entry-panel-left"
          >
            {/* Diagonal texture stripes */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, transparent, transparent 28px, oklch(1 0 0 / 0.05) 28px, oklch(1 0 0 / 0.05) 30px)",
              }}
            />
            {/* Radial vignette */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 30% 60%, transparent 40%, oklch(0 0 0 / 0.45) 100%)",
              }}
            />
            {/* KLU ghost text */}
            <div className="absolute bottom-10 left-8 flex flex-col items-start leading-none pointer-events-none">
              <span
                className="font-display font-black select-none"
                style={{
                  fontSize: "clamp(72px, 12vw, 140px)",
                  color: "oklch(1 0 0 / 0.07)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                KLU
              </span>
              <span
                className="font-body font-medium tracking-[0.35em] uppercase"
                style={{ color: "oklch(1 0 0 / 0.18)", fontSize: "11px" }}
              >
                KL University
              </span>
            </div>
            {/* Corner accent triangle */}
            <div
              className="absolute top-0 left-0 w-0 h-0"
              style={{
                borderRight: "60px solid transparent",
                borderTop: "60px solid oklch(1 0 0 / 0.06)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── RIGHT RED PANEL ─── */}
      <AnimatePresence>
        {showPanels && (
          <motion.div
            className="absolute inset-y-0 right-0 z-10"
            style={{
              width: "calc(50% - 4px)",
              background:
                "linear-gradient(225deg, oklch(0.48 0.22 25) 0%, oklch(0.38 0.24 22) 100%)",
            }}
            initial={{ x: 0 }}
            animate={animState === "sliding" ? { x: "105%" } : { x: 0 }}
            exit={{ x: "105%" }}
            transition={
              animState === "sliding"
                ? { type: "spring", stiffness: 260, damping: 20, delay: 0.07 }
                : { duration: 0 }
            }
            data-ocid="entry-panel-right"
          >
            {/* Diagonal texture stripes */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-135deg, transparent, transparent 28px, oklch(1 0 0 / 0.05) 28px, oklch(1 0 0 / 0.05) 30px)",
              }}
            />
            {/* Radial vignette */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 70% 60%, transparent 40%, oklch(0 0 0 / 0.45) 100%)",
              }}
            />
            {/* SPOT ghost text */}
            <div className="absolute bottom-10 right-8 flex flex-col items-end leading-none pointer-events-none">
              <span
                className="font-display font-black select-none"
                style={{
                  fontSize: "clamp(72px, 12vw, 140px)",
                  color: "oklch(1 0 0 / 0.07)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                SPOT
              </span>
              <span
                className="font-body font-medium tracking-[0.35em] uppercase"
                style={{ color: "oklch(1 0 0 / 0.18)", fontSize: "11px" }}
              >
                Room Finder
              </span>
            </div>
            {/* Corner accent triangle */}
            <div
              className="absolute top-0 right-0 w-0 h-0"
              style={{
                borderLeft: "60px solid transparent",
                borderTop: "60px solid oklch(1 0 0 / 0.06)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CENTER BAR + TRIGGER BUTTON ─── */}
      <AnimatePresence>
        {showPanels && (
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
            style={{ width: "8px" }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {/* White vertical bar */}
            <div className="absolute inset-0 bg-white/95" />

            {/* Radial glow on bar */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 300% 20% at 50% 50%, oklch(1 0 0 / 0.55) 0%, transparent 70%)",
              }}
            />

            {/* Trigger button */}
            <motion.button
              type="button"
              className="relative z-10 rounded-full flex items-center justify-center"
              style={{
                width: "52px",
                height: "52px",
                background: "oklch(0.08 0 0)",
                border: "2.5px solid oklch(1 0 0 / 0.9)",
                boxShadow:
                  "0 0 0 4px oklch(0.48 0.22 25 / 0.5), 0 0 24px oklch(0.48 0.22 25 / 0.7)",
              }}
              animate={centerBtnControls}
              onClick={handleIconClick}
              whileHover={{
                scale: 1.15,
                boxShadow:
                  "0 0 0 6px oklch(0.48 0.22 25 / 0.6), 0 0 40px oklch(0.48 0.22 25 / 0.8)",
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              aria-label="Open login"
              data-ocid="entry-login-trigger"
            >
              {/* K monogram */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 4v16M7 12l10-8M7 12l10 8"
                  stroke="oklch(0.72 0.20 25)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>

            {/* "Tap to Enter" hint */}
            <motion.span
              className="absolute font-body font-semibold text-white/80 uppercase tracking-[0.3em]"
              style={{
                fontSize: "9px",
                top: "calc(50% + 34px)",
                whiteSpace: "nowrap",
                writingMode: "horizontal-tb",
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 2.4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              Tap to Enter
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── BURST POPUP ─── */}
      <AnimatePresence>
        {showPopup && (
          <>
            {/* Dimmed backdrop with red tint */}
            <motion.div
              className="absolute inset-0 z-30"
              style={{
                background: "oklch(0.06 0.03 25 / 0.92)",
                backdropFilter: "blur(6px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={animState === "popup" ? handleClosePopup : undefined}
              data-ocid="entry-popup-backdrop"
            />

            {/* Starburst glow — purely decorative ring behind popup */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: BURST_EASE }}
            >
              <div
                style={{
                  width: "420px",
                  height: "420px",
                  clipPath: BURST_CLIP,
                  background:
                    "radial-gradient(ellipse 60% 60% at 50% 50%, oklch(0.55 0.22 25 / 0.25) 0%, oklch(0.48 0.22 25 / 0.08) 60%, transparent 100%)",
                }}
              />
            </motion.div>

            {/* Popup card */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative pointer-events-auto"
                style={{
                  width: "100%",
                  maxWidth: "360px",
                  background: "oklch(0.13 0.006 25)",
                  border: "1px solid oklch(0.48 0.22 25 / 0.4)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow:
                    "0 0 0 1px oklch(0.48 0.22 25 / 0.25), 0 24px 80px oklch(0.48 0.22 25 / 0.35), 0 8px 32px oklch(0 0 0 / 0.8)",
                }}
                initial={{ scale: 0.2, y: 40, rotate: -6 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.15, y: 20, opacity: 0 }}
                transition={{
                  scale: { type: "tween", duration: 0.55, ease: BURST_EASE },
                  y: { type: "tween", duration: 0.55, ease: BURST_EASE },
                  rotate: { type: "tween", duration: 0.5, ease: BURST_EASE },
                  opacity: { duration: 0.2 },
                }}
                data-ocid="entry-popup"
              >
                {/* Top accent bar */}
                <div
                  style={{
                    height: "4px",
                    background:
                      "linear-gradient(90deg, oklch(0.55 0.22 25) 0%, oklch(0.68 0.18 25) 50%, oklch(0.55 0.22 25) 100%)",
                  }}
                />

                {/* Inner padded content */}
                <div className="px-8 pt-7 pb-8">
                  {/* Close button */}
                  {animState === "popup" && (
                    <button
                      type="button"
                      className="absolute top-5 right-5 flex items-center justify-center rounded-full transition-smooth"
                      style={{
                        width: "28px",
                        height: "28px",
                        background: "oklch(0.19 0.004 25)",
                        color: "oklch(0.55 0 0)",
                      }}
                      onClick={handleClosePopup}
                      aria-label="Close popup"
                      data-ocid="entry-popup-close"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 1l10 10M11 1L1 11"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}

                  {/* ── ROAR BRANDING BLOCK ── */}
                  <div className="flex flex-col items-center mb-7">
                    {/* Roar emblem burst shape */}
                    <motion.div
                      className="relative mb-4"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.05,
                        duration: 0.5,
                        ease: BURST_EASE,
                      }}
                    >
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          clipPath:
                            "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
                          background:
                            "linear-gradient(145deg, oklch(0.55 0.22 25) 0%, oklch(0.42 0.24 22) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="font-display font-black text-white/90"
                          style={{ fontSize: "13px", letterSpacing: "0.08em" }}
                        >
                          KLU
                        </span>
                      </div>
                    </motion.div>

                    {/* ROAR heading */}
                    <motion.h1
                      className="font-display font-black text-center"
                      style={{
                        fontSize: "clamp(48px, 14vw, 64px)",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                        background:
                          "linear-gradient(135deg, oklch(0.97 0 0) 0%, oklch(0.72 0.18 25) 60%, oklch(0.55 0.22 25) 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: 0.1,
                        duration: 0.38,
                        ease: BURST_EASE,
                      }}
                    >
                      ROAR
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                      className="font-body font-medium text-center mt-2"
                      style={{
                        fontSize: "13px",
                        color: "oklch(0.62 0 0)",
                        letterSpacing: "0.06em",
                      }}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: 0.2,
                        duration: 0.32,
                        ease: "easeOut",
                      }}
                    >
                      Student ID Login
                    </motion.p>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: "1px",
                      background:
                        "linear-gradient(90deg, transparent, oklch(0.48 0.22 25 / 0.4), transparent)",
                      marginBottom: "24px",
                    }}
                  />

                  {/* Auth content */}
                  <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.32, ease: "easeOut" }}
                  >
                    {animState === "authenticating" ? (
                      <div className="flex flex-col items-center gap-3 py-3">
                        {/* Spinning ring */}
                        <div
                          className="rounded-full animate-spin"
                          style={{
                            width: "36px",
                            height: "36px",
                            border: "3px solid oklch(0.48 0.22 25 / 0.2)",
                            borderTop: "3px solid oklch(0.62 0.22 25)",
                          }}
                        />
                        <motion.p
                          className="font-display font-bold text-center"
                          style={{
                            fontSize: "22px",
                            letterSpacing: "0.1em",
                            color: "oklch(0.72 0.18 25)",
                          }}
                          animate={{ opacity: [1, 0.35, 1] }}
                          transition={{
                            duration: 1.2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                          data-ocid="entry-authenticating"
                        >
                          KLU
                        </motion.p>
                        <p
                          className="font-body uppercase tracking-[0.25em]"
                          style={{ fontSize: "9px", color: "oklch(0.48 0 0)" }}
                        >
                          Authenticating…
                        </p>
                      </div>
                    ) : (
                      <>
                        <p
                          className="font-body text-center leading-relaxed px-2"
                          style={{ fontSize: "12px", color: "oklch(0.52 0 0)" }}
                        >
                          Sign in with your KLU Internet Identity to access the
                          campus room availability system.
                        </p>

                        {/* Login button */}
                        <motion.button
                          type="button"
                          className="w-full flex items-center justify-center gap-3 font-display font-bold rounded-xl"
                          style={{
                            fontSize: "14px",
                            letterSpacing: "0.04em",
                            padding: "14px 24px",
                            background:
                              "linear-gradient(135deg, oklch(0.52 0.23 25) 0%, oklch(0.45 0.24 22) 100%)",
                            color: "oklch(0.97 0 0)",
                            border: "1px solid oklch(0.62 0.20 25 / 0.5)",
                            boxShadow:
                              "0 4px 16px oklch(0.48 0.22 25 / 0.45), 0 1px 3px oklch(0 0 0 / 0.4)",
                          }}
                          whileHover={{
                            scale: 1.03,
                            boxShadow:
                              "0 6px 24px oklch(0.48 0.22 25 / 0.65), 0 2px 8px oklch(0 0 0 / 0.4)",
                          }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleLogin}
                          data-ocid="entry-login-btn"
                          aria-label="Login with KLU ID"
                        >
                          {/* Shield icon */}
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"
                              fill="currentColor"
                              opacity="0.9"
                            />
                            <path
                              d="M9 12l2 2 4-4"
                              stroke="oklch(0.08 0 0)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Login with KLU ID
                        </motion.button>

                        <p
                          className="font-body uppercase tracking-[0.22em]"
                          style={{
                            fontSize: "9px",
                            color: "oklch(0.35 0 0)",
                            marginTop: "2px",
                          }}
                        >
                          KL University · Secure Access
                        </p>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
