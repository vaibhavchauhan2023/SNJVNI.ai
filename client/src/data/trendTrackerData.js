export const trendTrackerData = [
  {
    id: "ldl",
    label: "LDL Cholesterol",
    unit: "mg/dL",
    referenceRange: { min: 0, max: 100 },
    actionTip: "Reduce saturated fats and eat more soluble fiber like oats and beans.",
    correlationTip: "High LDL is strongly correlated with a higher risk of heart disease and stroke.",
    reports: [
      { date: "2023-01-15", value: 125, status: "High" },
      { date: "2023-04-15", value: 115, status: "High" },
      { date: "2023-07-20", value: 105, status: "High" },
      { date: "2023-10-18", value: 95, status: "Normal" },
      { date: "2024-01-10", value: 92, status: "Normal" }
    ]
  },
  {
    id: "hba1c",
    label: "HbA1c",
    unit: "%",
    referenceRange: { min: 4.0, max: 5.6 },
    actionTip: "Reduce added sugar intake, walk after meals, and engage in regular physical activity.",
    correlationTip: "HbA1c measures your average blood sugar levels over the past 2-3 months.",
    reports: [
      { date: "2023-01-15", value: 6.2, status: "Prediabetes" },
      { date: "2023-06-15", value: 5.9, status: "Prediabetes" },
      { date: "2024-01-10", value: 5.5, status: "Normal" },
    ]
  },
  {
    id: "vitamin_d",
    label: "Vitamin D",
    unit: "ng/mL",
    referenceRange: { min: 30, max: 100 },
    actionTip: "Get 15-20 minutes of morning sun daily, or consider a high-quality D3 supplement.",
    correlationTip: "Low Vitamin D is linked to fatigue, bone density loss, and a weakened immune system.",
    reports: [
      { date: "2023-01-15", value: 18, status: "Deficient" },
      { date: "2023-05-15", value: 24, status: "Insufficient" },
      { date: "2023-11-20", value: 35, status: "Optimal" },
    ]
  }
];
