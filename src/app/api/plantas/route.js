import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get unique plantas from ubicaciones_conteo
    const result = await query(
      'SELECT DISTINCT planta FROM ubicaciones_conteo WHERE planta IS NOT NULL ORDER BY planta',
      []
    );

    const plantas = result.map(row => row.planta);

    return NextResponse.json({
      success: true,
      data: plantas
    });

  } catch (error) {
    console.error('Error fetching plantas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener las plantas', details: error.message },
      { status: 500 }
    );
  }
}
