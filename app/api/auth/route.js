import supabase from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'login') {
            const { email, password } = body;
            if (!email || !password) return Response.json({ error: 'Email dan password wajib diisi' }, { status: 400 });

            const { data: rows, error } = await supabase.from('usser').select('*').eq('email', email);
            
            if (error || !rows || rows.length === 0) return Response.json({ error: 'Email atau password salah' }, { status: 401 });

            const user = rows[0];
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return Response.json({ error: 'Email atau password salah' }, { status: 401 });

            const session = await getSession();
            session.userId = user.id;
            session.userName = user.nama;
            await session.save();

            return Response.json({ success: true, user: { id: user.id, nama: user.nama } });
        }

        if (action === 'register') {
            const { nama, email, password } = body;
            if (!nama || !email || !password) return Response.json({ error: 'Semua field wajib diisi' }, { status: 400 });
            if (password.length < 6) return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 });

            const { data: existing } = await supabase.from('usser').select('id').eq('email', email);
            if (existing && existing.length > 0) return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 });

            const hashed = await bcrypt.hash(password, 10);
            const { data: result, error: insertError } = await supabase.from('usser').insert([
                { nama, email, password: hashed }
            ]).select();

            if (insertError) throw insertError;

            const session = await getSession();
            session.userId = result[0].id;
            session.userName = nama;
            await session.save();

            return Response.json({ success: true });
        }

        if (action === 'logout') {
            const session = await getSession();
            session.destroy();
            return Response.json({ success: true });
        }

        return Response.json({ error: 'Action tidak valid' }, { status: 400 });
    } catch (error) {
        console.error('Auth Error:', error);
        return Response.json({ error: 'Terjadi kesalahan server internal. Pastikan database Supabase terhubung.' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session.userId) return Response.json({ loggedIn: false });
        return Response.json({ loggedIn: true, user: { id: session.userId, name: session.userName } });
    } catch (error) {
        return Response.json({ loggedIn: false });
    }
}
