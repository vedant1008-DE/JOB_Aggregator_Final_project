from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import supabase
from auth import create_token, get_current_user, verify_password, hash_password
from models import RegisterUser, LoginUser, JobsInput, SavedJob, AlertPreference, SearchJob, SourceInput
from apscheduler.schedulers.background import BackgroundScheduler
from scrapers.main import main as run_scraper
from ai_service import extract_text_from_pdf, analyze_resume, get_rag_response, user_resumes, user_chat_history

app = FastAPI()
scheduler = None

class ChatMessage(BaseModel):
    message: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

def scheduled_scrape():
    print("\n" + "="*50)
    print("Running scheduled job scraper...")
    print("="*50 + "\n")
    try:
        run_scraper()
    except Exception as e:
        print(f"Error in scheduled scrape: {e}")

@app.on_event("startup")
async def startup_event():
    global scheduler
    scheduler = BackgroundScheduler()
    
    # Run every 2 days
    scheduler.add_job(
        scheduled_scrape,
        'interval',
        days=2,
        id='job_scraper',
        name='Scrape jobs every 2 days',
        replace_existing=True
    )
    
    scheduler.start()
    print("Scheduler started - will run scraper every 2 days")

@app.on_event("shutdown")
async def shutdown_event():
    global scheduler
    if scheduler:
        scheduler.shutdown()
        print("Scheduler stopped")

@app.get("/")
def home():
    return{
        "message": "Welcome to the Job Aggregator service"
    }

@app.post("/register")
def register(user: RegisterUser):
    existing_user = (supabase.table("users").select("*").eq("email", user.email).execute())
    if existing_user.data:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed = hash_password(user.password)
    new_user = (supabase.table("users").insert({
            "username": user.username,
            "email": user.email,
            "password_hash": hashed
        }).execute()
    )

    return {
        "message": "User registered successfully",
        "user": new_user.data[0]
    }

@app.post("/login")
def login(user: LoginUser):
    res = (supabase.table("users").select("*").eq("email", user.email).execute())

    if not res.data:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )
    db_user = res.data[0]

    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    token = create_token({"user_id": db_user["id"], "email": db_user["email"]})

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer"
    }


@app.get("/profile")
def profile(user_id: int = Depends(get_current_user)):
    user = (supabase.table("users").select("id, username, email, created_at").eq("id", user_id).execute())

    if not user.data:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    return user.data[0]


@app.post("/job_sources")
def create_source(source: SourceInput, user_id: str = Depends(get_current_user)):
    new_source = (supabase.table("job_sources").insert({"source_name": source.source_name, "source_url": source.source_url}).execute()
    )

    return {
        "message": "Source created successfully",
        "source": new_source.data[0]
    }


@app.post("/jobs")
def create_job(job: JobsInput, user_id: str = Depends(get_current_user)):
    new_job = (supabase.table("jobs").insert({"title": job.title, "company": job.company, "location": job.location, "salary": job.salary, "job_type": job.job_type, "description": job.description, "job_url": job.job_url, "source_id": job.source_id}).execute())

    return {
        "message": "Job created successfully",
        "job": new_job.data[0]
    }


@app.get("/jobs/{job_id}")
def get_job(job_id: int, user_id: int = Depends(get_current_user)):
    job = (supabase.table("jobs").select("*").eq("id", job_id).execute())

    if not job.data:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )
    return job.data[0]


@app.get("/get_jobs")
def get_jobs(page: int = 1, per_page: int = 10, user_id: str = Depends(get_current_user)):
    offset = (page - 1) * per_page
    jobs = supabase.table("jobs").select("*").range(offset, offset + per_page - 1).execute()
    return {"jobs": jobs.data, "page": page, "per_page": per_page}


@app.get("/locations")
def get_locations(user_id: str = Depends(get_current_user)):
    res = supabase.table("jobs").select("location").execute()
    locations = sorted(list(set(item["location"].strip() for item in res.data if item.get("location"))))
    return locations


@app.post("/search_jobs")
def search_jobs(search: SearchJob, page: int = 1, per_page: int = 10, user_id: str = Depends(get_current_user)):
    query = supabase.table("jobs").select("*")
    
    if search.location:
        query = query.ilike("location", f"%{search.location}%")
    
    if search.company:
        query = query.ilike("company", f"%{search.company}%")
    
    if search.job_type:
        query = query.eq("job_type", search.job_type)
    
    jobs = query.execute()
    results = jobs.data
    
    if search.keyword:
        keywords = search.keyword.lower().split()
        filtered = []
        for job in results:
            title = (job.get("title") or "").lower()
            company = (job.get("company") or "").lower()
            desc = (job.get("description") or "").lower()
            if all(any(kw in field for field in (title, company, desc)) for kw in keywords):
                filtered.append(job)
        results = filtered
        
    if search.min_salary:
        filtered_results = []
        for job in results:
            job_salary = job.get("salary")
            if job_salary is not None:
                try:
                    salary_int = int(job_salary)
                    if salary_int >= search.min_salary:
                        filtered_results.append(job)
                except (ValueError, TypeError):
                    pass
        results = filtered_results
    
    offset = (page - 1) * per_page
    paginated_results = results[offset:offset + per_page]
    
    return {"jobs": paginated_results, "page": page, "per_page": per_page, "total": len(results)}


@app.post("/save_job")
def save_job(saved_job: SavedJob, user_id: str = Depends(get_current_user)):
    existing = (supabase.table("saved_jobs").select("*").eq("user_id", user_id).eq("job_id", saved_job.job_id).execute())

    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="Job already saved"
        )

    saved = (supabase.table("saved_jobs").insert({"user_id": user_id,"job_id": saved_job.job_id}).execute())

    return {
        "message": "Job saved successfully",
        "saved_job": saved.data[0]
    }

@app.get("/saved_jobs")
def get_saved_jobs(user_id: int = Depends(get_current_user)):
    saved = (supabase.table("saved_jobs").select("*, jobs(*)").eq("user_id", user_id).execute())
    return saved.data


@app.delete("/saved_jobs/{job_id}")
def unsave_job(job_id: int, user_id: int = Depends(get_current_user)):
    deleted = (supabase.table("saved_jobs").delete().eq("user_id", user_id).eq("job_id", job_id).execute())
    return {"message": "Job unsaved successfully"}


@app.get("/job_sources")
def get_sources(user_id: str = Depends(get_current_user)):
    sources = (supabase.table("job_sources").select("*").execute())
    return sources.data


@app.delete("/job_sources/{source_id}")
def delete_source(source_id: int, user_id: str = Depends(get_current_user)):
    deleted = (supabase.table("job_sources").delete().eq("id", source_id).execute())
    return {"message": "Job source deleted successfully"}


@app.post("/alert_preferences")
def create_alert(alert: AlertPreference, background_tasks: BackgroundTasks, user_id: int = Depends(get_current_user)):
    new_alert = (supabase.table("alert_preferences").insert({
            "user_id": user_id,
            "keyword": alert.keyword,
            "location": alert.location,
            "min_salary": alert.min_salary,
            "email_enabled": alert.email_enabled
        }).execute()
    )

    if alert.email_enabled:
        from alerts import send_immediate_alerts
        background_tasks.add_task(
            send_immediate_alerts,
            user_id,
            alert.keyword,
            alert.location,
            alert.min_salary
        )

    return {"message": "Alert preference created successfully", "alert": new_alert.data[0]}



@app.get("/alert_preferences")
def get_alerts(user_id: int = Depends(get_current_user)):
    alerts = (supabase.table("alert_preferences").select("*").eq("user_id", user_id).execute())
    return alerts.data


@app.delete("/alert_preferences/{alert_id}")
def delete_alert(alert_id: int, user_id: int = Depends(get_current_user)):
    deleted = (supabase.table("alert_preferences").delete().eq("user_id", user_id).eq("id", alert_id).execute())
    return {"message": "Alert preference deleted successfully"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), user_id: int = Depends(get_current_user)):
    """Upload and analyze a resume file."""
    try:
        contents = await file.read()
        
        # Extract text based on file type
        if file.filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(contents)
        else:
            # For other files, try to decode as text
            try:
                resume_text = contents.decode('utf-8')
            except:
                resume_text = str(contents)
        
        if not resume_text or len(resume_text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Could not extract text from the file. Please upload a valid resume.")
        
        # Analyze the resume
        analysis = analyze_resume(resume_text)
        analysis['resume_summary'] = resume_text[:1000]  # Store for chat context
        
        # Save to in-memory storage
        user_resumes[user_id] = analysis
        
        return {
            "message": "Resume uploaded and analyzed successfully",
            "analysis": analysis
        }
        
    except Exception as e:
        print(f"Error processing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@app.get("/resume-analysis")
def get_resume_analysis(user_id: int = Depends(get_current_user)):
    """Get the user's stored resume analysis."""
    analysis = user_resumes.get(user_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    return analysis


@app.post("/chat")
def chat_with_ai(chat_msg: ChatMessage, user_id: int = Depends(get_current_user)):
    """Chat with AI about jobs and resume."""
    # Get user's saved jobs for context
    jobs = []
    try:
        saved_jobs = supabase.table("saved_jobs").select("*, jobs(*)").eq("user_id", user_id).execute()
        if saved_jobs.data:
            jobs = [sj["jobs"] for sj in saved_jobs.data if sj.get("jobs")]
    except Exception as e:
        print(f"Error fetching jobs for chat: {e}")
    
    # Get response
    response = get_rag_response(user_id, chat_msg.message, jobs)
    
    # Save chat history
    if user_id not in user_chat_history:
        user_chat_history[user_id] = []
    
    user_chat_history[user_id].append({
        "role": "user",
        "message": chat_msg.message
    })
    user_chat_history[user_id].append({
        "role": "ai",
        "message": response
    })
    
    return {"response": response}


@app.get("/chat-history")
def get_chat_history(user_id: int = Depends(get_current_user)):
    """Get chat history for user."""
    return {"history": user_chat_history.get(user_id, [])}
