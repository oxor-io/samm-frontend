'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { showToast } from '@/helpers/showToast';
import { useSAMMStore } from '@/store/sammStore';
import { Restriction } from '@/types/restriction';
import { getRestrictions, getSammWithProvider, setTxAllowed, validateAddress } from '@/utils/safe';

import LoadingSpinner from '@/components/LoadingSpinner';
import RestrictionCard from '@/containers/manage-page/restrictions/RestrictionCard';
import RestrictionForm from '@/containers/manage-page/restrictions/RestrictionForm';

export default function Restrictions() {
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);
  const [deletingRestrictions, setDeletingRestrictions] = useState<Set<Restriction>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const sammData = useSAMMStore((state) => state.sammData);
  const { toast } = useToast();

  useEffect(() => {
    async function setAllowedRestrictions() {
      setIsLoading(true);
      try {
        if (!sammData || !sammData.samm_address) {
          throw new Error('Invalid SAMM data or address');
        }

        const res = await getRestrictions(sammData.samm_address, sammData.chain_id);
        setRestrictions(res);
      } catch (error) {
        console.error('Failed to fetch restrictions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    setAllowedRestrictions();
  }, [sammData]);

  async function handleDeleteRestriction(restriction: Restriction) {
    setDeletingRestrictions((prev) => new Set(prev).add(restriction));
    try {
      validateAddress(sammData?.samm_address ?? '', 'SAMM');
      validateAddress(restriction.to, 'Contract');

      const samm = getSammWithProvider(sammData!.samm_address, sammData!.chain_id);
      await setTxAllowed(
        restriction.to,
        restriction.selector,
        restriction.allowance,
        false,
        samm,
        sammData!.chain_id
      );

      showToast(toast, 'Permission deleted successfully');
    } catch (error) {
      console.error('Error deleting permissions:', error);
      showToast(
        toast,
        'Failed to delete permissions',
        error instanceof Error ? error.message : 'Failed to set permissions',
        'destructive'
      );
    } finally {
      setDeletingRestrictions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(restriction);
        return newSet;
      });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-y-4 gap-x-8 lg:flex-row">
        <div className="bg-samm-white rounded-md p-4 lg:basis-1/2">
          <h3>Set restriction</h3>
          <RestrictionForm />
        </div>
        <div className="bg-samm-white rounded-md p-4 lg:basis-1/2">
          <h3>Allowed contract calls</h3>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="flex flex-col gap-4 mt-2">
              {restrictions.map((restriction) => (
                <RestrictionCard
                  key={restriction.to}
                  restriction={restriction}
                  onDelete={handleDeleteRestriction}
                  isDeleting={deletingRestrictions.has(restriction)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
