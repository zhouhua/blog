import type { FC } from 'react';
import bg from '@assets/projects/bg.jpg';
import { cn } from '@lib/utils';
import AnimatedCircularProgressBar from '@react/ui/animated-circular-progress-bar';
import { BorderBeam } from '@react/ui/border-beam';
import { DotPattern } from '@react/ui/dot-pattern';
import Iphone15Pro from '@react/ui/iphone-15-pro';
import Ripple from '@react/ui/ripple';
import { useEffect, useState } from 'react';

declare global {
  interface Navigator {
    getBattery: () => Promise<BatteryManager>;
  }
  interface BatteryManager {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    addEventListener: (event: string, callback: () => void) => void;
  }
}

const Battery: FC = () => {
  const [level, setLevel] = useState<number>(0);
  const [charging, setCharging] = useState<boolean>(false);
  const [chargingTime, setChargingTime] = useState<number>(0);
  const [dischargingTime, setDischargingTime] = useState<number>(0);
  const [fetched, setFetched] = useState<boolean>(false);
  const [supported, setSupported] = useState<boolean>(true);
  const handleBattery = (battery: BatteryManager) => {
    setLevel(battery.level);
    setCharging(battery.charging);
    setChargingTime(battery.chargingTime);
    setDischargingTime(battery.dischargingTime);
  };
  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then((batteryManager) => {
        setFetched(true);
        handleBattery(batteryManager);
        batteryManager.addEventListener('chargingchange', () => {
          handleBattery(batteryManager);
        });
        batteryManager.addEventListener('levelchange', () => {
          handleBattery(batteryManager);
        });
        batteryManager.addEventListener('chargingtimechange', () => {
          handleBattery(batteryManager);
        });
        batteryManager.addEventListener('dischargingtimechange', () => {
          handleBattery(batteryManager);
        });
      }).catch(() => {
        setSupported(false);
      });
    }
    else {
      setSupported(false);
    }
  }, []);
  if (!supported) {
    return (
      <div className="text-center text-gray-600">
        Your browser does not support the Battery API.
      </div>
    );
  }
  return (
    <div className="relative w-[433px] h-[882px] mx-auto">
      <Iphone15Pro className="size-full" src={bg.src} />
      {fetched && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-80 rounded-md bg-white">
          <DotPattern
            className={cn(
              '[mask-image:radial-gradient(200px_circle_at_center,white,transparent)]',
            )}
          />
          <AnimatedCircularProgressBar
            className="size-48 text-gray-600/0 ml-12 mt-8"
            min={0}
            max={1}
            value={level}
            gaugePrimaryColor="rgb(79 70 229)"
            gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
          />
          <div className="top-8 left-0 w-full flex items-center justify-center absolute size-48">
            <div className="text-[40px] text-gray-600 font-mono">{Math.floor(level * 100)}</div>
            <div className="text-[12px] text-gray-600 font-mono">{charging ? chargingTime : dischargingTime}</div>
          </div>
          {charging && <Ripple mainCircleSize={192} mainCircleOpacity={0.5} />}
          <BorderBeam size={250} duration={12} delay={9} />
        </div>
      )}
    </div>
  );
};

export default Battery;
