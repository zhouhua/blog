import projects from '@content/projects/list';
import ProjectIcon from './ProjectIcon';

function ProjectList() {
  return (
    <ul className="mx-auto max-w-[560px] text-center">
      {projects.filter(p => !p.hidden).map(({ description, link, name, type }) => (
        <li className="mt-10 p-5 relative" key={name}>
          <a href={link} target={/^https?:/.test(link) ? '_blank' : '_self'} className="relative z-20">
            <h3 className="text-2xl text-secondary flex items-center justify-center">
              <ProjectIcon type={type} />
              {name}
            </h3>
            {description && <p className="mt-2 text-gray">{description}</p>}
          </a>
        </li>
      ))}
    </ul>
  );
}
export default ProjectList;
