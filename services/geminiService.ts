import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CodeAnalysisResult, GeneratedCodeResult, QualityMetrics, DiffResult } from "../types";

// Initialize Gemini Client
// WARNING: In a production app, calls should go through a backend to protect the API Key.
// For this demo, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const generateCode = async (
  prompt: string,
  language: string
): Promise<GeneratedCodeResult> => {
  try {
    const fullPrompt = `Generate production-ready ${language} code for the following task: "${prompt}". 
    Also provide a brief explanation of how it works.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: "The generated code snippet" },
            explanation: { type: Type.STRING, description: "Brief explanation of logic" }
          },
          required: ["code", "explanation"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as GeneratedCodeResult;
  } catch (error) {
    console.error("Generate Code Error:", error);
    throw error;
  }
};

export const analyzeCode = async (code: string, language: string): Promise<CodeAnalysisResult> => {
  try {
    const prompt = `Analyze this ${language} code. 
    1. Explain logic. 
    2. Determine Time/Space complexity (Big O).
    3. List security vulnerabilities (e.g. SQL injection, XSS).
    4. List improvements.
    5. Rate quality on 1-10 scale for Readability, Maintainability, Security, Performance, Structure.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Code to analyze:\n${code}\n\nTask: ${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            timeComplexity: { type: Type.STRING },
            spaceComplexity: { type: Type.STRING },
            securityIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            qualityScore: {
              type: Type.OBJECT,
              properties: {
                readability: { type: Type.NUMBER },
                maintainability: { type: Type.NUMBER },
                security: { type: Type.NUMBER },
                performance: { type: Type.NUMBER },
                structure: { type: Type.NUMBER }
              },
              required: ["readability", "maintainability", "security", "performance", "structure"]
            }
          }
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as CodeAnalysisResult;
  } catch (error) {
    console.error("Analyze Code Error:", error);
    throw error;
  }
};

export const convertCode = async (code: string, fromLang: string, toLang: string): Promise<GeneratedCodeResult> => {
  try {
    const prompt = `Convert the following code from ${fromLang} to ${toLang}. Ensure idiomatic usage of the target language.`;
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Code:\n${code}\n\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: "The converted code" },
            explanation: { type: Type.STRING, description: "Key changes made during conversion" }
          },
          required: ["code", "explanation"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as GeneratedCodeResult;
  } catch (error) {
    console.error("Convert Code Error:", error);
    throw error;
  }
};

export const compareVersions = async (oldCode: string, newCode: string): Promise<DiffResult> => {
  try {
    const prompt = `Compare these two versions of code. 
    1. Summarize the differences.
    2. List specific changes.
    3. Assess any new risks or improvements.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Original Code:\n${oldCode}\n\nNew Code:\n${newCode}\n\nTask: ${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "High level summary of changes" },
            changes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific changes" },
            riskAssessment: { type: Type.STRING, description: "Impact on security or performance" }
          },
          required: ["summary", "changes", "riskAssessment"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as DiffResult;
  } catch (error) {
    console.error("Diff Error:", error);
    throw error;
  }
}

export const generateFlowchartSvg = async (code: string): Promise<string> => {
  try {
    const prompt = `Generate a scalable vector graphic (SVG) code that represents the flowchart logic of this code. 
    Do not wrap it in markdown. Return ONLY raw SVG code string starting with <svg and ending with </svg>. 
    Use a dark theme for the flowchart elements (strokes white/light gray, fill transparent or dark).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using flash for speed on SVG gen
      contents: `Code:\n${code}\n\n${prompt}`,
    });

    let svg = response.text || "";
    // Cleanup markdown if present
    svg = svg.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '');
    return svg;
  } catch (error) {
    console.error("Flowchart Error:", error);
    return "";
  }
};

export const simulateRunner = async (code: string, language: string): Promise<string> => {
  try {
    const prompt = `Act as a ${language} interpreter. Simulate the execution of this code and show the console output. 
    If there are errors, show the stack trace. Return only the output text.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Code:\n${code}\n\n${prompt}`,
    });

    return response.text || "No output generated.";
  } catch (error) {
    return "Error executing simulation.";
  }
};