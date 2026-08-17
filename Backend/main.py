from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from jose import jwt, JWTError

from dotenv import load_dotenv
from google import genai

import os

from database import Base, engine, get_db
from models import User, Expense

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# GEMINI CLIENT
# =========================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    client = genai.Client(
        api_key=GEMINI_API_KEY
    )
else:
    client = None


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="AI Expense Analyzer",
    description="AI-powered expense tracking application",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# JWT SECURITY
# =========================================================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user = db.query(User).filter(
            User.id == int(user_id)
        ).first()

        if user is None:

            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except (JWTError, ValueError):

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# =========================================================
# REQUEST MODELS
# =========================================================

class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


class ExpenseRequest(BaseModel):

    name: str

    amount: float

    category: str


class AIExpenseRequest(BaseModel):

    expenses: list[ExpenseRequest]


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "AI Expense Analyzer API is running"
    }


# =========================================================
# REGISTER
# =========================================================

@app.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if len(data.password) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters"
        )

    hashed_password = hash_password(
        data.password
    )

    new_user = User(

        name=data.name,

        email=data.email,

        password=hashed_password

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {

        "message": "Registration successful",

        "user": {

            "id": new_user.id,

            "name": new_user.name,

            "email": new_user.email

        }

    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_correct = verify_password(
        data.password,
        user.password
    )

    if not password_correct:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        user.id
    )

    return {

        "message": "Login successful",

        "access_token": token,

        "token_type": "bearer",

        "user": {

            "id": user.id,

            "name": user.name,

            "email": user.email

        }

    }


# =========================================================
# ADD EXPENSE
# =========================================================

@app.post("/expenses")
def add_expense(

    data: ExpenseRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    if data.amount <= 0:

        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero"
        )

    if not data.name.strip():

        raise HTTPException(
            status_code=400,
            detail="Expense name is required"
        )

    if not data.category.strip():

        raise HTTPException(
            status_code=400,
            detail="Expense category is required"
        )

    new_expense = Expense(

        user_id=current_user.id,

        name=data.name.strip(),

        amount=data.amount,

        category=data.category.strip()

    )

    db.add(new_expense)

    db.commit()

    db.refresh(new_expense)

    return {

        "message": "Expense added successfully",

        "expense": {

            "id": new_expense.id,

            "name": new_expense.name,

            "amount": new_expense.amount,

            "category": new_expense.category

        }

    }


# =========================================================
# GET USER EXPENSES
# =========================================================

@app.get("/expenses")
def get_expenses(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    expenses = db.query(Expense).filter(

        Expense.user_id == current_user.id

    ).all()

    return {

        "expenses": [

            {

                "id": expense.id,

                "name": expense.name,

                "amount": expense.amount,

                "category": expense.category

            }

            for expense in expenses

        ]

    }


# =========================================================
# DELETE EXPENSE
# =========================================================

@app.delete("/expenses/{expense_id}")
def delete_expense(

    expense_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    expense = db.query(Expense).filter(

        Expense.id == expense_id,

        Expense.user_id == current_user.id

    ).first()

    if not expense:

        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)

    db.commit()

    return {

        "message": "Expense deleted successfully"

    }


# =========================================================
# AI EXPENSE ANALYSIS
# =========================================================

@app.post("/analyze")
def analyze_expenses(

    data: AIExpenseRequest,

    current_user: User = Depends(
        get_current_user
    )

):

    # Check Gemini API key

    if not GEMINI_API_KEY or client is None:

        raise HTTPException(

            status_code=500,

            detail="Gemini API key is not configured."

        )


    # Check expenses

    if not data.expenses:

        raise HTTPException(

            status_code=400,

            detail="No expenses provided."

        )


    # Convert expenses to text

    expense_text = "\n".join(

        [

            f"- {expense.name}: "
            f"₹{expense.amount:.2f} "
            f"({expense.category})"

            for expense in data.expenses

        ]

    )


    # AI prompt

    prompt = f"""
You are a helpful personal budgeting assistant.

Analyze the following user's expenses:

{expense_text}

Provide a simple and useful financial spending analysis.

Include:

1. Total spending
2. Highest spending category
3. A short observation about the spending pattern
4. Three practical ways to reduce unnecessary spending
5. One simple monthly budgeting suggestion

Rules:

- Keep the answer beginner-friendly.
- Keep it concise.
- Use Indian Rupees (₹).
- Do not provide investment advice.
- Do not make financial guarantees.
- Use clear headings and bullet points.
"""


    try:

        # Send request to Gemini

        response = client.models.generate_content(

            model="gemini-3.5-flash",

            contents=prompt

        )


        # Get generated text

        ai_text = response.text


        if not ai_text:

            raise Exception(
                "Gemini returned an empty response."
            )


        return {

            "insights": ai_text

        }


    except Exception as error:

        print(
            "GEMINI ERROR:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail="AI analysis failed. Please check your Gemini API key and API limits."

        )