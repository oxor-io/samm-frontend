import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReadOnlyPage() {
  return (
    <div className="flex flex-col justify-center items-center gap-10 min-h-screen min-w-full">
      <h1 className="text-4xl">Permission denied</h1>
      <p className="text-center">
        You don&apos;t have permission to manage this Safe, connect your wallet or if you are a
        member of the SAMM, please go to the external website
      </p>
      <Button asChild>
        <Link target="_blank" href="https://samm-demo.oxor.io/">
          Go to external website
        </Link>
      </Button>
    </div>
  );
}
