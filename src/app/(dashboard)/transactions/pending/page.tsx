'use client';

import GenericTransactionsPage from '@/containers/transactions-page/TransactionsPage';

export default function PendingTransactionsPage() {
  return <GenericTransactionsPage title="Pending Transactions" status="pending" />;
}
