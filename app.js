// Firebase 관련 모듈 임포트 및 초기화
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

// Firebase 프로젝트 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyDsot1H1cAD02oWrswIMm5rNkvV4xxuGDM",
  authDomain: "capstone-design-global-sw.firebaseapp.com",
  projectId: "capstone-design-global-sw",
  storageBucket: "capstone-design-global-sw.appspot.com",
  messagingSenderId: "686741692448",
  appId: "1:686741692448:web:c812564389ed1ccaf31c45"
};

// Firebase 초기화
const firebaseApp = initializeApp(firebaseConfig);
// Realtime Database 초기화
const database = getDatabase(firebaseApp);

const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');

// Serve static files from the public folder
app.use(express.static('public'));

// 이미지 경로를 가져오는 API
app.get('/api/images', async (req, res) => {
  try {
    const dbRef = ref(database, 'imagePath');
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      res.json(snapshot.val());
    } else {
      res.status(404).send('No data available');
    }
  } catch (error) {
    res.status(500).send('Error occurred while fetching image data: ' + error.message);
  }
});

app.get('/weather', async (req, res) => {
  try {
      const url = 'https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=%EC%82%BC%EC%84%B1%EB%9D%BC%EC%9D%B4%EC%98%A8%EC%A6%88%ED%8C%8C%ED%81%AC+%EB%82%A0%EC%94%A8';
      const response = await axios.get(url, { 
          headers: { 'User-Agent': 'Mozilla/5.0' } 
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // 시간별 날씨 데이터를 추출
      const temps = $('div.graph_inner._hourly_weather').text().trim();
      const words = temps.split(/\s+/); // 공백으로 텍스트를 나누어 단어 배열 생성

      let result = "";
      let index = 0;

      // 시간, 날씨, 온도를 8번 추출 (8개 데이터가 있다고 가정)
      for (let i = 0; i < 8; i++) {
          const time = words[index];    // 시간
          const weather = words[index + 1]; // 날씨
          const temp = words[index + 2];    // 온도
          index += 3;

          result += `${time} ${weather} ${temp}\n`;
      }

      res.send(result);
  } catch (error) {
      res.status(500).send('Error occurred while fetching weather data: ' + error.message);
  }
});


// 기본 경로에서 index.html 파일을 렌더링합니다.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/event', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'event.html'));
});

app.get('/food', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'food.html'));
});

app.get('/lineup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lineup.html'));
});

// 서버를 포트 3000에서 실행합니다.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});