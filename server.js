// WCD2 server.js 
import express from 'express';
import 'babel-polyfill';
import cors from 'cors';
import env from './env.js';
// import dotenv from 'dotenv';
// dotenv.config();
import usersRoute from './app/routes/userRoute.js';
// import seedRoute from './app/routes/seedRoute';
import adminRoute from './app/routes/adminRoute.js';
import eventRoute from './app/routes/eventRoute.js';
import usageRoute from './app/routes/usageRoute.js';
// import eventUsageRoute from './app/routes/eventUsageRoute';

const app = express();
const port = process.env.PORT || 3000;
/// This solution to require not being found from SO
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
/// END SO SOLUTION
// console.log(process.env);
// import dotenv from 'dontenv'
// require('dotenv').config();

// Add middleware for parsing URL encoded bodies (which are usually sent by browser)
app.use(cors());
// Add middleware for parsing JSON and urlencoded data and populating `req.body`
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/v1', usersRoute);
// possibly for seeding database???
// app.use('/api/v1', seedRoute);
app.use('/api/v1', adminRoute);
// app.use('/api/v1', eventUsageRoute);
app.use('/api/v1', eventRoute);
app.use('/api/v1', usageRoute);


app.listen(port).on('listening', () => {
   console.log(`WCD live on ${port} 🚀 🚀 `);
});


export default app;