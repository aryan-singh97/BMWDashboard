# CSV Data Analysis Tool

This project is a web-based CSV data analysis tool that allows users to upload CSV files, visualize data using various plots and graphs, and perform interactive analysis.

## Features

- Intuitive interface for uploading CSV files.
- Interactive data visualization using React JS.
- Real-time parsing and processing of large CSV files on the backend.
- Zoom In/Out, Download Plots, Change Plot Parameters, Data Filtering, and Additional Features.
- Evaluation Metrics: Loading Speed, Big Data Handling, Interactivity, User Experience, Scalability, Error Handling.

## Project Structure

\`\`\`
project-root/
│
├── frontend/ # Frontend React application
│ ├── public/ # Static assets
│ └── src/ # React components and application logic
│ ├── components/ # Reusable components (e.g., CSVUpload)
│ ├── App.js # Main application component
│ └── index.js # Entry point for the React application
│
└── backend/ # Backend Node.js server
├── uploads/ # Directory for uploaded CSV files
├── index.js # Main server file
└── package.json # Backend dependencies and scripts
\`\`\`

## Setup Instructions

### Prerequisites

- Node.js installed on your machine

### Installation

1. Clone the repository:

   \`\`\`bash
   git clone <repository-url>
   cd project-directory
   \`\`\`

2. Install frontend dependencies:

   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

3. Install backend dependencies:

   \`\`\`bash
   cd ../backend
   npm install
   \`\`\`

### Running the Application

1. Start the backend server:

   \`\`\`bash
   cd ../backend
   npm start
   \`\`\`

2. Start the frontend development server:

   \`\`\`bash
   cd ../frontend
   npm start
   \`\`\`

3. Access the application in your web browser at [http://localhost:3000](http://localhost:3000).

## Usage

- Upload CSV files using the provided interface.
- Visualize data using various plots and graphs.
- Interact with the visualizations by zooming in/out, adjusting parameters, and filtering data.
- Analyze large datasets efficiently with real-time processing.

## License

This project is licensed under the [MIT License](LICENSE).
`;

fs.writeFileSync('README.md', readmeContent);

console.log('README.md file created successfully!');
