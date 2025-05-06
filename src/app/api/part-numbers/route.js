import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');

    let sql = 'SELECT * FROM part_numbers';
    const params = [];

    if (area) {
      sql += ' WHERE area = ?';
      params.push(area);
    }

    sql += ' ORDER BY part_number';

    const partNumbers = await query(sql, params);
    return NextResponse.json(partNumbers);
  } catch (error) {
    console.error('Error fetching part numbers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 