import { useEffect } from 'react';
import { useSAMMStore } from '@/store/sammStore';
import { getSAMMSettings, getSammWithProvider } from '@/utils/safe';

export function useSAMMAndRelayer() {
  const sammData = useSAMMStore((state) => state.sammData);
  const relayer = useSAMMStore((state) => state.relayer);
  const setRelayer = useSAMMStore((state) => state.setRelayer);

  const samm = getSammWithProvider(sammData?.samm_address || '', sammData?.chain_id || 0);

  useEffect(() => {
    async function getRelayer() {
      if (!relayer) {
        const relayerAddress = await getSAMMSettings(samm, 'Relayer');
        setRelayer(relayerAddress);
      }
    }
    getRelayer();
  }, [samm, relayer, setRelayer]);

  return { samm, sammData, relayer };
}
