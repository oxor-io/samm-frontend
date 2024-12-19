'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useSAMMStore } from '@/store/sammStore';

import { disableModule, getSammWithProvider, getSAMMSettings } from '@/utils/safe';

import { Button } from '@/components/ui/button';
import UnifiedSettingForm, { SettingConfig } from '@/containers/manage-page/settings/SettingsForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { deactivateSAMMModule } from '@/utils/api';
import { showToast } from '@/helpers/showToast';

const settingsConfig: SettingConfig[] = [
  {
    name: 'relayerEmail',
    label: 'Relayer Email Address',
    settingKey: 'Relayer',
    setterMethod: 'setRelayer',
    schema: z.string().email({ message: 'Invalid email address' }),
    placeholder: 'Enter relayer email',
  },
  {
    name: 'threshold',
    label: 'Threshold Value',
    settingKey: 'Threshold',
    setterMethod: 'setThreshold',
    schema: z.coerce
      .number()
      .min(1, 'Threshold must be at least 1')
      .max(10, 'Threshold cannot exceed 10'),
    inputType: 'number',
    placeholder: 'Enter threshold value',
  },
  {
    name: 'dkimRegistryAddress',
    label: 'DKIM Registry Address',
    settingKey: 'DKIMRegistry',
    setterMethod: 'setDKIMRegistry',
    schema: z.string().min(1, 'DKIM registry address is required'),
    placeholder: 'Enter DKIM registry address',
  },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const sammData = useSAMMStore((state) => state.sammData);

  const [isLoading, setIsLoading] = useState(true);
  const [sammSettings, setSammSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!sammData) return;

    const fetchSettings = async () => {
      try {
        const samm = getSammWithProvider(sammData.samm_address, sammData.chain_id);
        if (!samm) throw new Error('Unable to initialize SAMM provider');

        const [relayer, threshold, dkimRegistry] = await Promise.all([
          getSAMMSettings(samm, 'Relayer'),
          getSAMMSettings(samm, 'Threshold'),
          getSAMMSettings(samm, 'DKIMRegistry'),
        ]);

        setSammSettings({
          relayerEmail: relayer,
          threshold: threshold.toString(),
          dkimRegistryAddress: dkimRegistry,
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch SAMM settings:', error);
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [sammData]);

  if (!sammData) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner full={true} />
      </div>
    );
  }

  const samm = getSammWithProvider(sammData.samm_address, sammData.chain_id);

  async function handleDisabling() {
    try {
      if (!sammData) throw new Error('No Samm data');

      await deactivateSAMMModule(sammData?.id.toString());
      await disableModule(sammData?.samm_address);
    } catch (error) {
      showToast(toast, 'Error', (error as Error).message, 'destructive');
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-samm-white rounded-md p-4">
        <h3>Settings</h3>
        <div className="flex flex-col gap-4 mt-4">
          {settingsConfig.map((config) => (
            <UnifiedSettingForm
              key={config.name}
              config={config}
              samm={samm}
              toast={toast}
              defaultValue={sammSettings[config.name]}
            />
          ))}
        </div>
      </div>
      <div className="bg-samm-white rounded-md p-4">
        <h3 className="text-red-700">Danger Zone</h3>
        <Button variant="destructive" className="mt-4" onClick={handleDisabling}>
          Disable module
        </Button>
      </div>
    </div>
  );
}
