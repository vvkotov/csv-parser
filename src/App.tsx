import { useState } from "react";
import Papa from "papaparse";
import { Database, Upload } from "lucide-react";
import { FileUpload } from "./components/FileUpload";
import { EmptyState } from "./components/EmptyState";
import { SelectHeaderRow } from "./components/SelectHeaderRow";
import { ColumnMapping } from "./components/ColumnMapping";
import { DataValidationGrid } from "./components/DataValidationGrid";
import { ErrorBoundary } from "./components/ErrorBoundary";
import type { InvestorData } from "./types/investor";

type AppState =
  | "empty"
  | "uploading"
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

  const handleNewUpload = () => {
    setState("empty");
    setParseResult(null);
    setSelectedHeaderRowIndex(null);
    setColumnMappings({});
  };

  const handleFileUpload = async (file: File) => {
    setState("uploading");
    setUploadStatus(null);
    setErrorMessage("");

    try {
      const csvContent = await file.text();
      const result = Papa.parse<string[]>(csvContent);
      console.log(result);

      if (result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      setParseResult(result);
      setUploadStatus("success");
      setState("selecting-header");
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to parse CSV file"
      );
      setState("empty");
    }
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

  const handleMappingConfirm = () => {
    setState("validating");
  };

  const handleDataSave = (validatedData: InvestorData[]) => {
    console.log("Validated data:", validatedData);
    setState("viewing");
  };

  const renderHeader = () => (
    <header className="bg-white border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Investor Data Manager
              </h1>
              <p className="text-gray-600">
                Upload and manage your investor data
              </p>
            </div>
          </div>

          {state === "viewing" && (
            <button
              onClick={handleNewUpload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New File</span>
            </button>
          )}
        </div>
      </div>
    </header>
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
            onMappingChange={handleMappingChange}
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
      {renderHeader()}
      {renderContent()}
    </div>
  );
}

export default App;
