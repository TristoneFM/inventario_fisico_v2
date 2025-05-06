import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const partNumber = searchParams.get('partNumber');

    if (!partNumber) {
      return NextResponse.json(
        { error: 'El número de parte es requerido' },
        { status: 400 }
      );
    }

    // Check if part number exists in material table
    const result = await query(
      'SELECT material, material_description FROM material WHERE material = ?',
      [partNumber]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'El número de parte no existe en la base de datos' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        material: result[0].material,
        material_description: result[0].material_description
      }
    });

  } catch (error) {
    console.error('Error al verificar número de parte:', error);
    return NextResponse.json(
      { error: 'Error al verificar el número de parte', details: error.message },
      { status: 500 }
    );
  }
} 