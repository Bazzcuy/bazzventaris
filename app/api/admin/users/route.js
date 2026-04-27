import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
    const session = await getSession();
    if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [rows] = await pool.query('SELECT id, nama, email, no_hp, created_at FROM usser ORDER BY created_at DESC');
    return Response.json(rows);
}

export async function POST(request) {
    const session = await getSession();
    if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    if (body.action === 'create') {
        const { nama, email, password, no_hp } = body;
        const [existing] = await pool.query('SELECT id FROM usser WHERE email = ?', [email]);
        if (existing.length > 0) return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 });

        const hashed = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO usser (nama, email, password, no_hp) VALUES (?,?,?,?)', [nama, email, hashed, no_hp]);
        return Response.json({ success: true });
    }

    if (body.action === 'delete') {
        const [loans] = await pool.query('SELECT id FROM peminjaman WHERE user_id = ? LIMIT 1', [body.id]);
        if (loans.length > 0) {
            return Response.json({ error: 'Tidak dapat menghapus pengguna yang memiliki riwayat peminjaman!' }, { status: 400 });
        }
        await pool.query('DELETE FROM usser WHERE id = ?', [body.id]);
        return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
}
