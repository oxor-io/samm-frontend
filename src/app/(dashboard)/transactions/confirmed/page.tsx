'use client';

import GenericTransactionsPage from '@/containers/transactions-page/TransactionsPage';

export default function ConfirmedTransactionsPage() {
  return <GenericTransactionsPage title="Confirmed Transactions" status="confirmed" />;
}
