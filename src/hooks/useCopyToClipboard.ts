import { useCallback } from 'react';
import { useToast } from './use-toast';
import { showToast } from '@/helpers/showToast';

export function useCopyToClipboard() {
  const { toast } = useToast();

  const copyToClipboard = useCallback(
    async (text: string) => {
      let textarea: HTMLTextAreaElement | null = null;

      try {
        await navigator.clipboard.writeText(text);
        showToast(toast, 'Copied to clipboard');
        return true;
      } catch (error) {
        console.error('Clipboard API failed, trying fallback method...', error);

        try {
          textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();

          const success = document.execCommand('copy');
          if (success) {
            showToast(toast, 'Copied to clipboard');

            return true;
          } else {
            throw new Error('Fallback method failed to copy to clipboard');
          }
        } catch (fallbackError) {
          console.error(fallbackError);
          showToast(
            toast,
            'Failed to copy to clipboard',
            'Your browser may not support this action in this context',
            'destructive'
          );
          return false;
        } finally {
          if (textarea && textarea.parentNode) {
            textarea.parentNode.removeChild(textarea);
          }
        }
      }
    },
    [toast]
  );

  return copyToClipboard;
}
