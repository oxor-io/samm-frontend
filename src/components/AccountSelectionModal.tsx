import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';

export async function getUserSelectedAccount(accounts: string[]): Promise<string> {
  return new Promise((resolve) => {
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);

    const root = ReactDOM.createRoot(modalContainer);

    const handleClose = (selectedAccount: string) => {
      resolve(selectedAccount);
      root.unmount();
      document.body.removeChild(modalContainer);
    };

    root.render(<AccountSelectionModal accounts={accounts} onSelect={handleClose} />);
  });
}

interface AccountSelectionModalProps {
  accounts: string[];
  onSelect: (account: string) => void;
}

function AccountSelectionModal({ accounts, onSelect }: AccountSelectionModalProps) {
  const [open, setOpen] = useState(true);

  const handleSelect = (account: string) => {
    onSelect(account);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-80" />
      <DialogContent className="bg-white p-6 rounded-lg shadow-lg mx-auto absolute w-auto -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4">
        <h2 className="text-lg font-bold mb-4 text-center">Select an Account</h2>
        <ul className="space-y-2">
          {accounts.map((account) => (
            <li key={account}>
              <button
                className="w-full px-4 py-2 text-left bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => handleSelect(account)}
              >
                {account}
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
