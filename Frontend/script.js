const API_URL = "http://127.0.0.1:8000";

let expenses = [];
let expenseChart;


// ============================
// CHECK LOGIN
// ============================

const token = localStorage.getItem("access_token");
const savedUser = localStorage.getItem("user");

if (!token || !savedUser) {
    window.location.href = "login.html";
}

const user = JSON.parse(savedUser);

document.getElementById("welcomeUser").textContent =
    "Hi, " + user.name + " 👋";


// ============================
// LOGOUT
// ============================

function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}


// ============================
// LOAD EXPENSES FROM DATABASE
// ============================

async function loadExpenses() {

    try {

        const response = await fetch(
            `${API_URL}/expenses`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (response.status === 401) {

            logout();

            return;
        }


        const data = await response.json();


        expenses = data.expenses || [];


        updateDashboard();

        displayExpenses();

        updateChart();


    } catch (error) {

        console.error(
            "Error loading expenses:",
            error
        );

    }
}


// ============================
// ADD EXPENSE
// ============================

async function addExpense() {

    const name =
        document
            .getElementById("expenseName")
            .value
            .trim();


    const amount =
        Number(
            document
                .getElementById("expenseAmount")
                .value
        );


    const category =
        document
            .getElementById("expenseCategory")
            .value;


    if (!name || amount <= 0) {

        alert(
            "Please enter a valid expense."
        );

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/expenses`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body: JSON.stringify({

                    name: name,

                    amount: amount,

                    category: category

                })

            }
        );


        if (response.status === 401) {

            logout();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to add expense."
            );

            return;
        }


        // Clear inputs

        document
            .getElementById("expenseName")
            .value = "";


        document
            .getElementById("expenseAmount")
            .value = "";


        // Reload from database

        await loadExpenses();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );

    }
}


// ============================
// DASHBOARD
// ============================

function updateDashboard() {

    let total = 0;

    const categories = {};


    expenses.forEach(
        expense => {

            total +=
                Number(expense.amount);


            if (
                !categories[
                    expense.category
                ]
            ) {

                categories[
                    expense.category
                ] = 0;

            }


            categories[
                expense.category
            ] += Number(
                expense.amount
            );

        }
    );


    document.getElementById(
        "totalAmount"
    ).textContent =
        "₹" + total.toFixed(2);


    document.getElementById(
        "totalExpenses"
    ).textContent =
        expenses.length;


    let highestCategory = "-";

    let highestAmount = 0;


    for (
        const category in categories
    ) {

        if (
            categories[category]
            > highestAmount
        ) {

            highestAmount =
                categories[category];

            highestCategory =
                category;

        }

    }


    document.getElementById(
        "highestCategory"
    ).textContent =
        highestCategory;
}


// ============================
// DISPLAY EXPENSES
// ============================

function displayExpenses() {

    const list =
        document.getElementById(
            "expenseList"
        );


    if (expenses.length === 0) {

        list.innerHTML = `
            <p class="empty">
                No expenses added yet.
            </p>
        `;

        return;
    }


    list.innerHTML = "";


    expenses
        .slice()
        .reverse()
        .forEach(
            expense => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "expense-item";


                div.innerHTML = `

                    <div>

                        <div class="expense-name">
                            ${expense.name}
                        </div>

                        <div class="expense-category">
                            ${expense.category}
                        </div>

                    </div>

                    <div>

                        <span class="expense-amount">

                            ₹${Number(
                                expense.amount
                            ).toFixed(2)}

                        </span>


                        <button
                            class="delete-btn"
                            onclick="deleteExpense(${expense.id})">

                            Delete

                        </button>

                    </div>

                `;


                list.appendChild(div);

            }
        );
}


// ============================
// DELETE EXPENSE
// ============================

async function deleteExpense(id) {

    const confirmed =
        confirm(
            "Delete this expense?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/expenses/${id}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            alert(
                "Unable to delete expense."
            );

            return;
        }


        await loadExpenses();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }
}


// ============================
// CHART
// ============================

function updateChart() {

    const categoryTotals = {};


    expenses.forEach(
        expense => {

            if (
                !categoryTotals[
                    expense.category
                ]
            ) {

                categoryTotals[
                    expense.category
                ] = 0;

            }


            categoryTotals[
                expense.category
            ] += Number(
                expense.amount
            );

        }
    );


    const labels =
        Object.keys(
            categoryTotals
        );


    const values =
        Object.values(
            categoryTotals
        );


    const canvas =
        document.getElementById(
            "expenseChart"
        );


    if (!canvas) {

        return;
    }


    const ctx =
        canvas.getContext("2d");


    if (expenseChart) {

        expenseChart.destroy();

    }


    expenseChart =
        new Chart(
            ctx,
            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [{

                        data: values

                    }]

                },

                options: {

                    responsive: true

                }

            }
        );
}


// ============================
// AI ANALYSIS
// ============================

async function analyzeExpenses() {

    const result =
        document.getElementById(
            "aiResult"
        );


    if (expenses.length === 0) {

        result.style.display =
            "block";

        result.innerHTML =
            "Add some expenses first.";

        return;
    }


    result.style.display =
        "block";


    result.innerHTML =
        "🤖 AI is analyzing your expenses...";


    try {

        const response =
            await fetch(
                `${API_URL}/analyze`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        expenses: expenses

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "AI analysis failed"
            );

        }


        result.innerHTML = `

            <h3>🤖 AI Insights</h3>

            <p>
                ${data.insights
                    .replace(/\n/g, "<br>")}
            </p>

        `;


    } catch (error) {

        console.error(error);

        result.innerHTML = `

            ❌ AI analysis is not
            available yet.

            <br><br>

            Your expense database
            is working correctly.

        `;

    }
}


// ============================
// START APPLICATION
// ============================

loadExpenses();