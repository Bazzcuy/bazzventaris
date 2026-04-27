'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Edit, Save } from 'lucide-react';

export default function UbahProfilPage() {
    const [form, setForm] = useState({ nama: '', email: '', no_hp: '', password_baru: '', konfirmasi_password: '' });
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/profil').then(r => r.json()).then(d => {
            if (d.error) { router.push('/login'); return; }
            setForm({ nama: d.nama, email: d.email, no_hp: d.no_hp || '', password_baru: '' });
            setLoading(false);
        });
    }, [router]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (form.password_baru && form.password_baru !== form.konfirmasi_password) {
            setMsg({ text: 'Password Baru dan Konfirmasi Password tidak cocok!', type: 'danger' });
            return;
        }
        const res = await fetch('/api/profil', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (res.ok) setMsg({ text: 'Profil berhasil diupdate!', type: 'success' });
        else setMsg({ text: 'Gagal mengupdate profil', type: 'danger' });
    }

    if (loading) return <div className="page-bg"><Navbar /><div className="page-content"><div className="spinner"></div></div></div>;

    return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content page-content-narrow">
                <Link href="/profil" className="btn btn-back animate-in" style={{ marginBottom: '1.5rem' }}>← Kembali</Link>
                <div className="content-card animate-in">
                    <h2 style={{ fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Edit size={28} color="#4A86E8" /> Edit Profil
                    </h2>
                    {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group"><label>Nama</label><input type="text" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required /></div>
                        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                        <div className="form-group"><label>No. HP</label><input type="text" value={form.no_hp} onChange={e => setForm({ ...form, no_hp: e.target.value })} /></div>
                        <div className="form-group"><label>Password Baru (kosongkan jika tidak ingin mengubah)</label><input type="password" value={form.password_baru} onChange={e => setForm({ ...form, password_baru: e.target.value })} minLength={6} placeholder="Minimal 6 karakter" /></div>
                        {form.password_baru && (
                            <div className="form-group"><label>Konfirmasi Password Baru</label><input type="password" value={form.konfirmasi_password} onChange={e => setForm({ ...form, konfirmasi_password: e.target.value })} minLength={6} placeholder="Ulangi password baru" required /></div>
                        )}
                        <button type="submit" className="btn btn-success" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <Save size={18} /> Simpan Perubahan
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
