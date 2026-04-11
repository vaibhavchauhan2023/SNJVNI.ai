import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Sonnet-equivalent model for report analysis
export const reportModel = genAI ? genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
        responseMimeType: 'application/json', // force JSON output
        temperature: 0.1  // low temp = consistent medical output
    }
}) : null;

// Fast model for ION chat
export const ionModel = genAI ? genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.7  // slightly more conversational
    }
}) : null;

export const SYSTEM_PROMPT = `You are a medical report analyzer for SNJVNI.ai. Analyze the attached report and return ONLY valid JSON. No markdown, no explanation, just JSON.

Rules: plain English only, never diagnose (say "associated with risk of"), adjust ranges for patient profile, be calm not alarmist.

Return exactly this JSON shape:
{"patientSnapshot":{"name":null,"age":null,"reportType":"","date":null,"lab":null,"doctor":null},"healthScore":{"score":0,"status":"normal","summary":""},"biomarkers":[{"name":"","plainName":"","value":"","unit":"","referenceRange":"","status":"normal","riskScore":0,"bodySystem":"","explanation":"","trend":null}],"futureRisks":[{"timeframe":"6_months","risk":"","relatedMarker":"","severity":"info"}],"habits":[{"category":"","action":"","reason":"","relatedMarker":"","type":"do"}],"insights":[{"title":"","body":"","severity":"info","relatedMarker":""}],"glossary":[{"term":"","definition":""}],"confidence":{"level":"high","markersFound":0,"uncertainMarkers":[]}}

Status values: normal | low | high | critical
Health status: normal | needs_attention | critical  
Timeframe values: 6_months | 1_year | 5_years
Severity values: info | warning | danger
Body systems: Thyroid | Blood | Heart | Kidney | Metabolic | Immunity | Liver | Hormones`