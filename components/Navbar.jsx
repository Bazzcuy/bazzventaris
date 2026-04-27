'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        fetch('/api/auth')
            .then(r => r.json())
            .then(d => { if (d.loggedIn) setUser(d.user); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => pathname === path ? 'active' : '';

    return (
        <nav className={`main-nav${scrolled ? ' scrolled' : ''}`} id="mainNav">
            <Link href="/" className="logo-container">
                <img src="/foto/log.jpg" alt="Logo" className="logo-img" />
                <span className="logo-text">Bazzventaris</span>
            </Link>
            <div
                className={`hamburger${menuOpen ? ' active' : ''}`}
                role="button"
                tabIndex={0}
                aria-label="Toggle Menu"
                onClick={() => setMenuOpen(!menuOpen)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMenuOpen(!menuOpen); } }}
            >
                <span></span><span></span><span></span>
            </div>
            <div className={`nav-links${menuOpen ? ' active' : ''}`}>
                <Link href="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Beranda</Link>
                <Link href="/#about" onClick={() => setMenuOpen(false)}>Tentang</Link>
                <Link href="/#contact" onClick={() => setMenuOpen(false)}>Kontak</Link>
                <Link href="/barang" className={isActive('/barang')} onClick={() => setMenuOpen(false)}>Barang</Link>
                {user ? (
                    <Link href="/profil" onClick={() => setMenuOpen(false)}>
                        <img src="/foto/profile.png" alt="Profile" className="profile-icon" />
                    </Link>
                ) : (
                    <Link href="/login" className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }} onClick={() => setMenuOpen(false)}>
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}
