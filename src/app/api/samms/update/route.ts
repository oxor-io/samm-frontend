import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '../../config';

export async function PATCH(request: NextRequest) {
  const accessToken = request.headers.get('authorization');

  const sammId = request.nextUrl.searchParams.get('samm_id');
  const isActive = request.nextUrl.searchParams.get('is_active') || true;
  const threshold = request.nextUrl.searchParams.get('threshold');
  try {
    const response = await fetch(`${BASE_URL}/samms/${sammId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ threshold, is_active: isActive }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ success: false, error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 });
  }
}
