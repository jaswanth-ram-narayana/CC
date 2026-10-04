# Cloud BioMed Analysis Dashboard

## AWS data integration

The Spring Boot API stores public dataset files in a private Amazon S3 bucket
and dataset metadata in PostgreSQL (Amazon RDS). Locally, it defaults to an
in-memory H2 database; set the RDS/S3 environment variables below to connect
AWS. Credentials use the AWS SDK default credential chain—never put AWS keys
in source code, the frontend, or this repository.

The PowerShell importer downloads the MIT-BIH Arrhythmia Database from
[PhysioNet](https://physionet.org/content/mitdb/1.0.0/) and the human reference
proteome from [UniProt](https://www.uniprot.org/proteomes/UP000005640), then
uploads the archives through the API to S3. The API writes their source,
reuse terms, checksum, size, and S3 key to RDS. Dataset files remain private;
downloads use short-lived signed URLs.

### Configure the backend

1. Create a PostgreSQL database in RDS and an S3 bucket in the same AWS region
   (default: `ap-south-1`). Keep S3 Block Public Access enabled. Restrict
   PostgreSQL network access to the backend host; never allow `0.0.0.0/0`.
2. Grant the backend IAM role `s3:PutObject`, `s3:GetObject`, and
   `s3:DeleteObject` only for the dataset bucket's `datasets/*` keys. Prefer an
   instance/task role in AWS. For local development, configure AWS CLI SSO and
   select that profile with `AWS_PROFILE` (run `aws configure sso --profile
   biomed`, `aws sso login --profile biomed`, then set
   `$env:AWS_PROFILE = 'biomed'`); do not create or commit static keys.
3. Set the backend environment in the shell where Spring Boot will run:

```powershell
$env:AWS_REGION = 'ap-south-1'
$env:S3_BUCKET_NAME = '<private-dataset-bucket-name>'
$env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://<rds-endpoint>:5432/biomed?sslmode=require'
$env:SPRING_DATASOURCE_USERNAME = '<database-username>'
$env:SPRING_DATASOURCE_PASSWORD = '<database-password>'
$env:DATASET_IMPORT_TOKEN = '<long-random-import-token>'
```

The RDS security group must allow port `5432` only from the backend's security
group, or from a specific developer IP (`/32`) for local testing. A private RDS
instance requires the backend to run in the same VPC or use an approved secure
tunnel. Do not expose the database to the public internet.

Start the API in one terminal:

```powershell
Set-Location backend
.\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

### Download and import both public datasets

In a second PowerShell terminal, set the same import token and run:

```powershell
$env:DATASET_IMPORT_TOKEN = '<the-same-long-random-import-token>'
$env:API_BASE_URL = 'http://localhost:8080'
.\scripts\import-public-datasets.ps1
```

The script downloads the 48 MIT-BIH ECG records and UniProt human proteome
FASTA archive into a temporary directory, imports both through the protected
`POST /api/datasets` endpoint, and removes the temporary files. Dataset
metadata is available at `GET /api/datasets`; a private S3 object can be
downloaded through `GET /api/datasets/{id}/download`.

Keep the AWS Free Plan limits in mind: RDS, stored objects, requests, and data
transfer can consume free allowances or credits. Do not upgrade the account;
review AWS billing before and after imports and stop services when they are no
longer needed. This educational prototype must not be used for clinical care
or for storing private patient data.

## 1. Project Overview
The Cloud BioMed Analysis Dashboard is a beginner-friendly full-stack web application designed for healthcare and biological data analysis. It provides two main modules:
- **ECG Analysis**: Allows users to upload an ECG CSV file (or load a sample) to visualize the waveform and view basic signal properties (heart rate, amplitude).
- **Protein Structure Prediction**: Allows users to enter an amino acid sequence to get a simplified, educational prediction of its structure, including estimated molecular weight and hydrophobic/charged residue counts.

> **Note**: This is an educational demonstration. It does not provide real medical diagnoses or accurate AlphaFold-level protein structures.

## 2. Architecture
- **Frontend**: React.js (Vite), Tailwind CSS, Recharts for data visualization.
- **Backend**: Java Spring Boot, REST APIs.
- **Database**: PostgreSQL in Amazon RDS for dataset metadata; local development defaults to in-memory H2.
- **Object storage**: Private Amazon S3 bucket for public ECG and protein dataset files.
- **Communication**: Frontend uses Axios to call the configurable backend URL. AWS credentials stay on the backend and are resolved by the AWS SDK credential provider chain.

## 3. Technologies
- **React.js 19**
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
- **Maven** (bundled under `backend/apache-maven-3.9.6`)
- **AWS CLI** (only needed to connect a local backend to AWS using IAM Identity Center/SSO)

## 6. Installation
Clone the repository (or extract the folder). You will need two terminal windows to run both the frontend and the backend simultaneously.

## 7. How to Start Backend
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
apache-maven-3.9.6/bin/mvn spring-boot:run
```

On Windows PowerShell, run `.\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run`.
Without RDS/S3 environment variables, the API starts locally with H2. To
connect it to AWS, follow the AWS data integration instructions above.

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
- **CORS Errors**: Set `APP_CORS_ALLOWED_ORIGIN` in the backend to the exact frontend origin. The local default is `http://localhost:5173`.

For an AWS-hosted frontend, set `VITE_API_BASE_URL` at build time to the public
HTTPS API origin. Keep API keys and AWS credentials out of frontend environment
variables.
