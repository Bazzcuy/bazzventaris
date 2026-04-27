import supabase from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { action, email, password } = await request.json();

        if (action === 'login') {
            const { data: rows, error } = await supabase
                .from('admin')
                .select('*')
                .eq('email', email)
                .eq('status', 'aktif');
                
            if (error || !rows || rows.length === 0) return Response.json({ error: 'Email atau password salah' }, { status: 401 });

            const admin = rows[0];
            const valid = await bcrypt.compare(password, admin.password);
            if (!valid) return Response.json({ error: 'Email atau password salah' }, { status: 401 });

            const session = await getSession();
            session.adminId = admin.id;
            session.adminName = admin.nama;
            session.adminLevel = admin.level_akses;
            await session.save();

            return Response.json({ success: true });
        }

        if (action === 'logout') {
            const session = await getSession();
            session.destroy();
            return Response.json({ success: true });
        }

        if (action === 'check') {
            const session = await getSession();
            if (!session.adminId) return Response.json({ loggedIn: false });
            return Response.json({ loggedIn: true, admin: { id: session.adminId, name: session.adminName } });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin Auth Error:', error);
        return Response.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
    }
}
