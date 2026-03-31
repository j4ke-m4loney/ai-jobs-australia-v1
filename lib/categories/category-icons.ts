import {
  Brain,
  BrainCircuit,
  Shield,
  Bot,
  BarChart3,
  Tags,
  Eye,
  Database,
  FlaskConical,
  Wrench,
  Server,
  Megaphone,
  Package,
  ShieldCheck,
  TrendingUp,
  Code,
  Lightbulb,
  GraduationCap,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'ai-ml-architect': BrainCircuit,
  'ai-governance': Shield,
  'ai-automation': Bot,
  'analyst': BarChart3,
  'annotation': Tags,
  'computer-vision': Eye,
  'data-engineer': Database,
  'data-science': FlaskConical,
  'engineering': Wrench,
  'infrastructure': Server,
  'machine-learning': Brain,
  'marketing': Megaphone,
  'product': Package,
  'quality-assurance': ShieldCheck,
  'sales': TrendingUp,
  'software-development': Code,
  'strategy-transformation': Lightbulb,
  'teaching-research': GraduationCap,
};

export const FALLBACK_ICON: LucideIcon = Briefcase;

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? FALLBACK_ICON;
}
