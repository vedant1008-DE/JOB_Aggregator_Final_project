from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterUser(BaseModel):
    username: str
    email: EmailStr
    password:str

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class JobsInput(BaseModel):
    title: str
    company: str
    location: str
    salary: Optional[int] = None
    job_type: str
    description: Optional[str] = None
    job_url: str
    source_id: int

class SavedJob(BaseModel):
    job_id: int


class AlertPreference(BaseModel):
    keyword: str
    location: Optional[str] = None
    min_salary: Optional[int] = None
    email_enabled: bool = True

class SearchJob(BaseModel):
    keyword: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    min_salary: Optional[int] = None
    job_type: Optional[str] = None


class SourceInput(BaseModel):
    source_name: str
    source_url: str