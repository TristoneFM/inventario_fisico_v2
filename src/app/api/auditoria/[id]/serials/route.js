import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT DISTINCT serial, material, serial_auditado 
       FROM captura 
       WHERE rack = ? 
       ORDER BY serial`,
      [id]
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching serials:', error);
    return NextResponse.json(
      { error: 'Error fetching serials' },
      { status: 500 }
    );
  }
} 