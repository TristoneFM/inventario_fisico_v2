import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');

    if (!area) {
      return NextResponse.json(
        { error: 'Area parameter is required' },
        { status: 400 }
      );
    }

    // Map the area parameter to the correct storage_location value in the database
    let storageLocation = area;
    if (area === 'materia-prima') {
      storageLocation = 'mp';
    } else if (area === 'extrusion') {
      storageLocation = 'green';
    }

    // Fetch distinct racks for the specified area (storage_location)
    const racks = await query(
      `SELECT DISTINCT rack as id, rack as name 
       FROM ubicaciones_conteo
       WHERE storage_location = ? 
       ORDER BY rack`,
      [storageLocation]
    );

    return NextResponse.json({ racks });

  } catch (error) {
    console.error('Error fetching racks:', error);
    return NextResponse.json(
      { error: 'Error fetching racks' },
      { status: 500 }
    );
  }
} 