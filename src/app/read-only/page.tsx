import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReadOnlyPage() {
  return (
    <div className="flex flex-col justify-center items-center gap-10 min-h-screen min-w-full">
      <h1 className="text-4xl">Permission denied</h1>
      <p>
        You don&apos;t have permission to manage this Safe, connect your wallet or if you are a
        member of the SAMM, please go to the external website
      </p>
      <Button asChild>
        <Link href="https://samm-alpha.vercel.app">Go to external website</Link>
      </Button>
    </div>
  );
}
