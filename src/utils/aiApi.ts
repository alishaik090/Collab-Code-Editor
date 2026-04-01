import axios from "axios";

// Using deployed AI service on Render
const AI_SERVICE_URL = "https://collab-code-editor-qdso.onrender.com/api/ai";

export const convertCode = async (
  code: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  const response = await axios.post(`${AI_SERVICE_URL}/convert`, {
    code,
    sourceLanguage,
    targetLanguage,
  });
  return response.data.result;
};

export const explainErrors = async (
  code: string,
  errorOutput: string,
  language: string
): Promise<string> => {
  const response = await axios.post(`${AI_SERVICE_URL}/explain`, {
    code,
    errorOutput,
    language,
  });
  return response.data.result;
};

export const fixCode = async (
  code: string,
  errorOutput: string,
  language: string
): Promise<string> => {
  const response = await axios.post(`${AI_SERVICE_URL}/fix`, {
    code,
    errorOutput,
    language,
  });
  return response.data.result;
};
