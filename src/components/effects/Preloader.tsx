import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";

export function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = previousOverflow;
    }, 1750);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-8%" }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#06143c] text-white"
          aria-label="Carregando portfólio"
        >
          <motion.div
            aria-hidden="true"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute size-[38rem] rounded-full border border-dashed border-blue-300/15"
          />
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
            >
              <Logo className="[&_span]:text-white [&_svg]:size-12" />
            </motion.div>
            <div className="mt-7 h-px w-52 overflow-hidden bg-white/15">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.35, ease: [0.65, 0, 0.35, 1] }}
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-300 to-white"
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 font-mono text-[10px] tracking-[0.25em] text-blue-100/60 uppercase"
            >
              compilando experiências
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
