-- =============================================
-- Bazzventaris Database Schema (PostgreSQL/Supabase)
-- =============================================

-- Types for Enums
DO $$ BEGIN
    CREATE TYPE user_level AS ENUM('super_admin','admin','operator');
    CREATE TYPE user_status AS ENUM('aktif','nonaktif');
    CREATE TYPE item_status AS ENUM('tersedia','dipinjam','rusak','maintenance');
    CREATE TYPE loan_status AS ENUM('pending','disetujui','ditolak','dipinjam','dikembalikan','reserved','dibatalkan_otomatis');
    CREATE TYPE gender_type AS ENUM('Laki-laki','Perempuan');
    CREATE TYPE notif_type AS ENUM('info','sukses','peringatan','ditolak');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabel User
CREATE TABLE IF NOT EXISTS usser (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    no_hp VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Admin
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    level_akses user_level DEFAULT 'admin',
    status user_status DEFAULT 'aktif',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin (password: admin123)
INSERT INTO admin (nama, email, password, level_akses, status)
VALUES ('Admin Utama', 'admin@bazzventaris.ac.id', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin', 'aktif')
ON CONFLICT (email) DO NOTHING;

-- Tabel Barang
CREATE TABLE IF NOT EXISTS barang (
    id SERIAL PRIMARY KEY,
    kode_barang VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(150) NOT NULL,
    jenis VARCHAR(50) NOT NULL,
    tipe VARCHAR(100) DEFAULT NULL,
    deskripsi TEXT,
    kondisi VARCHAR(50) DEFAULT 'Baik',
    status item_status DEFAULT 'tersedia',
    jumlah INT DEFAULT 1,
    gambar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data barang awal
INSERT INTO barang (kode_barang, nama, jenis, tipe, deskripsi, kondisi, status, jumlah, gambar) VALUES
('BRG-001', 'Proyektor Multimedia', 'Elektronik', 'EP-3000', 'Proyektor multimedia untuk presentasi kelas. Resolusi 1080p, koneksi HDMI, daya 3000 lumen.', 'Baik', 'tersedia', 3, 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'),
('BRG-002', 'Laptop Asus', 'Elektronik', 'X509UA', 'Laptop Asus untuk keperluan akademik. Intel Core i5, RAM 8GB, SSD 256GB.', 'Lecet pada casing', 'dipinjam', 5, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'),
('BRG-003', 'Kamera DSLR Canon', 'Elektronik', 'EOS 2000D', 'Kamera DSLR Canon untuk fotografi dan videografi kampus. Sensor 24MP, lensa kit 18-55mm.', 'Lensa lecet', 'rusak', 2, 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80'),
('BRG-004', 'Speaker Portabel', 'Elektronik', 'SP-20W', 'Speaker portabel untuk acara kampus. Bluetooth, baterai 10 jam, output 20W.', 'Batre drop', 'tersedia', 4, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80'),
('BRG-005', 'Meja Kantor', 'Furnitur', 'MK-120', 'Meja kantor ergonomis untuk ruang kerja. Dimensi: 120x60cm, bahan kayu solid.', 'Baik', 'tersedia', 10, 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=400&q=80')
ON CONFLICT (kode_barang) DO NOTHING;

-- Tabel Peminjaman
CREATE TABLE IF NOT EXISTS peminjaman (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    barang_id INT NOT NULL,
    nim VARCHAR(20) NOT NULL,
    nik VARCHAR(20) DEFAULT NULL,
    nama_peminjam VARCHAR(100) NOT NULL,
    fakultas VARCHAR(100) DEFAULT NULL,
    prodi VARCHAR(100) DEFAULT NULL,
    alamat TEXT DEFAULT NULL,
    ttl VARCHAR(100) DEFAULT NULL,
    jenis_kelamin gender_type DEFAULT NULL,
    no_hp VARCHAR(20) DEFAULT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    tanggal_dikembalikan DATE DEFAULT NULL,
    batas_waktu_ambil TIMESTAMPTZ DEFAULT NULL,
    status loan_status DEFAULT 'reserved',
    catatan_admin TEXT DEFAULT NULL,
    foto_kondisi_awal VARCHAR(255) DEFAULT NULL,
    foto_kondisi_akhir VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES usser(id) ON DELETE CASCADE,
    FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE
);

-- Tabel Notifikasi
CREATE TABLE IF NOT EXISTS notifikasi (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(200) NOT NULL,
    pesan TEXT NOT NULL,
    tipe notif_type DEFAULT 'info',
    dibaca BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES usser(id) ON DELETE CASCADE
);
