'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import { formatTanggal } from '@/lib/utils';
import { Camera, RotateCcw, AlertTriangle, PackageOpen, ClipboardList, MessageSquare } from 'lucide-react';

export default function PinjamanPage() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('semua');

    // State untuk Modal & Aksi
    const [actionModal, setActionModal] = useState({ isOpen: false, id: null, action: '', itemName: '' });
    const [fotoUrl, setFotoUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const fetchLoans = () => {
        setLoading(true);
        fetch('/api/peminjaman').then(r => r.json()).then(d => {
            if (d.error) { router.push('/login'); return; }
            setLoans(d);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchLoans();
    }, [router]);

    const openActionModal = (id, action, itemName) => {
        setActionModal({ isOpen: true, id, action, itemName });
        setFotoUrl('');
    };

    const handleActionSubmit = async () => {
        if (!fotoUrl) return alert('URL foto bukti wajib diisi!');
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/peminjaman/${actionModal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: actionModal.action, foto_url: fotoUrl })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                setActionModal({ isOpen: false, id: null, action: '', itemName: '' });
                fetchLoans(); // Refresh data
            } else {
                alert(data.error || 'Terjadi kesalahan.');
            }
        } catch (error) {
            alert('Gagal terhubung ke server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { key: 'semua', label: 'Semua' },
        { key: 'reserved', label: 'Belum Diambil' },
        { key: 'dipinjam', label: 'Aktif Dipinjam' },
        { key: 'dikembalikan', label: 'Selesai' },
        { key: 'dibatalkan_otomatis', label: 'Batal Otomatis' },
    ];

    const filtered = activeTab === 'semua' ? loans : loans.filter(l => l.status === activeTab);

    if (loading) return <div className="page-bg"><Navbar /><div className="page-content"><div className="spinner"></div></div></div>;

    return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content">
                <Link href="/profil" className="btn btn-back animate-in" style={{ marginBottom: '1.5rem' }}>← Kembali</Link>
                <h2 className="animate-in" style={{ fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ClipboardList size={28} color="#4A86E8" /> Pinjaman Anda
                </h2>

                {/* Tabs */}
                <div className="animate-in" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-back'}`}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="empty-state animate-in">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'rgba(255,255,255,0.3)' }}>
                            <PackageOpen size={64} />
                        </div>
                        <p>Belum ada peminjaman</p>
                    </div>
                ) : (
                    filtered.map(loan => {
                        const isOverdue = ['disetujui', 'dipinjam'].includes(loan.status) && new Date(loan.tanggal_kembali) < new Date();
                        const isReserved = loan.status === 'reserved';
                        const isDipinjam = loan.status === 'dipinjam';

                        return (
                            <div key={loan.id} className="content-card animate-in" style={{ marginBottom: '1rem', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {isOverdue && <div className="overdue-banner" style={{ padding: '0.6rem 1rem' }}><span className="icon"><AlertTriangle size={18} /></span><span className="text">Melewati batas pengembalian!</span></div>}

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <img src={loan.gambar || '/foto/bground.jpg'} alt="" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1 }}>
                                        <strong>{loan.nama_barang}</strong> <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>({loan.kode_barang})</span>
                                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
                                            {formatTanggal(loan.tanggal_pinjam)} — {formatTanggal(loan.tanggal_kembali)}
                                        </div>
                                    </div>
                                    <StatusBadge status={loan.status} />
                                </div>

                                {/* Bagian Tombol Call to Action */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    {isReserved && (
                                        <button
                                            onClick={() => openActionModal(loan.id, 'ambil', loan.nama_barang)}
                                            className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <Camera size={16} /> Ambil Barang
                                        </button>
                                    )}
                                    {isDipinjam && (
                                        <button
                                            onClick={() => openActionModal(loan.id, 'kembali', loan.nama_barang)}
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <RotateCcw size={16} /> Kembalikan
                                        </button>
                                    )}
                                </div>

                                {loan.catatan_admin && (
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <MessageSquare size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <span>Admin: {loan.catatan_admin}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal Upload Foto untuk Ambil/Kembali Barang */}
            {actionModal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="content-card" style={{ padding: '2rem', maxWidth: '400px', width: '90%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#fff' }}>
                            {actionModal.action === 'ambil' ? 'Ambil Barang Fisik' : 'Kembalikan Barang Fisik'}
                        </h3>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                            Anda akan melakukan proses **{actionModal.action}** untuk barang <strong>{actionModal.itemName}</strong>.
                            Sebagai bukti fisik, harap sertakan URL / Link foto Anda bersama barang tersebut.
                        </p>

                        <input
                            type="url"
                            placeholder="Contoh: https://imgur.com/foto-bukti.jpg"
                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                            value={fotoUrl}
                            onChange={(e) => setFotoUrl(e.target.value)}
                        />
                        <small style={{ color: 'rgba(255,255,255,0.4)', marginTop: '-0.5rem' }}>*Untuk demonstrasi, Anda bebas mengisi sembarang URL gambar.</small>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-back" onClick={() => setActionModal({ isOpen: false, id: null, action: '', itemName: '' })}>Batal</button>
                            <button className="btn btn-primary" onClick={handleActionSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Memproses...' : 'Kirim Bukti & Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
