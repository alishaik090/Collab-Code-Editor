import axios from "axios";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions";

// 🔐 API KEY FROM ENV
const API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || "474f7717b2msh5cb77af34fecaddp196d70jsn2773d7536f52";

export async function runCode(sourceCode: string, languageId: number, stdin?: string) {
    const response = await axios.post(
        `${JUDGE0_URL}?base64_encoded=false&wait=true`,
        {
            source_code: sourceCode,
            language_id: languageId,
            stdin: stdin || "",
        },
        {
            headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": API_KEY,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
        }
    );

    return response.data;
}
