require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes    = require('./routes/auth');
const childrenRoutes = require('./routes/children');
const goalsRoutes   = require('./routes/goals');
const plansRoutes   = require('./routes/plans');
const sessionsRoutes = require('./routes/sessions');
const importRoutes  = require('./routes/import');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/goals',    goalsRoutes);
app.use('/api/plans',    plansRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/import',   importRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
