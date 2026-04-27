import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request, { params }) {
    const session = await getSession();
    if (!session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const peminjamanId = params.id;
    const body = await request.json();

    // action: "ambil" atau "kembali"
    // foto_url: URL dari foto (klien web idealnya meng-upload lewat API utilitas lalu mengirimkan URL - atau ini bisa base64 string jika database support tipe text tapi lebih baik URL/Path file)
    const { action, foto_url } = body;

    if (!action || !foto_url) {
        return Response.json({ error: 'Action dan foto bukti wajib disertakan!' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Cari data peminjaman milik user ini
        const [peminjaman] = await connection.query(
            `SELECT p.*, b.nama AS nama_barang 
             FROM peminjaman p 
             JOIN barang b ON p.barang_id = b.id 
             WHERE p.id = ? AND p.user_id = ? FOR UPDATE`,
            [peminjamanId, session.userId]
        );

        if (peminjaman.length === 0) {
            throw new Error('Data peminjaman tidak ditemukan atau Anda tidak berhak atas data ini.');
        }

        const currentData = peminjaman[0];

        if (action === 'ambil') {
            // Validasi: Harus status "reserved"
            if (currentData.status !== 'reserved') {
                throw new Error(`Gagal mengambil. Status pesanan saat ini: ${currentData.status}`);
            }

            // Ubah status jadi dipinjam & set foto bukti awal
            await connection.query(
                `UPDATE peminjaman 
                 SET status = 'dipinjam', foto_kondisi_awal = ? 
                 WHERE id = ?`,
                [foto_url, peminjamanId]
            );

            // Tambahkan notifikasi pengingat kembali
            await connection.query(
                `INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, ?, ?, 'sukses')`,
                [session.userId, 'Barang Diambil', `Anda telah berhasil mengambil barang ${currentData.nama_barang}. Harap kembalikan barang paling lambat ${new Date(currentData.tanggal_kembali).toLocaleDateString('id-ID')}`]
            );

        } else if (action === 'kembali') {
            // Validasi: Harus status "dipinjam"
            if (currentData.status !== 'dipinjam') {
                throw new Error(`Gagal mengembalikan. Barang ini tidak sedang Anda pinjam. Status: ${currentData.status}`);
            }

            // Ubah status jadi dikembalikan, set tgl kembalikan & set foto bukti akhir
            const tglKembali = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
            await connection.query(
                `UPDATE peminjaman 
                 SET status = 'dikembalikan', tanggal_dikembalikan = ?, foto_kondisi_akhir = ? 
                 WHERE id = ?`,
                [tglKembali, foto_url, peminjamanId]
            );

            // Beri notif berhasil dikembalikan
            await connection.query(
                `INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, ?, ?, 'sukses')`,
                [session.userId, 'Barang Dikembalikan', `Terima kasih!. Anda telah mengembalikan barang ${currentData.nama_barang}.`]
            );

        } else {
            throw new Error('Aksi tidak valid!');
        }

        await connection.commit();
        return Response.json({ success: true, message: `Proses ${action} barang berhasil dicatat!` });

    } catch (error) {
        await connection.rollback();
        return Response.json({ error: error.message }, { status: 400 });
    } finally {
        connection.release();
    }
}
