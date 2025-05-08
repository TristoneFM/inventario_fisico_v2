import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get total tickets from talones table
    const totalRows = await query(`
      SELECT SUM(totales) as total
      FROM talones
    `);

    // Get captured tickets (where captura_grupo is null)
    const capturedRows = await query(`
      SELECT COUNT(DISTINCT serial) as captured
      FROM captura
      WHERE captura_grupo IS NULL
    `);

    const total = parseInt(totalRows[0].total) || 0;
    const captured = parseInt(capturedRows[0].captured) || 0;
    const pending = total - captured;

    return NextResponse.json({
      total,
      captured,
      pending,
      percentage: total > 0 ? Math.round((captured / total) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return NextResponse.json(
      { error: 'Error fetching ticket statistics' },
      { status: 500 }
    );
  }
} 