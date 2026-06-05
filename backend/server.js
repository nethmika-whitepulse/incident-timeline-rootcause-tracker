require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports (stubbed — add handlers as features are built)
const authRoutes       = require('./src/routes/authRoutes');
const incidentRoutes   = require('./src/routes/incidentRoutes');
const timelineRoutes   = require('./src/routes/timelineRoutes');
const evidenceRoutes   = require('./src/routes/evidenceRoutes');
const rcaRoutes        = require('./src/routes/rcaRoutes');
const actionItemRoutes = require('./src/routes/actionItemRoutes');
const dashboardRoutes  = require('./src/routes/dashboardRoutes');

const app = express();

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── HTTP Request Logging (Morgan → Winston) ───────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/incidents',    incidentRoutes);
app.use('/api/timeline',     timelineRoutes);
app.use('/api/evidence',     evidenceRoutes);
app.use('/api/rca',          rcaRoutes);
app.use('/api/action-items', actionItemRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

if (require.main === module) {
  startServer();
}

// Export for supertest
module.exports = app;
