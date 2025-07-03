import React from "react";
import Eye from "lucide-react/dist/esm/icons/eye";

interface PreviewTableProps {
  parseResult: Papa.ParseResult<string[]>;
  onContinue: () => void;
  maxRowsToShow?: number;
  maxColsToShow?: number;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  parseResult,
  onContinue,
  maxRowsToShow = 10,
  maxColsToShow = 10,
}) => {
  const { data } = parseResult;
  const previewData = data.slice(0, maxRowsToShow);
  const maxColumns = Math.max(...data.map((row) => row.length));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Preview CSV Data
            </h2>
            <p className="text-gray-600">
              Review your uploaded CSV data exactly as it was read
            </p>
          </div>
        </div>

        {/* Data Statistics */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Total Rows:</span>
              <span className="ml-2 text-gray-600">{data.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Total Columns:</span>
              <span className="ml-2 text-gray-600">{maxColumns}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Preview Rows:</span>
              <span className="ml-2 text-gray-600">{previewData.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Delimiter:</span>
              <span className="ml-2 text-gray-600">
                {parseResult.meta?.delimiter
                  ? `"${parseResult.meta.delimiter}"`
                  : "Auto-detected"}
              </span>
            </div>
          </div>
        </div>

        {/* Preview Table */}
        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Row
                  </th>
                  {Array.from(
                    { length: Math.min(maxColumns, maxColsToShow) },
                    (_, colIndex) => (
                      <th
                        key={colIndex}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32"
                      >
                        Column {colIndex + 1}
                      </th>
                    )
                  )}
                  {maxColumns > maxColsToShow && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      +{maxColumns - maxColsToShow} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rowIndex + 1}
                    </td>
                    {Array.from(
                      { length: Math.min(maxColumns, maxColsToShow) },
                      (_, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 max-w-48 truncate"
                          title={row[colIndex] || ""}
                        >
                          {row[colIndex] || (
                            <span className="text-gray-400 italic">empty</span>
                          )}
                        </td>
                      )
                    )}
                    {maxColumns > maxColsToShow && (
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        ...
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Show truncation info */}
        {(data.length > maxRowsToShow || maxColumns > maxColsToShow) && (
          <div className="mb-6 text-sm text-gray-500 text-center space-y-1">
            {data.length > maxRowsToShow && (
              <p>
                Showing first {maxRowsToShow} rows of {data.length} total rows
              </p>
            )}
            {maxColumns > maxColsToShow && (
              <p>
                Showing first {maxColsToShow} columns of {maxColumns} total
                columns
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Data loaded successfully - ready to select headers
          </div>

          <button
            onClick={onContinue}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue to Header Selection
          </button>
        </div>
      </div>
    </div>
  );
};
