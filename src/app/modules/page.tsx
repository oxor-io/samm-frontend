'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useSAMMStore } from '@/store/sammStore';
import { safeSDK } from '@/config/SDK';
import { SAMMData } from '@/types/samm';
import { deactivateSAMMModule, getUserSAMMs } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { showToast } from '@/helpers/showToast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { truncateAddress } from '@/helpers/truncate';
import { useTokenCheck } from '@/hooks/useTokenCheck';
import { Info, RotateCw } from 'lucide-react';
import { disableModule, enableModule } from '@/utils/safe';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

interface CategorizedModules {
  awaitingEnable: SAMMData[];
  enabled: SAMMData[];
  awaitingDisable: SAMMData[];
  disabled: SAMMData[];
}

export default function ModulesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { handleApiError } = useTokenCheck();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [modules, setModules] = useState<{
    awaitingEnable: SAMMData[];
    enabled: SAMMData[];
    awaitingDisable: SAMMData[];
    disabled: SAMMData[];
  }>({
    awaitingEnable: [],
    enabled: [],
    awaitingDisable: [],
    disabled: [],
  });

  const allSAMMs = useSAMMStore((state) => state.allSAMMs);
  const setAllSAMMs = useSAMMStore((state) => state.setAllSAMMs);
  const isSafeApp = useSAMMStore((state) => state.isSafeApp);

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      if (isSafeApp) {
        const { modules: safeModules } = await safeSDK.safe.getInfo();
        const lowerCasedSafeModules = safeModules?.map((module) => module.toLowerCase());
        if (localStorage.getItem('isAuthenticated') === 'true') {
          setIsAuthenticated(true);
        } else {
          router.push('/owners-login');
        }
        categorizeModules(allSAMMs, lowerCasedSafeModules || []);
      } else {
        const sammData = await getUserSAMMs();
        setIsAuthenticated(true);
        setDbEnabledModules(sammData);
      }
    } catch (error) {
      handleApiError(error);
      showToast(toast, 'Error', 'Failed to fetch modules. Please try again.', 'destructive');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  function handleChooseModule(module: SAMMData) {
    useSAMMStore.getState().setSAMMData(module);
    localStorage.setItem('currentSamm', JSON.stringify(module));

    if (isSafeApp) {
      router.replace('/manage/members');
    } else {
      router.replace('/transactions/pending');
    }
  }

  const categorizeModules = (sammData: SAMMData[], safeModules: string[]) => {
    const categorizedModules = sammData.reduce(
      (acc: CategorizedModules, module) => {
        const isEnabledInSafe = safeModules.includes(module.samm_address);

        if (module.is_active) {
          if (isEnabledInSafe) {
            acc.enabled.push(module);
          } else {
            acc.awaitingEnable.push(module);
          }
        } else {
          if (isEnabledInSafe) {
            acc.awaitingDisable.push(module);
          } else {
            acc.disabled.push(module);
          }
        }
        return acc;
      },
      { awaitingEnable: [], enabled: [], awaitingDisable: [], disabled: [] }
    );
    setModules(categorizedModules);
  };

  const setDbEnabledModules = (sammData: SAMMData[]) => {
    const dbEnabledModules = sammData.filter((module) => module.is_active);
    setModules({
      enabled: dbEnabledModules,
      disabled: [],
      awaitingDisable: [],
      awaitingEnable: [],
    });
    setAllSAMMs(dbEnabledModules);
  };

  const handleEnableModule = async (module: SAMMData) => {
    try {
      await enableModule(module.samm_address);
      showToast(toast, 'Success', 'Module enabled successfully', 'default');
      await fetchModules();
    } catch (error) {
      showToast(toast, 'Error', 'Failed to enable module. Please try again.', 'destructive');
      console.error(error);
    }
  };

  const handleDisableModule = async (module: SAMMData) => {
    try {
      await disableModule(module.samm_address);
      showToast(toast, 'Success', 'Module disabled successfully', 'default');
      await fetchModules();
    } catch (error) {
      showToast(toast, 'Error', 'Failed to disable module. Please try again.', 'destructive');
      console.error(error);
    } finally {
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  if (isLoading) return <LoadingSpinner full={true} />;

  return (
    <div className="flex flex-col items-center min-h-screen">
      {isAuthenticated ? (
        <div className="bg-samm-black min-w-full">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row p-8 items-center justify-center min-h-screen gap-8 lg:gap-20">
            <h1 className="gradient-text text-6xl text-center">My Modules</h1>
            <div className="flex flex-col gap-4">
              {Object.entries(modules).map(
                ([category, moduleList]) =>
                  moduleList.length > 0 && (
                    <div key={category} className="w-full">
                      <p className="text-samm-white text-center mb-2 capitalize">
                        {category.replace(/([A-Z])/g, ' $1')}
                      </p>
                      <ul className="flex flex-col gap-4">
                        {moduleList.map((module) => (
                          <li
                            key={module.samm_address}
                            className={`gradient-border text-samm-white rounded-md p-4 flex justify-between gap-10 items-center ${
                              category === 'disabled' ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {module.name && <span>{module.name}:</span>}{' '}
                              {truncateAddress(module.samm_address)}
                            </div>
                            {category === 'awaitingEnable' && (
                              <div className="flex gap-2">
                                <Button size="sm" className="flex gap-2">
                                  Enabling...
                                  <span>
                                    <RotateCw className="w-2 h-2 text-samm-black animate-spin" />
                                  </span>
                                </Button>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="bg-samm-black max-w-72 p-2 gradient-border rounded-sm">
                                        <p className="text-center text-sm mb-2">
                                          If you don&apos;t have a transaction related with this
                                          module, please use one of these options
                                        </p>
                                        <div className="flex flex-col gap-2">
                                          <Button
                                            size="sm"
                                            className="flex gap-2"
                                            onClick={() => handleEnableModule(module)}
                                          >
                                            Force enable
                                          </Button>
                                          <Button
                                            size="sm"
                                            className="flex gap-2"
                                            variant="destructive"
                                            onClick={() =>
                                              deactivateSAMMModule(module.id.toString())
                                            }
                                          >
                                            Force delete
                                          </Button>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                            {category === 'awaitingDisable' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="destructive" className="flex gap-2">
                                  Disabling...
                                  <span>
                                    <RotateCw className="w-2 h-2 text-samm-white animate-spin" />
                                  </span>
                                </Button>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="bg-samm-black max-w-72 p-2 gradient-border rounded-sm">
                                        <p className="text-center text-sm mb-2">
                                          If you don&apos;t have a transaction related with this
                                          module, please use of this option
                                        </p>
                                        <div className="flex flex-col gap-2">
                                          <Button
                                            size="sm"
                                            className="flex gap-2"
                                            onClick={() => handleDisableModule(module)}
                                          >
                                            Force disable
                                          </Button>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                            {category === 'enabled' && (
                              <Button size="sm" onClick={() => handleChooseModule(module)}>
                                Chose
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </div>
          </div>
          {Object.values(modules).every((moduleList) => moduleList.length === 0) && (
            <p>No modules available</p>
          )}
        </div>
      ) : (
        <p>Redirecting to login...</p>
      )}
    </div>
  );
}
