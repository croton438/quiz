export type Answer = 'A' | 'B' | 'C' | 'D';
export interface Question { id:string; category:string; question:string; options:Record<Answer,string>; correctAnswer:Answer; difficulty:string }
export interface Player { userId:string; username:string; displayName:string; avatarUrl:string; score:number; correctAnswers:number; wrongAnswers:number; lastAnswer?:Answer }
export interface LiveEvent { id:string; text:string; type:'correct'|'wrong'|'gift'|'leader'; createdAt:number }
export interface Gift { type:'Rose'|'Heart Me'|'Galaxy'; points:number; special?:boolean }
export interface QuizState { phase:'question'|'result'; question:Question; secondsLeft:number; leaderboard:Player[]; events:LiveEvent[]; featuredGift?:{player:Player; gift:Gift} }
