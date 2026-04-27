'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminBarangPage() {
    const [items, setItems] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [form, setForm] = useState({ kode_barang: '', nama: '', jenis: '', tipe: '', deskripsi: '', kondisi: 'Baik', status: 'tersedia', jumlah: 1, gambar: '' });
    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check' }) })
            .then(r => r.json())
            .then(d => {
                if (!d.loggedIn) { router.push('/admin/login'); return; }
                setAdmin(d.admin);
                loadItems();
            });
    }, [router]);

    async function loadItems() {
        const res = await fetch('/api/admin/barang');
        setItems(await res.json());
        setLoading(false);
    }

    function openAdd() {
        setEditItem(null);
        setImageFile(null);
        setForm({ kode_barang: '', nama: '', jenis: '', tipe: '', deskripsi: '', kondisi: 'Baik', status: 'tersedia', jumlah: 1, gambar: '' });
        setShowModal(true);
    }

    function openEdit(item) {
        setEditItem(item);
        setImageFile(null);
        setForm({ kode_barang: item.kode_barang, nama: item.nama, jenis: item.jenis, tipe: item.tipe || '', deskripsi: item.deskripsi || '', kondisi: item.kondisi, status: item.status, jumlah: item.jumlah, gambar: item.gambar || '' });
        setShowModal(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        let finalImageUrl = form.gambar;
        if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            const resUpload = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            if (resUpload.ok) {
                const dataUpload = await resUpload.json();
                finalImageUrl = dataUpload.url;
            } else {
                alert('Gagal mengupload gambar');
                return;
            }
        }

        const payload = editItem ? { action: 'update', id: editItem.id, ...form, gambar: finalImageUrl } : { action: 'create', ...form, gambar: finalImageUrl };
        const res = await fetch('/api/admin/barang', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { setShowModal(false); loadItems(); }
        else { const d = await res.json(); alert(d.error); }
    }

    async function deleteItem(id) {
        if (!confirm('Yakin ingin menghapus barang ini?')) return;
        await fetch('/api/admin/barang', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
        loadItems();
    }

    const statusMap = { tersedia: 'success', dipinjam: 'warning', rusak: 'danger', maintenance: 'secondary' };

    if (loading) return <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="admin-body">
            <AdminLayout adminName={admin?.name} title="Daftar Barang">
                <div style={{ padding: '1.5rem' }}>
                    <div className="d-flex justify-content-end mb-3">
                        <button className="btn btn-primary btn-sm" onClick={openAdd}>
                            <i className="bi bi-plus-lg me-1"></i> Tambah Barang
                        </button>
                    </div>
                    <div className="card shadow-sm">
                        <div className="card-body p-0">
                            <table className="table table-hover mb-0">
                                <thead className="table-light"><tr><th>Kode</th><th>Nama</th><th>Jenis</th><th>Kondisi</th><th>Status</th><th>Jumlah</th><th>Aksi</th></tr></thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id}>
                                            <td className="fw-bold">{item.kode_barang}</td>
                                            <td><div className="d-flex align-items-center gap-2">
                                                {item.gambar && <img src={item.gambar} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
                                                {item.nama}
                                            </div></td>
                                            <td>{item.jenis}</td><td>{item.kondisi}</td>
                                            <td><span className={`badge bg-${statusMap[item.status] || 'secondary'}`}>{item.status}</span></td>
                                            <td>{item.jumlah}</td>
                                            <td>
                                                <button className="btn btn-primary btn-action" onClick={() => openEdit(item)}><i className="bi bi-pencil"></i></button>
                                                <button className="btn btn-danger btn-action" onClick={() => deleteItem(item.id)}><i className="bi bi-trash"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </AdminLayout>

            {showModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header"><h5 className="modal-title fw-bold">{editItem ? 'Edit Barang' : 'Tambah Barang'}</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3"><label className="form-label fw-bold small">Kode Barang</label><input className="form-control" value={form.kode_barang} onChange={e => setForm({ ...form, kode_barang: e.target.value })} required /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label fw-bold small">Nama</label><input className="form-control" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label fw-bold small">Jenis</label><input className="form-control" value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })} required placeholder="Contoh: Elektronik" /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label fw-bold small">Tipe</label><input className="form-control" value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} /></div>
                                        <div className="col-12 mb-3"><label className="form-label fw-bold small">Deskripsi</label><textarea className="form-control" rows="2" value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })}></textarea></div>
                                        <div className="col-md-4 mb-3"><label className="form-label fw-bold small">Kondisi</label><input className="form-control" value={form.kondisi} onChange={e => setForm({ ...form, kondisi: e.target.value })} /></div>
                                        <div className="col-md-4 mb-3"><label className="form-label fw-bold small">Status</label><select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="tersedia">Tersedia</option><option value="dipinjam">Dipinjam</option><option value="rusak">Rusak</option><option value="maintenance">Maintenance</option></select></div>
                                        <div className="col-md-4 mb-3"><label className="form-label fw-bold small">Jumlah</label><input type="number" className="form-control" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: parseInt(e.target.value) })} min={0} /></div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label fw-bold small">Upload Gambar (Kosongkan bila tidak ingin mengubah)</label>
                                            <input type="file" className="form-control" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                                            {form.gambar && <div className="mt-2"><small className="text-muted">Gambar saat ini: {form.gambar}</small></div>}
                                        </div>
                                    </div>
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
