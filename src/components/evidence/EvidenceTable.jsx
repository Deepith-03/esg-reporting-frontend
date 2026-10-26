import { FileText, Calendar, HardDrive } from "lucide-react";

const EvidenceTable = ({ evidence, loading }) => {
    const formatFileSize = (bytes) => {
        if (bytes == null) return "—";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (loading) {
        return <p className="py-6 text-center text-gray-500">Loading evidence...</p>;
    }

    if (!evidence.length) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-600">No evidence uploaded for this entry.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="px-4 py-3">File</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Uploaded At</th>
                    </tr>
                </thead>

                <tbody>
                    {evidence.map((item) => (
                        <tr key={item.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className="shrink-0 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {item.fileName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.contentType || "Unknown file type"}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                                {item.description || "—"}
                            </td>

                            <td className="px-4 py-3">
                                <span className="flex items-center gap-1 text-gray-600">
                                    <HardDrive size={14} />
                                    {formatFileSize(item.fileSize)}
                                </span>
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {item.uploadedAt
                                        ? new Date(item.uploadedAt).toLocaleString()
                                        : "—"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EvidenceTable;