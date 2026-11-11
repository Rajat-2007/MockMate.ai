"""Configurable academic streams, courses, career roles, and languages.

Covers all 8 academic categories and common job roles. Configurable
so new courses, degrees and streams can be added dynamically.
"""

from __future__ import annotations

ACADEMIC_STREAMS = [
    {
        "id": "engineering",
        "name": "Engineering & Technology",
        "courses": ["B.Tech", "B.E.", "M.Tech", "M.E.", "Polytechnic", "Diploma"],
        "specializations": [
            "Computer Science & Engineering",
            "Information Technology",
            "Electronics & Communication",
            "Electrical & Electronics",
            "Mechanical Engineering",
            "Civil Engineering",
            "Artificial Intelligence & Data Science",
            "Chemical Engineering",
        ],
    },
    {
        "id": "computer_applications",
        "name": "Computer Applications & IT",
        "courses": ["BCA", "MCA", "B.Sc Computer Science", "B.Sc IT", "M.Sc IT"],
        "specializations": [
            "Full Stack Web Development",
            "Software Development",
            "Data Science & Analytics",
            "Cloud Computing",
            "Cybersecurity",
            "Mobile App Development",
        ],
    },
    {
        "id": "management",
        "name": "Management & Business",
        "courses": ["BBA", "MBA", "PGDM", "Executive MBA"],
        "specializations": [
            "Marketing Management",
            "Financial Management",
            "Human Resource Management",
            "Operations & Supply Chain",
            "Business Analytics",
            "International Business",
        ],
    },
    {
        "id": "commerce",
        "name": "Commerce, Banking & Accounting",
        "courses": ["B.Com", "M.Com", "CA", "CS", "CMA", "B.Com (Hons)"],
        "specializations": [
            "Accounting & Taxation",
            "Banking & Finance",
            "Auditing & Corporate Governance",
            "Investment Banking",
            "Financial Modeling",
        ],
    },
    {
        "id": "arts_humanities",
        "name": "Arts, Humanities & Social Sciences",
        "courses": ["BA", "MA", "BJMC", "MJMC"],
        "specializations": [
            "Journalism & Mass Communication",
            "Psychology",
            "English Literature",
            "Sociology",
            "Political Science & Public Administration",
            "Economics",
            "Content Writing & Public Relations",
        ],
    },
    {
        "id": "science",
        "name": "Pure & Applied Sciences",
        "courses": ["B.Sc", "M.Sc", "Integrated M.Sc"],
        "specializations": [
            "Biotechnology & Bioinformatics",
            "Chemistry & Biochemistry",
            "Physics & Applied Physics",
            "Mathematics & Statistics",
            "Microbiology",
            "Environmental Science",
        ],
    },
    {
        "id": "law",
        "name": "Law & Legal Studies",
        "courses": ["LLB", "BA LLB", "BBA LLB", "LLM"],
        "specializations": [
            "Corporate Law & Mergers",
            "Constitutional & Civil Law",
            "Criminal Litigation",
            "Intellectual Property Rights",
            "Cyber Law",
        ],
    },
    {
        "id": "medical_healthcare",
        "name": "Medical, Pharmacy & Healthcare",
        "courses": ["MBBS", "BDS", "B.Pharm", "M.Pharm", "B.Sc Nursing", "BPT"],
        "specializations": [
            "Clinical Medicine",
            "Pharmaceutical Formulation & Quality Control",
            "Nursing Care & Patient Management",
            "Physiotherapy & Rehabilitation",
            "Hospital & Healthcare Management",
        ],
    },
]

EXPERIENCE_LEVELS = [
    "Student (1st / 2nd Year)",
    "Final Year Student",
    "Fresher / Recent Graduate",
    "Junior Professional (0-2 Years)",
    "Mid-Level Professional (2-5 Years)",
    "Senior Professional (5+ Years)",
    "Career Switcher",
]

TARGET_JOB_ROLES = [
    # Tech
    "Software Engineer (SDE 1 / Fresher)",
    "Frontend Developer (React / Next.js)",
    "Backend Developer (Python / Node / Java)",
    "Full Stack Developer",
    "Data Analyst / Data Scientist",
    "DevOps & Cloud Engineer",
    "QA / Automation Testing Engineer",
    # Management & Business
    "Business Development Associate (BDA)",
    "Management Trainee",
    "HR Recruiter / HR Generalist",
    "Product Manager / Associate PM",
    "Digital Marketing Specialist",
    "Operations Executive",
    # Finance & Commerce
    "Financial Analyst / Equity Research",
    "Accountant / Tax Consultant",
    "Auditor / Compliance Associate",
    "Banking Officer / Relationship Manager",
    # Others
    "Content Writer / Copywriter",
    "Legal Associate / Corporate Counsel",
    "Clinical Research Associate",
    "General / Other Role",
]

INTERVIEW_LANGUAGES = [
    {"code": "en", "label": "English"},
    {"code": "hi", "label": "Hindi (हिन्दी)"},
    {"code": "hi-en", "label": "Hinglish (Hindi + English)"},
    {"code": "bn", "label": "Bengali (বাংলা)"},
    {"code": "ta", "label": "Tamil (தமிழ்)"},
    {"code": "te", "label": "Telugu (తెలుగు)"},
    {"code": "mr", "label": "Marathi (मराठी)"},
    {"code": "gu", "label": "Gujarati (ગુજરાતી)"},
    {"code": "kn", "label": "Kannada (ಕನ್ನಡ)"},
    {"code": "ml", "label": "Malayalam (മലയാളം)"},
    {"code": "pa", "label": "Punjabi (ਪੰਜਾਬੀ)"},
]
