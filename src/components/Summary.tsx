import React from "react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Upload from "lucide-react/dist/esm/icons/upload";
import Users from "lucide-react/dist/esm/icons/users";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";

interface SummaryProps {
  contactsCreated: number;
  rowsSkipped: number;
  totalRowsProcessed: number;
  onNewUpload: () => void;
}

export const Summary: React.FC<SummaryProps> = ({
  contactsCreated,
  rowsSkipped,
  totalRowsProcessed,
  onNewUpload,
}) => {
  const successRate =
    totalRowsProcessed > 0
      ? Math.round((contactsCreated / totalRowsProcessed) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Import Complete!
          </h2>
          <p className="text-gray-600">
            Your CSV data has been successfully processed and imported.
          </p>
        </div>

        {/* Import Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900 mb-1">
              {contactsCreated}
            </div>
            <div className="text-sm text-green-700">Contacts Created</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {rowsSkipped}
            </div>
            <div className="text-sm text-gray-700">Rows Skipped</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {successRate}%
            </div>
            <div className="text-sm text-blue-700">Success Rate</div>
          </div>
        </div>

        {/* Detailed Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Import Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total rows processed:</span>
              <span className="font-medium">{totalRowsProcessed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Successfully imported:</span>
              <span className="font-medium text-green-600">
                {contactsCreated}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Skipped/Removed:</span>
              <span className="font-medium text-gray-600">{rowsSkipped}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-900 font-medium">Success rate:</span>
              <span className="font-medium text-blue-600">{successRate}%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNewUpload}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Another File</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
