'use client';

import { Copy, RotateCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DBTransaction, DBTransactionApproval } from '@/types/transaction';
import { truncateText, truncateAddress } from '@/helpers/truncate';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { fetchTransactionApprovalProof, fetchTransactionApprovals } from '@/utils/api';
import { useSAMMStore } from '@/store/sammStore';

export type TransactionStatus = 'pending' | 'confirmed' | 'sent' | 'failed' | 'success';

interface TransactionCardProps {
  transaction: DBTransaction;
  setIsLoading: (isLoading: boolean) => void;
  relayer: string;
  members: number;
  status: TransactionStatus;
}

export default function TransactionCard({
  transaction,
  setIsLoading,
  relayer,
  members,
  status,
}: TransactionCardProps) {
  const truncatedMsgHash = truncateText(transaction.msg_hash, 10, 10);
  const truncatedTo = truncateAddress(transaction.to);
  const truncatedData = transaction.data.slice(0, 38);
  const messageSubject = transaction.msg_hash;

  const handleCopy = useCopyToClipboard();
  const isSafeApp = useSAMMStore((state) => state.isSafeApp);

  const handleOpenEmail = useCallback(() => {
    const emailUrl = `mailto:${relayer}?subject=${encodeURIComponent(messageSubject)}`;
    window.open(emailUrl, '_blank');
  }, [messageSubject, relayer]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [approvals, setApprovals] = useState<DBTransactionApproval[]>([]);
  const [isApprovalsLoading, setIsApprovalsLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    async function loadApprovals() {
      try {
        setIsApprovalsLoading(true);
        const data = await fetchTransactionApprovals(transaction.id);
        const approve = await fetchTransactionApprovalProof(transaction.id);

        setApprovals(data);
        if (approve !== null) {
          setIsApproved(true);
        }
      } catch (error) {
        console.error('Error: ', (error as Error).message);
      } finally {
        setIsApprovalsLoading(false);
        setIsLoading(false);
      }
    }

    loadApprovals();
  }, [transaction.id]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-samm-white rounded-md border border-gray-200 border-solid overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center bg-background p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <h4>Message hash:</h4>
          <div className="flex items-center gap-2">
            <div>{truncatedMsgHash}</div>
            <span
              className="cursor-pointer"
              onClick={async () => {
                await handleCopy(transaction.msg_hash);
              }}
            >
              <Copy className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <Button variant="outline" className="cursor-default">
            {isApprovalsLoading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              `${approvals.length} / ${members} confirmed`
            )}
          </Button>
          {!isApprovalsLoading && status === 'pending' && !isApproved && !isSafeApp && (
            <Button onClick={handleOpenEmail}>Approve</Button>
          )}
          {status !== 'pending' && (
            <Button
              className="cursor-default"
              variant={status === 'success' ? 'default' : 'destructive'}
            >
              {status}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="text-gray-500 flex items-center gap-1">
          to(address): {truncatedTo}
          <span
            className="cursor-pointer"
            onClick={async () => {
              await handleCopy(transaction.msg_hash);
            }}
          >
            <Copy className="w-4 h-4 ml-1" />
          </span>
        </div>
        <div className="text-gray-500">value: {transaction.value} ETH</div>
        <div className="text-gray-500">operation: {transaction.operation}</div>
        <div className="text-gray-500">
          <div className="flex gap-2">
            data:{' '}
            <div className="text-container">
              {isExpanded ? transaction.data : truncatedData + '...'}
              <button className="ml-2 underline text-samm-black" onClick={handleToggle}>
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
