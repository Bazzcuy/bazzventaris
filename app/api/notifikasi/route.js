import supabase from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: notifs, error } = await supabase
            .from('notifikasi')
            .select('*')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        const { count, error: countError } = await supabase
            .from('notifikasi')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.userId)
            .eq('dibaca', false);

        if (countError) throw countError;

        return Response.json({ notifikasi: notifs || [], unread: count || 0 });
    } catch (error) {
        console.error('Notifikasi GET Error:', error);
        return Response.json({ error: 'Gagal mengambil notifikasi' }, { status: 500 });
    }
}

export async function POST() {
    try {
        const session = await getSession();
        if (!session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { error } = await supabase
            .from('notifikasi')
            .update({ dibaca: true })
            .eq('user_id', session.userId);

        if (error) throw error;
        return Response.json({ success: true });
    } catch (error) {
        console.error('Notifikasi POST Error:', error);
        return Response.json({ error: 'Gagal memperbarui notifikasi' }, { status: 500 });
    }
}
