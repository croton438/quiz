import { Gift } from './types.js';
const gifts:Record<string,Gift>={Rose:{type:'Rose',points:5},'Heart Me':{type:'Heart Me',points:10},Galaxy:{type:'Galaxy',points:100,special:true}};
export const getGift=(name:string)=>gifts[name] || gifts.Rose;
