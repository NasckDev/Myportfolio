import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mediaOf } from "@/data/media";
import { getProject } from "@/data/projects";
import type { ProjectMedia } from "@/lib/media";
import { setPref } from "@/lib/prefs";
import { renderWithApp } from "@/test/render";
import { media as mq } from "@/test/setup";
import { Cover, useCanPreviewVideo } from "./Cover";
import { ProjectCard } from "./ProjectCard";

const project = getProject("insighthub")!;
const withVideo: ProjectMedia = {
  shots: [{ src: "/assets/projetos/insighthub/desktop-1.webp", caption: "Painel" }],
  mobile: { src: "/assets/projetos/insighthub/mobile.webp", caption: "Celular" },
  video: { mp4: "/v.mp4", webm: "/v.webm", poster: "/p.webp" },
  og: null,
};

function Probe() {
  return <span data-testid="probe">{String(useCanPreviewVideo())}</span>;
}

describe("prévia em vídeo", () => {
  it("não carrega nem toca o vídeo sem hover", () => {
    render(<Cover project={project} media={withVideo} allowVideo active={false} />);
    const video = screen.getByTestId("video-preview") as HTMLVideoElement;
    expect(video).toHaveAttribute("preload", "none");
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("poster", "/p.webp");
    expect(video.querySelectorAll("source")).toHaveLength(2);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("toca ao ativar e pausa voltando ao início ao desativar", () => {
    const { rerender } = render(<Cover project={project} media={withVideo} allowVideo active={false} />);
    rerender(<Cover project={project} media={withVideo} allowVideo active />);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    const video = screen.getByTestId("video-preview") as HTMLVideoElement;
    rerender(<Cover project={project} media={withVideo} allowVideo active={false} />);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(video.currentTime).toBe(0);
  });

  it("sem vídeo na mídia, mostra só a imagem", () => {
    render(<Cover project={project} media={{ ...withVideo, video: null }} allowVideo active />);
    expect(screen.queryByTestId("video-preview")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Painel" })).toBeInTheDocument();
  });

  it("sem capturas, mostra a palavra da marca", () => {
    const { container } = render(<Cover project={project} media={{ shots: [], mobile: null, video: null, og: null }} />);
    expect(container.querySelector(".cover-word")).toHaveTextContent("nasck");
  });
});

describe("quando a prévia é permitida", () => {
  it("com mouse e movimento completo, sim", () => {
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("true");
  });

  it("sem mouse (toque), não", () => {
    mq.hover = false;
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("false");
  });

  it("com o movimento Suave do painel Aparência, não", () => {
    setPref("motion", "reduced");
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("false");
  });

  it("com prefers-reduced-motion do sistema, não", () => {
    mq.reduced = true;
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("false");
  });

  it("o cartão usa a mídia do repositório: toca a prévia no hover só se houver vídeo", () => {
    const hasVideo = mediaOf(project.id).video !== null;
    renderWithApp(<ProjectCard project={project} />);
    const card = screen.getByRole("link");
    fireEvent.pointerEnter(card);
    if (hasVideo) {
      expect(screen.getByTestId("video-preview")).toBeInTheDocument();
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    } else {
      expect(screen.queryByTestId("video-preview")).not.toBeInTheDocument();
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    }
    expect(card).toHaveAttribute("href", "/projeto/insighthub");
  });
});
