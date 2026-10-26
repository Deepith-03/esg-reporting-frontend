import axios from "axios";

/**
 * Resolves and normalizes the backend API base URL:
 * 1. Reads import.meta.env.VITE_API_BASE_URL if configured (e.g. in Vercel or .env).
 * 2. Normalizes the URL by removing trailing slashes and ensuring '/api' suffix is present without duplication.
 * 3. In local development (!import.meta.env.PROD), falls back safely to 'http://localhost:8081/api'.
 * 4. In production (import.meta.env.PROD), refuses to silently use localhost and raises a clear configuration error.
 */
const resolveBaseUrl = () => {
    const rawEnvUrl = import.meta.env.VITE_API_BASE_URL;

    if (rawEnvUrl && rawEnvUrl.trim() !== "") {
        // Remove any trailing slashes
        let url = rawEnvUrl.trim().replace(/\/+$/, "");
        // Ensure '/api' suffix is present without duplication
        if (!url.endsWith("/api")) {
            url = `${url}/api`;
        }
        return url;
    }

    if (import.meta.env.PROD) {
        console.error(
            "[ESG Platform Configuration Error] VITE_API_BASE_URL is not defined in this production build. " +
            "Please configure VITE_API_BASE_URL in your deployment platform settings (e.g. Vercel Project Settings -> Environment Variables) " +
            "with value 'https://esg-reporting-backend-1.onrender.com/api', then redeploy."
        );
        return "";
    }

    // Safe fallback for local development only
    return "http://localhost:8081/api";
};

const resolvedBaseUrl = resolveBaseUrl();

const api = axios.create({
    baseURL: resolvedBaseUrl,
});

// Guard against missing API URL in production
api.interceptors.request.use(
    (config) => {
        if (!config.baseURL) {
            const missingUrlError = new Error(
                "API configuration error: VITE_API_BASE_URL is missing. " +
                "Please configure VITE_API_BASE_URL in your Vercel project environment variables and redeploy."
            );
            console.error(missingUrlError.message);
            return Promise.reject(missingUrlError);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
