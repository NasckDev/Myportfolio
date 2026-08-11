import { Code2, Rocket, Users, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Stat {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  {
    icon: Code2,
    value: 4,
    suffix: "+",
    label: "Anos de experiência",
  },
  {
    icon: Rocket,
    value: 8,
    suffix: "+",
    label: "Projetos entregues",
  },
  {
    icon: Users,
    value: 20,
    suffix: "+",
    label: "Clientes atendidos",
  },
  {
    icon: Award,
    value: 100,
    suffix: "%",
    label: "Comprometimento",
  },
];
