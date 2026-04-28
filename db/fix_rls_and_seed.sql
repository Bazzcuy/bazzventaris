-- =============================================
-- FIX: Disable RLS & Insert Seed Data
-- Jalankan ini di Supabase SQL Editor
-- =============================================

-- 1. Disable RLS pada semua tabel
ALTER TABLE usser DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin DISABLE ROW LEVEL SECURITY;
ALTER TABLE barang DISABLE ROW LEVEL SECURITY;
ALTER TABLE peminjaman DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi DISABLE ROW LEVEL SECURITY;

-- 2. Insert default admin (password: admin123)
INSERT INTO admin (nama, email, password, level_akses, status)
VALUES ('Admin Utama', 'admin@bazzventaris.ac.id', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin', 'aktif')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert seed data barang
INSERT INTO barang (kode_barang, nama, jenis, tipe, deskripsi, kondisi, status, jumlah, gambar) VALUES
('BRG-001', 'Proyektor Multimedia', 'Elektronik', 'EP-3000', 'Proyektor multimedia untuk presentasi kelas. Resolusi 1080p, koneksi HDMI, daya 3000 lumen.', 'Baik', 'tersedia', 3, 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'),
('BRG-002', 'Laptop Asus', 'Elektronik', 'X509UA', 'Laptop Asus untuk keperluan akademik. Intel Core i5, RAM 8GB, SSD 256GB.', 'Lecet pada casing', 'dipinjam', 5, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'),
('BRG-003', 'Kamera DSLR Canon', 'Elektronik', 'EOS 2000D', 'Kamera DSLR Canon untuk fotografi dan videografi kampus. Sensor 24MP, lensa kit 18-55mm.', 'Lensa lecet', 'rusak', 2, 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80'),
('BRG-004', 'Speaker Portabel', 'Elektronik', 'SP-20W', 'Speaker portabel untuk acara kampus. Bluetooth, baterai 10 jam, output 20W.', 'Batre drop', 'tersedia', 4, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80'),
('BRG-005', 'Meja Kantor', 'Furnitur', 'MK-120', 'Meja kantor ergonomis untuk ruang kerja. Dimensi: 120x60cm, bahan kayu solid.', 'Baik', 'tersedia', 10, 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=400&q=80')
ON CONFLICT (kode_barang) DO NOTHING;
