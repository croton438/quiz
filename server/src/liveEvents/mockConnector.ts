import { EventEmitter } from 'node:events';
export type CommentEvent={userId?:string;username:string;displayName?:string;avatarUrl?:string;text:string}; export type GiftEvent={userId?:string;username:string;displayName?:string;avatarUrl?:string;giftType:string};
export class MockLiveConnector extends EventEmitter { comment(e:CommentEvent){this.emit('comment',e)} gift(e:GiftEvent){this.emit('gift',e)} }
