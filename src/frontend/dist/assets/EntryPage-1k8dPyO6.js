import { r as reactExports, j as jsxRuntimeExports, u as useAuth, a as useNavigate, b as ue } from "./index-D0QMt-9Q.js";
import { M as MotionConfigContext, i as isHTMLElement, u as useConstant, P as PresenceContext, a as usePresence, b as useIsomorphicLayoutEffect, L as LayoutGroupContext, m as motion } from "./proxy-D5vWE1qx.js";
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
class PopChildMeasure extends reactExports.Component {
  getSnapshotBeforeUpdate(prevProps) {
    const element = this.props.childRef.current;
    if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
      const parent = element.offsetParent;
      const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
      const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
      const computedStyle = getComputedStyle(element);
      const size = this.props.sizeRef.current;
      size.height = parseFloat(computedStyle.height);
      size.width = parseFloat(computedStyle.width);
      size.top = element.offsetTop;
      size.left = element.offsetLeft;
      size.right = parentWidth - size.width - size.left;
      size.bottom = parentHeight - size.height - size.top;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
  var _a;
  const id = reactExports.useId();
  const ref = reactExports.useRef(null);
  const size = reactExports.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  });
  const { nonce } = reactExports.useContext(MotionConfigContext);
  const childRef = ((_a = children.props) == null ? void 0 : _a.ref) ?? (children == null ? void 0 : children.ref);
  const composedRef = useComposedRefs(ref, childRef);
  reactExports.useInsertionEffect(() => {
    const { width, height, top, left, right, bottom } = size.current;
    if (isPresent || pop === false || !ref.current || !width || !height)
      return;
    const x = anchorX === "left" ? `left: ${left}` : `right: ${right}`;
    const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
    ref.current.dataset.motionPopId = id;
    const style = document.createElement("style");
    if (nonce)
      style.nonce = nonce;
    const parent = root ?? document.head;
    parent.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
    }
    return () => {
      var _a2;
      (_a2 = ref.current) == null ? void 0 : _a2.removeAttribute("data-motion-pop-id");
      if (parent.contains(style)) {
        parent.removeChild(style);
      }
    };
  }, [isPresent]);
  return jsxRuntimeExports.jsx(PopChildMeasure, { isPresent, childRef: ref, sizeRef: size, pop, children: pop === false ? children : reactExports.cloneElement(children, { ref: composedRef }) });
}
const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
  const presenceChildren = useConstant(newChildrenMap);
  const id = reactExports.useId();
  let isReusedContext = true;
  let context = reactExports.useMemo(() => {
    isReusedContext = false;
    return {
      id,
      initial,
      isPresent,
      custom,
      onExitComplete: (childId) => {
        presenceChildren.set(childId, true);
        for (const isComplete of presenceChildren.values()) {
          if (!isComplete)
            return;
        }
        onExitComplete && onExitComplete();
      },
      register: (childId) => {
        presenceChildren.set(childId, false);
        return () => presenceChildren.delete(childId);
      }
    };
  }, [isPresent, presenceChildren, onExitComplete]);
  if (presenceAffectsLayout && isReusedContext) {
    context = { ...context };
  }
  reactExports.useMemo(() => {
    presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
  }, [isPresent]);
  reactExports.useEffect(() => {
    !isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
  }, [isPresent]);
  children = jsxRuntimeExports.jsx(PopChild, { pop: mode === "popLayout", isPresent, anchorX, anchorY, root, children });
  return jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children });
};
function newChildrenMap() {
  return /* @__PURE__ */ new Map();
}
const getChildKey = (child) => child.key || "";
function onlyElements(children) {
  const filtered = [];
  reactExports.Children.forEach(children, (child) => {
    if (reactExports.isValidElement(child))
      filtered.push(child);
  });
  return filtered;
}
const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const exitingComponents = reactExports.useRef(/* @__PURE__ */ new Set());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
        exitingComponents.current.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitingComponents.current.has(key)) {
        return;
      }
      if (exitComplete.has(key)) {
        exitingComponents.current.add(key);
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender == null ? void 0 : forceRender();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && (safeToRemove == null ? void 0 : safeToRemove());
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, anchorY, children: child }, key);
  }) });
};
const BURST_EASE = [0.34, 1.56, 0.64, 1];
function EntryPage() {
  const [animState, setAnimState] = reactExports.useState("idle");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);
  reactExports.useEffect(() => {
    if (isAuthenticated && animState === "authenticating" && !hasNavigated.current) {
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
      ue.error("Login failed. Please try again.");
      setAnimState("popup");
    }
  };
  const handleClosePopup = () => {
    setAnimState("idle");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-screen h-screen overflow-hidden bg-background select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: (animState === "idle" || animState === "sliding") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "absolute inset-y-0 left-0 klu-panel",
        style: { width: "calc(50% - 2px)" },
        initial: { x: 0 },
        animate: animState === "sliding" ? { x: "-100%" } : { x: 0 },
        exit: { x: "-100%" },
        transition: animState === "sliding" ? { type: "spring", stiffness: 260, damping: 28, delay: 0 } : { duration: 0 },
        "data-ocid": "entry-panel-left",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute inset-0 opacity-10",
              style: {
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.08) 20px, rgba(255,255,255,0.08) 22px)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-8 left-8 font-display font-black text-white/10 text-[120px] leading-none pointer-events-none", children: "KLU" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: (animState === "idle" || animState === "sliding") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "absolute inset-y-0 right-0 klu-panel",
        style: { width: "calc(50% - 2px)" },
        initial: { x: 0 },
        animate: animState === "sliding" ? { x: "100%" } : { x: 0 },
        exit: { x: "100%" },
        transition: animState === "sliding" ? { type: "spring", stiffness: 260, damping: 28, delay: 0.1 } : { duration: 0 },
        "data-ocid": "entry-panel-right",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute inset-0 opacity-10",
              style: {
                backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.08) 20px, rgba(255,255,255,0.08) 22px)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-8 right-8 font-display font-black text-white/10 text-[120px] leading-none pointer-events-none text-right", children: "SPOT" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: (animState === "idle" || animState === "sliding") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20",
        style: { width: "4px" },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-white/90" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              type: "button",
              className: "relative z-10 w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg",
              onClick: handleIconClick,
              whileHover: { scale: 1.12 },
              whileTap: { scale: 0.92 },
              transition: { type: "spring", stiffness: 400, damping: 17 },
              "aria-label": "Open login",
              "data-ocid": "entry-login-trigger",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "svg",
                {
                  width: "22",
                  height: "22",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  "aria-hidden": "true",
                  className: "text-primary",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "8", r: "4", fill: "currentColor" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        d: "M4 20c0-4 3.58-7 8-7s8 3 8 7",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        strokeLinecap: "round"
                      }
                    )
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.p,
            {
              className: "absolute top-[calc(50%+32px)] text-white text-xs font-body font-medium tracking-widest uppercase whitespace-nowrap",
              animate: { opacity: [0.5, 1, 0.5] },
              transition: {
                duration: 2.4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
              },
              children: "Tap to Enter"
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: (animState === "popup" || animState === "authenticating") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute inset-0 bg-background/80 backdrop-blur-sm z-30",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          onClick: animState === "popup" ? handleClosePopup : void 0,
          "data-ocid": "entry-popup-backdrop"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute inset-0 flex items-center justify-center z-40 px-4",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "burst-container relative w-full max-w-sm p-8 pt-10 pb-10 bg-card",
              initial: { scale: 0, rotate: -4 },
              animate: { scale: 1, rotate: 0 },
              exit: { scale: 0, opacity: 0 },
              transition: {
                scale: { type: "tween", duration: 0.45, ease: BURST_EASE },
                rotate: { type: "tween", duration: 0.45, ease: BURST_EASE }
              },
              "data-ocid": "entry-popup",
              children: [
                animState === "popup" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "absolute top-4 right-5 text-foreground/40 hover:text-foreground transition-colors text-xl leading-none",
                    onClick: handleClosePopup,
                    "aria-label": "Close popup",
                    "data-ocid": "entry-popup-close",
                    children: "×"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 mb-8", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-16 h-16 flex items-center justify-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-primary/10" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "svg",
                      {
                        width: "40",
                        height: "40",
                        viewBox: "0 0 40 40",
                        fill: "none",
                        "aria-hidden": "true",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "circle",
                            {
                              cx: "20",
                              cy: "20",
                              r: "18",
                              stroke: "oklch(0.65 0.22 25)",
                              strokeWidth: "2"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "path",
                            {
                              d: "M20 10 C16 10 12 13 12 18 C12 22 15 25 18 26 L18 30 L22 30 L22 26 C25 25 28 22 28 18 C28 13 24 10 20 10Z",
                              fill: "oklch(0.65 0.22 25)",
                              opacity: "0.85"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "path",
                            {
                              d: "M17 19 L23 19",
                              stroke: "oklch(0.12 0 0)",
                              strokeWidth: "1.5",
                              strokeLinecap: "round"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "circle",
                            {
                              cx: "16.5",
                              cy: "17",
                              r: "1.5",
                              fill: "oklch(0.12 0 0)"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "circle",
                            {
                              cx: "23.5",
                              cy: "17",
                              r: "1.5",
                              fill: "oklch(0.12 0 0)"
                            }
                          )
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.h1,
                    {
                      className: "font-display font-black text-4xl tracking-tight text-center text-primary",
                      initial: { y: 8, opacity: 0 },
                      animate: { y: 0, opacity: 1 },
                      transition: {
                        delay: 0.18,
                        duration: 0.32,
                        ease: BURST_EASE
                      },
                      children: "KLU Spotter"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.p,
                    {
                      className: "font-body text-sm text-muted-foreground text-center tracking-wide",
                      initial: { y: 6, opacity: 0 },
                      animate: { y: 0, opacity: 1 },
                      transition: { delay: 0.26, duration: 0.3, ease: "easeOut" },
                      children: "Find Empty Rooms Instantly"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border mb-6" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "flex flex-col items-center gap-4",
                    initial: { y: 10, opacity: 0 },
                    animate: { y: 0, opacity: 1 },
                    transition: { delay: 0.34, duration: 0.3, ease: "easeOut" },
                    children: animState === "authenticating" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 py-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.p,
                        {
                          className: "font-display font-bold text-2xl tracking-widest text-primary",
                          animate: { opacity: [1, 0.4, 1] },
                          transition: {
                            duration: 1.2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut"
                          },
                          "data-ocid": "entry-authenticating",
                          children: "KLU"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-body tracking-widest uppercase", children: "Authenticating…" })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center font-body leading-relaxed px-2", children: "Sign in with your Internet Identity to access the campus room occupancy system." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        motion.button,
                        {
                          type: "button",
                          className: "w-full flex items-center justify-center gap-3 font-display font-bold text-sm tracking-wide py-3.5 px-6 rounded-lg transition-smooth bg-primary text-primary-foreground",
                          whileHover: { scale: 1.03, filter: "brightness(1.12)" },
                          whileTap: { scale: 0.97 },
                          onClick: handleLogin,
                          "data-ocid": "entry-login-btn",
                          "aria-label": "Login with Internet Identity",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "svg",
                              {
                                width: "18",
                                height: "18",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                "aria-hidden": "true",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "path",
                                    {
                                      d: "M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z",
                                      fill: "currentColor",
                                      opacity: "0.9"
                                    }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "path",
                                    {
                                      d: "M9 12l2 2 4-4",
                                      stroke: "currentColor",
                                      strokeWidth: "2",
                                      strokeLinecap: "round",
                                      strokeLinejoin: "round"
                                    }
                                  )
                                ]
                              }
                            ),
                            "Login with Internet Identity"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground/50 font-body tracking-widest uppercase mt-1", children: "KL University · Secure Access" })
                    ] })
                  }
                )
              ]
            }
          )
        }
      )
    ] }) })
  ] });
}
export {
  EntryPage as default
};
