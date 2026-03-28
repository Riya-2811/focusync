const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/focus', require('./routes/focus'));
app.use('/api/updates', require('./routes/updates'));
// TODO: Add other routes as features are implemented

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running ✅', mode: 'Mock Database (Development)' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                   FOCUSYNC BACKEND                ║
╠════════════════════════════════════════════════════╣
║ 🚀 Server running on port ${PORT}                      
║ 📦 Mode: Mock Database (Development)              
║ ✅ Ready for authentication testing               
║                                                    
║ Test the API:                                      
║ - POST /api/auth/signup                           
║ - POST /api/auth/login                            
║ - GET /api/auth/me                                
║ - GET /health                                     
╠════════════════════════════════════════════════════╣
║ Frontend: http://localhost:3000                   
║ Backend: http://localhost:${PORT}                      
╚════════════════════════════════════════════════════╝
  `);
});