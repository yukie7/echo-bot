'use strict';

// Pythonのimportに相当
const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// サーバーサイドの実行環境を提供するAPI
// WEBサーバーを立てるためのAPI
// サーバー上でWEBアプリを呼び出すためのもの
// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
// LINEに"あ"を送信：req <- "あ"
app.post('/callback', line.middleware(config), (req, res) => {
    // LINEで"あ" → "い"の順に送信　→　"あ" → "い"の順に返信
    // 同期処理の場合，"い" → "あ"の順に返信される可能性アリ
    Promise // 非同期処理
        // all : とりあえずこいつを初めに実行
        // 本体の処理はhandleEventの中
        .all(req.body.events.map(handleEvent))
        // then : allで成功した時，帰ってくるresultに対して～
        // (result) = handleEventのreturnで帰ってくる値
        .then((result) => res.json(result)) // json形式
        // then : allで失敗した時，帰ってくるerrに対して～
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
function handleEvent(event) {
    // LINEがスタンプなど文字列以外の場合，無視
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    // create a echoing text message
    // event.message.text には"あ"が入っている
    // これがjson形式{ field1 : value1, field2 : value2, ...}
    const echo = { type: 'text', text: event.message.text };

    // use reply API
    // Promise Objec型をリターン（この中には，"あ"も含まれている状態）
    // この時点でLINEに"あ"を返信
    return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    // Print log
    console.log(`listening on ${port}`);
});