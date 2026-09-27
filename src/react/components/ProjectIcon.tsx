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

function ProjectIcon({ logo, type }: { logo?: string; type: Type }) {
  if (logo) {
    return (
      <img
        alt=""
        className="mr-4 size-5 rounded-sm object-cover"
        src={logo}
      />
    );
  }
  return iconMap[type];
}

export default ProjectIcon;
