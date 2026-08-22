# 💰 AI Expense Analyzer

An AI-powered expense tracking web application that helps users record their daily expenses, monitor spending, and get AI-generated insights about their spending habits.

## 🚀 Features

* 🔐 User registration and login
* 💵 Add and manage expenses
* 🗑️ Delete expenses
* 📊 View spending information
* 🤖 AI-powered expense analysis
* 📱 Responsive user interface
* 🔒 Token-based authentication
* 🌐 Live frontend and backend deployment

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* FastAPI
* SQLAlchemy
* JWT Authentication

### AI

* AI API integration
* AI-generated spending insights

### Database

* SQLite

### Deployment

* GitHub
* Render

## 📂 Project Structure

```text
AI-Expense-Analyzer/
│
├── Backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   └── .env
│
├── Frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── script.js
│   ├── auth.js
│   ├── style.css
│   └── auth.css
│
└── README.md
```

## ⚙️ How It Works

1. Users create an account and log in.
2. Users add their daily expenses.
3. The application stores and displays the expense information.
4. Users can delete expenses when needed.
5. The AI analyzes the user's spending data.
6. The application provides personalized spending insights and suggestions.

## 🖥️ Run Locally

### Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/AI-Expense-Analyzer.git
cd AI-Expense-Analyzer
```

### Install backend dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### Start the FastAPI server

```bash
uvicorn main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Run the frontend

Open the `Frontend` folder using VS Code and run `index.html` with **Live Server**.

## 🔑 Environment Variables

Create a `.env` file inside the `Backend` folder.

Example:

```env
OPENAI_API_KEY=your_api_key_here
```

**Never upload your API key to GitHub.**

Add `.env` to `.gitignore`:

```text
.env
__pycache__/
*.pyc
```

## 🌐 Live Demo

**Frontend:**
https://ai-expense-analyzer-frontend.onrender.com/login.html
**Backend API:**
https://ai-expense-analyzer-xtgt.onrender.com/

**API Documentation:**
https://ai-expense-analyzer-xtgt.onrender.com/docs
## LIVE application

## 🎯 Future Improvements

* Persistent PostgreSQL database
* Monthly and yearly expense reports
* Expense category charts
* Budget alerts
* Export expenses as CSV/PDF
* Improved AI recommendations
* Mobile application

## 👩‍💻 Author

**Tulasi Bobbara**

B.Tech CSE (AI & ML) | Full Stack Developer | AI Enthusiast

GitHub: `https://github.com/tulasibobbara`

LinkedIn: `https://www.linkedin.com/in/tulasibobbara/`

---
