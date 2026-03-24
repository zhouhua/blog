import { menu } from '@consts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@react/ui/dropdown-menu';
import { useState } from 'react';
import MenuIcon from './MenuIcon';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="block h-10 w-10 text-primary opacity-50 sm:hidden">
        <MenuIcon isOpen={isOpen} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" alignOffset={-5} className="w-[calc(100vw-24px)] max-w-xs" sideOffset={20}>
        {
          menu.map(item => (
            <DropdownMenuItem
              key={item.name}
              className="my-2 flex h-10 justify-center items-center text-lg hover:bg-bgRevert/10 rounded-lg text-primary gap-6 cursor-pointer"
            >
              {item.iconComponent}
              <a href={item.path}>{item.name}</a>
            </DropdownMenuItem>
          ))
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
