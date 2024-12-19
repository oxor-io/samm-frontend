import { memo } from 'react';
import { Interface } from 'ethers';

import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FunctionSelector from '@/components/form/FunctionSelector';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Control } from 'react-hook-form';
import { FormInputs } from './RestrictionForm';

interface CommonFieldsProps {
  control: Control<FormInputs>;
}

interface FunctionCallFieldsProps {
  control: Control<FormInputs>;
  functionNames: string[];
  onFunctionSelect: (name: string) => void;
  contractInterface: Interface | null;
  functionName?: string;
  isPayableFunction: boolean;
}

const permissionSelectOptions = [
  { label: 'Function Call', value: 'function_call' },
  { label: 'Ether Transfer', value: 'ether_transfer' },
];

export const CommonFields = memo(({ control }: CommonFieldsProps) => (
  <>
    <FormField
      control={control}
      name="permissionType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Permission Type</FormLabel>
          <FormControl>
            <Select {...field} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select permission type" />
              </SelectTrigger>
              <SelectContent>
                {permissionSelectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="contractAddress"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contract Address</FormLabel>
          <FormControl>
            <Input {...field} className="w-full" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
));
CommonFields.displayName = 'CommonFields';

export const FunctionCallFields = memo(
  ({ control, functionNames, onFunctionSelect, isPayableFunction }: FunctionCallFieldsProps) => (
    <>
      <FormField
        control={control}
        name="abiJson"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ABI JSON</FormLabel>
            <FormControl>
              <Textarea {...field} rows={8} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {functionNames.length > 0 && (
        <FormItem>
          <FormLabel>Select Function</FormLabel>
          <FormControl>
            <FunctionSelector onSelect={onFunctionSelect} functions={functionNames} />
          </FormControl>
        </FormItem>
      )}
      {isPayableFunction && (
        <FormField
          control={control}
          name="ethValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ETH Value</FormLabel>
              <FormControl>
                <Input {...field} className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  )
);
FunctionCallFields.displayName = 'FunctionCallFields';

export const EtherTransferFields = memo(({ control }: CommonFieldsProps) => (
  <FormField
    control={control}
    name="ethAmount"
    render={({ field }) => (
      <FormItem>
        <FormLabel>ETH Amount</FormLabel>
        <FormControl>
          <Input {...field} className="w-full" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));
EtherTransferFields.displayName = 'EtherTransferFields';
