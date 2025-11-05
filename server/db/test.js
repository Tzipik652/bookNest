import sql from "./connection.js";

async function test() {
  const res = await sql`SELECT NOW()`;   
  console.log("Connected:", res); 
}

test().catch(console.error);