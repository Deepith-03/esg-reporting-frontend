import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password) {
            toast.error("Enter your username and password");
            return;
        }

        setLoading(true);

        try {
            await onLogin(username.trim(), password);
        } catch {
            toast.error("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-lg"
            >
                <div className="text-center">
                    <ShieldCheck className="mx-auto mb-3 text-blue-600" size={42} />
                    <h1 className="text-2xl font-bold text-gray-800">
                        FutureTrPr ESG
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to your reporting platform
                    </p>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Username
                    </label>
                    <input
                        type="text"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter username"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Password
                    </label>
                    <input
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
        </div>
    );
};

export default Login;
