import test from "node:test";
import assert from "node:assert/strict";
import {guardExamNavigation} from "../lib/exam-navigation";
class Browser extends EventTarget{
 location=new URL("https://upscradio.com/student/exam/free-polity/");
 accepted=false;prompts=0;restored=0;
 history={state:{next:"preserved"},pushState:(state:unknown,_title:string,url:string)=>{assert.deepEqual(state,{next:"preserved"});this.location=new URL(url);this.restored++;}};
 confirm=()=>{this.prompts++;return this.accepted;};
 get window(){return this as unknown as Window;}
}
test("cancelling Back restores the active exam URL and stops route handling",()=>{
 const browser=new Browser(),cleanup=guardExamNavigation(browser.window,()=>"Leave test?");
 browser.location=new URL("https://upscradio.com/courses/");
 let routed=false;browser.addEventListener("popstate",()=>{routed=true;});
 browser.dispatchEvent(new Event("popstate"));
 assert.equal(browser.prompts,1);assert.equal(routed,false);assert.equal(browser.restored,1);
 assert.equal(browser.location.pathname,"/student/exam/free-polity/");cleanup();
});
test("confirming Back permits navigation and cleanup removes the guard",()=>{
 const browser=new Browser();browser.accepted=true;const cleanup=guardExamNavigation(browser.window,()=>"Leave test?");
 browser.dispatchEvent(new Event("popstate"));assert.equal(browser.prompts,1);assert.equal(browser.restored,0);
 const unload=new Event("beforeunload",{cancelable:true});browser.dispatchEvent(unload);assert.equal(unload.defaultPrevented,false);
 cleanup();browser.dispatchEvent(new Event("popstate"));assert.equal(browser.prompts,1);
});
test("navigation links require confirmation; new tabs and question anchors do not",()=>{
 const browser=new Browser(),cleanup=guardExamNavigation(browser.window,()=>"Leave test?");
 const click=(href:string,target="")=>{const link={href,target,hasAttribute:()=>false};const event=new Event("click",{cancelable:true});Object.defineProperties(event,{target:{value:{closest:()=>link}},button:{value:0}});browser.dispatchEvent(event);return event;};
 assert.equal(click("https://upscradio.com/courses/").defaultPrevented,true);
 assert.equal(browser.prompts,1);
 click("https://upscradio.com/courses/","_blank");click(browser.location.href+"#question-2");assert.equal(browser.prompts,1);
 const unload=new Event("beforeunload",{cancelable:true});Object.defineProperty(unload,"returnValue",{value:"",writable:true});browser.dispatchEvent(unload);assert.equal(unload.defaultPrevented,true);
 cleanup();
});
