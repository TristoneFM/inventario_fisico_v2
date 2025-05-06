import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

export async function POST(request) {
  try {
    const { serial, partNumber, quantity, area, rack, bin } = await request.json();

    // Validate required fields
    if (!serial || !partNumber || !quantity || !area || !rack || !bin) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate quantity is a positive number
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    // Use a transaction to ensure data consistency
    const result = await transaction(async (connection) => {
      // Check if serial already exists
      const [existingSerials] = await connection.execute(
        'SELECT serial FROM captura WHERE serial = ?',
        [serial]
      );

      if (existingSerials.length > 0) {
        throw new Error('Serial number already exists');
      }

      // Insert the captured serial
      const [insertResult] = await connection.execute(
        `INSERT INTO captura 
         (serial, part_number, quantity, area, rack, bin, captured_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [serial, partNumber, quantityNum, area, rack, bin]
      );

      return {
        id: insertResult.insertId,
        serial,
        partNumber,
        quantity: quantityNum,
        area,
        rack,
        bin,
        capturedAt: new Date()
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error capturing serial:', error);
    
    // Handle specific error cases
    if (error.message === 'Serial number already exists') {
      return NextResponse.json(
        { error: 'Serial number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch captured serials for a specific area/rack/bin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const rack = searchParams.get('rack');
    const bin = searchParams.get('bin');

    if (!area || !rack || !bin) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const capturedSerials = await query(
      `SELECT * FROM captura 
       WHERE area = ? AND rack = ? AND bin = ?
       ORDER BY captured_at DESC`,
      [area, rack, bin]
    );

    return NextResponse.json(capturedSerials);
  } catch (error) {
    console.error('Error fetching captured serials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 