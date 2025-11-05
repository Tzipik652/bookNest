import postgres from 'postgres'
import dotenv from 'dotenv'
dotenv.config()
console.log("DB URL Host:", process.env.DATABASE_URL?.split('@')[1]?.split(':')[0]);
const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

export default sql