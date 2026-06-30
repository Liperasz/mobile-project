import * as SQLite from 'expo-sqlite';

// tipos

export type UserType = 'citizen' | 'cooperative';

export type User = {
    id: number;
    name: string;
    email: string;
    type: UserType;
    document: string | null; // CPF ou CNPJ
    cep: string | null;
    address: string | null;
    created_at: string;
};

export type AnnouncementStatus = 'pending' | 'collected';

export type Announcement = {
    id: number;
    user_id: number;
    user_name: string;
    category: string;
    weight_kg: number;
    description: string | null;
    photo_uri: string | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    status: AnnouncementStatus;
    created_at: string;
};

// conexão singleton

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!db) {
        db = await SQLite.openDatabaseAsync('wastego.db');

        // criação das tabelas (se não existirem, roda apenas uma vez)
        await db.execAsync(`
            PRAGMA journal_mode = WAL;

            CREATE TABLE IF NOT EXISTS users (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT    NOT NULL,
                email      TEXT    NOT NULL UNIQUE,
                type       TEXT    NOT NULL,
                document   TEXT,
                cep        TEXT,
                address    TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS announcements (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER NOT NULL,
                user_name   TEXT    NOT NULL,
                category    TEXT    NOT NULL,
                weight_kg   REAL    NOT NULL,
                description TEXT,
                photo_uri   TEXT,
                latitude    REAL,
                longitude   REAL,
                address     TEXT,
                status      TEXT    DEFAULT 'pending',
                created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
    }
    return db;
}

// serviço

export const sqliteService = {

    // usuários

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const database = await getDb();
            const user = await database.getFirstAsync<User>(
                'SELECT * FROM users WHERE email = ?;',
                email.toLowerCase().trim()
            );
            return user ?? null;
        } catch (e) {
            throw new Error('Erro ao buscar usuário');
        }
    },

    async registerUser(data: {
        name: string;
        email: string;
        type: UserType;
        document?: string;
        cep?: string;
        address?: string;
    }): Promise<number> {
        try {
            const database = await getDb();
            const result = await database.runAsync(
                `INSERT INTO users (name, email, type, document, cep, address)
                 VALUES (?, ?, ?, ?, ?, ?);`,
                data.name,
                data.email.toLowerCase().trim(),
                data.type,
                data.document ?? null,
                data.cep ?? null,
                data.address ?? null
            );
            return result.lastInsertRowId;
        } catch (e) {
            const msg = String(e);
            if (msg.includes('UNIQUE')) {
                throw new Error('Este e-mail já está cadastrado.');
            }
            throw new Error('Erro ao cadastrar usuário.');
        }
    },

    // anúncios

    async getAllAnnouncements(): Promise<Announcement[]> {
        try {
            const database = await getDb();
            return await database.getAllAsync<Announcement>(
                'SELECT * FROM announcements ORDER BY id DESC;'
            );
        } catch (e) {
            throw new Error('Erro ao buscar anúncios.');
        }
    },

    async getAnnouncementsByUser(userId: number): Promise<Announcement[]> {
        try {
            const database = await getDb();
            return await database.getAllAsync<Announcement>(
                'SELECT * FROM announcements WHERE user_id = ? ORDER BY id DESC;',
                userId
            );
        } catch (e) {
            throw new Error('Erro ao buscar seus anúncios.');
        }
    },

    async addAnnouncement(data: {
        userId: number;
        userName: string;
        category: string;
        weightKg: number;
        description?: string;
        photoUri?: string;
        latitude?: number;
        longitude?: number;
        address?: string;
    }): Promise<number> {
        try {
            const database = await getDb();
            const result = await database.runAsync(
                `INSERT INTO announcements
                 (user_id, user_name, category, weight_kg, description, photo_uri, latitude, longitude, address)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                data.userId,
                data.userName,
                data.category,
                data.weightKg,
                data.description ?? null,
                data.photoUri ?? null,
                data.latitude ?? null,
                data.longitude ?? null,
                data.address ?? null
            );
            return result.lastInsertRowId;
        } catch (e) {
            throw new Error('Erro ao salvar anúncio.');
        }
    },

    async updateAnnouncementStatus(id: number, status: AnnouncementStatus): Promise<void> {
        try {
            const database = await getDb();
            await database.runAsync(
                'UPDATE announcements SET status = ? WHERE id = ?;',
                status,
                id
            );
        } catch (e) {
            throw new Error('Erro ao atualizar status do anúncio.');
        }
    },

    async deleteAnnouncement(id: number): Promise<void> {
        try {
            const database = await getDb();
            await database.runAsync(
                'DELETE FROM announcements WHERE id = ?;',
                id
            );
        } catch (e) {
            throw new Error('Erro ao remover anúncio.');
        }
    },
};
