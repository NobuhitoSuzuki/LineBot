
'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const moment = require('moment-timezone');

require('dotenv').config();

const postWebhook = '/webhook';
const EVENT_TYPE_MESSAGE = 'message';
const MESSAGE_TYPE_TEXT = 'text';
const MESSAGE_TAIKIN = 'たいきん';

const PORT = process.env.PORT || 8000;

// create LINE SDK config from env variables
const config = {
  channelAccessToken: "HtngeV8/o7DlL6XGyTkEPnfQIoqA9wrI2kP7Bv1fD5kh6lnnDC8FOS2ibv+kuctFN+CC+gUOBwF1nNNCYY50PeRQyR6C430pbnyog8kfGkL57f0yBf7/+Omzmshd6VwnCHnmlHIswN6ae1/NJ0sg4gdB04t89/1O/w1cDnyilFU=",
  channelSecret: "2ac8a541c0406371485320a96a58092a"
};

const app = express();

app.post(postWebhook, line.middleware(config), (req, res) => {
    // console.log(req.body.events[0]);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== EVENT_TYPE_MESSAGE || event.message.type !== MESSAGE_TYPE_TEXT) {
    return Promise.resolve(null);
  }

  if (event.message.text != MESSAGE_TAIKIN) {
      // たいきん以外処理しないよ。
      return Promise.resolve(null);
  }

  let hour = moment().tz("Asia/Tokyo").format('HH');
  console.log(""+hour+"時");

  let userId = event.source.userId;
  let dragon = getDragon(hour);

  if (dragon == '') {
      var text = '';
      if (hour < 10) {
          text = '夜勤か何か？';
      } else {
          text = '草。働け。';
      }
      return client.replyMessage(event.replyToken, {
          type : 'text',
          text : text
      });
  }
  if (userId == 'Uf3000ec33f345bf533bcb9c9147e7624') {
      // 俺だったらストロングゼロを返す
    let url = 'https://www.suntory.co.jp/news/2013/l_img/l_11678-1.jpg';
    return client.replyMessage(event.replyToken,
        [
            {type: 'text', 'text' : 'お疲れ様でございます。'}, 
            {type: 'image', originalContentUrl : url, previewImageUrl : url}
        ]);
  } else {
    return client.replyMessage(event.replyToken, 
        [
            {type: 'text', 'text' : 'お疲れ様でございます。'},
            {type: 'image', originalContentUrl : dragon, previewImageUrl : dragon}
        ]);
  }
  return Promise.resolve(null);
}

function getDragon(hour) {
    if (hour >= 22 || hour == 0) {
        return 'https://ocg2.xpg.jp/1003/Klm3ce7WVYsa.jpg';
    } else if (hour >= 20) {
        return 'https://ocg2.xpg.jp/1001/Jykc8utAiCDl.jpg';
    } else if (hour == 19) {
        return 'https://ocg2.xpg.jp/1003/QR638FkxrbKa.jpg';
    } else if (hour < 19 && hour >= 17) {
        return 'https://ocg2.xpg.jp/1001/GqEGLdI0PtbN.jpg';
    } else if (hour < 17 && hour >= 15) {
        return 'https://ocg2.xpg.jp/1003/fJQCmeWO9qMa.jpg';
    } else {
        return '';
    }
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);