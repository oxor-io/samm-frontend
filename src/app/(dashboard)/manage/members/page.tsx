'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSAMMStore } from '@/store/sammStore';
import { useTokenCheck } from '@/hooks/useTokenCheck';
import LoadingSpinner from '@/components/LoadingSpinner';

import { Member } from '@/types/member';
import { showToast } from '@/helpers/showToast';
import { fetchMembers, updateMembers } from '@/utils/api';
import { updateMembersRoot } from '@/utils/safe';
import Email from '@/containers/manage-page/members/Email';
import AddEmailForm from '@/containers/manage-page/members/AddEmailForm';

export default function Owners() {
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [deletingEmails, setDeletingEmails] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { handleApiError } = useTokenCheck();

  const { toast } = useToast();

  const sammData = useSAMMStore((state) => state.sammData);
  const sammId = sammData?.id;

  useEffect(() => {
    async function fetchEmails() {
      if (!sammId) {
        showToast(toast, 'Error', 'No SAMM ID found', 'destructive');
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetchMembers(sammId);
        if (response) setMemberList(response);
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmails();
  }, [sammData?.id]);

  async function handleDeleteEmail(email: string) {
    setDeletingEmails((prev) => new Set(prev).add(email));
    if (!sammId) return;
    try {
      const newMemberList = memberList.filter((member) => member.email !== email);

      if (newMemberList.length === memberList.length) {
        throw new Error('Email is not in the current root');
      }

      const newEmailsList = newMemberList.map((member) => member.email);

      await updateMembers(sammId, newEmailsList);
      setMemberList(newMemberList);
      await updateMembersRoot(sammData, newEmailsList);

      showToast(toast, 'Email Deleted', 'Merkle root successfully updated');
    } catch (error) {
      handleApiError(error);
    } finally {
      setDeletingEmails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  }

  async function handleAddEmail(newEmails: string[]) {
    if (!sammId) return;
    try {
      const emails = memberList.map((member) => member.email);
      emails.push(...newEmails);
      const response = await updateMembers(sammId, emails);
      if (response) setMemberList(response.filter((member) => member.is_active == true));
      await updateMembersRoot(sammData, emails);

      showToast(toast, 'Email Added', 'Merkle root successfully updated');
    } catch (error) {
      handleApiError(error);
    }
  }

  return (
    <div className="bg-samm-white min-h-[calc(100vh-10rem)] rounded-md p-4 mb-8">
      <h3>List of emails</h3>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col gap-y-4 mt-4">
          {memberList.length > 0 ? (
            memberList.map((member) => (
              <Email
                email={member?.email || ''}
                key={member?.id}
                onDelete={handleDeleteEmail}
                isDeleting={deletingEmails.has(member?.email)}
              />
            ))
          ) : (
            <p>Email list is empty</p>
          )}
        </div>
      )}

      <h3 className="mt-6">Add new email</h3>
      <div className="mt-2">
        <AddEmailForm
          onAddEmail={handleAddEmail}
          emailList={memberList.map((data) => data.email)}
        />
      </div>
    </div>
  );
}
