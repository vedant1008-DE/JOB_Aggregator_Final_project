import os
# pyrefly: ignore [missing-import]
import resend
from database import supabase

resend.api_key = os.getenv("RESEND_API_KEY")

def send_email(to_email, keyword, jobs):
    jobs_list_html = ""
    text_body = f"New Job Alerts for '{keyword.title()}'\n\nWe found the following new jobs matching your preference:\n\n"
    
    for job in jobs[:10]:
        salary_text = f"Rs. {job['salary']}" if job.get("salary") else "Not specified"
        
        jobs_list_html += f"""
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 6px; font-family: sans-serif;">
            <h3 style="margin: 0 0 10px 0;"><a href="{job['job_url']}" style="color: #2b6cb0; text-decoration: none;">{job['title']}</a></h3>
            <p style="margin: 0 0 5px 0; color: #4a5568;"><strong>Company:</strong> {job['company']}</p>
            <p style="margin: 0 0 5px 0; color: #4a5568;"><strong>Location:</strong> {job['location']}</p>
            <p style="margin: 0; color: #4a5568;"><strong>Salary:</strong> {salary_text}</p>
        </div>
        """
        
        text_body += f"- {job['title']} at {job['company']}\n  Location: {job['location']}\n  Salary: {salary_text}\n  Link: {job['job_url']}\n\n"

    html_body = f"""
    <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
        <h2 style="color: #2d3748;">New Job Alerts for "{keyword.title()}"</h2>
        <p style="color: #718096; margin-bottom: 20px;">We found the following new jobs matching your preference:</p>
        {jobs_list_html}
    </div>
    """

    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to_email,
            "subject": f"Job Alert: {keyword.title()}",
            "html": html_body,
            "text": text_body
        })
    except Exception as e:
        print(f"Error sending alert email to {to_email}: {e}")


def match_and_send_alerts(new_jobs):
    if not new_jobs:
        return

    res = supabase.table("alert_preferences").select("*, users(email)").eq("email_enabled", True).execute()
    if not res.data:
        return

    for pref in res.data:
        user = pref.get("users")
        if not user or not user.get("email"):
            continue

        email = user["email"]
        keyword = pref["keyword"].strip().lower()
        pref_loc = pref.get("location")
        min_salary = pref.get("min_salary")

        matched_jobs = []
        for job in new_jobs:
            title = (job.get("title") or "").lower()
            company = (job.get("company") or "").lower()
            desc = (job.get("description") or "").lower()
            job_loc = (job.get("location") or "").lower()
            job_sal = job.get("salary")

            if keyword not in title and keyword not in company and keyword not in desc:
                continue

            if pref_loc and pref_loc.strip().lower() not in job_loc:
                continue

            if min_salary:
                try:
                    if not job_sal or int(job_sal) < int(min_salary):
                        continue
                except (ValueError, TypeError):
                    continue

            matched_jobs.append(job)

        if matched_jobs:
            send_email(email, keyword, matched_jobs)

def send_immediate_alerts(user_id, keyword, location=None, min_salary=None):
    res_user = supabase.table("users").select("email").eq("id", user_id).execute()
    if not res_user.data:
        return
    email = res_user.data[0]["email"]

    res_jobs = supabase.table("jobs").select("*").order("id", desc=True).limit(100).execute()
    if not res_jobs.data:
        return

    keyword_lower = keyword.strip().lower()
    matched_jobs = []
    for job in res_jobs.data:
        title = (job.get("title") or "").lower()
        company = (job.get("company") or "").lower()
        desc = (job.get("description") or "").lower()
        job_loc = (job.get("location") or "").lower()
        job_sal = job.get("salary")

        if keyword_lower not in title and keyword_lower not in company and keyword_lower not in desc:
            continue

        if location and location.strip().lower() not in job_loc:
            continue

        if min_salary:
            try:
                if not job_sal or int(job_sal) < int(min_salary):
                    continue
            except (ValueError, TypeError):
                continue

        matched_jobs.append(job)

    if matched_jobs:
        send_email(email, keyword, matched_jobs)

