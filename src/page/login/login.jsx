import { gql, useLazyQuery } from "@apollo/client";
import bcrypt from "bcryptjs";
import React, { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { img1, img6 } from "../../assets";
import { Footer, Notification } from "../../components";

// Define the GraphQL query for user authentication
const LOGIN_QUERY = gql`
  query MyQuery($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      nama
      email
      password
      foto_profile
      role_id
      mahasiswas {
        id
        NIM
        card_motors {
          id
          foto_STNK
          foto_KTM
          foto_motor
          foto_QR_Code
        }
      }
    }
  }
`;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(false);
  const navigate = useNavigate();
  const [login, { loading, error, data }] = useLazyQuery(LOGIN_QUERY);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(false); // Reset notification before new login attempt

    // Fetch user data
    const { data } = await login({ variables: { email } });

    if (data && data.users.length > 0) {
      const user = data.users.find((user) =>
        bcrypt.compareSync(password, user.password)
      );

      if (user) {
        const { role_id } = user;

        // Store user details in localStorage
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on role_id
        if (role_id === 1) navigate("/dashboard");
        else if (role_id === 2) navigate("/dashboard-petugas");
        else if (role_id === 3) navigate("/dashboard-mahasiswa");
      } else {
        setNotification(true);
      }
    } else {
      setNotification(true);
    }
  };

  const closeNotification = () => {
    setNotification(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white-maron">
      <div className="flex-grow flex items-center justify-center relative">
        <img
          src={img1}
          alt="Telkom University Surabaya"
          className="absolute top-4 right-4 w-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg 2xl:max-w-xl"
          style={{ maxWidth: "160px" }}
        />
        <div
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
          style={{ width: "90%" }}
        >
          <h1 className="text-2xl font-bold text-center text-red-700">LOGIN</h1>
          <hr className="my-2 bg-red-maron pt-1" />
          <p className="text-center font-bold text-gray-600">
            Parking Telkom University
          </p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="mb-4">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-red-maron placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm rounded-full"
                  placeholder="Enter Your Email"
                />
              </div>
              <div className="mb-4 relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-red-maron placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm rounded-full"
                  placeholder="Enter Your Password"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <BsEye className="h-5 w-5 text-gray-500" />
                  ) : (
                    <BsEyeSlash className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-red-maron hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={loading}
              >
                {loading ? "Logging in..." : "LOGIN"}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-center">
                Login failed. Please try again.
              </p>
            )}
            <div className="flex justify-center">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Forgot Password?
                </a>
              </div>
            </div>
          </form>
        </div>

        <img
          src={img6}
          alt="login image"
          className="hidden md:block w-full max-w-sm ms-32"
        />
      </div>
      <Notification
        message={"Invalid email or password"}
        visible={notification}
        onClose={closeNotification}
      />
      <Footer />
    </div>
  );
};

export default Login;
