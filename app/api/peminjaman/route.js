import supabase from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
    try {
        const session = await getSession();
        if (!session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabase
            .from('peminjaman')
            .select(`
                *,
                barang:barang_id (nama, kode_barang, gambar)
            `)
            .eq('user_id', session.userId);

        if (status) query = query.eq('status', status);
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        // Flatten the join result to match old MySQL structure
        const flattened = data.map(item => ({
            ...item,
            nama_barang: item.barang?.nama,
            kode_barang: item.barang?.kode_barang,
            gambar: item.barang?.gambar
        }));

        return Response.json(flattened);
    } catch (error) {
        console.error('Peminjaman GET Error:', error);
        return Response.json({ error: 'Gagal mengambil data peminjaman' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { barang_id, nim, nik, nama_peminjam, fakultas, prodi, alamat, ttl, jenis_kelamin, no_hp, tanggal_pinjam, tanggal_kembali } = body;

        if (!barang_id || !nim || !nama_peminjam || !tanggal_pinjam || !tanggal_kembali) {
            return Response.json({ error: 'Field wajib belum diisi' }, { status: 400 });
        }

        const tPinjam = new Date(tanggal_pinjam);
        const tKembali = new Date(tanggal_kembali);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (tPinjam < today) return Response.json({ error: 'Tanggal pinjam tidak boleh di masa lalu' }, { status: 400 });
        if (tKembali < tPinjam) return Response.json({ error: 'Tanggal kembali tidak valid' }, { status: 400 });

        // Check availability
        const { data: barang, error: bError } = await supabase.from('barang').select('*').eq('id', barang_id).eq('status', 'tersedia').single();
        if (bError || !barang) return Response.json({ error: 'Barang tidak tersedia' }, { status: 400 });

        // Check stock
        const { data: overlapping } = await supabase
            .from('peminjaman')
            .select('id')
            .eq('barang_id', barang_id)
            .in('status', ['reserved', 'pending', 'disetujui', 'dipinjam'])
            .lte('tanggal_pinjam', tanggal_kembali)
            .gte('tanggal_kembali', tanggal_pinjam);

        if (overlapping && overlapping.length >= barang.jumlah) {
            return Response.json({ error: 'Stok barang pada rentang tanggal tersebut sudah habis dibooking' }, { status: 400 });
        }

        const batasWaktuAmbil = new Date(tanggal_pinjam);
        batasWaktuAmbil.setHours(23, 59, 59, 0);

        // Insert reservation
        const { error: insError } = await supabase.from('peminjaman').insert([{
            user_id: session.userId,
            barang_id, nim, nik, nama_peminjam, fakultas, prodi, alamat, ttl, jenis_kelamin, no_hp,
            tanggal_pinjam, tanggal_kembali,
            batas_waktu_ambil: batasWaktuAmbil.toISOString(),
            status: 'reserved'
        }]);

        if (insError) throw insError;

        // Create notification
        const tglPinjamFormat = new Date(tanggal_pinjam).toLocaleDateString('id-ID');
        await supabase.from('notifikasi').insert([{
            user_id: session.userId,
            judul: 'Barang Berhasil Direservasi',
            pesan: `Harap ambil ${barang.nama} maksimal pada tanggal ${tglPinjamFormat} jam 23:59.`,
            tipe: 'info'
        }]);

        return Response.json({ success: true, message: 'Barang berhasil direservasi.' });
    } catch (error) {
        console.error('Peminjaman POST Error:', error);
        return Response.json({ error: error.message || 'Terjadi kesalahan sistem.' }, { status: 500 });
    }
}
