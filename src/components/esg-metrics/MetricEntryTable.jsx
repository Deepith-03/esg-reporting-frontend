
function MetricEntryTable({
  entries,
  metricDefinitions,
  loading,
  error,
}) {
  const getMetricName = (entry) => {
    const metricId =
      entry.metricDefinitionId ?? entry.metricDefinition?.id;

    const metric = metricDefinitions.find(
      (item) => String(item.id) === String(metricId)
    );

    return (
      metric?.name ||
      entry.metricDefinition?.name ||
      `Metric #${metricId ?? "—"}`
    );
  };

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4">Metric</th>
            <th className="px-6 py-4">Value</th>
            <th className="px-6 py-4">Data Status</th>
            <th className="px-6 py-4">Data Source</th>
            <th className="px-6 py-4">Assumptions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center">
                Loading metric entries...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-red-600">
                {error}
              </td>
            </tr>
          ) : entries.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                No metric entries found for this period.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b last:border-0 hover:bg-slate-50"
              >
                <td className="px-6 py-4 font-medium">
                  {getMetricName(entry)}
                </td>
                <td className="px-6 py-4">
                  {entry.value ?? "—"}
                </td>
                <td className="px-6 py-4">
                  {entry.dataStatus || "—"}
                </td>
                <td className="px-6 py-4">
                  {entry.dataSource || "—"}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {entry.assumptions || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MetricEntryTable;
