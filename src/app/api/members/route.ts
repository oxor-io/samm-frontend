import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '../config';

export async function GET(request: NextRequest) {
  const sammId = request.nextUrl.searchParams.get('samm_id');
  const offset = request.nextUrl.searchParams.get('offset') || '0';
  const limit = request.nextUrl.searchParams.get('limit') || '100';
  const accessToken = request.headers.get('authorization');

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/samms/${sammId}/members/?offset=${offset}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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
    console.error('API call failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sammId = request.nextUrl.searchParams.get('samm_id');
  const accessToken = request.headers.get('authorization');

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestBody = await request.json();
  const { emailsList } = requestBody;

  try {
    const response = await fetch(`${BASE_URL}/samms/${sammId}/members/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(emailsList),
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
    console.error('API call failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
