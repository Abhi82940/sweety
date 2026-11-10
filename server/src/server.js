require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

// Verify DB connection before starting server
db.query('SELECT NOW()')
  .then((res) => {
    console.log(`Connected to PostgreSQL database at ${res.rows[0].now}`);
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Sweety API Server is running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL database:', err);
    process.exit(1);
  });
