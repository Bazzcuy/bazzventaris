import supabase from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: rows, error } = await supabase.from('usser').select('id, nama, email, no_hp, created_at').eq('id', session.userId);
        if (error || !rows || rows.length === 0) return Response.json({ error: 'User tidak ditemukan' }, { status: 404 });
        return Response.json(rows[0]);
    } catch (error) {
        return Response.json({ error: 'Gagal mengambil profil' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { nama, email, no_hp, password_baru } = await request.json();

        const { data: existingEmail } = await supabase.from('usser').select('id').eq('email', email).neq('id', session.userId);
        if (existingEmail && existingEmail.length > 0) {
            return Response.json({ error: 'Email sudah digunakan oleh akun lain!' }, { status: 400 });
        }

        const updateData = { nama, email, no_hp };

        if (password_baru && password_baru.length >= 6) {
            updateData.password = await bcrypt.hash(password_baru, 10);
        }

        const { error } = await supabase.from('usser').update(updateData).eq('id', session.userId);
        if (error) throw error;

        // Update session name
        session.userName = nama;
        await session.save();

        return Response.json({ success: true });
    } catch (error) {
        console.error('Profil API Error:', error);
        return Response.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
    }
}
