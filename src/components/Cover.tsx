import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Project } from "@/data/types";
import type { MediaVideo, ProjectMedia } from "@/lib/media";
import { canHover } from "@/lib/motion";
import { systemWantsLessMotion, usePrefs } from "@/lib/prefs";

/** Prévia em vídeo só com mouse de verdade e sem pedido de menos movimento (sistema ou painel Aparência). */
export function useCanPreviewVideo(): boolean {
  const prefs = usePrefs();
  const [hover] = useState(canHover);
  const soft = prefs.motion === "reduced" || (prefs.motion === "auto" && systemWantsLessMotion());
  return hover && !soft;
}

interface VideoPreviewProps {
  video: MediaVideo;
  active: boolean;
}

/**
 * Vídeo curto sobre a captura: preload="none" (nada é baixado antes do hover),
 * toca ao ativar e volta ao início ao sair.
 */
export function VideoPreview({ video, active }: VideoPreviewProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      const p = v.play();
      if (p && typeof p.then === "function") p.then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* mídia ainda sem metadados */
      }
      setPlaying(false);
    }
  }, [active]);

  return (
    <video
      ref={ref}
      className={`cv-video${playing ? " on" : ""}`}
      muted
      playsInline
      loop
      preload="none"
      poster={video.poster || undefined}
      aria-hidden="true"
      tabIndex={-1}
      data-testid="video-preview"
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}

interface CoverProps {
  project: Project;
  media: ProjectMedia;
  xl?: boolean;
  className?: string;
  /** Texto alternativo das imagens; vazio quando a capa está dentro de um link que já tem nome. */
  decorative?: boolean;
  /** Ativa a prévia em vídeo (hover/foco no cartão). */
  active?: boolean;
  allowVideo?: boolean;
  style?: CSSProperties;
}

export function Cover({ project, media, xl, className, decorative, active = false, allowVideo = false, style }: CoverProps) {
  const shot = media.shots[0];
  const phone = shot ? media.mobile : null;
  const cls = ["cover", xl ? "cover-xl" : "", phone ? "has-phone" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <div className={cls} style={{ "--pc": project.color, "--pf": project.on, ...style } as CSSProperties}>
      {shot ? (
        <>
          <div className="cv-browser">
            <div className="cv-bar" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="cv-screen">
              <img src={shot.src} alt={decorative ? "" : shot.caption} loading="lazy" decoding="async" />
              {allowVideo && media.video ? <VideoPreview video={media.video} active={active} /> : null}
            </div>
          </div>
          {phone ? (
            <div className="cv-phone">
              <img src={phone.src} alt={decorative ? "" : phone.caption} loading="lazy" decoding="async" />
            </div>
          ) : null}
        </>
      ) : (
        <div className="cover-word" aria-hidden="true">
          nasck
        </div>
      )}
    </div>
  );
}
