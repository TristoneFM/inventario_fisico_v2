import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  console.log('POST request received');
  try {
    const { 
      serial,
      partNumber,
      materialDescription,
      quantity,
      area,
      rack,
      bin,
      employeeId,
      isObsolete
    } = await request.json();

    // Validate required fields
    if (!serial || !partNumber || !quantity || !area || !rack || !bin || !employeeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get employee name
    const employeeResult = await query(
      'SELECT emp_nombre FROM empleados.del_empleados WHERE emp_id = ?',
      [employeeId]
    );

    if (employeeResult.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Insert into captura table
    const result = await query(
      `INSERT INTO inventario_fisico.captura (
        captura_grupo,
        serial,
        material,
        material_description,
        cantidad,
        ubicacion,
        num_empleado,
        emp_nombre,
        fecha,
        serial_obsoleto,
        rack
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        employeeId,
        serial,
        partNumber,
        materialDescription,
        quantity,
        bin,
        employeeId,
        employeeResult[0].emp_nombre,
        isObsolete ? 1 : 0,
        rack
      ]
    );

    return NextResponse.json({ 
      success: true,
      message: 'Special capture inserted successfully',
      data: {
        id: result.insertId,
        serial,
        material: partNumber,
        material_description: materialDescription,
        cantidad: quantity,
        ubicacion: bin,
        rack
      }
    });

  } catch (error) {
    console.error('Error inserting special capture:', error);
    return NextResponse.json(
      { error: 'Error inserting special capture', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a serial exists
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

    const result = await query(
      'SELECT captura_id, serial, material, material_description, cantidad, ubicacion, rack, fecha FROM inventario_fisico.captura WHERE serial = ?',
      [serial]
    );

    return NextResponse.json({ 
      exists: result.length > 0,
      serial: result[0] || null
    });

  } catch (error) {
    console.error('Error checking serial:', error);
    return NextResponse.json(
      { error: 'Error checking serial' },
      { status: 500 }
    );
  }
} 