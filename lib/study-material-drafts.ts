export const currentAffairsDrafts = [
  {
    slug:"ap-current-affairs-bit-bank-2026-english",
    title:"AP Current Affairs Bit Bank 2026 — English PDF",
    summary:"674 Andhra Pradesh current affairs MCQs with answers and explanations for APPSC Group 1 & Group 2 Prelims. Covers January–8 November 2026, with English questions arranged by month and topic.",
    body:"Build a focused Andhra Pradesh current-affairs revision routine with this APPSCExamEdge practice question bank. It contains 674 multiple-choice questions for APPSC Group 1 and Group 2 Preliminary Examination preparation.\n\nQuestions are organised month by month and by subject within each month. Answers and explanations follow the relevant sections, including background concepts and related schemes, institutions and events.\n\nCoverage runs from January to 8 November 2026. Topics include polity and governance, economy and infrastructure, science and health, environment and other Andhra Pradesh developments.\n\nThe questions and explanations are in English; the introductory reader’s note includes Telugu. The uploaded PDF has 242 pages, including its cover and a blank final page. Published by APPSCExamEdge and distributed through UPSC Radio with the owner’s permission.",
    category:"Current Affairs",
    extra:{exam:"APPSC",groups:"Group 1, Group 2",stage:"Prelims",language:"English",type:"Practice question bank",question_count:674,pages:242,file_bytes:2441632,coverage:"January–8 November 2026",coverage_end:"2026-11-08",publisher:"APPSCExamEdge",price_paise:9900,temporary_price:true,access:"paid",purchase_enabled:false,cover:"/materials/ap-current-affairs-2026-english.webp",storage_key:"study-materials/appsc/current-affairs/AP_Current_Affairs_Bit_Bank_2026.pdf"},
  },
  {
    slug:"ap-current-affairs-bit-bank-2026-telugu",
    title:"AP Current Affairs Bit Bank 2026 — Telugu PDF",
    summary:"674 Andhra Pradesh current affairs MCQs in Telugu, with answers and explanations for APPSC Group 1 & Group 2 Prelims. Covers January–8 November 2026, organised by month and topic for revision.",
    body:"Revise Andhra Pradesh current affairs in Telugu with this APPSCExamEdge practice question bank for APPSC Group 1 and Group 2 Preliminary Examination preparation. The book contains 674 multiple-choice questions with answers and explanations.\n\nQuestions are arranged month by month and by subject within each month, with answers and explanations after the relevant sections. Use the explanations to revisit the background concepts as well as the current-affairs facts.\n\nCoverage runs from January to 8 November 2026. Topics include polity and governance, economy and infrastructure, science and health, environment and other Andhra Pradesh developments.\n\nThe uploaded Telugu PDF has 309 pages, including its cover and a blank final page. Published by APPSCExamEdge and distributed through UPSC Radio with the owner’s permission.",
    category:"Current Affairs",
    extra:{exam:"APPSC",groups:"Group 1, Group 2",stage:"Prelims",language:"Telugu",native_title:"ఆంధ్రప్రదేశ్ కరెంట్ అఫైర్స్ బిట్ బ్యాంక్ 2026",type:"Practice question bank",question_count:674,pages:309,file_bytes:3322012,coverage:"January–8 November 2026",coverage_end:"2026-11-08",publisher:"APPSCExamEdge",price_paise:9900,temporary_price:true,access:"paid",purchase_enabled:false,cover:"/materials/ap-current-affairs-2026-telugu.webp",storage_key:"study-materials/appsc/current-affairs/AP_Current_Affairs_Bit_Bank_2026_Telugu.pdf"},
  },
] as const;

export function requiresPurchase(extra:Record<string,unknown>){
  return extra.access==="paid" || Number(extra.price_paise)>0;
}
