import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import OrganizationTable from "./OrganizationTable";
import OrganizationForm from "./OrganizationForm";
import { Toaster } from "react-hot-toast";

function Organizations({ currentUser }) {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fetchOrganizations = async () => {
        try {
            const response = await api.get("/organizations");
            setOrganizations(response.data);
            setError("");
        } catch (error) {
            console.error("Failed to fetch organizations:", error);
            setError("Unable to load organizations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleOrganizationCreated = async () => {
        await fetchOrganizations();
        setShowForm(false);
    };

    return (
        <div>
            <Toaster position="top-right" />
            <h3 className="text-2xl font-bold">Organizations</h3>

            <p className="mt-1 text-sm text-slate-500">
                Manage your registered organizations.
            </p>
            {currentUser?.role === "ADMIN" && (
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                    + Add Organization
                </button>)}

            {showForm && (
                <OrganizationForm
                    api={api}
                    onCreated={handleOrganizationCreated}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <OrganizationTable
                organizations={organizations}
                loading={loading}
                error={error}
            />
        </div>
    );
}

export default Organizations;