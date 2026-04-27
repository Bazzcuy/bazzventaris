'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { formatTanggal } from '@/lib/utils';
import { Mail, Phone, Bell, ClipboardList, Edit, LogOut, AlertTriangle, User } from 'lucide-react';

export default function ProfilPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ unread: 0, active: 0 });
    const [overdueLoans, setOverdueLoans] = useState([]);
    const router = useRouter();

    useEffect(() => {
        Promise.all([
            fetch('/api/profil').then(r => r.json()),
            fetch('/api/notifikasi').then(r => r.json()),
            fetch('/api/peminjaman').then(r => r.json()),
        ]).then(([profil, notifs, loans]) => {
            if (profil.error) { router.push('/login'); return; }
            setUser(profil);
            setStats({
                unread: notifs.unread || 0,
                active: Array.isArray(loans) ? loans.filter(l => ['disetujui', 'dipinjam'].includes(l.status)).length : 0,
            });
            // Check overdue
            const now = new Date();
            const overdue = Array.isArray(loans)
                ? loans.filter(l => ['disetujui', 'dipinjam'].includes(l.status) && new Date(l.tanggal_kembali) < now)
                : [];
            setOverdueLoans(overdue);
            setLoading(false);
        }).catch(() => { router.push('/login'); });
    }, [router]);

    async function handleLogout() {
        await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
        router.push('/');
        router.refresh();
    }

    if (loading) return <div className="page-bg"><Navbar /><div className="page-content"><div className="spinner"></div></div></div>;

    return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content page-content-narrow">
                <div className="content-card animate-in" style={{ textAlign: 'center' }}>
                    <img src="/foto/profile.png" alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem', border: '3px solid #4A86E8' }} />
                    <h2 style={{ fontWeight: 800, marginBottom: '0.3rem' }}>{user?.nama}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '2rem' }}>{user?.email}</p>

                    {/* Overdue Alert (NEW FEATURE) */}
                    {overdueLoans.length > 0 && (
                        <div className="overdue-banner">
                            <div className="icon"><AlertTriangle size={20} /></div>
                            <div className="text">
                                <strong>{overdueLoans.length} barang melewati batas pengembalian!</strong><br />
                                {overdueLoans.map(l => l.nama_barang).join(', ')} — Segera kembalikan.
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="profile-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> Email</h3>
                            <p>{user?.email}</p>
                        </div>
                        <div className="profile-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> No. HP</h3>
                            <p>{user?.no_hp || '-'}</p>
                        </div>
                        <div className="profile-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Bell size={14} /> Notifikasi</h3>
                            <p>{stats.unread} belum dibaca</p>
                        </div>
                        <div className="profile-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={14} /> Pinjaman Aktif</h3>
                            <p>{stats.active} barang</p>
                        </div>
                    </div>

                    <div className="menu-buttons">
                        <Link href="/profil/notifikasi" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={16} /> Notifikasi
                        </Link>
                        <Link href="/profil/ubah" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Edit size={16} /> Edit Profil
                        </Link>
                        <Link href="/profil/pinjaman" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <ClipboardList size={16} /> Pinjaman Anda
                        </Link>
                        <button onClick={handleLogout} className="btn btn-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <LogOut size={16} /> Keluar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
