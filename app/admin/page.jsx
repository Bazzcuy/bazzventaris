'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check' }) })
            .then(r => r.json())
            .then(d => {
                if (!d.loggedIn) { router.push('/admin/login'); return; }
                setAdmin(d.admin);
                return fetch('/api/admin/dashboard').then(r => r.json());
            })
            .then(d => { if (d) { setStats(d); setLoading(false); } })
            .catch(() => router.push('/admin/login'));
    }, [router]);

    if (loading) return <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="admin-body">
            <AdminLayout adminName={admin?.name} title="Dashboard">
                <div style={{ padding: '1.5rem' }}>
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="stat-card" style={{ borderLeftColor: '#4e73df' }}>
                                <div className="stat-label" style={{ color: '#4e73df' }}>Total Pengguna</div>
                                <div className="stat-value">{stats.total_users}</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card" style={{ borderLeftColor: '#1cc88a' }}>
                                <div className="stat-label" style={{ color: '#1cc88a' }}>Barang Tersedia</div>
                                <div className="stat-value">{stats.available_items}</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card" style={{ borderLeftColor: '#36b9cc' }}>
                                <div className="stat-label" style={{ color: '#36b9cc' }}>Peminjaman Aktif</div>
                                <div className="stat-value">{stats.active_loans}</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card" style={{ borderLeftColor: '#f6c23e' }}>
                                <div className="stat-label" style={{ color: '#f6c23e' }}>Menunggu Persetujuan</div>
                                <div className="stat-value">{stats.pending_loans}</div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white fw-bold"><i className="bi bi-people me-2"></i>Pengguna Terbaru</div>
                                <div className="card-body p-0">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light"><tr><th>Nama</th><th>Email</th></tr></thead>
                                        <tbody>
                                            {stats.recent_users?.map(u => (
                                                <tr key={u.id}><td>{u.nama}</td><td className="text-muted small">{u.email}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white fw-bold"><i className="bi bi-clipboard-check me-2"></i>Peminjaman Terbaru</div>
                                <div className="card-body p-0">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light"><tr><th>Peminjam</th><th>Barang</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {stats.recent_loans?.map(l => (
                                                <tr key={l.id}>
                                                    <td>{l.nama_user}</td><td>{l.nama_barang}</td>
                                                    <td><span className={`badge bg-${l.status === 'pending' ? 'warning' : l.status === 'disetujui' ? 'success' : 'secondary'}`}>{l.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </div>
    );
}
