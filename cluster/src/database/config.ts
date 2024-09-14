export const HOSTNAME = process.env.HOSTNAME!;
export const HOST = process.env.HOST;
export const PORT = 3000;
export const DATABASE_CONNECTION_STRING =
  process.env.DATABASE_CONNECTION_STRING!;

export const creatDbConnection = async () => {
  const { createConnection } = await import("mysql2/promise");

  return await createConnection({
    uri: DATABASE_CONNECTION_STRING,
  });
};
