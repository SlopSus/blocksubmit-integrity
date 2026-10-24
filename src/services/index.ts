import type {
  Activity,
  Assignment,
  AuthSession,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  LoginCredentials,
  Submission,
  SubmissionStep,
  User,
  UserRole,
} from "@/types/domain";
import { serviceConfig } from "./config";
import { apiRequest, apiBlobRequest, clearSession } from "./api";
import { mockRepository } from "./mock/repository";

export const authService = {
  login: (input: LoginCredentials): Promise<AuthSession> => {
    if (serviceConfig.useMock) {
      return mockRepository.login(input.email, input.password);
    }
    clearSession();
    return apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  me: (role?: UserRole): Promise<User> =>
    serviceConfig.useMock
      ? mockRepository.me(role)
      : apiRequest<User>("/auth/me"),
};

export const assignmentService = {
  list: (): Promise<Assignment[]> =>
    serviceConfig.useMock
      ? mockRepository.getAssignments()
      : apiRequest<Assignment[]>("/assignments"),
  get: (id: string): Promise<Assignment> =>
    serviceConfig.useMock
      ? mockRepository.getAssignments().then((list) => {
          const found = list.find((a) => a.id === id);
          if (!found) throw new Error("Assignment not found.");
          return found;
        })
      : apiRequest<Assignment>(`/assignments/${id}`),
  create: (input: CreateAssignmentInput): Promise<Assignment> =>
    serviceConfig.useMock
      ? mockRepository.createAssignment(input)
      : apiRequest<Assignment>("/assignments", {
          method: "POST",
          body: JSON.stringify(input),
        }),
  update: (id: string, input: UpdateAssignmentInput): Promise<Assignment> =>
    serviceConfig.useMock
      ? mockRepository.updateAssignment(id, input)
      : apiRequest<Assignment>(`/assignments/${id}`, {
          method: "PUT",
          body: JSON.stringify(input),
        }),
  delete: (id: string): Promise<{ message: string; id: string }> =>
    serviceConfig.useMock
      ? mockRepository.deleteAssignment(id)
      : apiRequest<{ message: string; id: string }>(`/assignments/${id}`, {
          method: "DELETE",
        }),
};

export const submissionService = {
  list: (role?: UserRole): Promise<Submission[]> =>
    serviceConfig.useMock
      ? mockRepository.getSubmissions(role)
      : apiRequest<Submission[]>("/submissions"),
  submit: async (
    assignmentId: string,
    file: File,
    onStep: (s: SubmissionStep) => void
  ): Promise<Submission> => {
    if (serviceConfig.useMock) return mockRepository.submit(assignmentId, file, onStep);
    const body = new FormData();
    body.append("assignmentId", assignmentId);
    body.append("document", file);
    onStep("uploading");
    const t1 = setTimeout(() => onStep("hashing"), 300);
    const t2 = setTimeout(() => onStep("recording"), 600);
    const t3 = setTimeout(() => onStep("confirming"), 1000);
    try {
      const res = await apiRequest<Submission>("/submissions", {
        method: "POST",
        body,
      });
      onStep("complete");
      return res;
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    }
  },
  getDocumentBlob: async (id: string): Promise<Blob> => {
    if (serviceConfig.useMock) {
      return new Blob(["%PDF-1.4 Mock document bytes for testing"], { type: "application/pdf" });
    }
    return apiBlobRequest(`/submissions/${id}/document`);
  },
};

export const activityService = {
  list: (role?: UserRole): Promise<Activity[]> =>
    serviceConfig.useMock
      ? mockRepository.getActivities(role)
      : apiRequest<Activity[]>("/activities"),
};

export const verificationService = {
  verify: (id: string): Promise<Submission> =>
    serviceConfig.useMock
      ? mockRepository.verify(id)
      : apiRequest<Submission>(`/submissions/${id}/verify`, {
          method: "POST",
        }),
};

export * from "./integrityTest";

