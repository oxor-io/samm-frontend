import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '../../../config';

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('authorization');
  const transactionId = request.nextUrl.searchParams.get('transactionId');

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!transactionId) {
    return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
  }

  try {
    const url = `${BASE_URL}/transactions/${transactionId}/approvals/me/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `External API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching approval proof:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
