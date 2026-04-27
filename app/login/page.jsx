'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ nama: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (isRegister && form.password !== form.confirmPassword) {
            setError('Password dan Konfirmasi Password tidak cocok!');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isRegister ? 'register' : 'login', ...form }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Terjadi kesalahan');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch {
            setError('Tidak dapat terhubung ke server');
        }
        setLoading(false);
    }

    return (
        <div className="page-bg">
            <Navbar />
            <div className="login-wrapper">
                <div className="auth-card animate-in">
                    <h2>{isRegister ? 'Daftar Akun' : 'Masuk'}</h2>
                    <p className="subtitle">{isRegister ? 'Buat akun baru untuk mulai meminjam' : 'Masuk ke akun Bazzventaris Anda'}</p>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input type="text" placeholder="Masukkan nama lengkap" value={form.nama}
                                    onChange={e => setForm({ ...form, nama: e.target.value })} required />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="Masukkan email" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="Masukkan password" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                        </div>
                        {isRegister && (
                            <div className="form-group">
                                <label>Konfirmasi Password</label>
                                <input type="password" placeholder="Ulangi password" value={form.confirmPassword}
                                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required minLength={6} />
                            </div>
                        )}
                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'Memproses...' : (isRegister ? 'Daftar' : 'Masuk')}
                        </button>
                    </form>

                    <div className="auth-switch">
                        {isRegister ? (
                            <>Sudah punya akun? <a onClick={() => { setIsRegister(false); setError(''); }}>Masuk</a></>
                        ) : (
                            <>Belum punya akun? <a onClick={() => { setIsRegister(true); setError(''); }}>Daftar</a></>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
