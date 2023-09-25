import type { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';
import * as styles from './index.module.css';

/**
 * Aside: the wonderful fixed positioned elements that are to the left
 * and the right of the written content on our articles. For example, the
 * progress bar and dark controls are within an Aside. The main responsibility
 * of this component is to show or hide its children if it's at the top or bottom
 * of the page!
 *
 * The left and right Asides!
 *
 * left Aside ----> |  content  | <--- right Aside
 *                  |  content  |
 *                  |  content  |
 *                  |  content  |
 *
 */
const Aside: FC<PropsWithChildren & { show: boolean }> = ({ show, children }) => (
  <aside className={clsx(styles.AsideContainer, 'mx-auto my-0 flex')}>
    <div
      className={clsx(
        'fixed items-center',
        {
          'visible opacity-100': show,
          'invisible opacity-0': !show
        },
        'z-[3] flex h-screen translate-y-0'
      )}
      style={{
        transition: `opacity ${show ? '0.4' : '0.2'}s linear, visibility 0.4s linear`,
        top: 0
      }}
    >
      {children}
    </div>
  </aside>
);

export default Aside;
