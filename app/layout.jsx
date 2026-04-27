import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '600', '700', '900'],
});

export const metadata = {
    title: 'Bazzventaris - Sistem Inventaris Kampus',
    description: 'Sistem peminjaman dan pengelolaan barang inventaris Universitas Muhammadiyah Palembang',
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body className={poppins.className}>{children}</body>
        </html>
    );
}
