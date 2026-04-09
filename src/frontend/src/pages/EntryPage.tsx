// EntryPage — KLU Spotter animated entry with sliding red panels + burst login popup
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type AnimState = "idle" | "sliding" | "popup" | "authenticating";

const BURST_EASE = [0.34, 1.56, 0.64, 1] as const;

export default function EntryPage() {
  const [animState, setAnimState] = useState<AnimState>("idle");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  // Redirect if already authenticated on mount
  useEffect(() => {
    if (isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  // Watch for successful login during popup
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background select-none">
      {/* Left red panel */}
      <AnimatePresence>
        {(animState === "idle" || animState === "sliding") && (
          <motion.div
            className="absolute inset-y-0 left-0 klu-panel"
            style={{ width: "calc(50% - 2px)" }}
            initial={{ x: 0 }}
            animate={animState === "sliding" ? { x: "-100%" } : { x: 0 }}
            exit={{ x: "-100%" }}
            transition={
              animState === "sliding"
                ? { type: "spring", stiffness: 260, damping: 28, delay: 0 }
                : { duration: 0 }
            }
            data-ocid="entry-panel-left"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.08) 20px, rgba(255,255,255,0.08) 22px)",
              }}
            />
            <div className="absolute bottom-8 left-8 font-display font-black text-white/10 text-[120px] leading-none pointer-events-none">
              KLU
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right red panel */}
      <AnimatePresence>
        {(animState === "idle" || animState === "sliding") && (
          <motion.div
            className="absolute inset-y-0 right-0 klu-panel"
            style={{ width: "calc(50% - 2px)" }}
            initial={{ x: 0 }}
            animate={animState === "sliding" ? { x: "100%" } : { x: 0 }}
            exit={{ x: "100%" }}
            transition={
              animState === "sliding"
                ? { type: "spring", stiffness: 260, damping: 28, delay: 0.1 }
                : { duration: 0 }
            }
            data-ocid="entry-panel-right"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.08) 20px, rgba(255,255,255,0.08) 22px)",
              }}
            />
            <div className="absolute bottom-8 right-8 font-display font-black text-white/10 text-[120px] leading-none pointer-events-none text-right">
              SPOT
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center vertical bar + icon */}
      <AnimatePresence>
        {(animState === "idle" || animState === "sliding") && (
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20"
            style={{ width: "4px" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Vertical white bar */}
            <div className="absolute inset-0 bg-white/90" />

            {/* Icon button */}
            <motion.button
              type="button"
              className="relative z-10 w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg"
              onClick={handleIconClick}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              aria-label="Open login"
              data-ocid="entry-login-trigger"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-primary"
              >
                <circle cx="12" cy="8" r="4" fill="currentColor" />
                <path
                  d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.button>

            {/* Animated hint label */}
            <motion.p
              className="absolute top-[calc(50%+32px)] text-white text-xs font-body font-medium tracking-widest uppercase whitespace-nowrap"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2.4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              Tap to Enter
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup overlay */}
      <AnimatePresence>
        {(animState === "popup" || animState === "authenticating") && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={animState === "popup" ? handleClosePopup : undefined}
              data-ocid="entry-popup-backdrop"
            />

            {/* Burst popup */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-40 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="burst-container relative w-full max-w-sm p-8 pt-10 pb-10 bg-card"
                initial={{ scale: 0, rotate: -4 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  scale: { type: "tween", duration: 0.45, ease: BURST_EASE },
                  rotate: { type: "tween", duration: 0.45, ease: BURST_EASE },
                }}
                data-ocid="entry-popup"
              >
                {/* Close button */}
                {animState === "popup" && (
                  <button
                    type="button"
                    className="absolute top-4 right-5 text-foreground/40 hover:text-foreground transition-colors text-xl leading-none"
                    onClick={handleClosePopup}
                    aria-label="Close popup"
                    data-ocid="entry-popup-close"
                  >
                    ×
                  </button>
                )}

                {/* Logo / brand */}
                <div className="flex flex-col items-center gap-3 mb-8">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/10" />
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        stroke="oklch(0.65 0.22 25)"
                        strokeWidth="2"
                      />
                      <path
                        d="M20 10 C16 10 12 13 12 18 C12 22 15 25 18 26 L18 30 L22 30 L22 26 C25 25 28 22 28 18 C28 13 24 10 20 10Z"
                        fill="oklch(0.65 0.22 25)"
                        opacity="0.85"
                      />
                      <path
                        d="M17 19 L23 19"
                        stroke="oklch(0.12 0 0)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="16.5"
                        cy="17"
                        r="1.5"
                        fill="oklch(0.12 0 0)"
                      />
                      <circle
                        cx="23.5"
                        cy="17"
                        r="1.5"
                        fill="oklch(0.12 0 0)"
                      />
                    </svg>
                  </div>

                  <motion.h1
                    className="font-display font-black text-4xl tracking-tight text-center text-primary"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.18,
                      duration: 0.32,
                      ease: BURST_EASE,
                    }}
                  >
                    KLU Spotter
                  </motion.h1>

                  <motion.p
                    className="font-body text-sm text-muted-foreground text-center tracking-wide"
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.26, duration: 0.3, ease: "easeOut" }}
                  >
                    Find Empty Rooms Instantly
                  </motion.p>
                </div>

                {/* Divider */}
                <div className="h-px bg-border mb-6" />

                {/* Login section */}
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.34, duration: 0.3, ease: "easeOut" }}
                >
                  {animState === "authenticating" ? (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <motion.p
                        className="font-display font-bold text-2xl tracking-widest text-primary"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{
                          duration: 1.2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                        data-ocid="entry-authenticating"
                      >
                        KLU
                      </motion.p>
                      <p className="text-xs text-muted-foreground font-body tracking-widest uppercase">
                        Authenticating…
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground text-center font-body leading-relaxed px-2">
                        Sign in with your Internet Identity to access the campus
                        room occupancy system.
                      </p>

                      <motion.button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 font-display font-bold text-sm tracking-wide py-3.5 px-6 rounded-lg transition-smooth bg-primary text-primary-foreground"
                        whileHover={{ scale: 1.03, filter: "brightness(1.12)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleLogin}
                        data-ocid="entry-login-btn"
                        aria-label="Login with Internet Identity"
                      >
                        <svg
                          width="18"
                          height="18"
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
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Login with Internet Identity
                      </motion.button>

                      <p className="text-[10px] text-muted-foreground/50 font-body tracking-widest uppercase mt-1">
                        KL University · Secure Access
                      </p>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
