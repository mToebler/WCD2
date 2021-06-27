import dotenv from 'dotenv';

dotenv.config();

export default {
   database_url: process.env.DATABASE_URL,
   test_database_url: process.env.TEST_DATABASE_URL,
   secret: process.env.SECRET,
   port: process.env.PORT || 5000,
   environment: process.env.NODE_ENV,
   rachio_auth: process.env.RACHIO_AUTH_TOKEN,
   rachio_person: process.env.RACHIO_PERSON_ID,
   rachio_device: process.env.RACHIO_DEVICE_ID,
   flume_client: process.env.FLUME_CLIENT_ID,
   flume_secret: process.env.FLUME_CLIENT_SECRET,
   flume_user: process.env.FLUME_USERNAME,
   flume_pw: process.env.FLUME_PASSWORD,
}