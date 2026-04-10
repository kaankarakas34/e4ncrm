import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('supabase') 
    ? { rejectUnauthorized: false }
    : false
});

// Log pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (text: string, params?: any[]) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

export default pool;
