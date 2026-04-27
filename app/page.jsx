'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone, Package, Search, ClipboardCheck, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch('/api/auth').then(r => r.json()).then(d => {
            if (d.loggedIn) {
                setUser(d.user);
                // Fetch user stats
                Promise.all([
                    fetch('/api/peminjaman').then(r => r.json()),
                    fetch('/api/notifikasi').then(r => r.json()),
                ]).then(([loans, notifs]) => {
                    const active = Array.isArray(loans) ? loans.filter(l => ['disetujui', 'dipinjam', 'pending'].includes(l.status)).length : 0;
                    const total = Array.isArray(loans) ? loans.length : 0;
                    setStats({ active, total, unread: notifs.unread || 0 });
                });
            }
        }).catch(() => { });
    }, []);

    return (
        <>
            <Navbar />

            {/* Hero */}
            <section className="hero">
                <div className="animate-in">
                    <h1>Selamat datang di<br /><span>Bazzventaris</span></h1>
                    <p>Sistem peminjaman dan pengelolaan barang inventaris kampus Universitas Muhammadiyah Palembang. Mudah, cepat, dan transparan.</p>
                    <div className="hero-buttons">
                        <Link href="/barang" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Package size={18} /> Lihat Barang
                        </Link>
                        {!user && <Link href="/login" className="btn btn-outline">Daftar Akun</Link>}
                    </div>
                </div>

                {/* User Stats (NEW FEATURE) */}
                {user && stats && (
                    <div className="user-stats animate-in" style={{ marginTop: '3rem', width: '100%', maxWidth: '700px' }}>
                        <div className="user-stat-card">
                            <div className="stat-num">{stats.total}</div>
                            <div className="stat-label">Total Peminjaman</div>
                        </div>
                        <div className="user-stat-card">
                            <div className="stat-num">{stats.active}</div>
                            <div className="stat-label">Peminjaman Aktif</div>
                        </div>
                        <div className="user-stat-card">
                            <div className="stat-num">{stats.unread}</div>
                            <div className="stat-label">Notifikasi Baru</div>
                        </div>
                    </div>
                )}
            </section>

            {/* About */}
            <section className="section-white" id="about">
                <div className="section-container">
                    <h2 className="section-title">Tentang <span>Kami</span></h2>
                    <div className="about-grid">
                        <div className="about-text">
                            <p><strong>Bazzventaris</strong> adalah sistem manajemen inventaris digital untuk Universitas Muhammadiyah Palembang. Kami menyediakan platform yang efisien dan transparan untuk pengelolaan barang kampus.</p>
                            <p>Dengan Bazzventaris, proses peminjaman menjadi lebih mudah, terstruktur, dan tercatat dengan baik. Setiap peminjaman terlacak dari pengajuan hingga pengembalian.</p>
                        </div>
                        <div className="about-image">
                            <img src="/foto/bground.jpg" alt="Bazzventaris" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Cara Kerja (NEW UX SECTION) */}
            <section className="section-gray" id="cara-kerja">
                <div className="section-container" style={{ background: 'transparent', boxShadow: 'none' }}>
                    <h2 className="section-title">Alur <span>Peminjaman</span></h2>
                    <p style={{ textAlign: 'center', marginBottom: '3rem', color: '#666' }}>Panduan singkat untuk mahasiswa Universitas Muhammadiyah Palembang</p>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon"><Search size={28} /></div>
                            <h3>1. Cari Barang</h3>
                            <p>Temukan barang yang kamu butuhkan di halaman daftar barang.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon"><ClipboardCheck size={28} /></div>
                            <h3>2. Ajukan Pinjaman</h3>
                            <p>Isi form peminjaman dengan data valid dan tunggu persetujuan admin.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon"><Package size={28} /></div>
                            <h3>3. Ambil & Kembalikan</h3>
                            <p>Ambil barang di ruang inventaris dan kembalikan tepat waktu!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="section-white" id="contact" style={{ paddingTop: 0 }}>
                <div className="section-container">
                    <h2 className="section-title">Kontak <span>Kami</span></h2>
                    <div className="contact-grid">
                        <div className="contact-info">
                            <h3>Hubungi Kami</h3>
                            <div className="contact-item">
                                <div className="contact-icon"><MapPin size={20} /></div>
                                <span>Jl. Jend. Ahmad Yani, 13 Ulu, Palembang</span>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon"><Mail size={20} /></div>
                                <span>inventaris@ump.ac.id</span>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon"><Phone size={20} /></div>
                                <span>(0711) 513022</span>
                            </div>
                        </div>
                        <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Pesan terkirim!'); }}>
                            <input type="text" placeholder="Nama Anda" required />
                            <input type="email" placeholder="Email Anda" required />
                            <textarea rows="4" placeholder="Pesan Anda" required></textarea>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Kirim Pesan</button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
