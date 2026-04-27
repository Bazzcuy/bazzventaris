import supabase from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { count: total_users } = await supabase.from('usser').select('*', { count: 'exact', head: true });
        const { count: available_items } = await supabase.from('barang').select('*', { count: 'exact', head: true }).eq('status', 'tersedia');
        const { count: active_loans } = await supabase.from('peminjaman').select('*', { count: 'exact', head: true }).in('status', ['disetujui', 'dipinjam']);
        const { count: pending_loans } = await supabase.from('peminjaman').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        const { data: recent_users } = await supabase.from('usser').select('id, nama, email, created_at').order('created_at', { ascending: false }).limit(5);
        
        const { data: recent_loans_raw } = await supabase
            .from('peminjaman')
            .select(`
                id, status, tanggal_pinjam, created_at,
                usser:user_id (nama),
                barang:barang_id (nama)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        const recent_loans = recent_loans_raw?.map(r => ({
            id: r.id,
            status: r.status,
            tanggal_pinjam: r.tanggal_pinjam,
            nama_user: r.usser?.nama,
            nama_barang: r.barang?.nama
        }));

        return Response.json({ 
            total_users: total_users || 0, 
            available_items: available_items || 0, 
            active_loans: active_loans || 0, 
            pending_loans: pending_loans || 0, 
            recent_users: recent_users || [], 
            recent_loans: recent_loans || [] 
        });
    } catch (error) {
        console.error('Dashboard API Error:', error);
        return Response.json({ error: 'Gagal mengambil data dashboard' }, { status: 500 });
    }
}
