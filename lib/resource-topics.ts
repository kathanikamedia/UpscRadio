export const resourceTopics=[
 {slug:"polity",title:"Indian Polity",description:"Understand the Constitution, Parliament and the institutions that shape India.",terms:["polity","constitution","parliament"],sources:[{title:"Constitution of India",publisher:"Legislative Department",description:"Read the constitutional text from its official government source.",url:"https://www.legislative.gov.in/constitution-of-india"},{title:"Explore Parliament",publisher:"Digital Sansad",description:"Learn about Parliament and its role in India’s democratic system.",url:"https://sansad.in/ls/about/introduction"}]},
 {slug:"current-affairs",title:"Current Affairs",description:"Follow official updates and connect the news to your preparation.",terms:["current affairs","official news","press release"],sources:[{title:"Government press releases",publisher:"Press Information Bureau",description:"Follow announcements and releases from government ministries.",url:"https://www.pib.gov.in/AllRelease.aspx?lang=1&reg=1"},{title:"Official UPSC updates",publisher:"Union Public Service Commission",description:"Check examination notices, schedules and official announcements.",url:"https://www.upsc.gov.in/whats-new"}]},
 {slug:"general-studies",title:"General Studies",description:"Build your foundation and use previous papers to guide your revision.",terms:["general studies","ncert","books","previous papers"],sources:[{title:"NCERT textbooks",publisher:"NCERT",description:"Browse the official textbook library by class and subject.",url:"https://ncert.nic.in/textbook.php"},{title:"Previous question papers",publisher:"Union Public Service Commission",description:"Explore official exam papers to understand question patterns.",url:"https://www.upsc.gov.in/examinations/previous-question-papers"}]},
];
export type ResourceTopic=typeof resourceTopics[number];
export function resourceTopic(slug?:string,legacyQuery?:string){
 if(slug)return resourceTopics.find(topic=>topic.slug===slug);
 const query=legacyQuery?.trim().toLowerCase().replace(/\s+/g," ");
 return resourceTopics.find(topic=>topic.slug===query||topic.title.toLowerCase()===query||topic.slug.replaceAll("-"," ")===query);
}
