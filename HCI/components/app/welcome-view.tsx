import { Leaf } from '@phosphor-icons/react';
import { PlantHealthPanel } from '@/components/app/plant-health-panel';

interface WelcomeViewProps {
  onStartCall: () => void;
  startButtonText?: string;
}

export const WelcomeView = ({ onStartCall, startButtonText, ref }: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div
      ref={ref}
      className="bg-background flex min-h-svh items-center justify-center px-4 py-10 sm:py-16"
    >
      <div className="flex w-full max-w-3xl flex-col gap-6 sm:gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Leaf className="size-5 text-emerald-500" weight="fill" />
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            Scan a leaf to begin
          </h1>
        </div>

        <div className="w-full">
          <PlantHealthPanel onStartCall={onStartCall} />
        </div>
      </div>
    </div>
  );
};
