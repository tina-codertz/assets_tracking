import express, { json, urlencoded } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import assetRoutes from "./routes/assetRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reminders", reminderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// // 404 handler
// app.use('*/splat', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;