import useColorMode from '@react/hooks/useColorMode';
import { Expand } from '@theme-toggles/react';
import '@theme-toggles/react/css/Expand.css';

function noop() { }
const ColorMode: React.FC = () => {
  const [colorMode, setColorMode] = useColorMode();
  return (
    <div className="size-10 p-1.5 opacity-50">
      <Expand
        className="text-[28px]"
        placeholder=""
        toggled={colorMode === 'dark'}
        onPointerEnterCapture={noop}
        onPointerLeaveCapture={noop}
        onToggle={t => setColorMode(t ? 'dark' : 'light')}
      />
    </div>
  );
};

export default ColorMode;
