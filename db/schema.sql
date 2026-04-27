-- =============================================
-- Bazzventaris Database Schema
-- Database: ventaris
-- =============================================

CREATE DATABASE IF NOT EXISTS ventaris;
USE ventaris;

-- Tabel User
CREATE TABLE IF NOT EXISTS usser (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    no_hp VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Tabel Admin
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    level_akses ENUM('super_admin','admin','operator') DEFAULT 'admin',
    status ENUM('aktif','nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Insert default admin (password: admin123)
-- Hash compatible with bcryptjs ($2b$ prefix)
INSERT IGNORE INTO admin (nama, email, password, level_akses, status)
VALUES ('Admin Utama', 'admin@bazzventaris.ac.id', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin', 'aktif');

-- Tabel Barang
CREATE TABLE IF NOT EXISTS barang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_barang VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(150) NOT NULL,
    jenis VARCHAR(50) NOT NULL,
    tipe VARCHAR(100) DEFAULT NULL,
    deskripsi TEXT,
    kondisi VARCHAR(50) DEFAULT 'Baik',
    status ENUM('tersedia','dipinjam','rusak','maintenance') DEFAULT 'tersedia',
    jumlah INT DEFAULT 1,
    gambar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Seed data barang awal
INSERT IGNORE INTO barang (kode_barang, nama, jenis, tipe, deskripsi, kondisi, status, jumlah, gambar) VALUES
('BRG-001', 'Proyektor Multimedia', 'Elektronik', 'EP-3000', 'Proyektor multimedia untuk presentasi kelas. Resolusi 1080p, koneksi HDMI, daya 3000 lumen.', 'Baik', 'tersedia', 3, 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'),
('BRG-002', 'Laptop Asus', 'Elektronik', 'X509UA', 'Laptop Asus untuk keperluan akademik. Intel Core i5, RAM 8GB, SSD 256GB.', 'Lecet pada casing', 'dipinjam', 5, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'),
('BRG-003', 'Kamera DSLR Canon', 'Elektronik', 'EOS 2000D', 'Kamera DSLR Canon untuk fotografi dan videografi kampus. Sensor 24MP, lensa kit 18-55mm.', 'Lensa lecet', 'rusak', 2, 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80'),
('BRG-004', 'Speaker Portabel', 'Elektronik', 'SP-20W', 'Speaker portabel untuk acara kampus. Bluetooth, baterai 10 jam, output 20W.', 'Batre drop', 'tersedia', 4, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80'),
('BRG-005', 'Meja Kantor', 'Furnitur', 'MK-120', 'Meja kantor ergonomis untuk ruang kerja. Dimensi: 120x60cm, bahan kayu solid.', 'Baik', 'tersedia', 10, 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=400&q=80');

-- Tabel Peminjaman
CREATE TABLE IF NOT EXISTS peminjaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    barang_id INT NOT NULL,
    nim VARCHAR(20) NOT NULL,
    nik VARCHAR(20) DEFAULT NULL,
    nama_peminjam VARCHAR(100) NOT NULL,
    fakultas VARCHAR(100) DEFAULT NULL,
    prodi VARCHAR(100) DEFAULT NULL,
    alamat TEXT DEFAULT NULL,
    ttl VARCHAR(100) DEFAULT NULL,
    jenis_kelamin ENUM('Laki-laki','Perempuan') DEFAULT NULL,
    no_hp VARCHAR(20) DEFAULT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    tanggal_dikembalikan DATE DEFAULT NULL,
    batas_waktu_ambil DATETIME DEFAULT NULL,
    status ENUM('pending','disetujui','ditolak','dipinjam','dikembalikan','reserved','dibatalkan_otomatis') DEFAULT 'reserved',
    catatan_admin TEXT DEFAULT NULL,
    foto_kondisi_awal VARCHAR(255) DEFAULT NULL,
    foto_kondisi_akhir VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usser(id) ON DELETE CASCADE,
    FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Tabel Notifikasi
CREATE TABLE IF NOT EXISTS notifikasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(200) NOT NULL,
    pesan TEXT NOT NULL,
    tipe ENUM('info','sukses','peringatan','ditolak') DEFAULT 'info',
    dibaca TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usser(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
