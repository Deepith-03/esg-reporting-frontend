
import { useState } from "react";
import { Search } from "lucide-react";

function OrganizationTable({ organizations, loading, error }) {
    const [search, setSearch] = useState("");

    const filteredOrganizations = organizations.filter((org) =>
        `${org.name || ""} ${org.industry || org.sector || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    return (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
                <div className="relative max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search organizations..."
                        className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
                    />
                </div>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-6 py-4">Organization ID</th>
                        <th className="px-6 py-4">Organization Name</th>
                        <th className="px-6 py-4">Industry</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="3" className="px-6 py-8 text-center">
                                Loading organizations...
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-red-600">
                                {error}
                            </td>
                        </tr>
                    ) : organizations.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                No organizations registered yet.
                            </td>
                        </tr>
                    ) : (
                        filteredOrganizations.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                    No matching organizations found.
                                </td>
                            </tr>
                        ) : (
                            filteredOrganizations.map((org) => (
                                <tr key={org.id} className="border-b last:border-0">
                                    <td className="px-6 py-4">{org.id}</td>
                                    <td className="px-6 py-4 font-medium">
                                        {org.name || "—"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {org.industry || org.sector || "—"}
                                    </td>
                                </tr>
                            ))
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default OrganizationTable;

