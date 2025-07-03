import React from "react";
import Settings from "lucide-react/dist/esm/icons/settings";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import type { InvestorData } from "../types/investor";

interface ColumnMappingProps {
  parseResult: Papa.ParseResult<string[]>;
  headerRowIndex: number;
  columnMappings: Record<number, keyof InvestorData | "ignore">;
  removedColumns: Set<number>;
  onMappingChange: (
    columnIndex: number,
    field: keyof InvestorData | "ignore"
  ) => void;
  onColumnRemove: (columnIndex: number) => void;
  onColumnRestore: (columnIndex: number) => void;
  onConfirm: () => void;
}

const FIELD_LABELS: Record<keyof InvestorData | "ignore", string> = {
  first_name: "First Name",
  last_name: "Last Name",
  email: "Email Address",
  company: "Company",
  pipeline_stage: "Pipeline Stage",
  phone: "Phone Number",
  ignore: "Ignore Column",
};

const FIELD_DESCRIPTIONS: Record<keyof InvestorData | "ignore", string> = {
  first_name: "The investor's first name",
  last_name: "The investor's last name",
  email: "Email address for contact",
  company: "Company or organization name",
  pipeline_stage: "Current stage in investment pipeline",
  phone: "Phone number for contact",
  ignore: "Skip this column during import",
};

const REQUIRED_FIELDS: (keyof InvestorData)[] = [
  "first_name",
  "last_name",
  "email",
  "pipeline_stage",
];

export const ColumnMapping: React.FC<ColumnMappingProps> = ({
  parseResult,
  headerRowIndex,
  columnMappings,
  removedColumns,
  onMappingChange,
  onColumnRemove,
  onColumnRestore,
  onConfirm,
}) => {
  const { data } = parseResult;
  const headerRow = data[headerRowIndex];
  const sampleRow = data[headerRowIndex + 1] || [];

  const availableFields = Object.keys(FIELD_LABELS) as (
    | keyof InvestorData
    | "ignore"
  )[];

  // Check which required fields are mapped (only consider active columns)
  const activeMappings = Object.entries(columnMappings).filter(
    ([columnIndex]) => !removedColumns.has(parseInt(columnIndex))
  );
  const mappedFields = activeMappings.map(([, field]) => field);
  const missingRequiredFields = REQUIRED_FIELDS.filter(
    (field) => !mappedFields.includes(field)
  );
  const hasDuplicates =
    mappedFields.filter((field) => field !== "ignore").length !==
    new Set(mappedFields.filter((field) => field !== "ignore")).size;

  const isValidMapping = missingRequiredFields.length === 0 && !hasDuplicates;

  // Calculate statistics
  const activeColumnsCount = headerRow.length - removedColumns.size;
  const mappedCount = mappedFields.filter((f) => f !== "ignore").length;
  const ignoredCount = mappedFields.filter((f) => f === "ignore").length;

  const renderColumnCard = (header: string, columnIndex: number) => {
    const sampleValue = sampleRow[columnIndex] || "";
    const currentMapping = columnMappings[columnIndex] || "ignore";
    const isRequired = REQUIRED_FIELDS.includes(
      currentMapping as keyof InvestorData
    );
    const isDuplicate =
      mappedFields.filter(
        (field) => field === currentMapping && field !== "ignore"
      ).length > 1;

    return (
      <div
        key={columnIndex}
        className={`
          bg-white border rounded-lg p-4 transition-all duration-200
          ${
            isDuplicate
              ? "border-red-300 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }
        `}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-medium text-gray-900 truncate"
              title={header}
            >
              {header || `Column ${columnIndex + 1}`}
            </h3>
            <p
              className="text-xs text-gray-500 mt-1 truncate"
              title={sampleValue}
            >
              Sample: {sampleValue || <span className="italic">empty</span>}
            </p>
          </div>
          {isRequired && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Required
            </span>
          )}
        </div>

        <div className="relative">
          <select
            value={currentMapping}
            onChange={(e) =>
              onMappingChange(
                columnIndex,
                e.target.value as keyof InvestorData | "ignore"
              )
            }
            className={`
              w-full px-3 py-2 text-sm border rounded-md appearance-none bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${isDuplicate ? "border-red-300" : "border-gray-300"}
            `}
          >
            {availableFields.map((field) => (
              <option key={field} value={field}>
                {FIELD_LABELS[field]}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {currentMapping !== "ignore" && (
          <p className="text-xs text-gray-600 mt-2">
            {FIELD_DESCRIPTIONS[currentMapping]}
          </p>
        )}

        {isDuplicate && (
          <div className="flex items-center space-x-1 mt-2 text-red-600">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs">Field already mapped</span>
          </div>
        )}

        {/* Remove Column Button */}
        <div className="flex items-center justify-end mt-3">
          <button
            onClick={() => onColumnRemove(columnIndex)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove Column</span>
          </button>
        </div>
      </div>
    );
  };

  const renderRemovedColumnCard = (header: string, columnIndex: number) => {
    const sampleValue = sampleRow[columnIndex] || "";

    return (
      <div
        key={columnIndex}
        className="bg-gray-50 border border-gray-300 rounded-lg p-4 transition-all duration-200 opacity-75"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-medium text-gray-500 truncate"
              title={header}
            >
              {header || `Column ${columnIndex + 1}`}
            </h3>
            <p
              className="text-xs text-gray-400 mt-1 truncate"
              title={sampleValue}
            >
              Sample: {sampleValue || <span className="italic">empty</span>}
            </p>
          </div>
          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
            Removed
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            This column will be excluded from processing
          </p>
          <button
            onClick={() => onColumnRestore(columnIndex)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Map Columns to Fields
            </h2>
            <p className="text-gray-600">
              Match your CSV columns to the appropriate investor data fields
            </p>
          </div>
        </div>

        {/* Validation Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-3">
            {isValidMapping ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                {isValidMapping ? "Mapping Complete" : "Mapping Issues"}
              </h3>
              {!isValidMapping && (
                <div className="mt-2 space-y-1">
                  {missingRequiredFields.length > 0 && (
                    <p className="text-sm text-amber-700">
                      Missing required fields:{" "}
                      {missingRequiredFields
                        .map((field) => FIELD_LABELS[field])
                        .join(", ")}
                    </p>
                  )}
                  {hasDuplicates && (
                    <p className="text-sm text-red-700">
                      Some fields are mapped to multiple columns
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Columns */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Active Columns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {headerRow.map((header, index) =>
              !removedColumns.has(index)
                ? renderColumnCard(header, index)
                : null
            )}
          </div>
        </div>

        {/* Removed Columns */}
        {removedColumns.size > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Removed Columns ({removedColumns.size})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {headerRow.map((header, index) =>
                removedColumns.has(index)
                  ? renderRemovedColumnCard(header, index)
                  : null
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{headerRow.length}</span> total
            columns •<span className="font-medium"> {activeColumnsCount}</span>{" "}
            active •<span className="font-medium"> {mappedCount}</span> mapped •
            <span className="font-medium"> {ignoredCount}</span> ignored •
            <span className="font-medium text-red-600">
              {" "}
              {removedColumns.size}
            </span>{" "}
            removed
          </div>

          <button
            onClick={onConfirm}
            disabled={!isValidMapping}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors duration-200
              ${
                isValidMapping
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            Process Data
          </button>
        </div>
      </div>
    </div>
  );
};
