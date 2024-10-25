import type { Type } from '@content/projects/list';
import type { ReactNode } from 'react';

const iconMap: Record<Type, ReactNode> = {
  gatsby: <span className="iconify ri--gatsby-fill mr-4" />,
  github: <span className="iconify mdi--github mr-4" />,
  obsidian: <span className="iconify simple-icons--obsidian mr-4" />,
  tool: <span className="iconify mdi--design mr-4" />,
  web: <span className="iconify mdi--cellphone-link mr-4" />,
};

const ProjectIcon = ({ type }: { type: Type }) => iconMap[type];

export default ProjectIcon;
