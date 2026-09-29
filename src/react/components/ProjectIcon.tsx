import type { Type } from '@content/projects/list';
import type { ReactNode } from 'react';
import {
  GatsbyIcon,
  GithubIcon,
  ObsidianIcon,
} from '@react/icons/brands';
import {
  MonitorSmartphone,
  PenTool,
} from 'lucide-react';

const iconMap: Record<Type, ReactNode> = {
  gatsby: <GatsbyIcon className="mr-4 size-5" />,
  github: <GithubIcon className="mr-4 size-5" />,
  obsidian: <ObsidianIcon className="mr-4 size-5" />,
  tool: <PenTool className="mr-4 size-5" />,
  web: <MonitorSmartphone className="mr-4 size-5" />,
};

function ProjectIcon({ logo, type }: { logo?: string | undefined; type: Type }) {
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
