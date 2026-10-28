
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

    // Fetch the current user's profile.
    useEffect(() => {
        const getUser = async () => {
            if (user == null) {
                setUserData(null);
                return;
            }

            try {
                const response = await axios.post(
                    `${backendUrl}/user/getUser`,
                    { id: user }
                );

                const result = response.data;

                if (result.status === true) {
                    setUserData(result.data);
                } else {
                    setUserData(null);
                    setUser(null);
                    sessionStorage.removeItem("user");
                }
            } catch (error) {
                console.error(
                    "Failed to fetch user profile:",
                    error.response?.data?.message || error.message
                );
            }
        };

        getUser();
    }, [user]);

    // Shared helper for authentication requests.
    const authRequest = async (path, payload) => {
        try {
            const response = await axios.post(
                `${backendUrl}/auth${path}`,
                payload,
                { withCredentials: true }
            );

            const result = response.data;

            if (!result || result.status === false) {
                throw new Error(
                    result?.message || "Authentication request failed."
                );
            }

            return result;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Something went wrong. Please try again."
            );
        }
    };

    // Register a new user.
    const register = async (data) => {
        return authRequest("/register", {
            ...data,
            fullname: data.fullname?.trim(),
            email: data.email?.trim().toLowerCase(),
            phone: data.phone?.trim(),
        });
    };

    // Log in an existing user.
    const login = async (credentials) => {
        const result = await authRequest("/login", {
            ...credentials,
            email: credentials.email?.trim().toLowerCase(),
        });

        const account =
            result.userData ||
            result.user ||
            result.data?.userData ||
            result.data?.user ||
            (
                result.data &&
                    typeof result.data === "object"
                    ? result.data
                    : null
            );

        const userId =
            account?._id ||
            account?.id ||
            result.userId ||
            result._id ||
            result.data?._id ||
            (
                typeof result.user === "string"
                    ? result.user
                    : null
            );

        if (!userId) {
            throw new Error(
                "Login succeeded, but no user ID was found in the response. Check your /auth/login response."
            );
        }

        sessionStorage.setItem("user", String(userId));
        setUser(String(userId));

        return result;
    };

    // Resend the email verification code.
    const resendVerificationCode = async (email) => {
        return authRequest("/resend-verification-code", {
            email: email.trim().toLowerCase(),
        });
    };

    // Request a password reset code.
    const forgotPassword = async (email) => {
        return authRequest("/forgot-password", {
            email: email.trim().toLowerCase(),
        });
    };

    // Verify a new user's email address.
    const verifyEmail = async (email, code) => {
        return authRequest("/verify-email", {
            email: email.trim().toLowerCase(),
            code: code.trim(),
        });
    };

    // Verify a password-reset code.
    const verifyResetCode = async (email, code) => {
        const result = await authRequest("/verify-reset-code", {
            email: email.trim().toLowerCase(),
            code: code.trim(),
        });

        if (!result.status) {
            throw new Error(
                result.message || "Invalid or expired reset code."
            );
        }

        return result;
    };

    // Reset the user's password.
    const resetPassword = async ({
        email,
        resetToken,
        password,
    }) => {
        if (!password || password.length < 8) {
            throw new Error(
                "Your new password must contain at least 8 characters."
            );
        }

        return authRequest("/reset-password", {
            email: email.trim().toLowerCase(),
            resetToken,
            password,
        });
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

                resendVerificationCode,
                forgotPassword,
                verifyEmail,
                verifyResetCode,
                resetPassword,
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
