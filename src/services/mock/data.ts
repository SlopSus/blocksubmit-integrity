import type { Activity, Assignment, Submission, User } from "@/types/domain";
export const professor: User = { id: "p-1", name: "Dr. Ananya Rao", email: "professor@blocksubmit.edu", role: "professor", initials: "AR", department: "Computer Science" };
export const student: User = { id: "s-1", name: "Aarav Menon", email: "student@blocksubmit.edu", role: "student", initials: "AM", department: "B.Tech Computer Science" };
export const assignments: Assignment[] = [
 { id:"a-1", title:"Distributed Systems Research Paper", code:"CS-402", description:"Analyze consensus models and fault tolerance in distributed networks.", deadline:"2026-09-28T17:30:00Z", createdAt:"2026-09-10T08:00:00Z", status:"ACTIVE", submissionCount:42, requirements:["PDF format only","Maximum file size: 10 MB","Include citations and student ID"], submissionStatus:"VERIFIED" },
 { id:"a-2", title:"Smart Contract Security Audit", code:"BC-310", description:"Review a Solidity contract and document vulnerabilities with remediation steps.", deadline:"2026-10-04T17:30:00Z", createdAt:"2026-09-14T09:00:00Z", status:"ACTIVE", submissionCount:28, requirements:["PDF format only","Maximum file size: 10 MB","Include audit methodology"], submissionStatus:"NOT_SUBMITTED" },
 { id:"a-3", title:"Cryptographic Hash Functions", code:"CS-361", description:"Compare modern hash functions and evaluate collision resistance.", deadline:"2026-09-21T17:30:00Z", createdAt:"2026-09-01T10:00:00Z", status:"CLOSED", submissionCount:51, requirements:["PDF format only","2,500–3,000 words"], submissionStatus:"PENDING" },
];
const proof = { transactionHash:"0x8d32f6c4b8a921c75d90e8a6229b3416fc12a4109f87bd402e14c9a2e6d0317a", blockNumber:18429371, timestamp:"2026-09-18T10:34:18Z", status:"CONFIRMED" as const };
export const submissions: Submission[] = [
 { id:"sub-1", student:{id:"s-1",name:"Aarav Menon",email:"student@blocksubmit.edu",initials:"AM"}, assignmentId:"a-1", assignmentTitle:"Distributed Systems Research Paper", documentName:"aarav_distributed_systems.pdf", fileSize:2480000, submittedAt:"2026-09-18T10:32:00Z", status:"VERIFIED", trustedHash:"a6f4d53e8b6d7c0298ccdf57f92a4eb72c556bf8856ff581a35f6d891f87a420", currentHash:"a6f4d53e8b6d7c0298ccdf57f92a4eb72c556bf8856ff581a35f6d891f87a420", hashMatch:true, proof },
 { id:"sub-2", student:{id:"s-2",name:"Meera Iyer",email:"meera@blocksubmit.edu",initials:"MI"}, assignmentId:"a-1", assignmentTitle:"Distributed Systems Research Paper", documentName:"meera_consensus_analysis.pdf", fileSize:1910000, submittedAt:"2026-09-18T09:14:00Z", status:"PENDING", trustedHash:"f1d310a927a2368b9e871be42208c5d21a194f628469031fa2155403ea417ed8", currentHash:null, hashMatch:null, proof:null },
 { id:"sub-3", student:{id:"s-3",name:"Rohan Shah",email:"rohan@blocksubmit.edu",initials:"RS"}, assignmentId:"a-3", assignmentTitle:"Cryptographic Hash Functions", documentName:"hash_functions_final.pdf", fileSize:3240000, submittedAt:"2026-09-17T16:48:00Z", status:"TAMPERED", trustedHash:"8dc841d9e73f180763318afd082829ecbb3fa2f08c27f6c54f145fc5ee76c210", currentHash:"193a10ecacc083aa9197e465c9911e05f47471f284384be4c66bdfd056fe2601", hashMatch:false, proof:{...proof,transactionHash:"0x5b9fd20536717d010875fee2474724a296e4e51e28dc8948850091a0822d614d",blockNumber:18429102} },
];
export const activities: Activity[] = [
 {id:"ev-1",type:"verification",title:"Document verified",detail:"Aarav Menon · Distributed Systems Research Paper",timestamp:"2026-09-18T10:41:00Z"},
 {id:"ev-2",type:"submission",title:"Submission received",detail:"Meera Iyer · Distributed Systems Research Paper",timestamp:"2026-09-18T09:14:00Z"},
 {id:"ev-3",type:"warning",title:"Integrity mismatch detected",detail:"Rohan Shah · Cryptographic Hash Functions",timestamp:"2026-09-17T17:03:00Z"},
 {id:"ev-4",type:"assignment",title:"Assignment created",detail:"Smart Contract Security Audit",timestamp:"2026-09-14T09:00:00Z"},
];
