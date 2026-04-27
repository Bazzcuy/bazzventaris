'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import { ChevronLeft, ChevronRight, Square, XCircle, CheckCircle2, CalendarDays, Check } from 'lucide-react';

function AvailabilityCalendar({ bookings }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    function isBooked(day) {
        const date = new Date(year, month, day);
        return bookings.some(b => {
            const start = new Date(b.tanggal_pinjam);
            const end = new Date(b.tanggal_kembali);
            return date >= start && date <= end;
        });
    }

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`e${i}`} className="day empty"></div>);
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
        days.push(
            <div key={d} className={`day${isBooked(d) ? ' booked' : ''}${isToday ? ' today' : ''}`}>
                {d}
            </div>
        );
    }

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                <h4>{monthNames[month]} {year}</h4>
                <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><ChevronRight size={20} /></button>
            </div>
            <div className="calendar-grid">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d} className="day-header">{d}</div>)}
                {days}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Square fill="#ffd54f" color="#ffd54f" size={14} /> Sudah dibooking</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Square fill="transparent" color="#4A86E8" size={14} /> Hari ini</span>
            </p>
        </div>
    );
}

export default function DetailPage() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/barang?id=${id}`)
            .then(r => r.json())
            .then(d => { setItem(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content"><div className="spinner"></div></div>
        </div>
    );

    if (!item || item.error) return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content">
                <div className="empty-state">
                    <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}><XCircle size={64} /></div>
                    <p>Barang tidak ditemukan</p>
                    <Link href="/barang" className="btn btn-back" style={{ marginTop: '1rem' }}>← Kembali</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="page-bg">
            <Navbar />
            <div className="page-content">
                <Link href="/barang" className="btn btn-back animate-in" style={{ marginBottom: '1.5rem' }}>← Kembali ke Daftar Barang</Link>

                <div className="content-card animate-in">
                    <div className="detail-container">
                        <img src={item.gambar || '/foto/bground.jpg'} alt={item.nama} className="detail-image" />
                        <div className="detail-info">
                            <h2>{item.nama}</h2>
                            <div className="info-row"><span className="info-label">Kode</span><span>{item.kode_barang}</span></div>
                            <div className="info-row"><span className="info-label">Jenis</span><span>{item.jenis}</span></div>
                            <div className="info-row"><span className="info-label">Tipe</span><span>{item.tipe || '-'}</span></div>
                            <div className="info-row"><span className="info-label">Kondisi</span><span>{item.kondisi}</span></div>
                            <div className="info-row"><span className="info-label">Status</span><StatusBadge status={item.status} /></div>
                            <div className="info-row"><span className="info-label">Jumlah</span><span>{item.jumlah}</span></div>
                            {item.deskripsi && (
                                <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                    {item.deskripsi}
                                </div>
                            )}

                            {item.status === 'tersedia' && (
                                <Link href={`/form/${item.id}`} className="btn btn-success" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle2 size={18} /> Ajukan Peminjaman
                                </Link>
                            )}

                            {/* Calendar Feature (NEW) */}
                            {item.bookings && item.bookings.length > 0 && (
                                <AvailabilityCalendar bookings={item.bookings} />
                            )}
                            {item.bookings && item.bookings.length === 0 && (
                                <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CalendarDays size={16} /> Belum ada jadwal peminjaman
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
