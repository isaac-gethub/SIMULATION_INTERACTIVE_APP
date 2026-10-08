TIB ILA — FOUNDATION CLICK FIX

Issue:
FOUNDATION · Controls Theory was visible but clicking it did not open the viewer.

Cause:
The Foundation function loaded the content but did not explicitly change the shared viewer from display:none to display:flex.

Fix:
Added viewer.style.display='flex' to openFoundation().

Unchanged:
- 17 existing activities
- activity IDs/order
- Supabase/progress/submission architecture
- B0–B10 Foundation content
- navigation labels

Deploy:
Extract ZIP, Ctrl+A, upload all files to GitHub repository root, commit, allow Vercel to redeploy.
