import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const rack = searchParams.get('rack');

    if (!area || !rack) {
      return NextResponse.json(
        { error: 'Area and rack parameters are required' },
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

    // Fetch distinct storage_bins for the specified area and rack
    const bins = await query(
      `SELECT DISTINCT storage_bin as id, storage_bin as name 
       FROM ubicaciones_conteo 
       WHERE storage_location = ? AND rack = ? 
       ORDER BY storage_bin`,
      [storageLocation, rack]
    );

    return NextResponse.json({ bins });

  } catch (error) {
    console.error('Error fetching bins:', error);
    return NextResponse.json(
      { error: 'Error fetching bins' },
      { status: 500 }
    );
  }
} 