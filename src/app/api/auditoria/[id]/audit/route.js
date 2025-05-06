import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request, { params }) {

  try {
    const { serial, emp_id } = await request.json();
    const { id } = params;

    if (!emp_id) {
      return NextResponse.json(
        { error: 'ID de empleado no proporcionado' },
        { status: 400 }
      );
    }

    // Validate serial format
    if (!serial.match(/^[SsMm]/)) {
      return NextResponse.json(
        { error: 'El serial debe comenzar con S, s, M o m' },
        { status: 400 }
      );
    }

    // Remove the first letter for database check
    const serialWithoutPrefix = serial.substring(1);

    // First verify the serial exists in this rack
    const verifyResult = await query(
      `SELECT 1 FROM captura WHERE serial = ?`,
      [serialWithoutPrefix]
    );

    if (verifyResult.length === 0) {
      return NextResponse.json(
        { error: 'Serial no encontrado en este rack' },
        { status: 404 }
      );
    }

    // Update the audit status
    await query(
      `UPDATE captura 
       SET serial_auditado = 1
       WHERE serial = ?`,
      [serialWithoutPrefix]
    );

    // Check if we need to update the auditoria table
    const progressResult = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN serial_auditado = 1 THEN 1 ELSE 0 END) as audited
       FROM captura 
       WHERE rack = ?`,
      [id]
    );

    const progress = (progressResult[0].audited / progressResult[0].total) * 100;
   

    if (progress >= 10) {
      // Update auditoria table
      await query(
        `UPDATE auditoria 
         SET estado_auditoria = 1,
             emp_id = ?
         WHERE id_ubicacion = ?`,
        [emp_id, id]
      );
    }
    
    return NextResponse.json({ 
      success: true,
      progress,
      completed: progress >= 10
    });
  } catch (error) {
    console.error('Error updating audit status:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el estado de auditoría' },
      { status: 500 }
    );
  }
} 