import { usePortfolio } from "@/context/PortfolioContext";
import { ListExperience } from "./experience/ListExperience";
import { PinnedExperience } from "./experience/PinnedExperience";

export function Experience() {
  const { vp } = usePortfolio();
  const pinned = vp.w >= 1024 && vp.vh >= 640;
  return (
    <section id="experiencia" className="section-pad relative">
      {pinned ? <PinnedExperience /> : <ListExperience />}
    </section>
  );
}
