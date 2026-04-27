'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDataPage() {
    const [users, setUsers] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ nama: '', email: '', password: '', no_hp: '' });
    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check' }) })
            .then(r => r.json())
            .then(d => {
                if (!d.loggedIn) { router.push('/admin/login'); return; }
                setAdmin(d.admin);
                loadUsers();
            });
    }, [router]);

    async function loadUsers() {
        const res = await fetch('/api/admin/users');
        setUsers(await res.json());
        setLoading(false);
    }

    async function addUser(e) {
        e.preventDefault();
        const res = await fetch('/api/admin/users', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', ...newUser }),
        });
        if (res.ok) { setShowModal(false); setNewUser({ nama: '', email: '', password: '', no_hp: '' }); loadUsers(); }
        else { const d = await res.json(); alert(d.error); }
    }

    async function deleteUser(id) {
        if (!confirm('Yakin ingin menghapus user ini?')) return;
        await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
        loadUsers();
    }

    if (loading) return <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="admin-body">
            <AdminLayout adminName={admin?.name} title="Data Pengguna">
                <div style={{ padding: '1.5rem' }}>
                    <div className="d-flex justify-content-end mb-3">
                        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                            <i className="bi bi-plus-lg me-1"></i> Tambah User
                        </button>
                    </div>
                    <div className="card shadow-sm">
                        <div className="card-body p-0">
                            <table className="table table-hover mb-0">
                                <thead className="table-light"><tr><th>#</th><th>Nama</th><th>Email</th><th>No. HP</th><th>Aksi</th></tr></thead>
                                <tbody>
                                    {users.map((u, i) => (
                                        <tr key={u.id}>
                                            <td>{i + 1}</td><td>{u.nama}</td><td>{u.email}</td><td>{u.no_hp || '-'}</td>
                                            <td><button className="btn btn-danger btn-action" onClick={() => deleteUser(u.id)}><i className="bi bi-trash"></i></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && <p className="text-center text-muted py-3">Belum ada pengguna</p>}
                        </div>
                    </div>
                </div>
            </AdminLayout>

            {/* Modal */}
            {showModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header"><h5 className="modal-title fw-bold">Tambah User</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
                            <form onSubmit={addUser}>
                                <div className="modal-body">
                                    <div className="mb-3"><label className="form-label fw-bold small">Nama</label><input className="form-control" value={newUser.nama} onChange={e => setNewUser({ ...newUser, nama: e.target.value })} required /></div>
                                    <div className="mb-3"><label className="form-label fw-bold small">Email</label><input type="email" className="form-control" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required /></div>
                                    <div className="mb-3"><label className="form-label fw-bold small">Password</label><input type="password" className="form-control" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required minLength={6} /></div>
                                    <div className="mb-3"><label className="form-label fw-bold small">No. HP</label><input className="form-control" value={newUser.no_hp} onChange={e => setNewUser({ ...newUser, no_hp: e.target.value })} /></div>
                                </div>
                                <div className="modal-footer"><button className="btn btn-secondary" type="button" onClick={() => setShowModal(false)}>Batal</button><button className="btn btn-primary" type="submit">Simpan</button></div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
