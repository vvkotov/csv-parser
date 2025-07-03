import React from "react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Table from "lucide-react/dist/esm/icons/table";

interface SelectHeaderRowProps {
  parseResult: Papa.ParseResult<string[]>;
  selectedRowIndex: number | null;
  onRowSelect: (rowIndex: number) => void;
  onConfirm: () => void;
  maxRowsToShow?: number;
}

export const SelectHeaderRow: React.FC<SelectHeaderRowProps> = ({
  parseResult,
  selectedRowIndex,
  onRowSelect,
  onConfirm,
  maxRowsToShow = 10,
}) => {
  const { data } = parseResult;
  const rowsToShow = data.slice(0, maxRowsToShow);

  const renderRow = (row: string[], index: number) => {
    const isSelected = selectedRowIndex === index;
    const isEmpty = row.every((cell) => !cell || cell.trim() === "");

    if (isEmpty) return null;

    return (
      <div
        key={index}
        className={`
          border rounded-lg p-4 cursor-pointer transition-all duration-200
          ${
            isSelected
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }
        `}
        onClick={() => onRowSelect(index)}
      >
        <div className="flex items-start space-x-4">
          <div className="flex items-center mt-1">
            <input
              type="radio"
              name="header-row"
              checked={isSelected}
              onChange={() => onRowSelect(index)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-900">
                Row {index + 1}
              </span>
              {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {row.slice(0, 8).map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  className="text-sm text-gray-700 bg-white px-2 py-1 rounded border truncate"
                  title={cell}
                >
                  {cell || <span className="text-gray-400 italic">empty</span>}
                </div>
              ))}
              {row.length > 8 && (
                <div className="text-sm text-gray-500 px-2 py-1">
                  +{row.length - 8} more columns
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Table className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Select Headers Row
            </h2>
            <p className="text-gray-600">
              Choose which row contains your column headers
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {rowsToShow.map((row, index) => renderRow(row, index))}
        </div>

        {data.length > maxRowsToShow && (
          <div className="text-sm text-gray-500 text-center py-2 border-t border-gray-200">
            Showing first {maxRowsToShow} rows of {data.length} total rows
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedRowIndex !== null
              ? `Selected row ${selectedRowIndex + 1} as header`
              : "Please select a header row to continue"}
          </div>

          <button
            onClick={onConfirm}
            disabled={selectedRowIndex === null}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors duration-200
              ${
                selectedRowIndex !== null
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
