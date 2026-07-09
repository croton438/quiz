import { EventEmitter } from 'node:events';
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';
import type { CommentEvent, GiftEvent } from './mockConnector.js';

/** TikTok Webcast olaylarını uygulamanın ortak event biçimine çevirir. */
export class TikTokConnector extends EventEmitter {
  private connection?: TikTokLiveConnection;
  private retry?: NodeJS.Timeout;
  constructor(private readonly uniqueId: string) { super(); }
  start() {
    this.connection = new TikTokLiveConnection(this.uniqueId.replace(/^@/, ''), { processInitialData:false, enableExtendedGiftInfo:true });
    (this.connection as any).on(WebcastEvent.CHAT, (data:any) => {
      const u=data.user;
      const event={ userId:String(u?.id||u?.userId||u?.uniqueId), username:u?.uniqueId||u?.nickname||'TikTok Kullanıcısı', displayName:u?.nickname||u?.uniqueId||'TikTok Kullanıcısı', avatarUrl:u?.avatarThumb?.urlList?.[0]||u?.avatarMedium?.urlList?.[0]||'', text:data.comment||'' } satisfies CommentEvent;
      console.log(`[TikTok] yorum: ${event.displayName} → ${event.text}`);
      this.emit('comment', event);
    });
    (this.connection as any).on(WebcastEvent.GIFT, (data:any) => {
      if(data.giftDetails?.giftType===1 && !data.repeatEnd) return;
      const u=data.user;
      const event={ userId:String(u?.id||u?.userId||u?.uniqueId), username:u?.uniqueId||u?.nickname||'TikTok Kullanıcısı', displayName:u?.nickname||u?.uniqueId||'TikTok Kullanıcısı', avatarUrl:u?.avatarThumb?.urlList?.[0]||u?.avatarMedium?.urlList?.[0]||'', giftType:data.giftDetails?.giftName||data.extendedGiftInfo?.name||'Rose' } satisfies GiftEvent;
      console.log(`[TikTok] hediye: ${event.displayName} → ${event.giftType}`);
      this.emit('gift', event);
    });
    this.connection.connect().then(s=>console.log(`[TikTok] @${this.uniqueId} LIVE bağlandı (oda ${s.roomId})`)).catch((e:Error)=>{console.warn(`[TikTok] @${this.uniqueId} bağlantısı bekliyor: ${e.message}`);this.scheduleRetry()});
  }
  private scheduleRetry(){this.retry??=setTimeout(()=>{this.retry=undefined;this.start()},30_000)}
  stop(){if(this.retry)clearTimeout(this.retry);this.connection?.disconnect()}
}
