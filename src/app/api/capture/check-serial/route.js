import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serial = searchParams.get('serial');

    if (!serial) {
      return NextResponse.json(
        { error: 'Serial parameter is required' },
        { status: 400 }
      );
    }

    // First check if the serial exists in the material table
    const materialResult = await query(
      'SELECT storage_unit, material, material_description, stock FROM material WHERE storage_unit = ?',
      [serial]
    );

    // Then check if it's already captured
    const capturedResult = await query(
      'SELECT serial FROM captura WHERE serial = ?',
      [serial]
    );

    return NextResponse.json({ 
      exists: materialResult.length > 0,
      isCaptured: capturedResult.length > 0,
      material: materialResult[0] || null,
      message: materialResult.length > 0 
        ? 'Serial encontrado en la base de datos' 
        : 'Serial no encontrado en la base de datos'
    });

  } catch (error) {
    console.error('Error checking serial:', error);
    return NextResponse.json(
      { error: 'Error checking serial' },
      { status: 500 }
    );
  }
} 