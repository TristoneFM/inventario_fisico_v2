import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get total materials with storage_unit
    const totalRows = await query(`
      SELECT COUNT(*) as total
      FROM material
      WHERE storage_unit IS NOT NULL
    `);

    // Get captured materials (those that exist in captura table)
    const capturedRows = await query(`
      SELECT COUNT(DISTINCT c.serial) as captured
      FROM captura c
      INNER JOIN material m ON c.serial = m.storage_unit
      WHERE m.storage_unit IS NOT NULL
    `);

    const total = parseInt(totalRows[0].total);
    const captured = parseInt(capturedRows[0].captured);
    const pending = total - captured;

    return NextResponse.json({
      total,
      captured,
      pending,
      percentage: total > 0 ? Math.round((captured / total) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching capture stats:', error);
    return NextResponse.json(
      { error: 'Error fetching capture statistics' },
      { status: 500 }
    );
  }
} 