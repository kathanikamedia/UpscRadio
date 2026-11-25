import {StaffProgrammes} from "@/components/staff-programmes";
export const metadata={title:"Manage mock tests",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{edit?:string}>}){return <StaffProgrammes mock editSlug={(await searchParams).edit}/>;}
