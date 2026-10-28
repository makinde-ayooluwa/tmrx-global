
import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { backendUrl } from "../constants/backendUrl";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved user ID when the app loads.
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("user");

    if (storedUserId) {
      setUser(storedUserId);
    }

    setLoading(false);
  }, []);

  // Register a new user.
  const register = async (data) => {
    try {
      const response = await axios.post(
        `${backendUrl}/auth/register`,
        data,
        { withCredentials: true }
      );

      const result = response.data;

      if (!result || result.status === false) {
        throw new Error(
          result?.message || "Registration failed."
        );
      }

      return result;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Internal server error."
      );
    }
  };

  // Log in an existing user.
  const login = async (credentials) => {
    try {
      const response = await axios.post(
        `${backendUrl}/auth/login`,
        credentials,
        { withCredentials: true }
      );

      const result = response.data;

      if (!result || result.status === false) {
        throw new Error(
          result?.message || "Login failed."
        );
      }

      // Support common backend response formats.
      const account =
        result.userData ||
        result.user ||
        result.data?.userData ||
        result.data?.user ||
        (result.data &&
        typeof result.data === "object"
          ? result.data
          : null);

      const userId =
        account?._id ||
        account?.id ||
        result.userId ||
        result._id ||
        result.data?._id ||
        (typeof result.user === "string"
          ? result.user
          : null);

      if (!userId) {
        throw new Error(
          "Login succeeded, but no user ID was found in the response. Check your /auth/login response."
        );
      }

      sessionStorage.setItem("user", String(userId));

      setUser(String(userId));
      setUserData(account || result);

      return result;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Unable to log in."
      );
    }
  };

  // Log out the current user.
  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setUserData(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used inside a UserProvider."
    );
  }

  return context;
};
