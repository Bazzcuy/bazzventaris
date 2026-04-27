'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children, adminName, title }) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path) => pathname === path ? 'active' : '';

    async function handleLogout() {
        await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' }),
        });
        router.push('/admin/login');
    }

    return (
        <div className="d-flex">
            <div className="sidebar">
                <div className="sidebar-heading">
                    <i className="bi bi-shield-check" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.3rem' }}></i>
                    ADMIN PANEL
                </div>
                <div className="nav flex-column">
                    <Link href="/admin" className={`nav-link ${isActive('/admin')}`}>
                        <i className="bi bi-speedometer2"></i><span>Dashboard</span>
                    </Link>
                    <Link href="/admin/data" className={`nav-link ${isActive('/admin/data')}`}>
                        <i className="bi bi-people"></i><span>Data Pengguna</span>
                    </Link>
                    <Link href="/admin/barang" className={`nav-link ${isActive('/admin/barang')}`}>
                        <i className="bi bi-box-seam"></i><span>Daftar Barang</span>
                    </Link>
                    <Link href="/admin/peminjaman" className={`nav-link ${isActive('/admin/peminjaman')}`}>
                        <i className="bi bi-list-check"></i><span>Manajemen Peminjaman</span>
                    </Link>
                    <Link href="/admin/laporan" className={`nav-link ${isActive('/admin/laporan')}`}>
                        <i className="bi bi-clipboard-data"></i><span>Laporan & Riwayat</span>
                    </Link>
                </div>
                <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, padding: '0 1rem' }}>
                    <button onClick={handleLogout} className="nav-link" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.2rem' }}>
                        <i className="bi bi-box-arrow-right"></i><span>Keluar</span>
                    </button>
                </div>
            </div>
            <div id="content-wrapper">
                <div className="topbar">
                    <h1>{title || 'Dashboard'}</h1>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Halo, {adminName || 'Admin'}</span>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
