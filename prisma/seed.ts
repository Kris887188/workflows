import { prisma } from '../lib/db/prisma';
async function main(){
 await prisma.chapter.createMany({data:[{title:'Ранние годы',order:1},{title:'Повороты судьбы',order:2}], skipDuplicates:true});
 await prisma.lifeEntry.create({data:{title:'Первый школьный день',sourceType:'text/manual',rawText:'Я помню запах новых учебников.',cleanedText:'Я помню запах новых учебников.',summary:'Воспоминание о школе',literaryText:'Утро первого сентября пахло бумагой и надеждой.',status:'PROCESSED'}});
}
main().finally(()=>prisma.$disconnect());
