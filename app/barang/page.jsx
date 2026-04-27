'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import { Search, Package, PackageOpen, Filter } from 'lucide-react';

export default function BarangPage() {
    const [items, setItems] = useState([]);
    const [jenisList, setJenisList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterJenis, setFilterJenis] = useState('');

    useEffect(() => {
        fetchItems();
    }, [filterStatus, filterJenis]);

    async function fetchItems() {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterStatus) params.set('status', filterStatus);
        if (filterJenis) params.set('jenis', filterJenis);
        if (search) params.set('search', search);

        const res = await fetch(`/api/barang?${params}`);
        const data = await res.json();
        setItems(data.items || []);
        setJenisList(data.jenisList || []);
        setLoading(false);
    }

    function handleSearch(e) {
        e.preventDefault();
        fetchItems();
    }

    return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content">
                <h1 className="animate-in" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Package size={32} color="#4A86E8" /> Daftar Barang Inventaris
                </h1>
                <p className="animate-in" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                    Cari dan telusuri barang inventaris kampus
                </p>

                {/* Search & Filter Bar (NEW FEATURE) */}
                <form className="search-bar animate-in" onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                        <input type="text" placeholder="Cari berdasarkan nama atau kode..." value={search}
                            onChange={e => setSearch(e.target.value)} 
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>
                    <select value={filterJenis} onChange={e => { setFilterJenis(e.target.value); }} style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        <option value="" style={{ color: '#222' }}>Semua Jenis</option>
                        {jenisList.map(j => <option key={j} value={j} style={{ color: '#222' }}>{j}</option>)}
                    </select>
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); }} style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        <option value="" style={{ color: '#222' }}>Semua Status</option>
                        <option value="tersedia" style={{ color: '#222' }}>Tersedia</option>
                        <option value="dipinjam" style={{ color: '#222' }}>Dipinjam</option>
                        <option value="rusak" style={{ color: '#222' }}>Rusak</option>
                    </select>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={18} /> Filter
                    </button>
                </form>

                {loading ? (
                    <div className="spinner"></div>
                ) : items.length === 0 ? (
                    <div className="empty-state animate-in" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'rgba(255,255,255,0.4)' }}>
                            <PackageOpen size={64} />
                        </div>
                        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Barang tidak ditemukan</p>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Coba ubah kata kunci atau filter pencarian Anda.</p>
                    </div>
                ) : (
                    <div className="item-grid">
                        {items.map(item => (
                            <Link href={`/detail/${item.id}`} key={item.id} className="item-card animate-in" style={{ textDecoration: 'none', color: 'white' }}>
                                <img src={item.gambar || '/foto/bground.jpg'} alt={item.nama} className="item-image" />
                                <div className="item-title">{item.nama}</div>
                                <StatusBadge status={item.status} />
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{item.kode_barang}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
