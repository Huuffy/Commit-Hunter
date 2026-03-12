import axios from "axios";

const commitAnalyzerClient = axios.create({
  baseURL: "http://localhost:8000",
});

export default commitAnalyzerClient;
