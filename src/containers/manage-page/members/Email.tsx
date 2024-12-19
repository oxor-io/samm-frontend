'use client';

import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

import avatar1 from '../../../../public/avatar1.png';
import avatar2 from '../../../../public/avatar2.png';
import avatar3 from '../../../../public/avatar3.png';
import avatar4 from '../../../../public/avatar4.png';
import avatar5 from '../../../../public/avatar5.png';

import Image from 'next/image';

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5];
function getAvatarIndex(email: string): number {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % avatars.length;
}

interface EmailProps {
  email: string;
  isDeleting: boolean;
  onDelete: (email: string) => void;
}
export default function Email({ email, onDelete, isDeleting }: EmailProps) {
  const avatarIndex = getAvatarIndex(email);
  const avatar = avatars[avatarIndex];

  return (
    <article className="bg-background p-2 rounded items-center justify-between flex">
      <div className="flex items-center">
        <Image src={avatar} alt="Avatar" className="w-10 h-10 mr-4" />
        <div className="">{email}</div>
      </div>
      <Button
        disabled={isDeleting}
        variant="destructive"
        size="icon"
        aria-label="delete"
        onClick={() => onDelete(email)}
      >
        <Trash />
      </Button>
    </article>
  );
}
