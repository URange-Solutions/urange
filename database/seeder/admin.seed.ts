import { db } from '@/database';
import { admins } from '../schema';
import { hashPassword } from '@/lib/password';

(async function seed() {
    console.log("Creating admin...");
    const hashedPassword = await hashPassword("adminpogi123");

    const [result] = await db.insert(admins).values({
        email: 'janlibydelacosta@gmail.com',
        username: 'admin',
        first_name: 'Jan Liby',
        last_name: 'Dela Costa',
        password_hash: hashedPassword,
        role: 'super_admin'
    }).returning({ id: admins.id });

    console.log("Admin created:", result);
})();