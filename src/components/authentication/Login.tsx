import { useState, useEffect } from "react";
import { login } from "../../services/AuthenticationService";
import { motion, AnimatePresence } from "framer-motion";
import { LoginErrors, LoginProps } from "../../types";

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<LoginErrors>({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();
        setErrorMessage("");
        const newErrors: Partial<LoginErrors> = {};

        if (!email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email format";
        }

        if (!password) newErrors.password = "Password is required";

        setErrors(newErrors as LoginErrors);
        if (newErrors.email || newErrors.password) return;
        try {
            setLoading(true);
            const response = await login(email, password);
            if (response.error) {
                setErrorMessage(response.error);
            }
            onLogin();
        } catch (err: any) {
            console.error(err.message);
            const errorObj = JSON.parse(
                err.message.replace("Both APIs failed: ", "")
            );
            setErrorMessage(errorObj.error);
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        if (name === "email") {
            setEmail(value);
        } else {
            setPassword(value);
        }

        // Clear error when user starts typing
        if (errors) {
            setErrors({ email: "", password: "" });
        }
    };

    return (
        <div className="w-full max-w-md bg-white dark:bg-[#1E1E2A] rounded-2xl">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-[#F8F8FC] md:text-2xl flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-purple-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                    </svg>
                    Sign in to your account
                </h1>

                <AnimatePresence>
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="p-2 text-sm text-red-600 bg-red-100 dark:bg-red-900 rounded-lg">
                                {errorMessage}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form
                    className="space-y-4 md:space-y-6"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-[#F8F8FC]"
                        >
                            Your email
                            {errors.email && (
                                <span className="ml-1 text-xs text-red-600">
                                    ({errors.email})
                                </span>
                            )}
                        </label>
                        <input
                            id="email"
                            name="email"
                            className={`bg-gray-50 dark:bg-[#2A2A3A] border ${
                                errors.email
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-[#32324A]"
                            } text-gray-900 dark:text-[#F8F8FC] rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5`}
                            placeholder="name@company.com"
                            value={email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-[#F8F8FC]"
                        >
                            Password
                            {errors.password && (
                                <span className="ml-1 text-xs text-red-600">
                                    ({errors.password})
                                </span>
                            )}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            autoComplete="off"
                            className={`bg-gray-50 dark:bg-[#2A2A3A] border ${
                                errors.password
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-[#32324A]"
                            } text-gray-900 dark:text-[#F8F8FC] rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5`}
                            placeholder="••••••••"
                            value={password}
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300"
                        }`}
                    >
                        {loading ? (
                            <div className="flex justify-center items-center h-5">
                                <div role="status">
                                    <svg
                                        aria-hidden="true"
                                        className="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-purple-400"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"
                                        />
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>
                <div className="text-sm text-center text-gray-500 dark:text-[#A0A0B8]">
                    <span>Don't have an account? </span>
                    <button
                        onClick={onSwitchToRegister}
                        className="font-medium text-purple-600 hover:underline"
                    >
                        Create an account
                    </button>
                </div>
            </div>
        </div>
    );
}
