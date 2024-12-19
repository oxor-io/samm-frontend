import Link from 'next/link';
import { Button } from './ui/button';

export default function NoPermission() {
  return (
    <div className="flex flex-col justify-center items-center gap-10 min-h-screen min-w-full">
      <h1 className="text-4xl">You have not enough rights for this page</h1>
      <Button asChild>
        <Link href="/transactions/pending">Go to dashboard</Link>
      </Button>
    </div>
  );
}
