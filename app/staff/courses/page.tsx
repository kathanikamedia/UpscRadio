import {StaffProgrammes} from "@/components/staff-programmes";
export const metadata={title:"Manage courses",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{edit?:string}>}){return <StaffProgrammes editSlug={(await searchParams).edit}/>;}
