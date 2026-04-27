import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
    const session = await getSession();
    if (!session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [rows] = await pool.query('SELECT id, nama, email, no_hp, created_at FROM usser WHERE id = ?', [session.userId]);
    if (rows.length === 0) return Response.json({ error: 'User tidak ditemukan' }, { status: 404 });
    return Response.json(rows[0]);
}

export async function POST(request) {
    const session = await getSession();
    if (!session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { nama, email, no_hp, password_baru } = await request.json();

    // Validasi pencegahan Duplikasi/Pembajakan Akun (Account Hijacking)
    const [existingEmail] = await pool.query('SELECT id FROM usser WHERE email = ? AND id != ?', [email, session.userId]);
    if (existingEmail.length > 0) {
        return Response.json({ error: 'Email sudah digunakan oleh akun lain!' }, { status: 400 });
    }

    let query = 'UPDATE usser SET nama = ?, email = ?, no_hp = ?';
    const params = [nama, email, no_hp];

    if (password_baru && password_baru.length >= 6) {
        const hashed = await bcrypt.hash(password_baru, 10);
        query += ', password = ?';
        params.push(hashed);
    }

    query += ' WHERE id = ?';
    params.push(session.userId);

    await pool.query(query, params);

    // Update session name
    session.userName = nama;
    await session.save();

    return Response.json({ success: true });
}
