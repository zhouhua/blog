import clsx from 'clsx';
import * as styles from './index.module.css';

const BrokenText: FC<{ text: string }> = ({ text }) => (
  <div className="flex w-full items-center justify-center">
    <div className={clsx(styles.text)} data-text={text}>
      {text}
      <div className={styles.white} />
    </div>
  </div>
);

export default BrokenText;
