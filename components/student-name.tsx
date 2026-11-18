"use client";
import { useUser } from "@clerk/nextjs";
export function StudentName(){const {user}=useUser();return <>{user?.firstName||"student"}</>;}
