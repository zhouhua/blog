import projects from '@content/projects/list';
import { useMemo } from 'react';
import ProjectIcon from './ProjectIcon';

const EXTERNAL_LINK_RE = /^https?:/;

const GROUP_ORDER = ['Obsidian 插件', '设计工具', 'demo/工具', '其他项目'];

const GROUP_EN: Record<string, string> = {
  'demo/工具': 'DEMO / TOOLS',
  'Obsidian 插件': 'OBSIDIAN',
  '其他项目': 'OTHERS',
  '设计工具': 'DESIGN TOOLS',
};

function ProjectList() {
  const visible = projects.filter(p => !p.hidden);

  const allGroups = useMemo(() => {
    const groupMap = new Map<string, typeof visible>();

    visible.forEach((project) => {
      const group = project.group && GROUP_ORDER.includes(project.group) ? project.group : '其他';

      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }
      groupMap.get(group)!.push(project);
    });

    const result = GROUP_ORDER.map(group => ({
      group,
      items: groupMap.get(group) || [],
    })).filter(g => g.items.length > 0);

    const otherItems = groupMap.get('其他');
    if (otherItems && otherItems.length > 0) {
      result.push({ group: '其他', items: otherItems });
    }

    return result;
  }, [visible]);

  return (
    <div className="mx-auto max-w-[680px]">
      <style>
        {`
        .proj-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 0;
          padding: 0.7rem 0;
          border-bottom: 1px solid color-mix(in oklch, var(--color-border) 60%, transparent);
          text-decoration: none;
          color: inherit;
          transition: color 0.2s ease;
          overflow: hidden;
          isolation: isolate;
        }
        .proj-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 100%;
          background: color-mix(in oklch, var(--color-bgRevert) 5%, transparent);
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }
        .proj-item:hover::before {
          width: 100%;
        }
        .proj-item > * {
          position: relative;
          z-index: 1;
        }
        .proj-item:hover .proj-name {
          color: var(--color-bgRevert);
        }
        .proj-item:hover .proj-icon {
          color: var(--color-bgRevert);
          transform: scale(1.15);
        }
        .proj-icon {
          transition: color 0.2s ease, transform 0.2s ease;
          color: var(--color-gray);
          flex-shrink: 0;
          width: 2rem;
          font-size: 1rem;
        }
        .proj-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
          padding-left: 0.35rem;
        }
        .proj-name {
          font-family: var(--font-monospace);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-bgRevert);
          transition: color 0.2s ease;
          width: 100%;
        }
        .proj-desc {
          font-family: var(--font-serif);
          font-size: 0.82rem;
          color: var(--color-gray);
          text-align: left;
          line-height: 1.45;
          width: 100%;
          opacity: 0.75;
          transition: opacity 0.2s ease;
        }
        .proj-item:hover .proj-desc {
          opacity: 1;
        }
        .proj-num {
          font-family: var(--font-monospace);
          font-size: 0.7rem;
          color: var(--color-gray);
          opacity: 0.4;
          width: 1.5rem;
          flex-shrink: 0;
          user-select: none;
        }
        .group-header {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--color-bgRevert);
        }
        .group-zh {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-bgRevert);
        }
        .group-en {
          font-family: var(--font-monospace);
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          color: var(--color-gray);
          opacity: 0.7;
          text-transform: uppercase;
        }
        .group-count {
          font-family: var(--font-monospace);
          font-size: 0.65rem;
          color: var(--color-gray);
          opacity: 0.5;
          margin-left: auto;
        }
        @media (max-width: 480px) {
          .proj-name { font-size: 0.88rem; }
          .proj-desc { font-size: 0.78rem; }
        }
      `}
      </style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {allGroups.map(({ group, items }) => (
          <section key={group}>
            <div className="group-header">
              <span className="group-zh">{group}</span>
              <span className="group-en">{GROUP_EN[group] ?? group.toUpperCase()}</span>
              <span className="group-count">
                {items.length}
                {' '}
                projects
              </span>
            </div>
            <div>
              {items.map(({ description, link, name, type }, i) => (
                <a
                  key={name}
                  href={link}
                  target={EXTERNAL_LINK_RE.test(link) ? '_blank' : '_self'}
                  className="proj-item"
                >
                  <span className="proj-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="proj-icon">
                    <ProjectIcon type={type} />
                  </span>
                  <span className="proj-body">
                    <span className="proj-name">{name}</span>
                    {description && <span className="proj-desc">{description}</span>}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
export default ProjectList;
