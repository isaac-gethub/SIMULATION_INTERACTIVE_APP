TIB ACADEMY — BATCH 5 CONTROLLED DEPLOYMENT PACKAGE
October 2026

BASELINE
Built from the user-uploaded github_vercel.zip. Production was not touched.

FROZEN SCOPE IMPLEMENTED
1. Technical Market-Readiness Layer: TMR-01 through TMR-08
2. Market Readiness: Controls 360 Technical Profile → Interview Coaching → 50-Job Benchmark → Job-Specific Readiness Assessment → Targeted Development Plan

PRESERVED
- 17 Lead core activities remain 17.
- ENROLLMENT_COURSE = TIB-PM-CONTROLS-LEAD
- APP_COURSE_ID = pm_to_controls_lead
- tibsap:// protocol retained.
- Existing Supabase URL/publishable key retained.
- Existing course files and assets retained.

NEW FILES
- technical-market-readiness.html
- market-readiness.html

UPDATED
- course-home.html: links to the two frozen layers
- index.html: matching home links and trainee-facing branding normalization
- trainee-facing HTML: TIB Academy / SAP Practice Lab terminology normalization

IMPORTANT ACCEPTANCE NOTES
- Technical profile in this package is browser-local until the production Supabase readiness persistence schema is explicitly connected and runtime-tested. It does not falsely claim server persistence.
- Interview Coaching remains described as separately entitlement-gated; this baseline ZIP did not contain the gated coaching application files, so no ungated simulator was added.
- No instructor answer keys were newly exposed. Existing baseline files were preserved unchanged unless HTML branding normalization applied.
- No production deployment was performed.

DEPLOYMENT
Deploy the CONTENTS of this folder to the same Vercel project only after preview testing.

ACCEPTANCE
1. Sign in with a valid enrolled trainee.
2. Course Home loads.
3. Continue Training opens existing 17-activity course.
4. Foundation opens.
5. Technical Market Readiness opens and shows TMR-01 through TMR-08.
6. SAP Practice Lab links use tibsap://corvane?scenario=...
7. Market Readiness opens and profile scores 0–4.
8. Profile average is arithmetic mean of entered TMR scores.
9. Targeted Development lists only TMR scores below 3.
10. Job Market Alignment opens from Market Readiness.
11. Existing course progress/material/submission behavior remains intact.
12. Do not promote to production if the historical first-page blank defect appears in preview.
