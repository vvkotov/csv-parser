import Database from "lucide-react/dist/esm/icons/database";
import Upload from "lucide-react/dist/esm/icons/upload";

interface HeaderProps {
  showUploadButton: boolean;
  onNewUpload: () => void;
}

export function Header({ showUploadButton, onNewUpload }: HeaderProps) {
  return (
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

          {showUploadButton && (
            <button
              onClick={onNewUpload}
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
}
