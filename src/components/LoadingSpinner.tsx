import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: string;
  full?: boolean;
  color?: 'green' | 'black' | 'white';
}

export default function LoadingSpinner({
  size = 'w-10 h-10',
  full = false,
  color = 'black',
}: LoadingSpinnerProps) {
  const containerClass = cn('flex justify-center items-center', full && 'min-h-screen min-w-full', {
    'text-samm-black': color === 'black',
    'text-samm-green': color === 'green',
    'text-samm-white': color === 'white',
  });

  return (
    <div className={containerClass}>
      <RotateCw className={`${size} animate-spin`} />
    </div>
  );
}
