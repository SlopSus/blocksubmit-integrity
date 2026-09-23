export type UserRole = "professor" | "student";
export type IntegrityStatus = "PENDING" | "VERIFIED" | "TAMPERED";
export type AssignmentStatus = "ACTIVE" | "CLOSED" | "DRAFT";

export interface User { id: string; name: string; email: string; role: UserRole; initials: string; department: string; }
export interface BlockchainProof { transactionHash: string | null; blockNumber: number | null; timestamp: string | null; status: "CONFIRMED" | "PENDING" | "FAILED" | null; }
export interface Assignment { id: string; title: string; code: string; description: string; deadline: string; createdAt: string; status: AssignmentStatus; submissionCount: number; requirements: string[]; submissionStatus?: IntegrityStatus | "NOT_SUBMITTED"; }
export interface Submission { id: string; student: Pick<User, "id" | "name" | "email" | "initials">; assignmentId: string; assignmentTitle: string; documentName: string; fileSize: number; submittedAt: string; status: IntegrityStatus; trustedHash: string | null; currentHash: string | null; hashMatch: boolean | null; proof: BlockchainProof | null; }
export interface VerificationResult { submission: Submission; result: Exclude<IntegrityStatus, "PENDING">; verifiedAt: string; }
export interface DashboardStats { totalAssignments?: number; activeAssignments: number; totalSubmissions?: number; pending: number; verified: number; tampered?: number; completed?: number; }
export interface Activity { id: string; type: "assignment" | "submission" | "verification" | "warning"; title: string; detail: string; timestamp: string; }
export interface LoginCredentials { email: string; password: string; }
export interface AuthSession { token: string; user: User; }
export interface CreateAssignmentInput { title: string; description: string; deadline: string; }
export type SubmissionStep = "uploading" | "hashing" | "recording" | "confirming" | "complete";
