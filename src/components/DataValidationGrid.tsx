import React, { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  CellClassParams,
  CellEditingStoppedEvent,
} from "ag-grid-community";
import Database from "lucide-react/dist/esm/icons/database";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Save from "lucide-react/dist/esm/icons/save";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import type { InvestorData } from "../types/investor";
import { PIPELINE_STAGES, type PipelineStage } from "../types/pipelineStage";
import type { ValidationResult } from "../types/validationResult";
import {
  validateEmail,
  validateRequired,
  validatePipelineStage,
  validatePhone,
} from "../utils/validateCell";

// Import ag-grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface DataValidationGridProps {
  parseResult: Papa.ParseResult<string[]>;
  headerRowIndex: number;
  columnMappings: Record<number, keyof InvestorData | "ignore">;
  onSave: (validatedData: InvestorData[]) => void;
}

const FIELD_LABELS: Record<keyof InvestorData, string> = {
  first_name: "First Name",
  last_name: "Last Name",
  email: "Email",
  company: "Company",
  pipeline_stage: "Pipeline Stage",
  phone: "Phone",
};

export const DataValidationGrid: React.FC<DataValidationGridProps> = ({
  parseResult,
  headerRowIndex,
  columnMappings,
  onSave,
}) => {
  const [rowData, setRowData] = useState<Record<string, string>[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Map<string, ValidationResult>
  >(new Map());
  const [isDataReady, setIsDataReady] = useState(false);
  const [removedRows, setRemovedRows] = useState<Set<string>>(new Set());

  const validateCell = (
    field: keyof InvestorData,
    value: string
  ): ValidationResult => {
    switch (field) {
      case "email":
        return validateEmail(value);
      case "first_name":
        return validateRequired(value, "First name");
      case "last_name":
        return validateRequired(value, "Last name");
      case "pipeline_stage":
        return validatePipelineStage(value);
      case "phone":
        return validatePhone(value);
      case "company":
        return { isValid: true }; // Company is optional
      default:
        return { isValid: true };
    }
  };

  // Row removal handlers
  const handleRemoveRow = useCallback((rowId: string) => {
    setRemovedRows((prev) => new Set([...prev, rowId]));
  }, []);

  const handleRestoreRow = useCallback((rowId: string) => {
    setRemovedRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(rowId);
      return newSet;
    });
  }, []);

  // Action cell renderer for remove/restore buttons
  const ActionCellRenderer = useCallback(
    ({ data }: { data: Record<string, string> }) => {
      const isRemoved = removedRows.has(data.id);

      if (isRemoved) {
        return (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => handleRestoreRow(data.id)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              title="Restore row"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={() => handleRemoveRow(data.id)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
            title="Remove row"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    },
    [removedRows, handleRestoreRow, handleRemoveRow]
  );

  // Process CSV data based on mappings
  const processedData = useMemo(() => {
    if (!parseResult.data || headerRowIndex === null) return [];

    const dataRows = parseResult.data.slice(headerRowIndex + 1);
    const processed = dataRows
      .map((row, index) => {
        const processedRow: Record<string, string> = { id: index.toString() };

        Object.entries(columnMappings).forEach(([colIndex, field]) => {
          if (field !== "ignore") {
            const value = row[parseInt(colIndex)] || "";
            processedRow[field] = value;
          }
        });

        return processedRow;
      })
      .filter((row) => {
        // Filter out completely empty rows
        const hasData = Object.keys(row).some(
          (key) => key !== "id" && row[key] && row[key].trim() !== ""
        );
        return hasData;
      });

    setRowData(processed);
    setIsDataReady(processed.length > 0);
    return processed;
  }, [parseResult.data, headerRowIndex, columnMappings]);

  // Create column definitions
  const columnDefs = useMemo(() => {
    const mappedFields = Object.values(columnMappings).filter(
      (field) => field !== "ignore"
    ) as (keyof InvestorData)[];

    const dataColumns = mappedFields.map(
      (field): ColDef => ({
        field,
        headerName: FIELD_LABELS[field],
        editable: (params) => !removedRows.has(params.data.id),
        cellClass: (params: CellClassParams) => {
          const isRemoved = removedRows.has(params.data.id);
          const cellId = `${params.node.id}-${field}`;
          const validation = validationErrors.get(cellId);

          let classes = "";
          if (isRemoved) {
            classes += "opacity-50 bg-gray-50";
          }
          if (validation && !validation.isValid && !isRemoved) {
            classes += " invalid-cell";
          }
          return classes;
        },
        cellEditor:
          field === "pipeline_stage"
            ? "agSelectCellEditor"
            : "agTextCellEditor",
        cellEditorParams:
          field === "pipeline_stage"
            ? {
                values: PIPELINE_STAGES,
              }
            : undefined,
        tooltipValueGetter: (params) => {
          if (!params.node) return null;
          if (removedRows.has(params.data.id)) {
            return "This row is marked for removal";
          }
          const cellId = `${params.node.id}-${field}`;
          const validation = validationErrors.get(cellId);
          if (validation && !validation.isValid) {
            return validation.message;
          }
          return null;
        },
        flex: 1,
        resizable: true,
        sortable: true,
        filter: true,
      })
    );

    // Add actions column
    const actionsColumn: ColDef = {
      field: "actions",
      headerName: "Actions",
      cellRenderer: ActionCellRenderer,
      editable: false,
      sortable: false,
      filter: false,
      resizable: false,
      width: 84,
      pinned: "right",
    };

    return [...dataColumns, actionsColumn];
  }, [columnMappings, validationErrors, removedRows, ActionCellRenderer]);

  // Validate all data
  const validateAllData = useCallback(() => {
    const newValidationErrors = new Map<string, ValidationResult>();

    rowData.forEach((row, rowIndex) => {
      // Skip validation for removed rows
      if (removedRows.has(row.id)) {
        return;
      }

      Object.keys(row).forEach((field) => {
        if (field !== "id") {
          const cellId = `${rowIndex}-${field}`;
          const validation = validateCell(
            field as keyof InvestorData,
            row[field] || ""
          );
          newValidationErrors.set(cellId, validation);
        }
      });
    });

    setValidationErrors(newValidationErrors);
    return newValidationErrors;
  }, [rowData, removedRows]);

  // Handle cell editing
  const onCellEditingStopped = useCallback((event: CellEditingStoppedEvent) => {
    const { node, colDef, newValue } = event;
    const field = colDef.field as keyof InvestorData;
    const cellId = `${node.id}-${field}`;

    const validation = validateCell(field, newValue || "");
    setValidationErrors((prev) => new Map(prev.set(cellId, validation)));
  }, []);

  // Calculate validation summary
  const validationSummary = useMemo(() => {
    const errors = Array.from(validationErrors.values());
    const totalCells = errors.length;
    const invalidCells = errors.filter((v) => !v.isValid).length;
    const validCells = totalCells - invalidCells;
    const activeRows = rowData.filter((row) => !removedRows.has(row.id));
    const removedRowCount = removedRows.size;

    return {
      totalCells,
      validCells,
      invalidCells,
      activeRows: activeRows.length,
      removedRows: removedRowCount,
      totalRows: rowData.length,
      isAllValid: invalidCells === 0 && totalCells > 0,
    };
  }, [validationErrors, rowData, removedRows]);

  // Handle save
  const handleSave = useCallback(() => {
    const finalValidation = validateAllData();
    const hasErrors = Array.from(finalValidation.values()).some(
      (v) => !v.isValid
    );

    if (!hasErrors) {
      // Only save non-removed rows
      const activeRows = rowData.filter((row) => !removedRows.has(row.id));
      const validatedData: InvestorData[] = activeRows.map((row) => ({
        first_name: row.first_name || "",
        last_name: row.last_name || "",
        email: row.email || "",
        company: row.company || null,
        pipeline_stage: row.pipeline_stage as PipelineStage,
        phone: row.phone || null,
      }));

      onSave(validatedData);
    }
  }, [rowData, removedRows, validateAllData, onSave]);

  // Initialize validation on mount
  React.useEffect(() => {
    if (isDataReady && processedData.length > 0) {
      setTimeout(() => validateAllData(), 200);
    }
  }, [isDataReady, processedData, validateAllData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Validate & Edit Data
            </h2>
            <p className="text-gray-600">
              Review and correct any invalid data before importing
            </p>
          </div>
        </div>

        {/* Validation Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-3">
            {validationSummary.isAllValid ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Data Validation Summary
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-green-600">
                  {validationSummary.validCells}
                </span>{" "}
                valid •
                <span className="font-medium text-red-600 ml-1">
                  {validationSummary.invalidCells}
                </span>{" "}
                invalid •
                <span className="font-medium text-blue-600 ml-1">
                  {validationSummary.activeRows}
                </span>{" "}
                active rows
                {validationSummary.removedRows > 0 && (
                  <>
                    {" "}
                    •
                    <span className="font-medium text-gray-500 ml-1">
                      {validationSummary.removedRows}
                    </span>{" "}
                    removed
                  </>
                )}
              </div>
              {!validationSummary.isAllValid && (
                <p className="text-sm text-amber-700 mt-1">
                  Please fix invalid cells (highlighted in red) before saving
                </p>
              )}
              {validationSummary.removedRows > 0 && (
                <p className="text-sm text-blue-700 mt-1">
                  Removed rows will be excluded from the final import
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="mb-6">
          {!isDataReady ? (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading data...</p>
              </div>
            </div>
          ) : (
            <div
              className="ag-theme-alpine"
              style={{ height: "500px", width: "100%", minWidth: "300px" }}
            >
              <AgGridReact
                key={`grid-${rowData.length}-${JSON.stringify(columnMappings)}`}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={{
                  sortable: true,
                  filter: true,
                  resizable: true,
                  editable: true,
                }}
                onCellEditingStopped={onCellEditingStopped}
                suppressRowClickSelection={true}
                rowSelection="multiple"
                animateRows={true}
                tooltipShowDelay={500}
                suppressLoadingOverlay={true}
                suppressNoRowsOverlay={false}
                singleClickEdit={true}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{validationSummary.activeRows}</span>{" "}
            rows ready for import
            {validationSummary.removedRows > 0 && (
              <span className="ml-2 text-gray-500">
                ({validationSummary.removedRows} removed)
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={
              !validationSummary.isAllValid ||
              validationSummary.activeRows === 0
            }
            className={`
              flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors duration-200
              ${
                validationSummary.isAllValid && validationSummary.activeRows > 0
                  ? "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            <Save className="w-4 h-4" />
            <span>Save Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
