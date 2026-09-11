// Install: npm install cors
// Add near the top of server.js, before your routes are defined.

const cors = require('cors');

// Replace with frontend's real deployed URL once it exists.
// Keep this list short and explicit - avoid using "*" once real user data is involved.
const allowedOrigins = [
  'http://localhost:3000',        // local frontend dev
  'https://huddle-demo-sprint.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (e.g. curl, Postman) during testing
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // needed if using cookies/sessions for auth
}));
