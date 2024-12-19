'use client';

import { CopyIcon } from 'lucide-react';
import { Message } from '@/types/message';
import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { objToString } from '@/helpers/objToString';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useSAMMStore } from '@/store/sammStore';

interface CopyableTextProps {
  label: string;
  text: string;
  onCopy: (text: string) => Promise<void>;
}

const CopyableText = ({ label, text, onCopy }: CopyableTextProps) => (
  <>
    <h4>{label}</h4>
    <p className="break-all p-2 pr-8 bg-secondary relative border border-solid border-input rounded-sm my-2">
      {text}
      <button
        onClick={() => onCopy(text)}
        className="absolute right-2 top-2 hover:opacity-70 transition-opacity"
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        <CopyIcon className="w-4 h-4" />
      </button>
    </p>
  </>
);

export default function EncodedDataDisplay({ message }: { message: Message }) {
  const sammData = useSAMMStore((state) => state.sammData);
  const relayer = useSAMMStore((state) => state.relayer);

  if (!sammData) throw new Error('No SAMM Data');

  const messageBody = useMemo(
    () =>
      objToString({
        samm_id: sammData.id,
        ...Object.fromEntries(
          Object.entries(message.calldata).map(([k, v]) => [
            k,
            typeof v === 'bigint' ? v.toString() : v,
          ])
        ),
      }),
    [message.calldata, sammData?.id]
  );
  const messageSubject = message.msgHash;

  const handleCopy = useCopyToClipboard();

  const handleOpenEmail = useCallback(() => {
    const emailUrl = `mailto:${relayer}?subject=${encodeURIComponent(
      messageSubject
    )}&body=${encodeURIComponent(messageBody)}`;
    window.open(emailUrl, '_blank');
  }, [messageSubject, messageBody, relayer]);

  return (
    <div className="p-4 bg-samm-white self-start rounded-md basis-1/2">
      <h3>Email Message</h3>
      <div className="mt-4">
        <CopyableText
          label="Subject"
          text={messageSubject}
          onCopy={async (text) => {
            await handleCopy(text);
          }}
        />
        <CopyableText
          label="Message"
          text={messageBody}
          onCopy={async (text) => {
            await handleCopy(text);
          }}
        />
      </div>
      <Button onClick={handleOpenEmail} className="mt-4 w-full">
        Open message in email
      </Button>
    </div>
  );
}
