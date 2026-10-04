from flask import Flask, jsonify, send_from_directory
from pathlib import Path

app = Flask(__name__, static_folder=".", static_url_path="")

PROJECTS = {
    "ecg": {
        "name": "ECG analysis in the cloud",
        "category": "Health Care",
        "features": ["Upload ECG signal", "Classify rhythm", "Review analysis history"],
        "status": "ready",
    },
    "protein": {
        "name": "Protein structure prediction",
        "category": "Biology",
        "features": ["Submit sequence", "Run prediction job", "Inspect PDB result"],
        "status": "ready",
    },
}

@app.get("/")
def index():
    return send_from_directory(Path(__file__).parent, "index.html")

@app.get("/api/projects")
def projects():
    return jsonify(PROJECTS)

@app.get("/api/projects/<project_name>")
def project(project_name):
    project_data = PROJECTS.get(project_name)
    if project_data is None:
        return jsonify({"error": "Project not found"}), 404
    return jsonify(project_data)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
