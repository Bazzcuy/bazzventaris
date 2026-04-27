import supabase from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getSession();
        if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabase
            .from('peminjaman')
            .select(`
                *,
                usser:user_id (nama, email),
                barang:barang_id (nama, kode_barang)
            `);

        if (status) query = query.eq('status', status);
        query = query.order('created_at', { ascending: false });

        const { data: rows, error } = await query;
        if (error) throw error;

        // Escaping helper untuk CSV
        const esc = (str) => {
            let clean = String(str || '').replace(/"/g, '""');
            if (/^[=@+\-]/.test(clean)) clean = "'" + clean;
            return `"${clean}"`;
        };

        let csv = 'ID,Peminjam,Email,Barang,Kode Barang,NIM,Tanggal Pinjam,Tanggal Kembali,Status,Catatan Admin\n';
        rows.forEach(r => {
            csv += `PJ-${String(r.id).padStart(3, '0')},`;
            csv += `${esc(r.nama_peminjam)},`;
            csv += `${esc(r.usser?.email)},`;
            csv += `${esc(r.barang?.nama)},`;
            csv += `${esc(r.barang?.kode_barang)},`;
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
    } catch (error) {
        console.error('Export API Error:', error);
        return Response.json({ error: 'Gagal mengekspor data' }, { status: 500 });
    }
}
