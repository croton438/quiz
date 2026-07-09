# TikTok LIVE Quiz MVP

TikTok Live Studio için 9:16 dikey yayın katmanı ve gerçek zamanlı mock TikTok LIVE altyapısı.

## Çalıştırma

```powershell
npm install
npm run dev
```

- Yayın ekranı: `http://localhost:5173/broadcast`
- Geliştirme/mock paneli: `http://localhost:5173/admin`

TikTok LIVE Studio'da yayın ekranını Browser Source olarak ekleyin. Ana TikTok sahnesi için **1080×1920 (9:16, dikey)** kullanın. Browser Source görünmüyorsa `/broadcast` açık Chrome penceresini Window Capture ile yakalayın.

## Akış

`MockLiveConnector`, TikTok'a bağımlı olmayan bir olay adaptörüdür. Yorum olayları `A/B/C/D` olarak işlenir; her oyuncunun soru başına ilk cevabı geçerlidir. Hediye kuralları `giftManager`, soru döngüsü `quizEngine`, oyuncular `playerManager` altında tutulur. Gelecekteki TikTok connector'ı bu connector'ın `comment` ve `gift` olaylarını yayınlamalıdır.

Sorular [server/data/questions.json](server/data/questions.json) içindedir. TTS şu an yalnızca sunucu konsoluna yazdırır ve [server/src/ttsService.ts](server/src/ttsService.ts) üzerinden gerçek bir sağlayıcıyla değiştirilebilir.

## Komutlar

- `npm run dev`: backend ve frontend'i birlikte başlatır.
- `npm run build`: TypeScript ve Vite üretim derlemesi.

## Vercel ile yayın ekranı

Bu proje iki parçadan oluşur: Vercel'e yalnızca yayın ekranı (frontend) gider; TikTok yorumlarını dinleyen Node.js connector yayın bilgisayarında açık kalır.

1. Vercel'de `croton438/quiz` reposunu **Import** edin. `vercel.json` derleme ve SPA yönlendirmesini otomatik ayarlar.
2. Deploy sonrası yayın ekranı adresi `https://<vercel-proje-adresi>.vercel.app/broadcast` olur. Bu HTTPS adresini TikTok LIVE Studio Browser Source'a girin.
3. Yayın bilgisayarında `.env` oluşturun ve `TIKTOK_LIVE_ENABLED=true`, `TIKTOK_USERNAME=twinder6` ekleyin.
4. Aynı bilgisayarda `npm run dev:server` çalıştırın. Vercel ekranı Socket.io için varsayılan olarak bu bilgisayardaki `http://localhost:3001` adresine bağlanır.

Eğer LIVE Studio, HTTPS Vercel ekranının yerel `localhost:3001` Socket.io bağlantısını engellerse backend'i HTTPS bir tunnel veya sürekli çalışan bir Node.js sunucusuna taşıyıp Vercel Environment Variable olarak `VITE_SOCKET_URL=https://<backend-adresi>` tanımlayın ve yeniden deploy edin.
