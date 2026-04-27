'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminManajemenPeminjamanPage() {
    const [loans, setLoans] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('reserved');
    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check' }) })
            .then(r => r.json())
            .then(d => {
                if (!d.loggedIn) { router.push('/admin/login'); return; }
                setAdmin(d.admin);
                loadLoans('reserved');
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

    async function handleAction(action, id) {
        const catatan = action === 'cancel' ? prompt('Alasan pembatalan (opsional):') : null;
        if (action === 'cancel' && catatan === null) return;

        await fetch('/api/admin/peminjaman', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, id, catatan }),
        });
        loadLoans(filterStatus);
    }

    const statusMap = { reserved: 'warning', dipinjam: 'info', dikembalikan: 'success', dibatalkan_otomatis: 'danger', ditolak: 'danger' };

    // Function untuk buka foto di tab baru
    const viewPhoto = (url) => { if (url) window.open(url, '_blank'); else alert('Tidak ada foto bukti yang dilampirkan.'); };

    if (loading) return <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="admin-body">
            <AdminLayout adminName={admin?.name} title="Manajemen Peminjaman">
                <div style={{ padding: '1.5rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex gap-2 flex-wrap">
                            {[
                                { key: '', label: 'Semua Status' },
                                { key: 'reserved', label: 'Belum Diambil' },
                                { key: 'dipinjam', label: 'Sedang Dipinjam' },
                                { key: 'dikembalikan', label: 'Selesai' },
                                { key: 'dibatalkan_otomatis', label: 'Dibatalkan / Kadaluarsa' }
                            ].map(f => (
                                <button key={f.key} className={`btn btn-sm ${filterStatus === f.key ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handleFilter(f.key)}>{f.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body p-0">
                            <table className="table table-hover mb-0">
                                <thead className="table-light"><tr><th>ID</th><th>Peminjam</th><th>Barang</th><th>Tanggal</th><th>Status & Bukti</th><th>Aksi</th></tr></thead>
                                <tbody>
                                    {loans.map(l => (
                                        <tr key={l.id}>
                                            <td>PJ-{String(l.id).padStart(3, '0')}</td>
                                            <td><strong>{l.nama_user}</strong><br /><small className="text-muted">{l.email_user}</small></td>
                                            <td>{l.nama_barang}<br /><small className="text-muted">{l.kode_barang}</small></td>
                                            <td>
                                                <div className="d-flex flex-column text-muted small">
                                                    <span>Pinjam: <b>{new Date(l.tanggal_pinjam).toLocaleDateString('id-ID')}</b></span>
                                                    <span>Kembali: <b>{new Date(l.tanggal_kembali).toLocaleDateString('id-ID')}</b></span>
                                                    {l.status === 'dipinjam' && new Date(l.tanggal_kembali) < new Date(new Date().setHours(0, 0, 0, 0)) && (
                                                        <span className="text-danger fw-bold mt-1"><i className="bi bi-exclamation-triangle"></i> Jatuh Tempo</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${statusMap[l.status] || 'secondary'} mb-2 d-inline-block`}>
                                                    {l.status === 'dibatalkan_otomatis' ? 'Batal Otomatis' : l.status.toUpperCase()}
                                                </span>
                                                <div className="d-flex gap-1 flex-wrap">
                                                    {l.foto_kondisi_awal && <button onClick={() => viewPhoto(l.foto_kondisi_awal)} className="btn btn-outline-info btn-sm py-0 px-1" title="Foto Pengambilan"><i className="bi bi-camera"></i> Ambil</button>}
                                                    {l.foto_kondisi_akhir && <button onClick={() => viewPhoto(l.foto_kondisi_akhir)} className="btn btn-outline-success btn-sm py-0 px-1" title="Foto Pengembalian"><i className="bi bi-camera"></i> Kembali</button>}
                                                </div>
                                            </td>
                                            <td>
                                                {l.status === 'reserved' && (
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleAction('cancel', l.id)} title="Batalkan Reservasi"><i className="bi bi-x-circle"></i> Batalkan</button>
                                                )}
                                                {l.status === 'dipinjam' && (
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleAction('return', l.id)} title="Tandai Dikembalikan (Manual)"><i className="bi bi-arrow-return-left"></i> Paksa Selesai</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {loans.length === 0 && <p className="text-center text-muted py-3">Tidak ada data peminjaman aktif</p>}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </div>
    );
}
