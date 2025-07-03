import React, { useCallback, useState } from "react";
import Upload from "lucide-react/dist/esm/icons/upload";
import FileText from "lucide-react/dist/esm/icons/file-text";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  uploadStatus?: "success" | "error" | null;
  errorMessage?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  isProcessing,
  uploadStatus,
  errorMessage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const csvFile = files.find(
        (file) => file.type === "text/csv" || file.name.endsWith(".csv")
      );

      if (csvFile) {
        onFileUpload(csvFile);
      }
    },
    [onFileUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${isProcessing ? "opacity-50 pointer-events-none" : ""}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center space-y-4">
          <div
            className={`
            p-4 rounded-full transition-colors duration-200
            ${isDragOver ? "bg-blue-100" : "bg-gray-100"}
          `}
          >
            <Upload
              className={`
              w-8 h-8 transition-colors duration-200
              ${isDragOver ? "text-blue-600" : "text-gray-600"}
            `}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload CSV File
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your investor data CSV file here, or click to browse
            </p>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span>Supports .csv files only</span>
            </div>
          </div>

          <button
            className="
              px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
              hover:bg-blue-700 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
            disabled={isProcessing}
          >
            Choose File
          </button>
        </div>
      </div>

      {uploadStatus === "error" && errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-900">Upload Error</h4>
            <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
