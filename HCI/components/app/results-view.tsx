'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/livekit/button';

interface DiagnosisData {
  className: string;
  confidence: number;
  status: string;
  action: string;
  tips: string[];
  imageUrl?: string | null;
}

const STORAGE_KEY = 'plant-diagnosis';

export function ResultsView() {
  const router = useRouter();
  const [data, setData] = useState<DiagnosisData | null>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (!stored) {
      router.replace('/');
      return;
    }

    try {
      const parsed = JSON.parse(stored) as DiagnosisData;
      setData(parsed);
    } catch (error) {
      console.error('Unable to parse diagnosis data', error);
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (data?.imageUrl && data.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(data.imageUrl);
      }
    };
  }, [data?.imageUrl]);

  function clearStoredDiagnosis() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  function handleTalk() {
    clearStoredDiagnosis();
    router.push('/?start=call');
  }

  function handleScanAnother() {
    clearStoredDiagnosis();
    router.push('/');
  }

  if (!data) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-4 py-12 sm:py-16">
        <div className="text-sm text-muted-foreground">Loading diagnosis…</div>
      </main>
    );
  }

  const diagnosisLabel = data.className?.toUpperCase() === 'NULL' ? 'No Pod Detected' : data.className;

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 sm:py-16">
      <div className="flex w-full max-w-3xl flex-col gap-8 sm:gap-10">
        <header className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Diagnosis summary</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {diagnosisLabel}
          </h1>
        </header>

        {data.imageUrl && (
          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-border/40">
            <img
              src={data.imageUrl}
              alt={`Uploaded leaf showing ${diagnosisLabel}`}
              className="aspect-square w-full object-cover"
            />
          </div>
        )}

        <section className="space-y-4 text-sm text-foreground">
          <div className="space-y-3">
            <h2 className="text-base font-semibold">Recommended actions</h2>
            <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
              {[data.action, ...(data.tips ?? [])].map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="primary" onClick={handleTalk}>
            Talk to Dr. Eugenia
          </Button>
          <Button variant="outline" onClick={handleScanAnother}>
            Scan another leaf
          </Button>
        </div>
      </div>
    </main>
  );
}
