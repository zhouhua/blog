import type { Type } from '@content/projects/list';
import type { ReactNode } from 'react';
import {
  MonitorSmartphone,
  PenTool,
} from 'lucide-react';
import {
  SiGatsby,
  SiGithub,
  SiObsidian,
} from 'react-icons/si';

const iconMap: Record<Type, ReactNode> = {
  gatsby: <SiGatsby className="mr-4 size-5" />,
  github: <SiGithub className="mr-4 size-5" />,
  obsidian: <SiObsidian className="mr-4 size-5" />,
  tool: <PenTool className="mr-4 size-5" />,
  web: <MonitorSmartphone className="mr-4 size-5" />,
};

const ProjectIcon = ({ type }: { type: Type }) => iconMap[type];

export default ProjectIcon;
