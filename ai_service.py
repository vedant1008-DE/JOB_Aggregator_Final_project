import os
import json
import fitz  # PyMuPDF
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash"

# In-memory storage for user resumes and chat history (replace with DB in production)
user_resumes = {}
user_chat_history = {}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF file bytes."""
    try:
        doc = fitz.open("pdf", file_bytes)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def analyze_resume(resume_text: str) -> dict:
    """Analyze resume using Gemini 2.5 Flash to extract skills, calculate score, and provide feedback."""
    try:
        prompt = f"""
        Analyze this resume and return a JSON response in this exact format (no other text):
        {{
            "matched_skills": ["Python", "JavaScript", "React", "FastAPI", "SQL", "Machine Learning", "Artificial Intelligence", "Web Development", "Java", "Git", "Docker", "AWS", "CI/CD", "Node.js", "TypeScript", "MongoDB", "PostgreSQL", "Redis", "Kubernetes", "GraphQL", "REST APIs", "Agile", "Scrum", "Figma", "UI/UX Design", "Data Analysis", "TensorFlow", "PyTorch"],
            "missing_skills": ["Deep Learning", "NLP", "Computer Vision", "Azure", "GCP", "Terraform", "Ansible", "Jenkins", "Prometheus", "Grafana"],
            "score": 85,
            "feedback": "Detailed feedback text"
        }}

        Resume text:
        {resume_text}
        """
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        
        # Parse the JSON response
        result_text = response.text.strip()
        # Remove markdown code blocks if present
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        
        result = json.loads(result_text.strip())
        return result
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        # Fallback to simple analysis if Gemini fails
        return {
            "matched_skills": ["Python", "JavaScript", "React", "FastAPI", "SQL", "Machine Learning", "Artificial Intelligence", "Web Development", "Java"],
            "missing_skills": ["Docker", "AWS", "CI/CD", "Deep Learning", "TensorFlow/PyTorch", "Git"],
            "score": 75,
            "feedback": "Resume analysis failed. Here's a general recommendation: Add more projects and quantify achievements!"
        }


def get_rag_response(user_id: str, query: str, jobs: list = None) -> str:
    """Generate RAG-based response using Gemini 2.5 Flash with resume context."""
    try:
        resume_context = user_resumes.get(user_id, {}).get("resume_summary", "No resume uploaded yet.")
        
        # Build context from jobs if available
        jobs_context = ""
        if jobs:
            jobs_context = "\nAvailable Jobs:\n"
            for job in jobs[:5]:
                jobs_context += f"- {job.get('title', 'N/A')} at {job.get('company', 'N/A')} in {job.get('location', 'N/A')}\n"
        
        # Build the full prompt
        system_prompt = f"""You are a helpful AI Job Assistant. Answer questions about jobs, resumes, and career advice.

        Context from user's resume: {resume_context}
        {jobs_context}
        """
        
        # Get user's chat history for context
        chat_history = user_chat_history.get(user_id, [])
        
        # Build conversation history
        conversation = [system_prompt]
        for msg in chat_history[-10:]:  # Last 10 messages
            if msg["role"] == "user":
                conversation.append(f"User: {msg['message']}")
            else:
                conversation.append(f"AI: {msg['message']}")
        
        conversation.append(f"User: {query}")
        conversation.append("AI:")
        
        full_prompt = "\n".join(conversation)
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=full_prompt
        )
        
        return response.text
    
    except Exception as e:
        print(f"Error getting AI response: {e}")
        import traceback
        traceback.print_exc()
        return "I'm having trouble understanding. Please try again later!"
