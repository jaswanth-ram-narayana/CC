# Cloud BioMed Analysis Dashboard

## Deploy on Render's free tier

The React dashboard and Spring Boot API can be deployed together from this
repository using the root `render.yaml` Blueprint. The API is built from
`backend/Dockerfile`; Render supplies its `PORT` at runtime. The dashboard
build receives the API host from the Blueprint.

1. Put this project in its own GitHub repository. Do not use the unrelated
   `Sales-MLOps` repository.
2. In Render, choose **New → Blueprint** and connect that GitHub repository.
3. Review the Blueprint and deploy both `biomed-api` and `biomed-dashboard`
   using the free plan.
4. Open the dashboard's `onrender.com` URL. The free API may take a short time
   to wake up after a period without requests.

The free plan is suitable for a demonstration, not a production or clinical
service. Analysis results are educational/demo outputs and are not medical
advice.

## 1. Project Overview
The Cloud BioMed Analysis Dashboard is a beginner-friendly full-stack web application designed for healthcare and biological data analysis. It provides two main modules:
- **ECG Analysis**: Allows users to upload an ECG CSV file (or load a sample) to visualize the waveform and view basic signal properties (heart rate, amplitude).
- **Protein Structure Prediction**: Allows users to enter an amino acid sequence to get a simplified, educational prediction of its structure, including estimated molecular weight and hydrophobic/charged residue counts.

> **Note**: This is an educational demonstration. It does not provide real medical diagnoses or accurate AlphaFold-level protein structures.

## 2. Architecture
- **Frontend**: React.js (Vite), Tailwind CSS, Recharts for data visualization.
- **Backend**: Java Spring Boot, REST APIs.
- **Database**: None (in-memory/mock data).
- **Communication**: Frontend communicates with the backend via Axios over REST APIs (`http://localhost:8080/api`).

## 3. Technologies
- **React.js 18**
- **Vite**
- **Tailwind CSS**
- **Java 17**
- **Spring Boot 3.2.4**
- **Maven**
- **Recharts** & **Lucide React** (Icons)

## 4. Folder Structure
```
project-root/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # ECGAnalysis, ProteinPrediction
│   │   ├── pages/            # Dashboard page
│   │   ├── services/         # api.js for backend communication
│   │   ├── App.jsx           # Main React component
│   │   └── main.jsx          # React entry point
│   └── package.json          # Node.js dependencies
│
├── backend/                  # Spring Boot backend application
│   ├── src/main/java/com/example/biomed/
│   │   ├── controller/       # REST API endpoints
│   │   ├── service/          # Business logic
│   │   └── model/            # Data models and DTOs
│   └── pom.xml               # Maven dependencies
│
└── README.md
```

## 5. Requirements
To run this project locally, you need:
- **Node.js** (v16 or higher)
- **Java 17** (JDK 17)
- **Maven** (v3.6 or higher)

## 6. Installation
Clone the repository (or extract the folder). You will need two terminal windows to run both the frontend and the backend simultaneously.

## 7. How to Start Backend
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
mvn spring-boot:run
```
The backend will start on `http://localhost:8080`.

## 8. How to Start Frontend
Open a second terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`. Open this URL in your browser.

## 9. API Endpoints
- `POST /api/ecg/analyze`: Accepts raw CSV text data. Returns an `ECGResult` object.
- `GET /api/ecg/sample`: Returns sample CSV ECG data.
- `POST /api/protein/predict`: Accepts a `ProteinRequest` object containing an amino acid sequence. Returns a `ProteinResult` object.
- `GET /api/protein/sample`: Returns a sample `ProteinRequest`.

## 10. Example API Requests
**Predict Protein Structure:**
```bash
curl -X POST http://localhost:8080/api/protein/predict \
     -H "Content-Type: application/json" \
     -d '{"sequence": "MKTIIALSYIFCLVFADYKDDDDK"}'
```

## 11. Example Outputs
**Protein Prediction Output:**
```json
{
  "sequenceLength": 25,
  "molecularWeight": 2750.0,
  "hydrophobicResidues": 12,
  "chargedResidues": 5,
  "prediction": "Alpha-Helix Dominant",
  "status": "Demo Prediction"
}
```

## 12. Troubleshooting
- **Port 8080 is already in use**: If another application is using port 8080, open `backend/src/main/resources/application.properties` and change `server.port=8080` to `server.port=8081`. Then update the `API_BASE_URL` in `frontend/src/services/api.js`.
- **CORS Errors**: Ensure the backend is running. The Spring Boot controllers are configured with `@CrossOrigin(origins = "http://localhost:5173")` to allow requests from the Vite dev server.

## 13. Phase 2 – AWS Integration
**DO NOT CONNECT AWS YET.**
This project is currently designed to run entirely locally. In Phase 2, we can implement the following architecture:
- **Amazon S3**: Store uploaded ECG and protein sequence files for historical reference and larger batch processing.
- **AWS Elastic Beanstalk or EC2**: Deploy the Spring Boot backend to the cloud.
- **AWS Amplify or S3 Static Hosting**: Deploy the React frontend.
- **Amazon CloudWatch**: Monitor backend logs and performance.
- **AWS IAM**: Secure resource access using Identity and Access Management.
