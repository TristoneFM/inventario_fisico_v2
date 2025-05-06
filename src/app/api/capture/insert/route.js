import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { 
      serial, 
      employeeId, 
      bin, 
      rack,
      area,
      material,
      material_description,
      stock,
      serial_obsoleto
    } = await request.json();

    if (!serial || !employeeId || !bin || !rack || !area || !material || !material_description || stock === undefined) {
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
      `INSERT INTO captura (
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
        material,
        material_description,
        stock,
        bin,
        employeeId,
        employeeResult[0].emp_nombre,
        serial_obsoleto || 0,
        rack
      ]
    );

    return NextResponse.json({ 
      success: true,
      message: 'Capture inserted successfully',
      data: {
        id: result.insertId,
        serial,
        material,
        descripcion: material_description,
        cantidad: stock,
        ubicacion: bin,
        rack
      }
    });

  } catch (error) {
    console.error('Error inserting capture:', error);
    return NextResponse.json(
      { error: 'Error inserting capture', details: error.message },
      { status: 500 }
    );
  }
} 