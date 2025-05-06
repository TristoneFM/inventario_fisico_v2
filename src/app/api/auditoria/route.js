import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT DISTINCT id_ubicacion, area_ubicacion, estado_auditoria
      FROM auditoria 
      ORDER BY area_ubicacion, id_ubicacion
    `);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching auditoria data:', error);
    return NextResponse.json(
      { error: 'Error fetching auditoria data' },
      { status: 500 }
    );
  }
} 