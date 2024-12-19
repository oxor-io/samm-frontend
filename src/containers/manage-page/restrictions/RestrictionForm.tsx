'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Interface, FunctionFragment, parseEther, isAddress } from 'ethers';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useSAMMStore } from '@/store/sammStore';
import { useToast } from '@/hooks/use-toast';
import { getSammWithProvider, setTxAllowed, validateAddress } from '@/utils/safe';
import { safeSDK } from '@/config/SDK';
import { showToast } from '@/helpers/showToast';
import { CommonFields, EtherTransferFields, FunctionCallFields } from './RestrictionFormFields';

export type FormInputs = {
  permissionType: 'function_call' | 'ether_transfer';
  ethValue?: string;
  contractAddress: string;
  abiJson?: string;
  functionName?: string;
  ethAmount?: string;
};

const validateAbiJson = (data: string) => {
  try {
    const parsed = JSON.parse(data);
    new Interface(parsed);
    return true;
  } catch {
    return false;
  }
};

const isValidEthAmount = (value: string) => {
  return /^\d+(\.\d{1,18})?$/.test(value);
};

const createSchemas = () => {
  const baseSchema = z.object({
    permissionType: z.enum(['function_call', 'ether_transfer']),
    ethValue: z.string().optional(),
  });

  return {
    functionCallSchema: baseSchema.extend({
      permissionType: z.literal('function_call'),
      contractAddress: z.string().min(1, 'Contract address is required').refine(isAddress, {
        message: 'Invalid address',
      }),
      abiJson: z.string().min(1, 'Abi JSON is required').refine(validateAbiJson, {
        message: 'Invalid ABI JSON format',
      }),
      functionName: z.string().min(1, 'Function name is required'),
    }),
    etherTransferSchema: baseSchema.extend({
      permissionType: z.literal('ether_transfer'),
      contractAddress: z.string().min(1, 'Contract address is required').refine(isAddress, {
        message: 'Invalid address',
      }),
      ethAmount: z.string().min(1, 'ETH amount is required').refine(isValidEthAmount, {
        message: 'Invalid ETH amount',
      }),
    }),
  };
};

export default function RestrictionForm() {
  const [contractInterface, setContractInterface] = useState<Interface | null>(null);
  const [functionNames, setFunctionNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sammData = useSAMMStore((state) => state.sammData);
  const { toast } = useToast();

  const schemas = useMemo(() => createSchemas(), []);

  const form = useForm<FormInputs>({
    defaultValues: {
      permissionType: 'function_call',
      contractAddress: '',
      abiJson: '',
      functionName: '',
      ethValue: '',
      ethAmount: '',
    },
  });

  const { control, handleSubmit, watch, reset, setValue } = form;
  const permissionType = watch('permissionType');
  const abiJson = watch('abiJson');
  const functionName = watch('functionName');

  useEffect(() => {
    if (permissionType !== 'function_call' || !abiJson || !validateAbiJson(abiJson)) {
      setContractInterface(null);
      setFunctionNames([]);
      return;
    }

    try {
      const iface = Interface.from(abiJson);
      setContractInterface(iface);
      const uniqueFunctionNames = [
        ...new Set(
          iface.fragments.map((fragment) =>
            fragment.type === 'fallback' ? 'fallback' : (fragment as FunctionFragment).name
          )
        ),
      ];
      setFunctionNames(uniqueFunctionNames);
    } catch (error) {
      console.error('Error parsing ABI:', error);
      showToast(
        toast,
        'Failed to parse ABI JSON',
        'Please check your ABI JSON and try again.',
        'destructive'
      );
      setContractInterface(null);
      setFunctionNames([]);
    }
  }, [abiJson, permissionType, toast]);

  useEffect(() => {
    if (permissionType === 'function_call' && contractInterface && functionName) {
      try {
        const fragment = contractInterface.getFunction(functionName);
        if (!fragment) throw new Error('Function fragment not available');
      } catch (error) {
        console.error('Error updating schema:', error);
        showToast(
          toast,
          'Failed to process function parameters',
          'Please check your function parameters and try again.',
          'destructive'
        );
      }
    }
  }, [contractInterface, functionName, permissionType, schemas, toast]);

  useEffect(() => {
    form.reset(form.getValues());
  }, []);

  const isPayableFunction = useMemo(() => {
    if (!contractInterface || !functionName) return false;
    const fragment = contractInterface.getFunction(functionName);
    return fragment?.stateMutability === 'payable';
  }, [contractInterface, functionName]);

  const handlePermissionSubmit = useCallback(
    async (data: FormInputs) => {
      setIsSubmitting(true);

      try {
        validateAddress(sammData?.samm_address ?? '', 'SAMM');
        validateAddress(data.contractAddress, 'Contract');

        const samm = getSammWithProvider(sammData!.samm_address, sammData?.chain_id || 0);

        switch (data.permissionType) {
          case 'function_call': {
            if (!data.functionName) throw new Error('Function name is required');
            const functionSelector = contractInterface?.getFunction(data.functionName)?.selector;
            if (!functionSelector) throw new Error('Invalid function selector');
            const amount = data.ethValue ? parseEther(data.ethValue).toString() : '0';
            await setTxAllowed(
              data.contractAddress,
              functionSelector,
              amount,
              true,
              samm,
              sammData?.chain_id || 0
            );
            break;
          }
          case 'ether_transfer': {
            if (!data.ethAmount) throw new Error('ETH amount is required');
            const amount = parseEther(data.ethAmount).toString();
            await setTxAllowed(
              data.contractAddress,
              '0x00000000',
              amount,
              true,
              samm,
              sammData?.chain_id || 0
            );
            break;
          }
        }
        const { owners } = await safeSDK.safe.getInfo();

        const title = `Permission ${owners.length > 1 ? 'awaits change' : 'updated successfully'}`;
        showToast(toast, title);
        reset();
      } catch (error) {
        const description = error instanceof Error ? error.message : 'Failed to set permissions';
        console.error('Error setting permissions:', description);
        showToast(toast, 'Failed to set permissions', description, 'destructive');
      } finally {
        setIsSubmitting(false);
      }
    },
    [sammData, contractInterface, reset, toast]
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handlePermissionSubmit)} className="flex flex-col gap-4 mt-4">
        <CommonFields control={control} />

        {permissionType === 'function_call' ? (
          <FunctionCallFields
            control={control}
            functionNames={functionNames}
            onFunctionSelect={(name) => setValue('functionName', name)}
            contractInterface={contractInterface}
            functionName={functionName}
            isPayableFunction={isPayableFunction}
          />
        ) : (
          <EtherTransferFields control={control} />
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Setting Permission...' : 'Set Permission'}
        </Button>
      </form>
    </Form>
  );
}
