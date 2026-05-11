export default () => ({
  port: Number(process.env.PORT || 4000),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'meduchet',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
})
