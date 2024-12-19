'use client';

import { useState } from 'react';
import { Message } from '@/types/message';
import { Fragment, FunctionFragment, Interface } from 'ethers';
import EncodedDataDisplay from '@/containers/tx-helper-page/EncodedDataDisplay';
import GenerateMessageForm from '@/containers/tx-helper-page/GenerateMessageForm';
import AbiInputForm, { AbiFormValues } from '@/containers/tx-helper-page/AbiInputForm';

function filterNonConstantFunctions(fragment: Fragment): boolean {
  return (
    fragment.type === 'fallback' ||
    (fragment.type === 'function' && !(fragment as FunctionFragment).constant)
  );
}

export default function TxHelperPage() {
  const [contractInterface, setContractInterface] = useState<Interface | null>(null);
  const [functionNames, setFunctionNames] = useState<string[]>([]);
  const [encodedData, setEncodedData] = useState<Message | null>(null);
  const [isAbiFormValid, setIsAbiFormValid] = useState(false);
  const [contractAddress, setContractAddress] = useState<string>('');

  const handleAbiSubmit = (data: AbiFormValues) => {
    try {
      const iface = Interface.from(data.abiJson);
      const functions = iface.fragments.filter(filterNonConstantFunctions).map((fragment) => {
        return fragment.type === 'fallback' ? 'fallback' : (fragment as FunctionFragment).name;
      });

      setContractInterface(iface);
      setFunctionNames(functions);
      setContractAddress(data.contractAddress);
      if (!isAbiFormValid) setIsAbiFormValid(true);
    } catch (error) {
      console.error('Impossible to get function names: ', error);
    }
  };

  return (
    <div className="p-8 pt-2 flex  flex-col lg:flex-row gap-6">
      <div className="bg-samm-white rounded-md p-4 basis-1/2">
        <h3>Transaction Builder</h3>
        <AbiInputForm onSubmit={handleAbiSubmit} />
        {isAbiFormValid && contractInterface && (
          <GenerateMessageForm
            contractInterface={contractInterface}
            contractAddress={contractAddress}
            functionNames={functionNames}
            onGenerate={(message: Message | null) => setEncodedData(message)}
          />
        )}
      </div>
      {encodedData && <EncodedDataDisplay message={encodedData} />}
    </div>
  );
}
