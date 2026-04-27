'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminLaporanPage() {
    const [loans, setLoans] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check' }) })
            .then(r => r.json())
            .then(d => {
                if (!d.loggedIn) { router.push('/admin/login'); return; }
                setAdmin(d.admin);
                loadLoans();
            });
    }, [router]);

    async function loadLoans(status) {
        const params = status ? `?status=${status}` : '';
        const res = await fetch(`/api/admin/peminjaman${params}`);
        setLoans(await res.json());
        setLoading(false);
    }

    function handleFilter(status) {
        setFilterStatus(status);
        setLoading(true);
        loadLoans(status);
    }

    function exportCSV() {
        const params = filterStatus ? `?status=${filterStatus}` : '';
        window.open(`/api/admin/export${params}`, '_blank');
    }

    const statusMap = { pending: 'warning', disetujui: 'success', ditolak: 'danger', dipinjam: 'info', dikembalikan: 'secondary' };

    if (loading) return <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="admin-body">
            <AdminLayout adminName={admin?.name} title="Laporan & Riwayat Peminjaman">
                <div style={{ padding: '1.5rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex gap-2 flex-wrap">
                            {[{ key: '', label: 'Semua Status' }, { key: 'dikembalikan', label: 'Dikembalikan' }, { key: 'ditolak', label: 'Ditolak' }].map(f => (
                                <button key={f.key} className={`btn btn-sm ${filterStatus === f.key ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handleFilter(f.key)}>{f.label}</button>
                            ))}
                        </div>
                        <button className="btn btn-success btn-sm" onClick={exportCSV}>
                            <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
                        </button>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body p-0">
                            <table className="table table-hover mb-0">
                                <thead className="table-light"><tr><th>ID</th><th>Peminjam</th><th>Barang</th><th>Tgl Pinjam</th><th>Tgl Kembali</th><th>Status</th></tr></thead>
                                <tbody>
                                    {loans.map(l => (
                                        <tr key={l.id}>
                                            <td>PJ-{String(l.id).padStart(3, '0')}</td>
                                            <td><strong>{l.nama_user}</strong><br /><small className="text-muted">{l.email_user}</small></td>
                                            <td>{l.nama_barang}<br /><small className="text-muted">{l.kode_barang}</small></td>
                                            <td>{new Date(l.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                                            <td>{new Date(l.tanggal_kembali).toLocaleDateString('id-ID')}</td>
                                            <td><span className={`badge bg-${statusMap[l.status] || 'secondary'}`}>{l.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {loans.length === 0 && <p className="text-center text-muted py-3">Tidak ada riwayat peminjaman</p>}
                        </div>
                    </div>
                </div>
            </AdminLayout >
        </div >
    );
}
