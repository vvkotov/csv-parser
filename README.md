# 📊 CSV Investor Data Parser

A modern, intuitive web application for uploading, parsing, and managing investor data from CSV files. Built with React, TypeScript, and Tailwind CSS for a seamless user experience.

## ✨ Features

### 🔄 Multi-Step Data Processing Pipeline

- **File Upload**: Drag & drop or click to upload CSV files
- **Smart Header Detection**: Automatically detect and select header rows
- **Intelligent Column Mapping**: Map CSV columns to investor data fields
- **Real-time Validation**: Validate data with live feedback
- **Error Handling**: Comprehensive error boundary and validation messages

### 📋 Investor Data Management

- **Required Fields**: First Name, Last Name, Email, Pipeline Stage
- **Optional Fields**: Company, Phone Number
- **Pipeline Stages**: Lead, Prospect, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
- **Data Validation**: Email format, required field checks, duplicate detection

### 🎨 Modern UI/UX

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Interface**: Modern design with Tailwind CSS
- **Interactive Components**: Smooth transitions and hover effects
- **Loading States**: Visual feedback during processing
- **Error States**: Clear error messages and recovery options

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **CSV Parsing**: PapaParse
- **Data Grid**: AG Grid Community
- **Code Quality**: ESLint with TypeScript support

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd csv-parser
   ```

2. **Install dependencies**

   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install

   # Using pnpm
   pnpm install
   ```

3. **Start the development server**

   ```bash
   # Using npm
   npm run dev

   # Using yarn
   yarn dev

   # Using pnpm
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## 📖 Usage Guide

### Step 1: Upload CSV File

- Click the upload area or drag and drop your CSV file
- Supported formats: `.csv` files
- The application will automatically parse the file content

### Step 2: Select Header Row

- Review the parsed data preview
- Select the row that contains your column headers
- Click "Continue" to proceed to column mapping

### Step 3: Map Columns

- Map each CSV column to the appropriate investor data field
- **Required fields** are marked and must be mapped:
  - First Name
  - Last Name
  - Email Address
  - Pipeline Stage
- **Optional fields** can be mapped or ignored:
  - Company
  - Phone Number
- Resolve any duplicate mappings before continuing

### Step 4: Validate & Review

- Review the mapped data in an interactive grid
- Edit individual cells if needed
- See validation errors highlighted in red
- Save the validated data when ready

## 📁 Project Structure

```
csv-parser/
├── src/
│   ├── components/           # React components
│   │   ├── ColumnMapping.tsx    # Column mapping interface
│   │   ├── DataValidationGrid.tsx # Data validation grid
│   │   ├── EmptyState.tsx       # Empty state component
│   │   ├── ErrorBoundary.tsx    # Error boundary wrapper
│   │   ├── FileUpload.tsx       # File upload component
│   │   ├── Header.tsx           # Application header
│   │   └── SelectHeaderRow.tsx  # Header row selection
│   ├── types/               # TypeScript type definitions
│   │   ├── investor.ts         # Investor data types
│   │   ├── pipelineStage.ts    # Pipeline stage types
│   │   └── validationResult.ts # Validation result types
│   ├── utils/               # Utility functions
│   │   └── validateCell.ts     # Cell validation logic
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json           # Project dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md             # Project documentation
```

## 🏗️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Key Components

- **App.tsx**: Main application state management and routing
- **FileUpload**: Handles CSV file upload and parsing
- **SelectHeaderRow**: Interface for selecting header row from CSV data
- **ColumnMapping**: Maps CSV columns to investor data fields
- **DataValidationGrid**: Interactive grid for data validation and editing
- **Header**: Application header with navigation

### State Management

The application uses React's built-in state management with the following key states:

- `state`: Current step in the processing pipeline
- `parseResult`: Parsed CSV data from PapaParse
- `selectedHeaderRowIndex`: Selected header row index
- `columnMappings`: Column to field mappings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
