export interface PlantDiagnosis {
  className: string;
  confidence: number;
  index: number;
  topK: Array<{ className: string; confidence: number }>;
  isHealthy: boolean | null;
}

const PLANT_API_BASE_URL =
  process.env.NEXT_PUBLIC_PLANT_API_BASE_URL ?? 'https://codoc-backend0.onrender.com';

export async function analyzeLeaf(file: File): Promise<PlantDiagnosis> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${PLANT_API_BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Plant analysis failed');
  }

  return (await res.json()) as PlantDiagnosis;
}
