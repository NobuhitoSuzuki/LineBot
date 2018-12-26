var express = require('express');
var router = express.Router();
const line = require('@line/bot-sdk');
const moment = require('moment-timezone');
require('dotenv').config();
const EVENT_TYPE_MESSAGE = "message";
const EVEMT_TYPE_POSTBACK = "postback";
const MESSAGE_TYPE_TEXT = 'text';
const MESSAGE_TYPE_STICKER = 'sticker';

const MESSAGE_TAIKIN = 'たいきん';
const KUSO_UKARE_CHINOU_ZERO_STICKER_ID = "121193461";

const DB_TMP_DOMAIN = "https://dl.dropboxusercontent.com/s/";
const BLACK_METAL = "g78q4sg78yogmi2/IMG_1465.JPG'";
const BLACK = "qe47b7kb31yafkb/IMG_1470.JPG'";
const BLACK_AND_WHITE = "h8crlue4g4ajgex/IMG_1467.JPG'";
const WHITE = "cm3smzosvd53k6a/IMG_1466.JPG";
const ULTIMATE_WHITE = "1hi0bpoooot1cd5/IMG_1469.JPG";
const FOUR_NINE = "4fcvv80qmbf89ub/61pYZyjEfzL._SY445_.jpg";
const AKIYAMA_DONO = "zapswsy4gociqbk/Akiyamadono.png";
var isPrevShowAkiyamadono = false;
// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};
router.post('/', (req, res, next) => {
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);
function handleEvent(event) {
    if (event.type == EVEMT_TYPE_POSTBACK) {
        return Promise.resolve(null);
    } else if (event.type == EVENT_TYPE_MESSAGE) {
        if (event.message.type == MESSAGE_TYPE_TEXT) {
            handleTaikin(event);
        } else if (event.message.type == MESSAGE_TYPE_STICKER) {
            if (event.message.stickerId == KUSO_UKARE_CHINOU_ZERO_STICKER_ID) {
                showKusoUkareChinouZero(event);
            } else {
                return Promise.resolve(null);
            }
        }
    } else {
        return Promise.resolve(null);
    }
}

function showKusoUkareChinouZero (event) {
    return client.replyMessage(event.replyToken,
        [
            {
                type: 'image',
                originalContentUrl : "https://dl.dropboxusercontent.com/s/he2dnnb7ysg1zq0/9073161319800.jpg",
                previewImageUrl : "https://dl.dropboxusercontent.com/s/he2dnnb7ysg1zq0/9073161319800.jpg"
            }
        ]);
}

// たいきんメッセージのハンドリング
function handleTaikin(event) {
  if (event.message.text != MESSAGE_TAIKIN) {
      // たいきん以外処理しない
      return Promise.resolve(null);
  }
  let hour = getHour();
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
  if (userId == "Uf3000ec33f345bf533bcb9c9147e7624") {
    let url = DB_TMP_DOMAIN + FOUR_NINE;
    return client.replyMessage(event.replyToken,
        [
            {type: 'text', 'text' : 'お疲れ様でございます。ご主人様。'}, 
            {type: 'image', originalContentUrl : url, previewImageUrl : url}
        ]);
  } else if (userId == "UU19ab59de7355c1cffc3fee2c79767927") {
        if (isPrevShowAkiyamadono) {
            isPrevShowAkiyamadono = false;
            return client.replyMessage(event.replyToken, 
            [
                 {type: 'image', originalContentUrl : dragon, previewImageUrl : dragon}
            ]);
       }    
      if (shouldShowAkiyamadono()) {
        isPrevShowAkiyamadono = true;
        let url = DB_TMP_DOMAIN + AKIYAMA_DONO;
        return client.replyMessage(event.replyToken,
            [
                {type: 'text', 'text' : '了解しました!秋山殿。'}, 
                {type: 'image', originalContentUrl : url, previewImageUrl : url}
            ]);
      } else {
        return client.replyMessage(event.replyToken, 
            [
                 {type: 'image', originalContentUrl : dragon, previewImageUrl : dragon}
            ]);
      }
  } else {
    return client.replyMessage(event.replyToken, 
        [
             {type: 'image', originalContentUrl : dragon, previewImageUrl : dragon}
        ]);
  }
  return Promise.resolve(null);
}
// ドラゴンを返す
function getDragon(hour) {
    if (hour >= 22 || hour == 0) {
        return DB_TMP_DOMAIN + BLACK_METAL;
    } else if (hour >= 20) {
        return DB_TMP_DOMAIN + BLACK;
    } else if (hour == 19) {
        return DB_TMP_DOMAIN + BLACK_AND_WHITE;
    } else if (hour < 19 && hour >= 17) {
        return DB_TMP_DOMAIN + WHITE;
    } else if (hour < 17 && hour >= 15) {
        return DB_TMP_DOMAIN + ULTIMATE_WHITE;
    } else {
        return '';
    }
}
// 秋山殿出す？
function shouldShowAkiyamadono() {
    let min = 1;
    let max = 5;
    var r = Math.floor(Math.random() * (max + 1 - min)) + min;
    return r == 3;
}
// 現在の時間 (24H)
function getHour() {
    return moment().tz("Asia/Tokyo").format('H');
}
module.exports = router;