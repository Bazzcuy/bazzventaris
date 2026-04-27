import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
    const session = await getSession();
    if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `SELECT p.*, u.nama AS nama_user, u.email AS email_user, b.nama AS nama_barang, b.kode_barang, b.gambar 
               FROM peminjaman p JOIN usser u ON p.user_id = u.id JOIN barang b ON p.barang_id = b.id`;
    const params = [];

    if (status) { query += ' WHERE p.status = ?'; params.push(status); }
    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);
    return Response.json(rows);
}

export async function POST(request) {
    const session = await getSession();
    if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, id, catatan } = await request.json();

    if (action === 'cancel') {
        const [cek] = await pool.query("SELECT id FROM peminjaman WHERE id = ? AND status = 'reserved'", [id]);
        if (cek.length === 0) return Response.json({ error: 'Hanya pesanan berstatus reserved yang dapat dibatalkan admin!' }, { status: 400 });

        await pool.query("UPDATE peminjaman SET status = 'dibatalkan_otomatis', catatan_admin = ? WHERE id = ?", [catatan || 'Dibatalkan oleh admin secara manual', id]);
        const [[loan]] = await pool.query('SELECT user_id, barang_id FROM peminjaman WHERE id = ?', [id]);
        const [[barang]] = await pool.query('SELECT nama FROM barang WHERE id = ?', [loan.barang_id]);
        await pool.query(
            "INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, 'Reservasi Dibatalkan Admin', ?, 'ditolak')",
            [loan.user_id, `Reservasi ${barang.nama} dibatalkan oleh admin. Alasan: ${catatan || 'Tidak ada keterangan'}`]
        );
        return Response.json({ success: true });
    }

    if (action === 'return') {
        const [cek] = await pool.query("SELECT id FROM peminjaman WHERE id = ? AND status = 'dipinjam'", [id]);
        if (cek.length === 0) return Response.json({ error: 'Barang yang dapat dikembalikan manual oleh admin hanya yang berstatus dipinjam!' }, { status: 400 });

        const now = new Date().toISOString().split('T')[0];
        await pool.query("UPDATE peminjaman SET status = 'dikembalikan', tanggal_dikembalikan = ? WHERE id = ?", [now, id]);
        const [[loan]] = await pool.query('SELECT user_id, barang_id FROM peminjaman WHERE id = ?', [id]);
        // Update barang ke tersedia tidak relevan secara radikal (sama spt aturan approval)
        const [[barang]] = await pool.query('SELECT nama FROM barang WHERE id = ?', [loan.barang_id]);
        await pool.query(
            "INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, 'Barang Dikembalikan', ?, 'sukses')",
            [loan.user_id, `${barang.nama} telah berhasil dikembalikan. Terima kasih!`]
        );
        return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
}
