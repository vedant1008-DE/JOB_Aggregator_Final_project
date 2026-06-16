import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import os
import time
from dotenv import load_dotenv
import requests
from database import supabase

load_dotenv()

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
TARGET_JOBS = 60

KEYWORDS = [
    "software developer", "data analyst", "web developer", "python",
    "java developer", "marketing manager", "sales executive",
    "human resources", "business analyst", "project manager",
    "content writer", "graphic designer", "accountant",
    "customer support", "operations manager", "mechanical engineer",
    "civil engineer", "electrical engineer", "digital marketing",
    "finance manager",
]


def get_or_create_source():
    existing = supabase.table("job_sources").select("*").eq("source_name", "Adzuna").execute()
    if existing.data:
        return existing.data[0]["id"]
    new = supabase.table("job_sources").insert({"source_name": "Adzuna", "source_url": "https://www.adzuna.in"}).execute()
    return new.data[0]["id"]


def job_exists(job_url, title, company):
    if job_url and supabase.table("jobs").select("id").eq("job_url", job_url).execute().data:
        return True
    if title and company:
        return bool(supabase.table("jobs").select("id").eq("title", title).eq("company", company).execute().data)
    return False


def fetch_jobs(keyword, page=1):
    try:
        resp = requests.get(
            f"https://api.adzuna.com/v1/api/jobs/in/search/{page}",
            params={"app_id": ADZUNA_APP_ID, "app_key": ADZUNA_APP_KEY,
                     "results_per_page": 20, "what": keyword},
            timeout=15
        )
        if resp.status_code == 401:
            print("  [ERROR] 401 - check ADZUNA_APP_ID / ADZUNA_APP_KEY in .env")
            return []
        resp.raise_for_status()
        return resp.json().get("results", [])
    except Exception as e:
        print(f"  [ERROR] {e}")
        return []


def main():
    print("Starting Adzuna job import...")

    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        print("[FATAL] ADZUNA_APP_ID or ADZUNA_APP_KEY not set in .env")
        return

    source_id = get_or_create_source()
    inserted, skipped = 0, 0
    seen = set()
    new_jobs = []

    for keyword in KEYWORDS:
        if inserted >= TARGET_JOBS:
            break

        print(f"\nSearching: \"{keyword}\"")
        for job in fetch_jobs(keyword):
            if inserted >= TARGET_JOBS:
                break
            try:
                url = job.get("redirect_url", "")
                title = job.get("title", "").strip()
                company = (job.get("company") or {}).get("display_name", "Unknown").strip()
                location = (job.get("location") or {}).get("display_name", "India").strip()
                salary = int(job.get("salary_max") or job.get("salary_min") or 0) or None
                desc = (job.get("description") or "")[:500] or None

                if not title or not url:
                    continue
                if url in seen:
                    skipped += 1
                    continue
                seen.add(url)
                if job_exists(url, title, company):
                    skipped += 1
                    continue

                res = supabase.table("jobs").insert({
                    "title": title, "company": company, "location": location,
                    "salary": salary, "job_type": "Full-time",
                    "description": desc, "job_url": url, "source_id": source_id,
                }).execute()

                if res.data:
                    new_jobs.append(res.data[0])

                inserted += 1
                print(f"  Inserted: {title} at {company}")
            except Exception as e:
                print(f"  [ERROR] {e}")

        time.sleep(1)

    print(f"\nDone! {inserted} jobs imported, {skipped} duplicates skipped.")

    if new_jobs:
        from alerts import match_and_send_alerts
        match_and_send_alerts(new_jobs)



if __name__ == "__main__":
    main()
