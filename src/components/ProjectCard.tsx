import { useState, type CSSProperties } from "react";
import { mediaOf } from "@/data/media";
import { projectPath } from "@/data/projects";
import type { Project } from "@/data/types";
import type { ProjectMedia } from "@/lib/media";
import { Link } from "@/router/Link";
import { Cover, useCanPreviewVideo } from "./Cover";
import { Icon } from "./Icon";

export function StatusLabel({ project }: { project: Project }) {
  return <span className={`status${project.live ? " live" : ""}`}>{project.status}</span>;
}

/** Cartão de projeto: capa com captura (e prévia em vídeo no hover, quando houver), texto e provas. */
export function ProjectCard({ project, style, className, media = mediaOf(project.id) }: { project: Project; style?: CSSProperties; className?: string; media?: ProjectMedia }) {
  const allowVideo = useCanPreviewVideo();
  const [active, setActive] = useState(false);
  const on = () => setActive(true);
  const off = () => setActive(false);
  return (
    <Link
      to={projectPath(project.id)}
      className={`pcard${className ? ` ${className}` : ""}`}
      data-id={project.id}
      style={style}
      onPointerEnter={allowVideo ? on : undefined}
      onPointerLeave={allowVideo ? off : undefined}
      onFocus={allowVideo ? on : undefined}
      onBlur={allowVideo ? off : undefined}
    >
      <Cover project={project} media={media} decorative active={active} allowVideo={allowVideo} />
      <div className="pbody">
        <div className="tx">
          <div className="pname">
            <h3 className="h3">{project.name}</h3>
            <span className="kind">{project.kind}</span>
          </div>
          <p className="pitch">{project.pitch}</p>
          <p className="muted">{project.summary}</p>
          <p className="proofline">
            <StatusLabel project={project} />
          </p>
          <div className="chips">
            {project.stack.slice(0, 4).map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
            <span className="chip">{project.proofLine}</span>
          </div>
        </div>
        <span className="go" aria-hidden="true">
          <Icon name="arrow" />
        </span>
      </div>
    </Link>
  );
}
