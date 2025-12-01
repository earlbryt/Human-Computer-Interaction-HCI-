'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatCircleDots } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/livekit/alert';
import { Button } from '@/components/livekit/button';
import { type PlantDiagnosis, analyzeLeaf } from '@/lib/plant-api';

interface PlantHealthPanelProps {
  onStartCall: () => void;
}

export function PlantHealthPanel({ onStartCall }: PlantHealthPanelProps) {
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextPreviewUrl = URL.createObjectURL(file);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(nextPreviewUrl);

    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    try {
      const result = await analyzeLeaf(file);
      setDiagnosis(result);

      const info = getTreatmentInfo(result.className);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'plant-diagnosis',
          JSON.stringify({
            className: result.className,
            confidence: result.confidence,
            status: info.status,
            action: info.action,
            tips: info.tips,
            imageUrl: nextPreviewUrl,
          })
        );
      }

      router.push('/results');
    } catch (err) {
      console.error(err);
      setError('Unable to analyze this image. Please try another photo.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleTakePhotoClick() {
    cameraInputRef.current?.click();
  }

  function handleUploadClick() {
    uploadInputRef.current?.click();
  }

  function getTreatmentInfo(conditionOverride?: string) {
    const normalized = (conditionOverride ?? diagnosis?.className ?? '')
      .toUpperCase()
      .replace(/\s+/g, '');

    switch (normalized) {
      case 'HEALTHY':
        return {
          status: 'Your cocoa appears healthy',
          action: 'Continue your current care routine.',
          tips: [
            'Continue watering on your usual schedule.',
            'Keep the area around plants clean and free of weeds.',
            'Inspect leaves weekly so you can catch issues early.',
          ],
        } as const;
      case 'BLACKPOD':
        return {
          status: 'Black pod disease detected',
          action: 'Act quickly to stop the disease spreading.',
          tips: [
            'Remove and destroy all black or brown pods you can see.',
            'Spray an appropriate fungicide according to local guidance.',
            'Improve drainage and airflow around affected trees.',
          ],
        } as const;
      case 'FROSTPOD':
        return {
          status: 'Frosty pod rot detected',
          action: 'Treatment is recommended soon.',
          tips: [
            'Remove and safely dispose of infected pods each week.',
            'Apply a recommended fungicide if available in your region.',
            'Reduce excessive shade to keep leaves drier.',
          ],
        } as const;
      case 'MIRID':
        return {
          status: 'Mirid bug damage detected',
          action: 'Consider starting pest control.',
          tips: [
            'Apply an appropriate insecticide where damage is visible.',
            'Clear weeds and debris where pests may hide.',
            'Prune damaged branches to encourage healthy growth.',
          ],
        } as const;
      case 'NULL':
        return {
          status: 'No Pod Detected',
          action: 'Retake the photo with better lighting and a clear view of a single leaf.',
          tips: [
            'Ensure the leaf fills most of the frame.',
            'Wipe dust or water off the leaf before taking a new photo.',
          ],
        } as const;
      default:
        return {
          status: 'Issue detected',
          action: 'Monitor this plant closely and get advice if needed.',
          tips: [
            'Check this plant regularly for spreading spots or new symptoms.',
            'Keep the area clean, remove heavily damaged material.',
            'Use the voice agent to talk through what you are seeing in the field.',
          ],
        } as const;
    }
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-md space-y-4 px-2 text-left sm:mt-10 sm:max-w-lg sm:px-0">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleTakePhotoClick}
          disabled={isLoading}
          className="w-full justify-center sm:w-auto"
        >
          Take photo
        </Button>
        <Button
          type="button"
          variant="primary"
          size="default"
          onClick={handleUploadClick}
          disabled={isLoading}
          className="w-full justify-center sm:w-auto"
        >
          Upload photo
        </Button>
      </div>

      {isLoading && (
        <div className="bg-background/95 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative flex size-32 items-center justify-center">
            <span className="absolute inline-flex size-full rounded-full border-2 border-sky-500/20" />
            <span className="absolute inline-flex size-full animate-[spin_1.1s_linear_infinite] rounded-full border-2 border-sky-500 border-b-transparent border-l-transparent" />
            <span className="relative rounded-full bg-sky-500 px-4 py-1 text-xs font-semibold tracking-wide text-white uppercase">
              Analyzing
            </span>
          </div>
        </div>
      )}

      {error && (
        <Alert className="border-destructive/30 bg-destructive/10" data-slot="alert" role="alert">
          <AlertTitle>Analysis failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </section>
  );
}
