import type { AuthSession, CreateAssignmentInput, Submission, SubmissionStep, UserRole } from "@/types/domain";
import { ApiError } from "../errors";
import { activities, assignments, professor, student, submissions } from "./data";
const wait = (ms=450) => new Promise(resolve => setTimeout(resolve, ms));
export const mockRepository = {
 async login(email:string,password:string):Promise<AuthSession> { await wait(); if (!password || password.length < 4) throw new ApiError("Invalid email or password.",401); const user = email.toLowerCase().includes("student") ? student : email.toLowerCase().includes("professor") ? professor : null; if (!user) throw new ApiError("Use a demo university account shown below.",401); return {token:`demo-${user.role}-session`,user}; },
 async me(role?:UserRole){ await wait(180); return role === "student" ? student : professor; },
 async getAssignments(){ await wait(); return [...assignments]; },
 async createAssignment(input:CreateAssignmentInput){ await wait(650); const item={id:`a-${Date.now()}`,code:"NEW",...input,createdAt:new Date().toISOString(),status:"ACTIVE" as const,submissionCount:0,requirements:["PDF format only","Maximum file size: 10 MB"]}; assignments.unshift(item); return item; },
 async getSubmissions(role?:UserRole){ await wait(); return role === "student" ? submissions.filter(s=>s.student.id===student.id) : [...submissions]; },
 async submit(assignmentId:string,file:File,onStep:(step:SubmissionStep)=>void):Promise<Submission>{ for (const step of ["uploading","hashing","recording","confirming"] as SubmissionStep[]){ onStep(step); await wait(650); } const assignment=assignments.find(a=>a.id===assignmentId); if(!assignment) throw new ApiError("Assignment not found.",404); const created:Submission={id:`sub-${Date.now()}`,student:{id:student.id,name:student.name,email:student.email,initials:student.initials},assignmentId,assignmentTitle:assignment.title,documentName:file.name,fileSize:file.size,submittedAt:new Date().toISOString(),status:"PENDING",trustedHash:null,currentHash:null,hashMatch:null,proof:null}; submissions.unshift(created); onStep("complete"); return created; },
 async getActivities(){ await wait(); return [...activities]; },
 async verify(id:string){ await wait(900); const item=submissions.find(s=>s.id===id); if(!item) throw new ApiError("Submission not found.",404); return item; },
};
