import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided for insertion' },
        { status: 400 }
      );
    }

    // Get employee name for the first item (assuming all items have the same employeeId)
    const employeeResult = await query(
      'SELECT emp_nombre FROM empleados.del_empleados WHERE emp_id = ?',
      [items[0].employeeId]
    );

    if (employeeResult.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Prepare the bulk insert query
    const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)').join(',');
    const values = items.flatMap(item => [
      item.employeeId,
      item.serial,
      item.material,
      item.material_description,
      item.stock,
      item.bin,
      item.employeeId,
      employeeResult[0].emp_nombre,
      item.serial_obsoleto || 0,
      item.rack
    ]);

    // Execute bulk insert
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
      ) VALUES ${placeholders}`,
      values
    );

    // Check if rack exists in auditoria table
    const auditoriaResult = await query(
      'SELECT id_ubicacion FROM auditoria WHERE id_ubicacion = ?',
      [items[0].rack]
    );

    if (auditoriaResult.length > 0) {
      // Update existing record
      await query(
        'UPDATE auditoria SET estado_auditoria = 0 WHERE id_ubicacion = ?',
        [items[0].rack]
      );
    } else {
      // Insert new record
      await query(
        `INSERT INTO auditoria (
          id_ubicacion,
          ubicacion,
          area_ubicacion,
          emp_id,
          estado_auditoria
        ) VALUES (?, ?, ?, NULL, 0)`,
        [items[0].rack, items[0].bin, items[0].area]
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Captures inserted successfully',
      data: {
        insertedCount: items.length
      }
    });

  } catch (error) {
    console.error('Error inserting captures:', error);
    return NextResponse.json(
      { error: 'Error inserting captures', details: error.message },
      { status: 500 }
    );
  }
} 