import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    // API ini bisa diatur untuk dipanggil setiap jam atau setiap tengah malam (00:01)

    // Keamanan opsional: Pastikan yg manggil adalah cron job service (misal Vercel Cron)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Cari data reservasi yang melewati batas_waktu_ambil
        const [expiredReservations] = await connection.query(`
            SELECT id, user_id, barang_id, nama_peminjam 
            FROM peminjaman 
            WHERE status = 'reserved' AND batas_waktu_ambil < NOW() FOR UPDATE
        `);

        if (expiredReservations.length === 0) {
            await connection.commit();
            return NextResponse.json({ message: 'Tidak ada pesanan yang kadaluarsa.', cancelledCount: 0 });
        }

        // 2. Ubah status menjadi dibatalkan_otomatis
        const expiredIds = expiredReservations.map(res => res.id);

        await connection.query(`
            UPDATE peminjaman 
            SET status = 'dibatalkan_otomatis', catatan_admin = 'Dibatalkan oleh sistem karena melewati batas waktu pengambilan (pukul 23:59 hari H).' 
            WHERE id IN (?)
        `, [expiredIds]);

        // 3. Kirim notifikasi ke setiap users bahwa orderannya dibatalkan
        const notificationValues = expiredReservations.map(res => [
            res.user_id,
            'Reservasi Otomatis Dibatalkan',
            `Pesanan peminjaman Anda atas nama ${res.nama_peminjam} telah dibatalkan oleh sistem karena barang tidak dipindai / diambil melewati tanggal peminjaman.`,
            'peringatan'
        ]);

        if (notificationValues.length > 0) {
            await connection.query(`
                INSERT INTO notifikasi (user_id, judul, pesan, tipe) 
                VALUES ?
            `, [notificationValues]);
        }

        await connection.commit();
        return NextResponse.json({
            message: 'Auto-cancel berhasil dijalankan',
            cancelledCount: expiredReservations.length
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error in Auto-Cancel Cron:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
