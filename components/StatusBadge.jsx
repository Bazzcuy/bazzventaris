export default function StatusBadge({ status }) {
    const map = {
        tersedia: 'status-tersedia',
        dipinjam: 'status-dipinjam',
        rusak: 'status-rusak',
        maintenance: 'status-rusak',
        reserved: 'status-dipinjam',
        dibatalkan_otomatis: 'status-rusak',
        dikembalikan: 'status-tersedia',
    };
    const cls = map[status] || 'status-dipinjam';

    // Label kustom
    let label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
    if (status === 'dibatalkan_otomatis') label = 'Batal Otomatis';

    return <span className={`item-status ${cls}`}>{label}</span>;
}
