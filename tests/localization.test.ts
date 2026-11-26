import test from "node:test";
import assert from "node:assert/strict";
import {createElement,Suspense} from "react";
import {renderToStaticMarkup,renderToPipeableStream} from "react-dom/server";
import {PassThrough} from "node:stream";
import {translateText} from "../lib/translations";
import {localizeTree,Localized} from "../components/localized";
import {SiteLanguage} from "../components/site-language";
import {starterLessons} from "../lib/free-course";

test("Telugu covers the reported catalogue and homepage copy, including every starter lesson",()=>{
 for(const text of ["Shop","Cart","YOUR NEXT CHAPTER","Make room for your ambition.","Continue learning","Explore courses","All status","Not started","In progress","Completed","Search courses…","Featured first","UPSC Preparation Starter","Prelims Practice Programme","GS Foundation","Understand the exam, build a study routine and make your practice count.","Revise core topics and develop a consistent question-practice routine.","View course","Start free course","Add to cart","Add to wishlist",...starterLessons.flatMap(lesson=>[lesson.title,lesson.introduction,...lesson.paragraphs,lesson.task])]){
  assert.notEqual(translateText(text,"te"),text,text);
  assert.equal(translateText(text,"en"),text);
 }
});
test("localized controls preserve filter identifiers, user input and original exam content",()=>{
 const onClick=()=>{};
 const tree=createElement("div",null,createElement("select",null,createElement("option",null,"In progress")),createElement("input",{value:"My answer",placeholder:"Search courses…",readOnly:true}),createElement("button",{onClick},"Continue"),createElement("p",{translate:"no"},"Continue"));
 const markup=renderToStaticMarkup(localizeTree(tree,"te"));
 assert.match(markup,/value="In progress"/);
 assert.match(markup,/కొనసాగుతోంది/);
 assert.match(markup,/value="My answer"/);
 assert.match(markup,/<p translate="no">Continue<\/p>/);
 assert.match(renderToStaticMarkup(localizeTree(tree,"en")),/>In progress</);
 assert.equal((localizeTree(createElement("button",{onClick},"Continue"),"te") as {props:{onClick:unknown}}).props.onClick,onClick);
});
test("normalization preserves whitespace and dynamic counts without translating arbitrary data",()=>{
 assert.equal(translateText("  View details ↗  ","te"),"  వివరాలు చూడండి ↗  ");
 assert.equal(translateText("3 lessons","te"),"3 పాఠాలు");
 assert.equal(translateText("constructor","te"),"constructor");
 assert.equal(translateText("__proto__","te"),"__proto__");
});
test("Telugu translation leaves deferred sections unresolved for their own Suspense boundary",()=>{
 const deferred=new Promise<ReturnType<typeof createElement>>(()=>{});
 const children=[createElement("h1",null,"Continue learning"),deferred];
 const translated=localizeTree(children,"te") as unknown[];
 assert.equal(translated[1],deferred);
 assert.match(renderToStaticMarkup(translated[0] as ReturnType<typeof createElement>),/అభ్యాసాన్ని కొనసాగించండి/);
});
test("translated page streams its usable shell before a slow section resolves",{timeout:3000},async()=>{
 let release!:(node:ReturnType<typeof createElement>)=>void;
 const slow=new Promise<ReturnType<typeof createElement>>(resolve=>{release=resolve;});
 const output=new PassThrough();let html="";output.on("data",chunk=>{html+=chunk;});
 let shellReady!:()=>void;const shell=new Promise<void>(resolve=>{shellReady=resolve;});
 const finished=new Promise<void>((resolve,reject)=>{output.on("end",resolve);output.on("error",reject);});
 const content=createElement(Localized,{children:createElement("section",null,createElement("h1",null,"Continue learning"),createElement(Suspense,{fallback:createElement("p",null,"Loading your programmes…")},[slow]))});
 const stream=renderToPipeableStream(createElement(SiteLanguage,{initialLanguage:"te",children:content}),{onShellReady(){stream.pipe(output);shellReady();},onShellError(error){output.destroy(error as Error);shellReady();}});
 try{
  await shell;await new Promise(resolve=>setImmediate(resolve));
  assert.match(html,/అభ్యాసాన్ని కొనసాగించండి/);
  assert.match(html,/మీ కోర్సులను తెస్తున్నాం/);
  assert.doesNotMatch(html,/SLOW_SECTION_FINISHED/);
 }finally{release(createElement("p",null,"SLOW_SECTION_FINISHED"));}
 await finished;
 assert.match(html,/SLOW_SECTION_FINISHED/);
});
