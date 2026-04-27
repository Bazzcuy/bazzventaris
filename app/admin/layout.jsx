import './admin.css';

export const metadata = { title: 'Admin Panel - Bazzventaris' };

export default function AdminLayout({ children }) {
    return (
        <>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
            {children}
        </>
    );
}
