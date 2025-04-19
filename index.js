require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const setupSwaggerDocs = require('./config/swaggerUiConfig');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
connectDB();
app.use(express.json());
setupSwaggerDocs(app);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/standings', require('./routes/standingRoutes'));
app.use('/api/players', require('./routes/playerRoutes'));
app.use('/api/officials', require('./routes/officialRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
