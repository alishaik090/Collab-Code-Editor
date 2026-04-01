export type DetectedLanguage = "python" | "c" | "cpp" | "java" | "unknown";

export function detectLanguage(code: string): DetectedLanguage {
    const trimmed = code.trim();

    // Java
    if (/public\s+class\s+\w+/m.test(trimmed)) return "java";
    if (/System\.out\.println/m.test(trimmed)) return "java";

    // C++
    if (/#include\s*<iostream>/m.test(trimmed)) return "cpp";
    if (/std::/m.test(trimmed)) return "cpp";
    if (/using\s+namespace\s+std/m.test(trimmed)) return "cpp";
    if (/cout\s*<</m.test(trimmed)) return "cpp";

    // C
    if (/#include\s*<stdio\.h>/m.test(trimmed)) return "c";
    if (/printf\s*\(/m.test(trimmed)) return "c";

    // Python
    if (/def\s+\w+\s*\(/m.test(trimmed)) return "python";
    if (/print\s*\(/m.test(trimmed)) return "python";
    if (/import\s+\w+/m.test(trimmed)) return "python";

    return "unknown";
}
