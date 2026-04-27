import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
    const session = await getSession();
    if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `SELECT p.*, u.nama AS nama_user, u.email AS email_user, b.nama AS nama_barang, b.kode_barang
               FROM peminjaman p JOIN usser u ON p.user_id = u.id JOIN barang b ON p.barang_id = b.id`;
    const params = [];

    if (status) { query += ' WHERE p.status = ?'; params.push(status); }
    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);

    // Escaping helper untuk CSV (mengganti " menjadi "" dan mencegah CSV Injection seperti `=cmd|' /C ...`)
    const esc = (str) => {
        let clean = String(str || '').replace(/"/g, '""');
        if (/^[=@+\-]/.test(clean)) clean = "'" + clean;
        return `"${clean}"`;
    };

    let csv = 'ID,Peminjam,Email,Barang,Kode Barang,NIM,Tanggal Pinjam,Tanggal Kembali,Status,Catatan Admin\n';
    rows.forEach(r => {
        csv += `PJ-${String(r.id).padStart(3, '0')},`;
        csv += `${esc(r.nama_peminjam)},`;
        csv += `${esc(r.email_user)},`;
        csv += `${esc(r.nama_barang)},`;
        csv += `${esc(r.kode_barang)},`;
        csv += `${esc(r.nim)},`;
        csv += `${esc(r.tanggal_pinjam)},`;
        csv += `${esc(r.tanggal_kembali)},`;
        csv += `${esc(r.status)},`;
        csv += `${esc(r.catatan_admin)}\n`;
    });

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="laporan_peminjaman_${new Date().toISOString().split('T')[0]}.csv"`,
        },
    });
}
