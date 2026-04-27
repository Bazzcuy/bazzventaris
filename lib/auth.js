import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

import { sessionOptions } from './session';

export async function getSession() {
    const cookieStore = await cookies();
    return getIronSession(cookieStore, sessionOptions);
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session.userId) return null;
    return { id: session.userId, name: session.userName, role: 'user' };
}

export async function getCurrentAdmin() {
    const session = await getSession();
    if (!session.adminId) return null;
    return { id: session.adminId, name: session.adminName, level: session.adminLevel };
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        return { redirect: '/login', user: null };
    }
    return { redirect: null, user };
}

export async function requireAdmin() {
    const admin = await getCurrentAdmin();
    if (!admin) {
        return { redirect: '/admin/login', admin: null };
    }
    return { redirect: null, admin };
}
