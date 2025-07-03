import { useState } from "react";
import Papa from "papaparse";
import { FileUpload } from "./components/FileUpload";
import { EmptyState } from "./components/EmptyState";
import { PreviewTable } from "./components/PreviewTable";
import { SelectHeaderRow } from "./components/SelectHeaderRow";
import { ColumnMapping } from "./components/ColumnMapping";
import { DataValidationGrid } from "./components/DataValidationGrid";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/Header";
import type { InvestorData } from "./types/investor";

type AppState =
  | "empty"
  | "uploading"
  | "previewing"
  | "selecting-header"
  | "mapping-columns"
  | "validating"
  | "viewing";

function App() {
  const [state, setState] = useState<AppState>("empty");
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [parseResult, setParseResult] = useState<Papa.ParseResult<
    string[]
  > | null>(null);
  const [selectedHeaderRowIndex, setSelectedHeaderRowIndex] = useState<
    number | null
  >(null);
  const [columnMappings, setColumnMappings] = useState<
    Record<number, keyof InvestorData | "ignore">
  >({});
  const [removedColumns, setRemovedColumns] = useState<Set<number>>(new Set());

  const handleNewUpload = () => {
    setState("empty");
    setParseResult(null);
    setSelectedHeaderRowIndex(null);
    setColumnMappings({});
    setRemovedColumns(new Set());
  };

  const handleFileUpload = async (file: File) => {
    setState("uploading");
    setUploadStatus(null);
    setErrorMessage("");

    try {
      const csvContent = await file.text();
      const result = Papa.parse<string[]>(csvContent);

      if (result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      setParseResult(result);
      setUploadStatus("success");
      setState("previewing");
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to parse CSV file"
      );
      setState("empty");
    }
  };

  const handlePreviewContinue = () => {
    setState("selecting-header");
  };

  const handleHeaderRowSelect = (rowIndex: number) => {
    setSelectedHeaderRowIndex(rowIndex);
  };

  const handleHeaderConfirm = () => {
    if (selectedHeaderRowIndex !== null) {
      setState("mapping-columns");
    }
  };

  const handleMappingChange = (
    columnIndex: number,
    field: keyof InvestorData | "ignore"
  ) => {
    setColumnMappings((prev) => ({
      ...prev,
      [columnIndex]: field,
    }));
  };

  const handleColumnRemove = (columnIndex: number) => {
    setRemovedColumns((prev) => new Set([...prev, columnIndex]));
    // Remove from column mappings when removed
    setColumnMappings((prev) => {
      const newMappings = { ...prev };
      delete newMappings[columnIndex];
      return newMappings;
    });
  };

  const handleColumnRestore = (columnIndex: number) => {
    setRemovedColumns((prev) => {
      const newSet = new Set(prev);
      newSet.delete(columnIndex);
      return newSet;
    });
    // Restore default mapping when restored
    setColumnMappings((prev) => ({
      ...prev,
      [columnIndex]: "ignore",
    }));
  };

  const handleMappingConfirm = () => {
    setState("validating");
  };

  const handleDataSave = (validatedData: InvestorData[]) => {
    console.log("Validated data:", validatedData);
    setState("viewing");
  };

  const renderContent = () => {
    switch (state) {
      case "empty":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FileUpload
              onFileUpload={handleFileUpload}
              isProcessing={false}
              uploadStatus={uploadStatus}
              errorMessage={errorMessage}
            />
            <EmptyState onUploadClick={() => {}} />
          </div>
        );

      case "uploading":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FileUpload
              onFileUpload={handleFileUpload}
              isProcessing={true}
              uploadStatus={uploadStatus}
              errorMessage={errorMessage}
            />
          </div>
        );

      case "previewing":
        return parseResult ? (
          <PreviewTable
            parseResult={parseResult}
            onContinue={handlePreviewContinue}
          />
        ) : null;

      case "selecting-header":
        return parseResult ? (
          <SelectHeaderRow
            parseResult={parseResult}
            selectedRowIndex={selectedHeaderRowIndex}
            onRowSelect={handleHeaderRowSelect}
            onConfirm={handleHeaderConfirm}
          />
        ) : null;

      case "mapping-columns":
        return parseResult && selectedHeaderRowIndex !== null ? (
          <ColumnMapping
            parseResult={parseResult}
            headerRowIndex={selectedHeaderRowIndex}
            columnMappings={columnMappings}
            removedColumns={removedColumns}
            onMappingChange={handleMappingChange}
            onColumnRemove={handleColumnRemove}
            onColumnRestore={handleColumnRestore}
            onConfirm={handleMappingConfirm}
          />
        ) : null;

      case "validating":
        return parseResult && selectedHeaderRowIndex !== null ? (
          <ErrorBoundary>
            <DataValidationGrid
              parseResult={parseResult}
              headerRowIndex={selectedHeaderRowIndex}
              columnMappings={columnMappings}
              onSave={handleDataSave}
            />
          </ErrorBoundary>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showUploadButton={state === "viewing"}
        onNewUpload={handleNewUpload}
      />
      {renderContent()}
    </div>
  );
}

export default App;
