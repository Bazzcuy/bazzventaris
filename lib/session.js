export const sessionOptions = {
    password: process.env.SESSION_PASSWORD || 'Bazzventaris-secret-password-at-least-32-chars!!',
    cookieName: 'bazzventaris_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
    },
};
