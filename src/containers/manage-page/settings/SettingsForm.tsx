'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { BaseContract, ContractInterface } from 'ethers';
import { getSAMMSettings, setSAMMSettings } from '@/utils/safe';
import { safeSDK } from '@/config/SDK';
import { showToast } from '@/helpers/showToast';
import { updateThreshold } from '@/utils/api';

export interface SettingConfig {
  name: string;
  label: string;
  settingKey: 'Relayer' | 'Threshold' | 'DKIMRegistry';
  setterMethod: 'setRelayer' | 'setThreshold' | 'setDKIMRegistry';
  schema: z.ZodType<string | number>;
  inputType?: string;
  placeholder: string;
}

interface SettingsFormProps {
  samm: BaseContract & Omit<ContractInterface, keyof BaseContract>;
  toast: ReturnType<typeof useToast>['toast'];
  sammId: number;
  defaultValue?: string | number;
}
export default function UnifiedSettingForm({
  config,
  samm,
  toast,
  sammId,
  defaultValue = '',
}: SettingsFormProps & { config: SettingConfig }) {
  const [currentValue, setCurrentValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = z.object({
    [config.name]: config.schema,
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      [config.name]: defaultValue,
    },
  });

  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    getSAMMSettings(samm, config.settingKey).then((value) => {
      setCurrentValue(value);
      reset({ [config.name]: config.inputType === 'number' ? parseInt(value) : value });
    });
  }, [samm, reset, config]);

  const onSubmit = async (data: Record<string, string | number>) => {
    setIsSubmitting(true);
    try {
      const value = String(data[config.name]);

      if (config.name === 'threshold') {
        await updateThreshold(sammId, value);
      }

      await setSAMMSettings(samm, config.setterMethod, value, currentValue);
      const { owners } = await safeSDK.safe.getInfo();
      showToast(
        toast,
        `${config.label} ${owners.length > 1 ? 'awaits change' : 'updated successfully'} `
      );
      reset();
    } catch (error) {
      console.error(`Failed to update ${config.label.toLowerCase()}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showToast(toast, `Error`, errorMessage, 'destructive');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col md:flex-row items-end gap-4 w-full"
      >
        <div className="w-full basis-2/3">
          <FormField
            control={control}
            name={config.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{config.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={config.inputType || 'text'}
                    placeholder={config.placeholder}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full md:w-auto basis-1/3" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : `Update ${config.label}`}
        </Button>
      </form>
    </Form>
  );
}
