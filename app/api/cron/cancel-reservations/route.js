import supabase from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // 1. Cari data reservasi yang melewati batas_waktu_ambil
        const now = new Date().toISOString();
        const { data: expiredReservations, error: fetchError } = await supabase
            .from('peminjaman')
            .select('id, user_id, barang_id, nama_peminjam')
            .eq('status', 'reserved')
            .lt('batas_waktu_ambil', now);

        if (fetchError) throw fetchError;

        if (!expiredReservations || expiredReservations.length === 0) {
            return NextResponse.json({ message: 'Tidak ada pesanan yang kadaluarsa.', cancelledCount: 0 });
        }

        // 2. Ubah status menjadi dibatalkan_otomatis
        const expiredIds = expiredReservations.map(res => res.id);

        const { error: updateError } = await supabase
            .from('peminjaman')
            .update({ 
                status: 'dibatalkan_otomatis', 
                catatan_admin: 'Dibatalkan oleh sistem karena melewati batas waktu pengambilan (pukul 23:59 hari H).' 
            })
            .in('id', expiredIds);

        if (updateError) throw updateError;

        // 3. Kirim notifikasi ke setiap users
        const notifications = expiredReservations.map(res => ({
            user_id: res.user_id,
            judul: 'Reservasi Otomatis Dibatalkan',
            pesan: `Pesanan peminjaman Anda atas nama ${res.nama_peminjam} telah dibatalkan oleh sistem karena barang tidak dipindai / diambil melewati tanggal peminjaman.`,
            tipe: 'peringatan'
        }));

        const { error: notifError } = await supabase.from('notifikasi').insert(notifications);
        if (notifError) throw notifError;

        return NextResponse.json({
            message: 'Auto-cancel berhasil dijalankan',
            cancelledCount: expiredReservations.length
        });

    } catch (error) {
        console.error('Error in Auto-Cancel Cron:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
