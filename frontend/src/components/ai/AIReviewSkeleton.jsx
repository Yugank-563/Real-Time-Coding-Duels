import { Bot } from 'lucide-react';

export const AIReviewSkeleton = () => {
  return (
    <div className="w-full bg-surface border border-border rounded-2xl p-10 flex flex-col items-center justify-center">
      <div className="relative mb-6">
        <Bot className="w-12 h-12 text-accent-primary animate-pulse" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
      </div>
      <h3 className="font-bold text-lg text-text-primary tracking-tight">AI Review is being generated...</h3>
      <p className="text-sm text-text-secondary mt-2">Analyzing algorithms and creating insights. This takes about 15 seconds.</p>
    </div>
  );
};
