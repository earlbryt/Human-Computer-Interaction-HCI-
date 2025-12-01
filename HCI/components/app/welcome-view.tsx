import Image from 'next/image';
import { PlantHealthPanel } from '@/components/app/plant-health-panel';

interface WelcomeViewProps {
  onStartCall: () => void;
}

export const WelcomeView = ({
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="bg-background relative min-h-svh overflow-hidden px-4 py-10 sm:py-16">
      <header className="absolute top-4 left-4 z-10 flex justify-start sm:top-6 sm:left-6">
        <Image
          src="/assets/Screenshot 2025-12-01 192410-Photoroom.png"
          alt="App logo"
          width={160}
          height={160}
          priority
          className="h-20 w-auto drop-shadow sm:h-28"
        />
      </header>
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft corner blobs */}
        <div className="absolute -top-56 -left-56 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,theme(colors.emerald.500/0.12),transparent_60%)] blur-3xl" />
        <div className="absolute -right-56 -bottom-56 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,theme(colors.sky.500/0.12),transparent_60%)] blur-3xl" />

        {/* Mesh tint (very subtle) */}
        <div className="absolute inset-0 [background-image:radial-gradient(45rem_28rem_at_20%_10%,theme(colors.emerald.500/0.20),transparent_60%),radial-gradient(30rem_24rem_at_80%_25%,theme(colors.sky.500/0.18),transparent_60%),radial-gradient(36rem_26rem_at_50%_85%,theme(colors.blue.500/0.16),transparent_60%)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-[0.25] dark:opacity-[0.18]" />

        {/* Faint grid */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] bg-[size:80px_80px] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)]" />

        {/* Radial rings */}
        <div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_50%_55%,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_2px,transparent_2px,transparent_14px)] [mask-image:radial-gradient(circle_at_center,black,transparent_70%)] opacity-[0.08] dark:bg-[repeating-radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.18),rgba(255,255,255,0.18)_2px,transparent_2px,transparent_14px)] dark:opacity-[0.07]" />

        {/* Dotted texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_1px_at_1px_1px,rgba(0,0,0,0.45),transparent_2px)] bg-[size:22px_22px] opacity-[0.035] dark:bg-[radial-gradient(circle_1px_at_1px_1px,rgba(255,255,255,0.5),transparent_2px)] dark:opacity-[0.05]" />
      </div>
      <div className="mx-auto flex min-h-[70svh] w-full max-w-3xl items-center justify-center pt-24 sm:pt-32">
        <div className="flex w-full flex-col items-center gap-6 text-center sm:gap-8">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            Scan a plant to begin
          </h1>
          <div className="w-full">
            <PlantHealthPanel onStartCall={onStartCall} />
          </div>
        </div>
      </div>
    </div>
  );
};
