'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useSAMMStore } from '@/store/sammStore';

import { safeSDK } from '@/config/SDK';
import { getOwnerToken, getUserSAMMs, updateMembers } from '@/utils/api';
import { deployModuleByUser, enableModule, requestSignature } from '@/utils/safe';

import SafeGuard from '@/components/SafeGuard';
import { ModuleForm, ModuleFormData } from '@/containers/create-page/CreateModuleForm';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { showToast } from '@/helpers/showToast';

enum Step {
  Form = 'form',
  EnablingModule = 'enablingModule',
}

interface DataForSignature {
  deployedSammAddress: string;
  chainId: number;
  owners: string[];
}

interface StepLayoutProps {
  title: string;
  showTitleOnBigScreen?: boolean;
  children: React.ReactNode;
}

const StepLayout = ({ title, showTitleOnBigScreen = true, children }: StepLayoutProps) => {
  const titleClass = cn(
    'text-2xl md:text-6xl text-center lg:text-start lg:text-8xl gradient-text leading-snug',
    {
      'hidden lg:block': !showTitleOnBigScreen,
    }
  );
  return (
    <SafeGuard>
      <div className="bg-samm-black">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row p-8 items-center justify-center lg:justify-between min-h-screen gap-10">
          <h1 className={titleClass}>{title}</h1>
          {children}
        </div>
      </div>
    </SafeGuard>
  );
};

export default function CreateModulePage() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Form);
  const [loading, setLoading] = useState(false);
  const [dataForSignature, setDataForSignature] = useState<DataForSignature | null>(null);

  const setToken = useSAMMStore((state) => state.setToken);
  const router = useRouter();
  const { toast } = useToast();

  const handleAddEmails = async (newSammId: number, emails: string[]) => {
    try {
      await updateMembers(newSammId, emails);
    } catch (error) {
      console.error('Failed to send emails:', error);
      showToast(toast, 'Error', 'Failed to add emails to database', 'destructive');
    }
  };

  const handleSubmit = async (data: ModuleFormData) => {
    setLoading(true);
    try {
      const { owners } = await safeSDK.safe.getInfo();
      const { deployedSammAddress, chainId } = await deployModuleByUser(data);

      setDataForSignature({ deployedSammAddress, chainId, owners });
      const signedData = await requestSignature(deployedSammAddress, chainId, owners);
      const token = await getOwnerToken(signedData, data.moduleName);

      localStorage.setItem('accessToken', token.access_token);
      localStorage.setItem('isAuthenticated', 'true');
      setToken(token.access_token);
      const response = await getUserSAMMs();

      if (!response) {
        showToast(toast, `Failed to fetch samms`, '', 'destructive');
      }

      const newSammId = response.find(
        (samm) => samm.samm_address.toLowerCase() === deployedSammAddress.toLowerCase()
      )?.id;

      if (!newSammId) {
        throw new Error('No such SAMM in database');
      }

      await handleAddEmails(
        newSammId,
        data.emailAddresses.split(',').map((email) => email.trim())
      );
      setCurrentStep(Step.EnablingModule);
    } catch (error) {
      showToast(toast, 'Error', `Failed to deploy SAMM Module: ${error}`, 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableModule = async () => {
    if (!dataForSignature) return;

    setLoading(true);
    try {
      await enableModule(dataForSignature.deployedSammAddress);
      router.replace('/');
    } catch (error) {
      showToast(toast, 'Error', `Failed to enable module: ${error}`, 'destructive');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === Step.EnablingModule) {
    return (
      <StepLayout title="Step 2">
        <Button onClick={handleEnableModule} disabled={loading}>
          {loading ? 'Enabling module...' : 'Enable SAMM module'}
        </Button>
      </StepLayout>
    );
  }

  return (
    <StepLayout title="Create your new SAMM Module" showTitleOnBigScreen={false}>
      <ModuleForm onSubmit={handleSubmit} isSubmitting={loading} />
    </StepLayout>
  );
}
