import React from "react";
import Upload from "lucide-react/dist/esm/icons/upload";
import FileText from "lucide-react/dist/esm/icons/file-text";

interface EmptyStateProps {
  onUploadClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onUploadClick }) => {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>

      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        No investor data uploaded yet
      </h3>

      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Upload a CSV file containing your investor data to get started. The
        system will validate and parse your data automatically.
      </p>

      <button
        onClick={onUploadClick}
        className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
      >
        <Upload className="w-5 h-5" />
        <span>Upload CSV File</span>
      </button>
    </div>
  );
};
