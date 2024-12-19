import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseEther, FunctionFragment, Interface, ethers } from 'ethers';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FunctionSelector from '../../components/form/FunctionSelector';
import FunctionFormField from '../../components/form/FunctionFormField';

import { useSAMMStore } from '@/store/sammStore';
import { Message, MessageBody } from '@/types/message';
import { getMsgHash, getNonceFromSamm, getProvider } from '@/utils/safe';

interface CombinedFunctionFormProps {
  contractInterface: Interface;
  contractAddress: string;
  functionNames: string[];
  onGenerate: (message: Message | null) => void;
}

const EXPIRATION_PERIOD = 604800; // 7 days in seconds

export default function GenerateMessageForm({
  contractInterface,
  contractAddress,
  functionNames,
  onGenerate,
}: CombinedFunctionFormProps) {
  const sammData = useSAMMStore((state) => state.sammData);
  const sammAddress = sammData?.samm_address || '';
  const chainId = sammData?.chain_id || 0;
  const provider = getProvider(chainId);

  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [functionFragment, setFunctionFragment] = useState<FunctionFragment | null>(null);

  const isPayable = functionFragment?.stateMutability === 'payable';

  useEffect(() => {
    if (selectedFunction) {
      const fragment = contractInterface.getFunction(selectedFunction);
      setFunctionFragment(fragment || null);
    } else {
      setFunctionFragment(null);
    }
  }, [selectedFunction, contractInterface]);

  const { combinedSchema, defaultValues } = useMemo(() => {
    const paramSchema = z.object(
      functionFragment?.inputs.reduce((acc, input) => {
        acc[input.name] = z.string().min(1, `${input.name} is required`);
        return acc;
      }, {} as Record<string, z.ZodTypeAny>) || {}
    );

    const schema = paramSchema.extend({
      ethValue: isPayable
        ? z.string().regex(/^\d+(\.\d{1,18})?$/, 'Invalid ETH value')
        : z.string().optional(),
    });

    const values = {
      ...functionFragment?.inputs.reduce((acc, input) => {
        acc[input.name] = '';
        return acc;
      }, {} as Record<string, string>),
      ethValue: '',
    };

    return { combinedSchema: schema, defaultValues: values };
  }, [functionFragment, isPayable]);

  type FormSchema = z.infer<typeof combinedSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(combinedSchema),
    defaultValues,
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof combinedSchema>) => {
      if (!functionFragment || !provider || !sammAddress) return;

      try {
        const args = functionFragment.inputs.map((input) => data[input.name]);
        const calldata = contractInterface.encodeFunctionData(functionFragment, args);

        const nonce = await getNonceFromSamm(sammAddress, chainId);

        let value: string = '0';
        if (isPayable) {
          value = parseEther(data.ethValue as string).toString();
        }

        const block = await provider.getBlock('latest');
        const deadline = Number(block?.timestamp) + EXPIRATION_PERIOD;

        const transactionData: MessageBody = {
          to: contractAddress,
          value,
          data: calldata,
          operation: 'CALL',
          nonce,
          deadline,
        };

        const msgHash = getMsgHash(
          contractAddress,
          value,
          calldata,
          'CALL' === 'CALL' ? '0' : '1',
          nonce,
          deadline.toString(),
          sammAddress,
          chainId.toString()
        );

        const msgHashBase64 = ethers.encodeBase64(ethers.toBeArray(ethers.toBigInt(msgHash)));

        onGenerate({ msgHash: msgHashBase64, calldata: transactionData });
      } catch (error) {
        console.error('Failed to encode function data:', error);
      }
    },
    [
      functionFragment,
      isPayable,
      provider,
      contractInterface,
      contractAddress,
      chainId,
      onGenerate,
      sammAddress,
    ]
  );

  function onSelect(fn: string) {
    form.setValue('functionName', fn);
    setSelectedFunction(fn);
    onGenerate(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
        <FormItem>
          <FormLabel>Contract Address</FormLabel>
          <FormControl>
            <Input value={contractAddress} disabled className="w-full" />
          </FormControl>
        </FormItem>

        {isPayable && (
          <FormField
            control={form.control}
            name="ethValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ETH Value</FormLabel>
                <FormControl>
                  <Input placeholder="0.1" {...field} value={(field.value as string) || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="functionName"
          render={() => (
            <FormItem>
              <FormLabel>Select Function</FormLabel>
              <FormControl>
                <FunctionSelector onSelect={onSelect} functions={functionNames} />
              </FormControl>
            </FormItem>
          )}
        />

        {functionFragment?.inputs.map((input) => (
          <FunctionFormField input={input} key={input.name} form={form} />
        ))}

        <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
          Generate Message
        </Button>
      </form>
    </Form>
  );
}
