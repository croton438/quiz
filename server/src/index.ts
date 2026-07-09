import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import { createServer } from 'node:http'; import { Server } from 'socket.io';
import { PlayerManager } from './playerManager.js'; import { TtsService } from './ttsService.js'; import { QuizEngine } from './quizEngine.js'; import { MockLiveConnector } from './liveEvents/mockConnector.js'; import { TikTokConnector } from './liveEvents/tiktokConnector.js'; import { getGift } from './giftManager.js';
const app=express(); app.use(cors()); app.get('/health',(_,res)=>res.json({ok:true})); const http=createServer(app); const io=new Server(http,{cors:{origin:'*'}});
const players=new PlayerManager(); const mock=new MockLiveConnector(); const engine=new QuizEngine(players,new TtsService(),state=>io.emit('quiz:state',state));
type IncomingComment={userId?:string;username:string;displayName?:string;avatarUrl?:string;text:string}; type IncomingGift=Omit<IncomingComment,'text'>&{giftType:string};
const processComment=(event:IncomingComment)=>engine.submit(event);
const processGift=(event:IncomingGift)=>{const p=players.getOrCreate(event);const gift=getGift(event.giftType);engine.gift(p,gift.type,gift.points)};
mock.on('comment',processComment);mock.on('gift',processGift);
io.on('connection',socket=>{socket.emit('quiz:state',engine.state());socket.on('mock:comment',(e:IncomingComment)=>mock.comment(e));socket.on('mock:gift',(e:IncomingGift)=>mock.gift(e));});
const port=Number(process.env.PORT||3001);http.listen(port,()=>console.log(`Quiz server: http://localhost:${port}`));
const username=process.env.TIKTOK_USERNAME||'twinder6';
if(process.env.TIKTOK_LIVE_ENABLED!=='false'){const tiktok=new TikTokConnector(username);tiktok.on('comment',processComment);tiktok.on('gift',processGift);tiktok.start()}
