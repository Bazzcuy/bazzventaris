'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { formatTanggal } from '@/lib/utils';
import { Bell, BellOff, Info, CheckCircle2, AlertTriangle, XCircle, Check } from 'lucide-react';

export default function NotifikasiPage() {
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/notifikasi').then(r => r.json()).then(d => {
            if (d.error) { router.push('/login'); return; }
            setNotifs(d.notifikasi || []);
            setLoading(false);
        });
    }, [router]);

    async function markAllRead() {
        await fetch('/api/notifikasi', { method: 'POST' });
        setNotifs(notifs.map(n => ({ ...n, dibaca: 1 })));
    }

    const renderTipeIcon = (tipe) => {
        switch (tipe) {
            case 'info': return <Info size={24} color="#3b82f6" />;
            case 'sukses': return <CheckCircle2 size={24} color="#10b981" />;
            case 'peringatan': return <AlertTriangle size={24} color="#f59e0b" />;
            case 'ditolak': return <XCircle size={24} color="#ef4444" />;
            default: return <Info size={24} color="#3b82f6" />;
        }
    };

    if (loading) return <div className="page-bg"><Navbar /><div className="page-content"><div className="spinner"></div></div></div>;

    return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content page-content-narrow">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <Link href="/profil" className="btn btn-back animate-in">← Kembali</Link>
                    {notifs.some(n => !n.dibaca) && (
                        <button className="btn btn-primary animate-in" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={markAllRead}>
                            <Check size={16} /> Tandai semua dibaca
                        </button>
                    )}
                </div>
                <h2 className="animate-in" style={{ fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={28} color="#4A86E8" /> Notifikasi
                </h2>

                {notifs.length === 0 ? (
                    <div className="empty-state animate-in">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'rgba(255,255,255,0.3)' }}>
                            <BellOff size={64} />
                        </div>
                        <p>Belum ada notifikasi</p>
                    </div>
                ) : (
                    notifs.map(n => (
                        <div key={n.id} className="content-card animate-in"
                            style={{ marginBottom: '0.8rem', padding: '1rem 1.2rem', opacity: n.dibaca ? 0.6 : 1, borderLeft: n.dibaca ? 'none' : '3px solid #4A86E8' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ marginTop: '2px' }}>{renderTipeIcon(n.tipe)}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{n.judul}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{n.pesan}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>
                                        {formatTanggal(n.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
