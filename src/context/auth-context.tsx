import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthSession, LoginCredentials, User } from "@/types/domain";
import { authService } from "@/services";
import { clearSession, persistSession, readSession } from "@/services/api";
interface AuthValue { user:User|null; loading:boolean; login:(v:LoginCredentials)=>Promise<User>; logout:()=>void; }
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){ const [user,setUser]=useState<User|null>(null);const [loading,setLoading]=useState(true); useEffect(()=>{const session=readSession<AuthSession>();setUser(session?.user??null);setLoading(false);const clear=()=>{clearSession();setUser(null)};window.addEventListener("blocksubmit:unauthorized",clear);return()=>window.removeEventListener("blocksubmit:unauthorized",clear)},[]); async function login(input:LoginCredentials){const session=await authService.login(input);persistSession(session);setUser(session.user);return session.user} function logout(){clearSession();setUser(null)} return <AuthContext.Provider value={{user,loading,login,logout}}>{children}</AuthContext.Provider> }
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used within AuthProvider");return value}
