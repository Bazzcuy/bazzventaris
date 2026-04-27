'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CheckCircle2, ClipboardList, Home } from 'lucide-react';


function KonfirmasiContent() {
    const searchParams = useSearchParams();
    const namaBarang = searchParams.get('nama_barang') || 'barang';

    return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="content-card animate-in" style={{ textAlign: 'center', maxWidth: '550px' }}>
                    <div style={{ color: '#5efc82', marginBottom: '1rem' }}><CheckCircle2 size={80} /></div>
                    <h2 style={{ fontWeight: 800, marginBottom: '0.8rem' }}>Peminjaman Berhasil Diajukan!</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Permintaan peminjaman <strong>{namaBarang}</strong> telah berhasil dikirim.
                        Admin akan meninjau dan menyetujui permintaan Anda. Periksa halaman notifikasi untuk update status.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/profil/pinjaman" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={18} /> Lihat Pinjaman</Link>
                        <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Home size={18} /> Kembali ke Beranda</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function KonfirmasiPage() {
    return (
        <Suspense fallback={<div className="page-bg"><Navbar /><div className="page-content"><div className="spinner"></div></div></div>}>
            <KonfirmasiContent />
        </Suspense>
    );
}
