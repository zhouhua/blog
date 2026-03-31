import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@react/ui/dropdown-menu';
import { Code, IdCard, MessageSquareText, PenTool } from 'lucide-react';
import { useState } from 'react';
import MenuIcon from './MenuIcon';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="block h-10 w-10 opacity-50 sm:hidden">
        <MenuIcon isOpen={isOpen} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" alignOffset={-5} className="w-[calc(100vw-24px)] max-w-xs" sideOffset={20}>
        <DropdownMenuItem
          asChild
          key="language"
          className="my-2 flex h-10 justify-center items-center text-lg hover:bg-bgRevert/10 rounded-lg gap-6 cursor-pointer"
        >
          <a href="/articles">
            <PenTool className="h-4 w-4 mr-0 opacity-75 md:mr-2" />
            <span>文章</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          key="language"
          className="my-2 flex h-10 justify-center items-center text-lg hover:bg-bgRevert/10 rounded-lg gap-6 cursor-pointer"
        >
          <a href="/projects">
            <Code className="h-4 w-4 mr-0 opacity-75 md:mr-2" />
            <span>项目</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          key="language"
          className="my-2 flex h-10 justify-center items-center text-lg hover:bg-bgRevert/10 rounded-lg gap-6 cursor-pointer"
        >
          <a href="/journals">
            <MessageSquareText className="h-4 w-4 mr-0 opacity-75 md:mr-2" />
            <span>随笔</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          key="language"
          className="my-2 flex h-10 justify-center items-center text-lg hover:bg-bgRevert/10 rounded-lg gap-6 cursor-pointer"
        >
          <a href="/about">
            <IdCard className="h-4 w-4 mr-0 opacity-75 md:mr-2" />
            <span>关于</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
