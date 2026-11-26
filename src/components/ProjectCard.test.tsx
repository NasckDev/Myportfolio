import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getProject } from "@/data/projects";
import type { ProjectMedia } from "@/lib/media";
import { renderWithApp } from "@/test/render";
import { media as mq } from "@/test/setup";
import { ProjectCard } from "./ProjectCard";

// Projeto com vídeo publicado segundo a convenção (preview.mp4/.webm).
const media: ProjectMedia = {
  shots: [{ src: "/assets/projetos/opsflow/desktop-1.webp", caption: "Caixa de entrada" }],
  mobile: null,
  video: { mp4: "/assets/projetos/opsflow/preview.mp4", webm: "/assets/projetos/opsflow/preview.webm", poster: "/p.webp" },
  og: null,
};

const project = getProject("opsflow")!;

describe("cartão com prévia em vídeo", () => {
  it("toca no hover e no foco, pausa ao sair", () => {
    renderWithApp(<ProjectCard project={project} media={media} />);
    const card = screen.getByRole("link");
    expect(screen.getByTestId("video-preview")).toHaveAttribute("preload", "none");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    fireEvent.pointerEnter(card);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    fireEvent.pointerLeave(card);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    fireEvent.focus(card);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
  });

  it("em tela de toque, não monta o vídeo", () => {
    mq.hover = false;
    renderWithApp(<ProjectCard project={project} media={media} />);
    fireEvent.pointerEnter(screen.getByRole("link"));
    expect(screen.queryByTestId("video-preview")).not.toBeInTheDocument();
    expect(screen.getByRole("link").querySelector(".cv-screen img")).not.toBeNull();
  });
});
