import {requireAdmin} from "@/lib/auth";
import {execute,rateLimit} from "@/lib/db";
import {uploadStudyPdf} from "@/lib/r2";
import {extractMockPdf,validateMockDraft} from "@/lib/mock-pdf-parser";
import {mockPaper,stageMock,publishMock,type MockMetadata} from "@/lib/mock-papers";
import {randomUUID} from "node:crypto";
import {z} from "zod";
import {revalidatePath,revalidateTag} from "next/cache";
import {PUBLIC_CATALOGUE_TAG} from "@/lib/public-catalogue";
import {examRules,examModes} from "@/lib/exam-rules";
export const runtime="nodejs";
export const maxDuration=60;
const metadataSchema=z.object({mode:z.enum(examModes).default("practice"),slug:z.string().regex(/^[a-z0-9-]+$/).max(150),title:z.string().trim().min(2).max(180),summary:z.string().trim().min(10).max(250),body:z.string().max(50000),exam:z.enum(["UPSC","APPSC","TSPSC"]),language:z.enum(["English","Telugu","Bilingual"]),price:z.string().regex(/^\d{1,6}(\.\d{1,2})?$/),minutes:z.coerce.number().int().min(1).max(840),expected:z.coerce.number().int().min(1).max(700)});
export async function POST(request:Request){
 const headers={"Cache-Control":"private, no-store"};
 if(request.headers.get("origin")!==new URL(request.url).origin)return Response.json({error:"Invalid request origin."},{status:403,headers});
 const admin=await requireAdmin();
 try{
  await rateLimit("mock-upload:"+admin.id,50);
  const reader=request.body?.getReader();if(!reader)throw Error("No upload received.");const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4_200_000){await reader.cancel();return Response.json({error:"Total upload must be under 4 MB."},{status:413,headers});}chunks.push(value);}
  const form=await new Request(request.url,{method:"POST",headers:{"Content-Type":request.headers.get("content-type")||""},body:Buffer.concat(chunks)}).formData();
  if(form.get("action")==="save"){
   const book=String(form.get("book")||""),paper=await mockPaper(book);if(!paper||paper.status!=="draft")throw Error("This draft is no longer editable.");const raw=String(form.get("questions")||"");if(raw.length>2_000_000)throw Error("Question data is too large.");const questions=validateMockDraft(JSON.parse(raw),paper.metadata.expected);
   const saved=await execute({sql:"UPDATE mock_papers SET questions=? WHERE book=? AND status='draft'",args:[JSON.stringify(questions),book]});if(!saved.rowsAffected)throw Error("This draft was already published. Reload the page.");return Response.json({ok:true},{headers});
  }
  if(form.get("action")==="publish"){
   const book=String(form.get("book")||"");if(form.get("confirmed")!=="yes")throw Error("Confirm that you checked the extracted questions against the PDF.");
   const raw=String(form.get("questions")||"");if(raw.length>2_000_000)throw Error("Question data is too large. Split the test.");
   await publishMock(admin.id,book,JSON.parse(raw));const paper=await mockPaper(book);
   revalidateTag(PUBLIC_CATALOGUE_TAG,"max");for(const path of ["/test-series/","/staff/mock-tests/","/"])revalidatePath(path);
   return Response.json({ok:true,published:true,book,contentId:paper?.contentId},{headers});
  }
  const result=metadataSchema.safeParse(Object.fromEntries(form));if(!result.success)throw Error("Check the URL name, title, short description, price, duration and expected question count.");const v=result.data;
  if(v.slug==="free-polity-starter")throw Error("That URL name is reserved for the built-in free starter test. Choose a different URL name.");
  examRules(v.mode,v.expected,v.minutes*60);if(v.mode!=="practice"&&v.exam!=="UPSC")throw Error("Choose UPSC for a full-paper UPSC preset.");
  const file=form.get("pdf");if(!(file instanceof File)||!file.size)throw Error("Choose the test PDF.");
  const existing=(await execute({sql:"SELECT category FROM content WHERE kind='course' AND slug=?",args:[v.slug]})).rows[0];if(existing&&existing.category!=="Test Series")throw Error("That URL name is already used by a course.");
  const bytes=new Uint8Array(await file.arrayBuffer());const extracted=await extractMockPdf(bytes.slice(),v.expected);
  if(extracted.issues.some(issue=>issue.startsWith("The PDF contains additional questions.")))throw Error("The PDF has more questions than the count entered. Enter its complete count, or split the PDF to match the selected full-paper preset.");
  const key=`study-materials/${v.exam.toLowerCase()}/tests/${randomUUID()}.pdf`;await uploadStudyPdf(key,bytes);
  const metadata:MockMetadata={title:v.title,summary:v.summary,body:v.body,exam:v.exam,language:v.language,price:Math.round(Number(v.price)*100),minutes:v.minutes,expected:v.expected,mode:v.mode};
  const book=await stageMock(admin.id,v.slug,metadata,key,extracted.questions);
  revalidatePath("/staff/mock-tests/");
  return Response.json({ok:true,book,questions:extracted.questions,issues:extracted.issues,pages:extracted.pages,expected:v.expected},{headers});
 }catch(error){return Response.json({error:error instanceof Error?error.message:"Could not process this PDF. The existing published test has been preserved."},{status:400,headers});}
}
