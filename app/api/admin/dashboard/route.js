import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) AS total_users FROM usser');
    const [[{ available_items }]] = await pool.query("SELECT COUNT(*) AS available_items FROM barang WHERE status = 'tersedia'");
    const [[{ active_loans }]] = await pool.query("SELECT COUNT(*) AS active_loans FROM peminjaman WHERE status IN ('disetujui','dipinjam')");
    const [[{ pending_loans }]] = await pool.query("SELECT COUNT(*) AS pending_loans FROM peminjaman WHERE status = 'pending'");

    const [recent_users] = await pool.query('SELECT id, nama, email, created_at FROM usser ORDER BY created_at DESC LIMIT 5');
    const [recent_loans] = await pool.query(
        `SELECT p.id, p.status, p.tanggal_pinjam, u.nama AS nama_user, b.nama AS nama_barang 
     FROM peminjaman p JOIN usser u ON p.user_id = u.id JOIN barang b ON p.barang_id = b.id 
     ORDER BY p.created_at DESC LIMIT 5`
    );

    return Response.json({ total_users, available_items, active_loans, pending_loans, recent_users, recent_loans });
}
