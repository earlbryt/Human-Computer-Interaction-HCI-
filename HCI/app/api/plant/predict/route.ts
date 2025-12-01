import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

const UPSTREAM_BASE = process.env.PLANT_API_BASE_URL ?? 'https://codoc-backend0.onrender.com';

function hasName(value: unknown): value is { name: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as Record<string, unknown>).name === 'string'
  );
}

export async function POST(req: Request) {
  try {
    const inForm = await req.formData();
    const file = inForm.get('file');

    if (!file || !(file instanceof Blob)) {
      return new NextResponse('Missing file', { status: 400 });
    }

    const outForm = new FormData();
    const filename = hasName(file) ? file.name : 'upload.jpg';
    outForm.append('file', file, filename);

    const upstreamRes = await fetch(`${UPSTREAM_BASE}/predict`, {
      method: 'POST',
      body: outForm,
    });

    const contentType = upstreamRes.headers.get('content-type') ?? 'application/json';
    const text = await upstreamRes.text();

    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch (err) {
    console.error('Proxy /api/plant/predict error:', err);
    return new NextResponse('Upstream request failed', { status: 502 });
  }
}
