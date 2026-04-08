import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source, first_name, last_name, email, phone, message } = body;

    const res = await query(
      `INSERT INTO leads (source, first_name, last_name, email, phone, message) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [source || 'Ads', first_name, last_name, email, phone, message]
    );

    return NextResponse.json({ success: true, id: res.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error('API Lead Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
