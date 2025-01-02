import { Button } from '@react/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@react/ui/drawer';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HelpDrawerProps {
  namespace: 'animateBlurry' | 'blurry' | 'collection.gradient' | 'gradient' | 'pattern';
}

export function HelpDrawer({ namespace }: HelpDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="size-[1.2rem]" />
          <span className="sr-only">{t('common.help')}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl pb-20 pt-10">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">{t(`${namespace}.title`)}</DrawerTitle>
            <DrawerDescription className="mt-6 whitespace-pre-line text-base">
              {t(`${namespace}.description`)}
            </DrawerDescription>
          </DrawerHeader>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
