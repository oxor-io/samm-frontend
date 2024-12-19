'use client';
import SafeGuard from '@/components/SafeGuard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EnablingPage() {
  return (
    <SafeGuard>
      <div className="bg-samm-black">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row p-8 items-center justify-center lg:justify-between min-h-screen lg:gap-10">
          <h1 className="text-6xl  text-center lg:text-start lg:text-8xl text-samm-white leading-snug">
            Module is waiting to be enabled
          </h1>
          <LoadingSpinner color="green" />
        </div>
      </div>
    </SafeGuard>
  );
}
