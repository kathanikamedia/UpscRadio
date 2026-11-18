"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
const AccountContext=createContext<{userId:string|null;ready:boolean}>({userId:null,ready:false});
function ClerkAccount({children}:{children:ReactNode}){const {userId,isLoaded}=useAuth();return <AccountContext.Provider value={{userId:userId||null,ready:isLoaded}}>{children}</AccountContext.Provider>;}
export function AccountState({configured,children}:{configured:boolean;children:ReactNode}){return configured?<ClerkAccount>{children}</ClerkAccount>:<AccountContext.Provider value={{userId:null,ready:true}}>{children}</AccountContext.Provider>;}
export function useAccount(){return useContext(AccountContext);}
