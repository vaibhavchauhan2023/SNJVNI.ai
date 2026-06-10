# SNJVNI.ai
An Intelligent Health Navigation & Medical Report Analysis System 

SNJVNI.ai is a web-based AI-powered medical report analyzer designed to help everyday users — particularly in India — understand their medical test results in plain English. Users upload a PDF or photograph of any medical report (blood panel, thyroid, lipid profile, urine analysis, MRI, and more), and the platform generates a comprehensive, structured analysis using Google's Gemini AI model. 

The platform addresses a critical gap: millions of patients receive medical reports they cannot interpret without expensive doctor consultations. SNJVNI.ai bridges this gap by providing instant, personalized, plain-English explanations of every biomarker, along with risk scores, future health consequences, daily habit recommendations, and a conversational AI assistant called ION that answers follow-up questions.

# Approach

The system employs a "Pipeline-of-Thought" architecture to ensure clinical safety and data accuracy. 
A. The 7-Section Output Framework To maintain consistency, the AI is constrained to generate output across these specific modules: 
1. Patient Snapshot: Automated extraction of metadata (Name, Age, Lab, Date).
2. Overall Health Score: A 0–10 risk scale categorized into Normal (0–3), Needs Attention (4–6), or Critical (7–10).
3. Biomarker Breakdown Table: A deep dive into every marker, its standard range, and the body system it impacts.
4. Visual Risk Dashboard: A color-coded visualization for at-a-glance risk assessment.
5. Future Consequences: A temporal risk model showing potential complications at 6 months, 1 year, and 5 years.
6. Daily Habit Recommendations: Specific, measurable actions (Diet, Exercise, Sleep) linked directly to the flagged markers.
7. Glossary & Disclaimer: Plain-English definitions and a mandatory medical disclaimer.
