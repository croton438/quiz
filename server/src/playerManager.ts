import { Player, Answer } from './types.js';
export class PlayerManager {
  private players = new Map<string, Player>();
  getOrCreate(input:{userId?:string; username:string; displayName?:string; avatarUrl?:string}) {
    const userId = input.userId || `mock-${input.username.toLowerCase().replace(/\W/g,'')}`;
    let p=this.players.get(userId);
    if(!p){ p={userId,username:input.username,displayName:input.displayName||input.username,avatarUrl:input.avatarUrl||'',score:0,correctAnswers:0,wrongAnswers:0}; this.players.set(userId,p); }
    return p;
  }
  answer(p:Player, answer:Answer, correct:boolean, bonus=0) { p.lastAnswer=answer; if(correct){p.correctAnswers++;p.score+=10+bonus;} else p.wrongAnswers++; }
  addPoints(p:Player, points:number){p.score+=points;}
  top(){ return [...this.players.values()].sort((a,b)=>b.score-a.score||b.correctAnswers-a.correctAnswers).slice(0,10); }
}
