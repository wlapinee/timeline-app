'use client';

export default function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 bg-surface-200 border border-surface-300 rounded-2xl px-10 py-8 shadow-2xl">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-surface-300" />
          <div className="absolute inset-0 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-300 font-medium">{message}</p>
      </div>
    </div>
  );
}
