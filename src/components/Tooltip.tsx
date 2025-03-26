import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../utils/cn';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export default function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            className={cn(
              'z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-2 text-sm text-gray-50 shadow-md animate-in fade-in-0 zoom-in-95',
              className
            )}
            sideOffset={5}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
