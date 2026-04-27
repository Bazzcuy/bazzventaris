'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function FormPage() {
    const { id } = useParams();
    const router = useRouter();
    const [item, setItem] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        nim: '', nik: '', nama_peminjam: '', fakultas: '', prodi: '',
        alamat: '', ttl: '', jenis_kelamin: '', no_hp: '',
        tanggal_pinjam: '', tanggal_kembali: '',
    });

    useEffect(() => {
        Promise.all([
            fetch('/api/auth').then(r => r.json()),
            fetch(`/api/barang?id=${id}`).then(r => r.json()),
            fetch('/api/profil').then(r => r.json()).catch(() => null),
        ]).then(([auth, barang, profil]) => {
            if (!auth.loggedIn) { router.push('/login'); return; }
            setUser(auth.user);
            setItem(barang);
            if (profil && !profil.error) {
                setForm(f => ({ ...f, nama_peminjam: profil.nama || '', no_hp: profil.no_hp || '' }));
            }
            setLoading(false);
        });
    }, [id, router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const res = await fetch('/api/peminjaman', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, barang_id: parseInt(id) }),
        });
        const data = await res.json();

        if (!res.ok) {
            setError(data.error || 'Gagal mengajukan peminjaman');
            setSubmitting(false);
        } else {
            router.push(`/konfirmasi?nama_barang=${encodeURIComponent(item?.nama || '')}`);
        }
    }

    function updateForm(key, value) {
        setForm(f => ({ ...f, [key]: value }));
    }

    if (loading) return (
        <div className="page-bg"><Navbar /><div className="page-content"><div className="spinner"></div></div></div>
    );

    return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content page-content-narrow">
                <Link href={`/detail/${id}`} className="btn btn-back animate-in" style={{ marginBottom: '1.5rem' }}>← Kembali</Link>

                <div className="content-card animate-in">
                    <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>📋 Form Peminjaman</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Barang: <strong>{item?.nama}</strong> ({item?.kode_barang})
                    </p>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.2rem' }}>
                            <div className="form-group">
                                <label>NIM *</label>
                                <input type="text" value={form.nim} onChange={e => updateForm('nim', e.target.value)} required placeholder="Contoh: 2201010001" />
                            </div>
                            <div className="form-group">
                                <label>NIK</label>
                                <input type="text" value={form.nik} onChange={e => updateForm('nik', e.target.value)} placeholder="Nomor Induk Kependudukan" />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Nama Lengkap *</label>
                                <input type="text" value={form.nama_peminjam} onChange={e => updateForm('nama_peminjam', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Fakultas</label>
                                <input type="text" value={form.fakultas} onChange={e => updateForm('fakultas', e.target.value)} placeholder="Contoh: Teknik" />
                            </div>
                            <div className="form-group">
                                <label>Program Studi</label>
                                <input type="text" value={form.prodi} onChange={e => updateForm('prodi', e.target.value)} placeholder="Contoh: Informatika" />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Alamat</label>
                                <input type="text" value={form.alamat} onChange={e => updateForm('alamat', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Tempat, Tanggal Lahir</label>
                                <input type="text" value={form.ttl} onChange={e => updateForm('ttl', e.target.value)} placeholder="Contoh: Jakarta, 01 Januari 2000" />
                            </div>
                            <div className="form-group">
                                <label>Jenis Kelamin</label>
                                <select value={form.jenis_kelamin} onChange={e => updateForm('jenis_kelamin', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>No. HP</label>
                                <input type="text" value={form.no_hp} onChange={e => updateForm('no_hp', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Tanggal Pinjam *</label>
                                <input type="date" value={form.tanggal_pinjam} onChange={e => updateForm('tanggal_pinjam', e.target.value)} required
                                    min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Tanggal Kembali *</label>
                                <input type="date" value={form.tanggal_kembali} onChange={e => updateForm('tanggal_kembali', e.target.value)} required
                                    min={form.tanggal_pinjam || new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                            {submitting ? 'Mengirim...' : '✅ Ajukan Peminjaman'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
