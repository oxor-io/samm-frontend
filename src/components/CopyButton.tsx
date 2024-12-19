'use client';

import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

export default function CopyButton({ text, className }: { text: string; className?: string }) {
  const handleCopy = useCopyToClipboard();
  return (
    <span
      onClick={async () => {
        await handleCopy(text);
      }}
    >
      <Copy className={cn('ml-1', className ? `${className}` : 'w-3 h-3')} />
    </span>
  );
}
