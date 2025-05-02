# Supermarket WhatsApp Chatbot 🛒🤖

A Node.js chatbot for supermarkets to send daily promotions and handle customer interactions via WhatsApp.

## Features ✨

- 📅 **Daily promotions** automatically sent at 8AM
- 🛍️ **Product catalog** with images
- 📩 **Opt-in/out system** for promotions
- 💬 **Interactive menu** with 5 options:
  1. Place an order
  2. Subscribe to promotions
  3. Talk to support
  4. Unsubscribe
  5. End conversation
- 📊 **Customer database** stored in JSON

## Technologies Used 🛠️

- [whatsapp-web.js](https://wwebjs.dev/) - WhatsApp Web API wrapper
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [cron](https://www.npmjs.com/package/node-cron) - Task scheduling
- [Express](https://expressjs.com/) - Admin panel (optional)

## Installation 💻

```bash
# Clone the repository
git clone https://github.com/Riannm/Supermarket_ChatBot.git
cd Supermarket_ChatBot

# Install dependencies
npm install

# Start the bot
node chatbot.js
