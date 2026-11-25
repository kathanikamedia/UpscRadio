import Image from "next/image";
export function CourseArt({category,free=false,lessons,index=0}:{category:string;free?:boolean;lessons?:number;index?:number}){
 const photograph=free?"starter":/prelim|test|polity/i.test(category)?"prelims":"foundation";
 return <div className={"course-art course-art-photo course-art-"+index%3} aria-hidden="true"><Image src={"/courses/"+photograph+".webp"} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 40vw"/><span className="course-art-label">{lessons?lessons+" lessons":category}</span></div>;
}
