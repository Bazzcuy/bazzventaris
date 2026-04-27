import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const jenis = searchParams.get('jenis');

        if (id) {
            const { data: rows, error } = await supabase.from('barang').select('*').eq('id', id);
            if (error || !rows || rows.length === 0) return Response.json({ error: 'Barang tidak ditemukan' }, { status: 404 });

            // Get booking dates for this item (for calendar feature)
            const { data: bookings } = await supabase
                .from('peminjaman')
                .select('tanggal_pinjam, tanggal_kembali, status')
                .eq('barang_id', id)
                .in('status', ['reserved', 'pending', 'disetujui', 'dipinjam']);

            return Response.json({ ...rows[0], bookings: bookings || [] });
        }

        let query = supabase.from('barang').select('*');

        if (status) query = query.eq('status', status);
        if (jenis) query = query.eq('jenis', jenis);
        if (search) query = query.or(`nama.ilike.%${search}%,kode_barang.ilike.%${search}%`);

        query = query.order('created_at', { ascending: false });
        
        const { data: rows, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        // Get unique types for filtering
        const { data: allJenis } = await supabase.from('barang').select('jenis');
        const jenisList = [...new Set(allJenis?.map(r => r.jenis) || [])].sort();

        return Response.json({ items: rows || [], jenisList });
    } catch (error) {
        console.error('Barang API Error:', error);
        return Response.json({ error: 'Gagal mengambil data barang' }, { status: 500 });
    }
}
