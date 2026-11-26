// Capture before Next's navigation handlers so a cancelled Back/link leaves the
// active question and unsaved local answers mounted. No extra history entries
// are inserted unless a Back navigation is actually cancelled.
export function guardExamNavigation(win:Window,message:()=>string){
 const currentUrl=win.location.href,currentState=win.history.state;
 const capture={capture:true};
 let confirmed=false,reset:ReturnType<typeof setTimeout>|undefined;
 const permit=()=>{confirmed=true;clearTimeout(reset);reset=setTimeout(()=>{confirmed=false;},1000);};
 const ask=()=>win.confirm(message());
 const unload=(event:BeforeUnloadEvent)=>{if(confirmed)return;event.preventDefault();event.returnValue="";};
 const click=(event:MouseEvent)=>{
  if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const target=event.target as Element|null;
  const link=target?.closest?.("a[href]") as HTMLAnchorElement|null;
  if(!link||link.hasAttribute("download")||(link.target&&link.target!=="_self"))return;
  const url=new URL(link.href,win.location.href);
  if(!["http:","https:"].includes(url.protocol)||(url.origin===win.location.origin&&url.pathname===win.location.pathname&&url.search===win.location.search))return;
  if(!ask()){event.preventDefault();event.stopImmediatePropagation();return;}
  permit();
 };
 const pop=(event:PopStateEvent)=>{
  if(ask()){permit();return;}
  event.stopImmediatePropagation();
  win.history.pushState(currentState,"",currentUrl);
 };
 win.addEventListener("beforeunload",unload);
 win.addEventListener("click",click,capture);
 win.addEventListener("popstate",pop,capture);
 return()=>{clearTimeout(reset);win.removeEventListener("beforeunload",unload);win.removeEventListener("click",click,capture);win.removeEventListener("popstate",pop,capture);};
}
