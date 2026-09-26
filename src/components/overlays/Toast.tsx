import { usePortfolio } from "@/context/PortfolioContext";

export function Toast() {
  const { toast } = usePortfolio();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[130] flex items-center gap-2.5 rounded-full bg-head px-[18px] py-3 text-[15px] font-semibold text-bg shadow-card"
      style={{
        transform: `translateX(-50%) ${toast.on ? "translateY(0)" : "translateY(20px)"}`,
        opacity: toast.on ? 1 : 0,
        transition: "opacity .25s,transform .35s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      <span className="size-2 rounded-full" style={{ background: "#22B573" }} />
      {toast.msg}
    </div>
  );
}
