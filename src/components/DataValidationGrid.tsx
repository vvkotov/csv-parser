import React, { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  CellClassParams,
  CellEditingStoppedEvent,
} from "ag-grid-community";
import { Database, AlertTriangle, CheckCircle, Save } from "lucide-react";
import type { InvestorData, PipelineStage } from "./types/investor";

// Import ag-grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface DataValidationGridProps {
  parseResult: Papa.ParseResult<string[]>;
  headerRowIndex: number;
  columnMappings: Record<number, keyof InvestorData | "ignore">;
  onSave: (validatedData: InvestorData[]) => void;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  "target",
  "prospect",
  "engaged",
  "evaluating",
  "allocated",
  "dormant",
  "lost",
];

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

  // Helper functions for validation
  const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim() === "") {
      return { isValid: false, message: "Email is required" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim())
      ? { isValid: true }
      : { isValid: false, message: "Invalid email format" };
  };

  const validateRequired = (
    value: string,
    fieldName: string
  ): ValidationResult => {
    if (!value || value.trim() === "") {
      return { isValid: false, message: `${fieldName} is required` };
    }
    return { isValid: true };
  };

  const validatePipelineStage = (stage: string): ValidationResult => {
    if (!stage || stage.trim() === "") {
      return { isValid: false, message: "Pipeline stage is required" };
    }
    return PIPELINE_STAGES.includes(stage.toLowerCase() as PipelineStage)
      ? { isValid: true }
      : {
          isValid: false,
          message: `Must be one of: ${PIPELINE_STAGES.join(", ")}`,
        };
  };

  const validatePhone = (phone: string): ValidationResult => {
    if (!phone || phone.trim() === "") {
      return { isValid: true }; // Phone is optional
    }
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ""))
      ? { isValid: true }
      : { isValid: false, message: "Invalid phone format" };
  };

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

    return mappedFields.map(
      (field): ColDef => ({
        field,
        headerName: FIELD_LABELS[field],
        editable: true,
        cellClass: (params: CellClassParams) => {
          const cellId = `${params.node.id}-${field}`;
          const validation = validationErrors.get(cellId);
          return validation && !validation.isValid ? "invalid-cell" : "";
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
          const cellId = `${params.node.id}-${field}`;
          const validation = validationErrors.get(cellId);
          if (validation && !validation.isValid) {
            return validation.message;
          }
          return null;
        },
        minWidth: 150,
        resizable: true,
        sortable: true,
        filter: true,
      })
    );
  }, [columnMappings, validationErrors]);

  // Validate all data
  const validateAllData = useCallback(() => {
    const newValidationErrors = new Map<string, ValidationResult>();

    rowData.forEach((row, rowIndex) => {
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
  }, [rowData]);

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

    return {
      totalCells,
      validCells,
      invalidCells,
      isAllValid: invalidCells === 0 && totalCells > 0,
    };
  }, [validationErrors]);

  // Handle save
  const handleSave = useCallback(() => {
    const finalValidation = validateAllData();
    const hasErrors = Array.from(finalValidation.values()).some(
      (v) => !v.isValid
    );

    if (!hasErrors) {
      const validatedData: InvestorData[] = rowData.map((row) => ({
        first_name: row.first_name || "",
        last_name: row.last_name || "",
        email: row.email || "",
        company: row.company || null,
        pipeline_stage: row.pipeline_stage as PipelineStage,
        phone: row.phone || null,
      }));

      onSave(validatedData);
    }
  }, [rowData, validateAllData, onSave]);

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
                <span className="font-medium ml-1">{rowData.length}</span> total
                rows
              </div>
              {!validationSummary.isAllValid && (
                <p className="text-sm text-amber-700 mt-1">
                  Please fix invalid cells (highlighted in red) before saving
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
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {rowData.length} rows ready for import
          </div>

          <button
            onClick={handleSave}
            disabled={!validationSummary.isAllValid}
            className={`
              flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors duration-200
              ${
                validationSummary.isAllValid
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
