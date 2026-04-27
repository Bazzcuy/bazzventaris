import supabase from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase.from('usser').select('id, nama, email, no_hp, created_at').order('created_at', { ascending: false });
        if (error) throw error;
        return Response.json(data);
    } catch (error) {
        return Response.json({ error: 'Gagal mengambil data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();

        if (body.action === 'create') {
            const { nama, email, password, no_hp } = body;
            const { data: existing } = await supabase.from('usser').select('id').eq('email', email).limit(1);
            if (existing && existing.length > 0) return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 });

            const hashed = await bcrypt.hash(password, 10);
            const { error } = await supabase.from('usser').insert([{ nama, email, password: hashed, no_hp }]);
            if (error) throw error;
            return Response.json({ success: true });
        }

        if (body.action === 'delete') {
            const { data: loans } = await supabase.from('peminjaman').select('id').eq('user_id', body.id).limit(1);
            if (loans && loans.length > 0) {
                return Response.json({ error: 'Tidak dapat menghapus pengguna yang memiliki riwayat peminjaman!' }, { status: 400 });
            }
            const { error } = await supabase.from('usser').delete().eq('id', body.id);
            if (error) throw error;
            return Response.json({ success: true });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin Users API Error:', error);
        return Response.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
    }
}
