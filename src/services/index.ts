import type { CreateAssignmentInput, LoginCredentials, SubmissionStep, UserRole } from "@/types/domain";
import { serviceConfig } from "./config";
import { apiRequest } from "./api";
import { mockRepository } from "./mock/repository";
export const authService={ login:(input:LoginCredentials)=>serviceConfig.useMock?mockRepository.login(input.email,input.password):apiRequest("/auth/login",{method:"POST",body:JSON.stringify(input)}), me:(role?:UserRole)=>serviceConfig.useMock?mockRepository.me(role):apiRequest("/auth/me") };
export const assignmentService={ list:()=>serviceConfig.useMock?mockRepository.getAssignments():apiRequest("/assignments"), create:(input:CreateAssignmentInput)=>serviceConfig.useMock?mockRepository.createAssignment(input):apiRequest("/assignments",{method:"POST",body:JSON.stringify(input)}) };
export const submissionService={ list:(role?:UserRole)=>serviceConfig.useMock?mockRepository.getSubmissions(role):apiRequest("/submissions"), submit:(assignmentId:string,file:File,onStep:(s:SubmissionStep)=>void)=>{ if(serviceConfig.useMock)return mockRepository.submit(assignmentId,file,onStep); const body=new FormData();body.append("assignmentId",assignmentId);body.append("document",file);onStep("uploading");return apiRequest("/submissions",{method:"POST",body}); } };
export const activityService={ list:()=>serviceConfig.useMock?mockRepository.getActivities():Promise.resolve([]) };
export const verificationService={ verify:(id:string)=>{ if(serviceConfig.useMock)return mockRepository.verify(id); return Promise.reject(new Error("Verification endpoint is not configured.")); } };
