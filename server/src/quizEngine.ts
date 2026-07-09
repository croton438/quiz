import questionsRaw from '../data/questions.json' with { type: 'json' };
import { Question, QuizState, LiveEvent, Answer, Player } from './types.js';
import { PlayerManager } from './playerManager.js'; import { TtsService } from './ttsService.js';
export class QuizEngine {
  private questions=questionsRaw as Question[]; private recent:string[]=[]; private current!:Question; private phase:'question'|'result'='question'; private seconds=15; private answers=new Map<string,{player:Player;answer:Answer;at:number}>(); private events:LiveEvent[]=[]; private timer?:NodeJS.Timeout; private priorLeader?:string;
  constructor(private players:PlayerManager, private tts:TtsService, private emit:(s:QuizState)=>void){this.next();this.timer=setInterval(()=>this.tick(),1000)}
  private event(text:LiveEvent['text'],type:LiveEvent['type']){this.events.unshift({id:crypto.randomUUID(),text,type,createdAt:Date.now()});this.events=this.events.slice(0,10)}
  private pick(){const choices=this.questions.filter(q=>!this.recent.includes(q.id));const q=choices[Math.floor(Math.random()*choices.length)]||this.questions[0];this.recent=[...this.recent,q.id].slice(-5);return q}
  private next(){this.current=this.pick();this.phase='question';this.seconds=15;this.answers.clear();this.tts.nextQuestion(this.current.question);this.broadcast()}
  private tick(){this.seconds--;if(this.seconds<=0){if(this.phase==='question')this.reveal();else this.next()}this.broadcast()}
  private reveal(){this.phase='result';this.seconds=5; const correct=[...this.answers.values()].filter(a=>a.answer===this.current.correctAnswer).sort((a,b)=>a.at-b.at);correct.forEach((x,i)=>{const bonus=[5,3,1][i]||0;this.players.answer(x.player,x.answer,true,bonus);this.event(`${x.player.displayName} doğru cevap verdi +${10+bonus}`,'correct')}); [...this.answers.values()].filter(x=>x.answer!==this.current.correctAnswer).forEach(x=>{this.players.answer(x.player,x.answer,false);this.event(`${x.player.displayName} yanlış cevap verdi`,'wrong')});this.tts.answer(this.current.correctAnswer);this.checkLeader();}
  submit(input:{userId?:string;username:string;displayName?:string;avatarUrl?:string;text:string}){if(this.phase!=='question')return;const answer=input.text.trim().toUpperCase() as Answer;if(!['A','B','C','D'].includes(answer))return;const p=this.players.getOrCreate(input);if(this.answers.has(p.userId))return;this.answers.set(p.userId,{player:p,answer,at:Date.now()});p.lastAnswer=answer;this.broadcast()}
  gift(p:Player,name:string,points:number){this.players.addPoints(p,points);this.event(`${p.displayName} ${name} gönderdi +${points}`,'gift');this.checkLeader();this.broadcast({player:p,gift:{type:name as any,points,special:name==='Galaxy'}})}
  private checkLeader(){const leader=this.players.top()[0];if(leader&&leader.userId!==this.priorLeader){this.priorLeader=leader.userId;this.event(`${leader.displayName} liderliğe yükseldi`,'leader');this.tts.leader(leader.displayName)}}
  private broadcast(featuredGift?:QuizState['featuredGift']){this.emit({phase:this.phase,question:this.current,secondsLeft:this.seconds,leaderboard:this.players.top(),events:this.events,featuredGift})}
  state(){return {phase:this.phase,question:this.current,secondsLeft:this.seconds,leaderboard:this.players.top(),events:this.events} as QuizState}
}
