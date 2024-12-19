import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '../config';

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('authorization');
  const sammId = request.nextUrl.searchParams.get('sammId');
  const status = request.nextUrl.searchParams.get('status');
  const offset = request.nextUrl.searchParams.get('offset') || '0';
  const limit = request.nextUrl.searchParams.get('limit') || '100';

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!sammId) {
    return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
  }

  try {
    const statusOption = status ? `status=${encodeURIComponent(status)}&` : '';
    const url = `${BASE_URL}/samms/${sammId}/transactions/?${statusOption}offset=${offset}&limit=${limit}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch transactions' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
