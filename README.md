## Turl | Advanced URL Shortener

![image](https://github.com/user-attachments/assets/0f864be1-8618-4921-a116-dcb5971ba8f8)

Manage your links easily with Turl, an advanced and open-source URL shortener packed with powerful features! 🚀

## PageSpeed Insights: ⚡

<img style="width: 600px; margin-top: 20px" alt="TurlPSI" src="https://tudes.vercel.app/images/psi.svg">

## Features ✨

- 📩 **Webhook Integration**: Send notifications to Discord.
- 🔢 **Analytics**: Track clicks and locations in real-time.
- 🔐 **Secure Links**: Protect your URLs with passwords.

## Tech Stack 🏗️

- **Frontend**: Angular, Tailwind CSS, Chart.js, Lucide Icons
- **Backend**: Express.js, Turso, bcrypt, Google Auth, Turso
- **Other Tools**: express-rate-limit, cookie-parser

## Installation 🛠️

1. Clone the repository:
   ```sh
   git clone https://github.com/tudes00/Turl.git
   cd Turl
   ```
2. Install dependencies:
   ```sh
   npm install;
   cd backend; npm install; cd ..;
   cd frontend npm install; cd ..
   ```
3. Add a `.env` file in the `backend` folder and structure it like this:
   ```.env
   TURSO_DATABASE_URL=
   TURSO_AUTH_TOKEN=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   NODE_ENV=local
   ```
4. Run Turl locally:
   ```sh
   npm run dev
   ```

### Requirements ✅

- Node.js & npm installed.


# TODO list 📇:
- [ ] add tracking pixel maker
