import CopyButton from '@/components/CopyButton';

import { Restriction } from '@/types/restriction';
import { truncateAddress } from '@/helpers/truncate';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface RestrictionCardProps {
  restriction: Restriction;
  isDeleting: boolean;
  onDelete: (restriction: Restriction) => void;
}

export default function RestrictionCard({
  restriction,
  isDeleting,
  onDelete,
}: RestrictionCardProps) {
  const { allowance, to, selector } = restriction;
  const value = Number(allowance) / 1e18;
  const address = truncateAddress(to);
  return (
    <div className="bg-background p-4 rounded-md flex items-center justify-between">
      <div className="">
        <h4 className="flex items-center text-lg">
          To: {address}
          <CopyButton text={to} className="w-4 h-4" />
        </h4>
        <div className="flex flex-col mt-2 text-slate-500">
          <p>Function: {selector}</p>
          <p>Value: {value} ETH</p>
        </div>
      </div>
      <Button
        disabled={isDeleting}
        variant="destructive"
        size="icon"
        aria-label="delete"
        onClick={() => onDelete(restriction)}
      >
        <Trash />
      </Button>
    </div>
  );
}
