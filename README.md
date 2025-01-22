# Up Tracker

Up Tracker is a personal finance tracking web app built with Next.js 15, allowing users to track their expenses and gain insights into their spending patterns. The project integrates with Up Bank (via API) and leverages Clerk for authentication and Inngest for background job processing.

## ⚠️ Disclaimer

**Up Tracker is an independent hobby project and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Up Bank or its parent company, Bendigo and Adelaide Bank Limited.** All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation or endorsement

---

## 🚀 Features

- Sync transactions from Up Bank via API.
- Secure storage of sensitive data using encryption.
- Authentication via **Clerk**.
- Background processing with **Inngest**.
- Expense tracking and categorisation.
- Daily, monthly, and yearly spending insights.

---

## ☁️ Use in the Cloud

If you'd prefer to skip the hassle of setting up Up Tracker locally, you can use it on https://uptracker.com.au

## 🔧 Installation (Local Setup)

Before starting, **you will need to create accounts with [Clerk](https://clerk.dev/) (for authentication) and [Inngest](https://www.inngest.com/) (for background processing).** Ensure you have the necessary API keys ready.

### Steps to set up the project locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mjsilva/up-tracker.git
   cd up-tracker
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   - Copy the provided `.env.template` file to `.env.local`:
     ```bash
     cp .env.template .env.local
     ```
   - Open `.env.local` and fill in the required values, such as database connection, encryption key, and API credentials for Clerk and Inngest.

4. **Set up the database:**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at **`http://localhost:3000`**.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 📧 Contact

If you have any questions or suggestions, feel free to reach out.
