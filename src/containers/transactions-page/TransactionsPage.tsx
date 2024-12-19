'use client';

import { useEffect, useState } from 'react';
import { DBTransaction } from '@/types/transaction';
import { useTokenCheck } from '@/hooks/useTokenCheck';
import { useSAMMAndRelayer } from '@/hooks/useSAMMAndRelayer';
import { fetchAllTransactions, fetchMembers, fetchTransactions } from '@/utils/api';

import LoadingSpinner from '@/components/LoadingSpinner';
import TransactionCard from '@/containers/transactions-page/TransactionCard';

interface TransactionsPageProps {
  title: string;
  status: 'pending' | 'confirmed';
}

export default function GenericTransactionsPage({ title, status }: TransactionsPageProps) {
  const { samm, relayer, sammData } = useSAMMAndRelayer();
  const [transactions, setTransactions] = useState<DBTransaction[]>([]);
  const [membersLength, setMembersLength] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { handleApiError } = useTokenCheck();

  async function loadTransactions() {
    try {
      setIsLoading(true);
      if (!sammData) {
        throw new Error('No Samm data');
      }

      let fetchedTransactions: DBTransaction[] = [];
      if (status === 'confirmed') {
        fetchedTransactions = (await fetchAllTransactions(sammData?.id)).filter((transaction) =>
          ['confirmed', 'success', 'failed'].includes(transaction.status)
        );
      } else {
        fetchedTransactions = await fetchTransactions(sammData?.id, status);
      }
      const members = await fetchMembers(sammData?.id);
      if (members) setMembersLength(members.length);
      setTransactions(fetchedTransactions);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (samm) {
      loadTransactions();
    }
  }, []);

  if (!samm) return null;

  return (
    <div className="bg-samm-white rounded-md p-4">
      <h3>{title}</h3>
      <div className="flex flex-col gap-4 mt-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          transactions
            .slice()
            .reverse()
            .map((transaction) => (
              <TransactionCard
                key={transaction.id}
                setIsLoading={setIsLoading}
                relayer={relayer}
                transaction={transaction}
                members={membersLength}
                status={transaction.status}
              />
            ))
        )}
      </div>
    </div>
  );
}
