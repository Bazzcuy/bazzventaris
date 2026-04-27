import { writeFile } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';

export async function POST(req) {
    const session = await getSession();
    if (!session.adminId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return Response.json({ error: "No files received." }, { status: 400 });
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return Response.json({ error: "Format file tidak valid. Hanya menerima format JPG, PNG, WEBP, atau GIF." }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return Response.json({ error: "Ukuran file terlalu besar. Maksimal 5MB." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
        const filepath = path.join(process.cwd(), "public/foto", filename);

        await writeFile(filepath, buffer);

        return Response.json({ success: true, url: "/foto/" + filename });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to upload file." }, { status: 500 });
    }
}
