'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', ...form }),
        });
        const data = await res.json();

        if (!res.ok) setError(data.error || 'Login gagal');
        else router.push('/admin');
        setLoading(false);
    }

    return (
        <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #4e73df, #224abe)' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <i className="bi bi-shield-check" style={{ fontSize: '3rem', color: '#4e73df' }}></i>
                    <h2 style={{ fontWeight: 800, marginTop: '0.8rem', color: '#333' }}>Admin Login</h2>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Bazzventaris Admin Panel</p>
                </div>

                {error && <div className="alert alert-danger" style={{ background: '#fde8e8', color: '#e74a3b', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Email</label>
                        <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="admin@bazzventaris.ac.id" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Password</label>
                        <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading} style={{ background: 'linear-gradient(135deg, #4e73df, #224abe)', border: 'none', padding: '0.7rem' }}>
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
}
