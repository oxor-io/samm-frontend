import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '../config';

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('authorization');

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized samms' }, { status: 401 });
  }

  try {
    const response = await fetch(`${BASE_URL}/samms/me/`, {
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
    console.error('API call failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const accessToken = request.headers.get('authorization');
  const moduleId = request.nextUrl.searchParams.get('module_id');

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!moduleId) {
    return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BASE_URL}/samms/${moduleId}/`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to delete the module' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('API call failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
