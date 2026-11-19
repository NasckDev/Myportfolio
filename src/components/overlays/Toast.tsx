import { usePortfolio } from "@/context/PortfolioContext";

export function Toast() {
  const { toast } = usePortfolio();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[130] box-border flex w-max max-w-[calc(100vw-32px)] items-center gap-2.5 rounded-[22px] bg-head px-[18px] py-3 text-[15px] font-semibold leading-snug text-bg shadow-card"
      style={{
        transform: `translateX(-50%) ${toast.on ? "translateY(0)" : "translateY(20px)"}`,
        opacity: toast.on ? 1 : 0,
        transition: "opacity .25s,transform .35s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: "#22B573" }} />
      <span className="min-w-0">{toast.msg}</span>
    </div>
  );
}
