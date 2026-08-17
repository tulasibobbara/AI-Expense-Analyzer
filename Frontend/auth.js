const API_URL = "http://127.0.0.1:8000";


// ==========================
// REGISTER
// ==========================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value;

            const email =
                document.getElementById("email").value;

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("message");


            message.textContent =
                "Creating account...";


            try {

                const response = await fetch(
                    `${API_URL}/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password
                        })
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.detail ||
                        "Registration failed.";

                    return;
                }


                message.textContent =
                    "Registration successful!";


                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1000);


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Unable to connect to server.";

            }

        }
    );

}



// ==========================
// LOGIN
// ==========================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value;


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            message.textContent =
                "Logging in...";


            try {

                const response = await fetch(
                    `${API_URL}/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.detail ||
                        "Login failed.";

                    return;
                }


                // Save login information

                localStorage.setItem(
                    "access_token",
                    data.access_token
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );


                message.textContent =
                    "Login successful!";


                // Go to dashboard

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 800);


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Unable to connect to server.";

            }

        }
    );

}