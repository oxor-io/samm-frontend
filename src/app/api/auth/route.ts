import { NextResponse } from 'next/server';
import { BASE_URL } from '../config';

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { isOwner } = requestBody;

    let url: string;
    let headers: Record<string, string>;
    let body: string;

    if (isOwner) {
      const { owner_address, samm_address, chain_id, timestamp, signature, name } = requestBody;

      if (!owner_address || !samm_address || !chain_id || !timestamp || !signature) {
        return NextResponse.json(
          { error: 'Missing required fields for owner authentication' },
          { status: 400 }
        );
      }

      url = `${BASE_URL}/token/owner/?owner_address=${owner_address}&samm_address=${samm_address}&chain_id=${chain_id}&timestamp=${timestamp}&signature=${signature}${
        name ? `&name=${name}` : ''
      }`;
      headers = { accept: 'application/json' };
      body = '';
    } else {
      const { username, password } = requestBody;

      if (!username || !password) {
        return NextResponse.json(
          { error: 'Missing required fields for member authentication' },
          { status: 400 }
        );
      }

      url = `${BASE_URL}/token`;
      headers = { accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' };
      const params = new URLSearchParams({
        grant_type: 'password',
        username,
        password,
      });
      body = params.toString();
    }

    const externalResponse = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    const data = await externalResponse.json();

    if (externalResponse.ok && data.access_token) {
      return NextResponse.json(data, { status: 200 });
    } else {
      const errorMessage = isOwner ? 'Owner authentication failed' : 'Member authentication failed';
      return NextResponse.json({ error: errorMessage, details: data }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
