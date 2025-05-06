import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT estado_auditoria 
       FROM auditoria 
       WHERE id_ubicacion = ?`,
      [id]
    );

    return NextResponse.json({ 
      estado_auditoria: result[0]?.estado_auditoria || 0
    });
  } catch (error) {
    console.error('Error fetching audit status:', error);
    return NextResponse.json(
      { error: 'Error al obtener el estado de auditoría' },
      { status: 500 }
    );
  }
} 