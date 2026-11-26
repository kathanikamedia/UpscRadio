
import {Localized} from "@/components/localized";
import {StaffProgrammes} from "@/components/staff-programmes";
export const metadata={title:"Manage courses",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{edit?:string}>}){return <Localized>{<StaffProgrammes editSlug={(await searchParams).edit}/>}</Localized>;}
