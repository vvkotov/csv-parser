import { useState, Suspense, lazy } from "react";
import Papa from "papaparse";
import { FileUpload } from "./components/FileUpload";
import { EmptyState } from "./components/EmptyState";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/Header";
import type { InvestorData } from "./types/investor";

// Lazy load components used in later steps for better performance
const PreviewTable = lazy(() =>
  import("./components/PreviewTable").then((module) => ({
    default: module.PreviewTable,
  }))
);
const SelectHeaderRow = lazy(() =>
  import("./components/SelectHeaderRow").then((module) => ({
    default: module.SelectHeaderRow,
  }))
);
const ColumnMapping = lazy(() =>
  import("./components/ColumnMapping").then((module) => ({
    default: module.ColumnMapping,
  }))
);
const DataValidationGrid = lazy(() =>
  import("./components/DataValidationGrid").then((module) => ({
    default: module.DataValidationGrid,
  }))
);
const Summary = lazy(() =>
  import("./components/Summary").then((module) => ({
    default: module.Summary,
  }))
);

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
  const [importResults, setImportResults] = useState<{
    contactsCreated: number;
    rowsSkipped: number;
    totalRowsProcessed: number;
  } | null>(null);

  const handleNewUpload = () => {
    setState("empty");
    setParseResult(null);
    setSelectedHeaderRowIndex(null);
    setColumnMappings({});
    setRemovedColumns(new Set());
    setImportResults(null);
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

    // Calculate import statistics
    if (parseResult && selectedHeaderRowIndex !== null) {
      const totalDataRows =
        parseResult.data.length - selectedHeaderRowIndex - 1;
      const contactsCreated = validatedData.length;
      const rowsSkipped = totalDataRows - contactsCreated;

      setImportResults({
        contactsCreated,
        rowsSkipped,
        totalRowsProcessed: totalDataRows,
      });
    }

    setState("viewing");
  };

  // Loading component for lazy-loaded components
  const LoadingSpinner = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );

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
          <Suspense fallback={<LoadingSpinner />}>
            <PreviewTable
              parseResult={parseResult}
              onContinue={handlePreviewContinue}
            />
          </Suspense>
        ) : null;

      case "selecting-header":
        return parseResult ? (
          <Suspense fallback={<LoadingSpinner />}>
            <SelectHeaderRow
              parseResult={parseResult}
              selectedRowIndex={selectedHeaderRowIndex}
              onRowSelect={handleHeaderRowSelect}
              onConfirm={handleHeaderConfirm}
            />
          </Suspense>
        ) : null;

      case "mapping-columns":
        return parseResult && selectedHeaderRowIndex !== null ? (
          <Suspense fallback={<LoadingSpinner />}>
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
          </Suspense>
        ) : null;

      case "validating":
        return parseResult && selectedHeaderRowIndex !== null ? (
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary>
              <DataValidationGrid
                parseResult={parseResult}
                headerRowIndex={selectedHeaderRowIndex}
                columnMappings={columnMappings}
                onSave={handleDataSave}
              />
            </ErrorBoundary>
          </Suspense>
        ) : null;

      case "viewing":
        return importResults ? (
          <Suspense fallback={<LoadingSpinner />}>
            <Summary
              contactsCreated={importResults.contactsCreated}
              rowsSkipped={importResults.rowsSkipped}
              totalRowsProcessed={importResults.totalRowsProcessed}
              onNewUpload={handleNewUpload}
            />
          </Suspense>
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
