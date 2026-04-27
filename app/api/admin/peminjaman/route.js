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
                barang:barang_id (nama, kode_barang, gambar)
            `);

        if (status) query = query.eq('status', status);
        query = query.order('created_at', { ascending: false });

        const { data: rows, error } = await query;
        if (error) throw error;

        // Flatten data to match old MySQL structure
        const flattened = rows.map(r => ({
            ...r,
            nama_user: r.usser?.nama,
            email_user: r.usser?.email,
            nama_barang: r.barang?.nama,
            kode_barang: r.barang?.kode_barang,
            gambar: r.barang?.gambar
        }));

        return Response.json(flattened);
    } catch (error) {
        console.error('Admin Peminjaman GET Error:', error);
        return Response.json({ error: 'Gagal mengambil data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { action, id, catatan } = await request.json();

        if (action === 'cancel') {
            const { data: loan, error: fetchError } = await supabase
                .from('peminjaman')
                .select('*, barang:barang_id(nama)')
                .eq('id', id)
                .eq('status', 'reserved')
                .single();

            if (fetchError || !loan) return Response.json({ error: 'Hanya pesanan berstatus reserved yang dapat dibatalkan admin!' }, { status: 400 });

            await supabase
                .from('peminjaman')
                .update({ status: 'dibatalkan_otomatis', catatan_admin: catatan || 'Dibatalkan oleh admin secara manual' })
                .eq('id', id);

            await supabase.from('notifikasi').insert([{
                user_id: loan.user_id,
                judul: 'Reservasi Dibatalkan Admin',
                pesan: `Reservasi ${loan.barang?.nama} dibatalkan oleh admin. Alasan: ${catatan || 'Tidak ada keterangan'}`,
                tipe: 'ditolak'
            }]);

            return Response.json({ success: true });
        }

        if (action === 'return') {
            const { data: loan, error: fetchError } = await supabase
                .from('peminjaman')
                .select('*, barang:barang_id(nama)')
                .eq('id', id)
                .eq('status', 'dipinjam')
                .single();

            if (fetchError || !loan) return Response.json({ error: 'Barang yang dapat dikembalikan manual oleh admin hanya yang berstatus dipinjam!' }, { status: 400 });

            const now = new Date().toISOString().split('T')[0];
            await supabase
                .from('peminjaman')
                .update({ status: 'dikembalikan', tanggal_dikembalikan: now })
                .eq('id', id);

            await supabase.from('notifikasi').insert([{
                user_id: loan.user_id,
                judul: 'Barang Dikembalikan',
                pesan: `${loan.barang?.nama} telah berhasil dikembalikan. Terima kasih!`,
                tipe: 'sukses'
            }]);

            return Response.json({ success: true });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin Peminjaman POST Error:', error);
        return Response.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
    }
}
