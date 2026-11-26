"use client";
import {Localized} from "@/components/localized";

import { useUser } from "@clerk/nextjs";
export function StudentName(){const {user}=useUser();return <Localized>{<>{user?.firstName||"student"}</>}</Localized>;}
