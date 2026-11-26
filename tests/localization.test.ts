import test from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {translateText} from "../lib/translations";
import {localizeTree} from "../components/localized";
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
