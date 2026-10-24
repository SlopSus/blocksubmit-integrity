import type { AuthSession, CreateAssignmentInput, UpdateAssignmentInput, Submission, SubmissionStep, UserRole } from "@/types/domain";
import { ApiError } from "../errors";
import { activities, assignments, professor, student, submissions } from "./data";
const wait = (ms=450) => new Promise(resolve => setTimeout(resolve, ms));
export const mockRepository = {
 async login(email:string,password:string):Promise<AuthSession> { await wait(); if (!password || password.length < 4) throw new ApiError("Invalid email or password.",401); const user = email.toLowerCase().includes("student") ? student : email.toLowerCase().includes("professor") ? professor : null; if (!user) throw new ApiError("Use a demo university account shown below.",401); return {token:`demo-${user.role}-session`,user}; },
 async me(role?:UserRole){ await wait(180); return role === "student" ? student : professor; },
 async getAssignments(){
   await wait();
   const now = Date.now();
   for (const a of assignments) {
     if (a.status === "ACTIVE" && new Date(a.deadline).getTime() <= now) {
       a.status = "CLOSED";
     }
   }
   return [...assignments];
 },
 async createAssignment(input:CreateAssignmentInput){ await wait(650); const item={id:`a-${Date.now()}`,code:"NEW",...input,createdAt:new Date().toISOString(),status:"ACTIVE" as const,submissionCount:0,requirements:["PDF format only","Maximum file size: 10 MB"]}; assignments.unshift(item); return item; },
 async updateAssignment(id:string, input:UpdateAssignmentInput){
   await wait(400);
   const assignment = assignments.find(a => a.id === id);
   if (!assignment) throw new ApiError("Assignment not found.", 404);
   if (input.title !== undefined) {
     if (input.title.trim().length < 3) throw new ApiError("Assignment title must be at least 3 characters.", 400);
     assignment.title = input.title.trim();
   }
   if (input.description !== undefined) {
     if (input.description.trim().length < 5) throw new ApiError("Assignment description must be at least 5 characters.", 400);
     assignment.description = input.description.trim();
   }
   if (input.deadline !== undefined) {
     const parsed = new Date(input.deadline);
     if (isNaN(parsed.getTime())) throw new ApiError("Invalid deadline format. Must be a valid date.", 400);
     assignment.deadline = parsed.toISOString();
     if (parsed.getTime() > Date.now()) {
       if (assignment.status === "CLOSED") assignment.status = "ACTIVE";
     } else {
       if (assignment.status === "ACTIVE") assignment.status = "CLOSED";
     }
   }
   if (input.status !== undefined) {
     if (input.status === "ACTIVE" && new Date(assignment.deadline).getTime() <= Date.now()) {
       throw new ApiError("Cannot activate an assignment whose deadline has already passed. Please extend the deadline first.", 400);
     }
     assignment.status = input.status;
   }
   if (input.requirements !== undefined) {
     assignment.requirements = input.requirements.filter(r => r.trim().length > 0);
   }
   return { ...assignment };
 },
 async deleteAssignment(id:string){
   await wait(400);
   const idx = assignments.findIndex(a => a.id === id);
   const assignment = assignments[idx];
   if (idx === -1 || !assignment) throw new ApiError("Assignment not found.", 404);
   const hasSubs = submissions.some(s => s.assignmentId === id) || assignment.submissionCount > 0;
   if (hasSubs) {
     throw new ApiError("Cannot delete an assignment with existing submissions. Archive or close the assignment instead to preserve student submission records and integrity proofs.", 409);
   }
   assignments.splice(idx, 1);
   return { message: "Assignment deleted successfully.", id };
 },
 async getSubmissions(role?:UserRole){ await wait(); return role === "student" ? submissions.filter(s=>s.student.id===student.id) : [...submissions]; },
 async submit(assignmentId:string,file:File,onStep:(step:SubmissionStep)=>void):Promise<Submission>{
   const assignment=assignments.find(a=>a.id===assignmentId);
   if(!assignment) throw new ApiError("Assignment not found.",404);
   const existing = submissions.find(s => s.assignmentId === assignmentId && s.student.id === student.id);
   if (existing) {
     throw new ApiError("You have already submitted a document for this assignment.", 409);
   }
   if (new Date(assignment.deadline).getTime() <= Date.now()) {
     throw new ApiError("Assignment deadline has passed. Submissions are closed.", 400);
   }
   if (assignment.status === "CLOSED" || assignment.status === "ARCHIVED") {
     throw new ApiError(`Submissions are closed for this assignment (status: ${assignment.status}).`, 400);
   }
   for (const step of ["uploading","hashing","recording","confirming"] as SubmissionStep[]){ onStep(step); await wait(650); }
   const created:Submission={id:`sub-${Date.now()}`,student:{id:student.id,name:student.name,email:student.email,initials:student.initials},assignmentId,assignmentTitle:assignment.title,documentName:file.name,fileSize:file.size,submittedAt:new Date().toISOString(),status:"PENDING",trustedHash:null,currentHash:null,hashMatch:null,proof:null};
   submissions.unshift(created);
   assignment.submissionStatus = "PENDING";
   assignment.submissionId = created.id;
   assignment.submissionCount += 1;
   onStep("complete");
   return created;
 },
 async getActivities(role?:UserRole){
   await wait();
   if (role === "student") {
     return activities.filter(a => a.type === "assignment" || a.detail.includes(student.name));
   }
   return [...activities];
 },
 async verify(id:string){ await wait(900); const item=submissions.find(s=>s.id===id); if(!item) throw new ApiError("Submission not found.",404); return item; },
};
