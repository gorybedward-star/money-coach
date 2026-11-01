import { ClipboardCheck, Handshake, Hourglass, LineChart, Scale } from "lucide-react";
import type { ToolInfo } from "@/content/tools";

export const fedTools: ToolInfo[] = [
  { href: "/federal-employees/tsp-checkup", title: "Free TSP Checkup", description: "Ten Yes / Somewhat / No questions, an education score, learning modules, and three follow-up actions.", icon: ClipboardCheck, available: true, time: "3 min" },
  { href: "/federal-employees/calculators/agency-match", title: "TSP Agency Match Calculator", description: "Estimate your contributions, the 1% automatic, FERS matching, and whether you may be missing any.", icon: Handshake, available: true, time: "1 min" },
  { href: "/federal-employees/calculators/growth", title: "TSP Growth Calculator", description: "Illustrate a future balance, separating your money, agency money, and modeled growth.", icon: LineChart, available: true, time: "2 min" },
  { href: "/federal-employees/calculators/roth-vs-traditional", title: "Traditional vs. Roth Education Calculator", description: "See how tax timing changes after-tax results under assumptions you choose.", icon: Scale, available: true, time: "2 min" },
  { href: "/federal-employees/calculators/cost-of-waiting", title: "Cost of Waiting: Federal Edition", description: "Compare starting TSP contributions now versus later, including agency matching.", icon: Hourglass, available: true, time: "2 min" },
];
