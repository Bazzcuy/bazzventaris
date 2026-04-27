import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer>
            <div className="social-media">
                <a href="#"><Facebook size={20} /> Facebook</a>
                <a href="#"><Instagram size={20} /> Instagram</a>
                <a href="#"><Twitter size={20} /> Twitter</a>
            </div>
            <p>&copy; 2026 Bazzventaris — Universitas Muhammadiyah Palembang</p>
        </footer>
    );
}
