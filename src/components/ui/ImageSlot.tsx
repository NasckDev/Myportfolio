interface ImageSlotProps {
  src?: string;
  alt?: string;
  placeholder: string;
  objectPosition?: string;
}

/**
 * Equivalente em produção do <image-slot> do handoff: mostra a imagem quando existe
 * e, sem imagem, o mesmo estado vazio (ícone + legenda + contorno tracejado).
 */
export function ImageSlot({ src, alt = "", placeholder, objectPosition = "center" }: ImageSlotProps) {
  return (
    <div className="relative size-full overflow-hidden" style={{ background: "rgba(127,127,127,.08)", font: "13px/1.3 system-ui,-apple-system,sans-serif" }}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" style={{ objectPosition }} />
      ) : (
        <>
          <div className="absolute inset-0 box-border flex select-none flex-col items-center justify-center gap-1.5 p-3 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.45 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <div className="max-w-[90%] font-medium tracking-[.01em]" style={{ opacity: 0.75 }}>
              {placeholder}
            </div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ border: "1.5px dashed currentColor", opacity: 0.35 }} />
        </>
      )}
    </div>
  );
}
