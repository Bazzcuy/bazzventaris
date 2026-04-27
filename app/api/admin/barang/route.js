import supabase from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase.from('barang').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return Response.json(data);
    } catch (error) {
        return Response.json({ error: 'Gagal mengambil data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { action } = body;

        if (action === 'create') {
            const { kode_barang, nama, jenis, tipe, deskripsi, kondisi, status, jumlah, gambar } = body;
            const validJumlah = Math.max(0, parseInt(jumlah) || 1);
            const { error } = await supabase.from('barang').insert([{
                kode_barang, nama, jenis, tipe, deskripsi, 
                kondisi: kondisi || 'Baik', 
                status: status || 'tersedia', 
                jumlah: validJumlah, 
                gambar
            }]);
            if (error) throw error;
            return Response.json({ success: true });
        }

        if (action === 'update') {
            const { id, kode_barang, nama, jenis, tipe, deskripsi, kondisi, status, jumlah, gambar } = body;
            const validJumlah = Math.max(0, parseInt(jumlah) || 1);
            const { error } = await supabase.from('barang').update({
                kode_barang, nama, jenis, tipe, deskripsi, kondisi, status, 
                jumlah: validJumlah, 
                gambar
            }).eq('id', id);
            if (error) throw error;
            return Response.json({ success: true });
        }

        if (action === 'delete') {
            const { data: loans } = await supabase.from('peminjaman').select('id').eq('barang_id', body.id).limit(1);
            if (loans && loans.length > 0) {
                return Response.json({ error: 'Tidak dapat menghapus barang yang memiliki riwayat peminjaman! Ubah statusnya menjadi "Maintenance" jika tidak lagi digunakan.' }, { status: 400 });
            }
            const { error } = await supabase.from('barang').delete().eq('id', body.id);
            if (error) throw error;
            return Response.json({ success: true });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin Barang API Error:', error);
        return Response.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
    }
}
