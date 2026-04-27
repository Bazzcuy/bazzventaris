import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';

import { sessionOptions } from './lib/session';

export default async function proxy(req) {
    const res = NextResponse.next();
    const session = await getIronSession(req.cookies, sessionOptions);
    const { pathname } = req.nextUrl;

    // Proteksi halaman Admin (harus login admin)
    if (pathname.startsWith('/admin') && !pathname.includes('/admin/login')) {
        if (!session.adminId) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    // Proteksi halaman User yang mutlak butuh login
    if (pathname.startsWith('/profil') || pathname.startsWith('/form')) {
        if (!session.userId) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*', '/profil/:path*', '/form/:path*'],
};
