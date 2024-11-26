// 가져오기
const canvas = document.getElementById('animation');
const ctx = canvas.getContext('2d');
const roll = document.querySelector('#roll');
const title = document.querySelector('#title');
const title_ctx = title.getContext('2d');

// title 띄울 때 사용할 변수들
let text = null;
let opacity = 0; // 0.0 ~ 2.0
const delay = 30 / 1000; // 30fps
let fadeOut = false;
let animationSpeed = 1;

// 주사위 굴리는 애니메이션용 변수들
let lastDrawTime = 0;
let index = null;
let animation = 0;
let ableToRoll = false;

// 숫자 뽑기를 위한 변수들
let min = 1;
let max = 6;
let result = null;

// ==================================================
// 페이드 인/아웃 애니메이션 함수
// ==================================================
// 애니메이션 시작 함수
function fadeInText_Start(t, d, speed, size) {
    text = t;
    opacity = -d;
    animationSpeed = speed;

    title_ctx.font = `${size}pt "GalmuriMono9"`;
    title_ctx.fillStyle = '#7B3548';
    title_ctx.textAlign = 'start';
    title_ctx.textBaseline = 'middle';

    fadeInText();
};
// 페이드 인 함수
function fadeInText() {
    if (opacity >= 3) {
        opacity = 0;
        ableToRoll = true;
        fadeOutText(); // 페이드 아웃 대기 시작
        return;
    }
    opacity += delay*animationSpeed;
    const textWidth = title_ctx.measureText(text).width;
    
    title_ctx.clearRect(0, 0, canvas.width, canvas.height);
    title_ctx.clearRect(0, 0, title.width, title.height);
    title_ctx.fillStyle = `rgba(123, 53, 72, ${opacity})`;
    for (let i = 0; i < text.length; i++) {
        const charPos = title_ctx.measureText(text.slice(0, i)).width;
        const charOpacity = opacity - (1/(text.length) * i);
        // opacity - (1(최대 차이)/(전체 길이) * (해당 글자순서))
        title_ctx.fillStyle = `rgba(123, 53, 72, ${charOpacity})`;
        title_ctx.fillText(text[i], title.width/2 - textWidth/2 + charPos, title.height / 2);
    }
    requestAnimationFrame(fadeInText);
}
// 페이드 아웃 함수
function fadeOutText() {
    // opacity가 2 이상이면 페이드 아웃 종료
    if (opacity >= 2) {
        fadeOut = false;
        return;
    }

    // 텍스트 너비 계산
    const textWidth = title_ctx.measureText(text).width;

    // 페이드 아웃 명령 대기
    if (!fadeOut) {
        // 일정 확률로 wiggle 효과
        const rn = Math.floor(Math.random() * 20); 
        if (rn === 0) {
            title_ctx.clearRect(0, 0, title.width, title.height);
            title_ctx.fillStyle = `rgba(123, 53, 72, ${opacity})`;
            for (let i = 0; i < text.length; i++) {
                const charPos = title_ctx.measureText(text.slice(0, i)).width;
                const charOpacity = 1 - (opacity - (1/(text.length) * i));
                title_ctx.fillStyle = `rgba(123, 53, 72, ${charOpacity})`;
                const strong = 8;
                let glitch_x = 0;
                let glitch_y = 0;
                if (Math.random() > 0.5) {
                    glitch_x = Math.floor(Math.random() * strong) - strong/2;
                    glitch_y = Math.floor(Math.random() * strong) - strong/2;
                }
                glitch_x = 0;
                title_ctx.fillText(text[i], title.width/2 - textWidth/2 + charPos + glitch_x, title.height / 2 + glitch_y);
            }
            
            // 0.1초 후에 원상 복구
            setTimeout(() => {
                title_ctx.clearRect(0, 0, title.width, title.height);
                title_ctx.fillStyle = `rgba(123, 53, 72, 1)`;
                const textWidth = title_ctx.measureText(text).width;
                title_ctx.fillText(text, title.width/2 - textWidth/2, title.height / 2);
            }, 100);
        }

        requestAnimationFrame(fadeOutText);
    } else {
        // 페이드 아웃
        opacity += delay*animationSpeed;
        title_ctx.clearRect(0, 0, title.width, title.height);
        title_ctx.fillStyle = `rgba(123, 53, 72, ${opacity})`;
        for (let i = 0; i < text.length; i++) {
            const charPos = title_ctx.measureText(text.slice(0, i)).width;
            const charOpacity = 1 - (opacity - (1/(text.length) * i));
            title_ctx.fillStyle = `rgba(123, 53, 72, ${charOpacity})`;
            title_ctx.fillText(text[i], title.width/2 - textWidth/2 + charPos, title.height / 2);
        }

        requestAnimationFrame(fadeOutText);
    }
}



// "CLICK TO ROLL THE DICE" 텍스트 그리기
document.fonts.load('15pt "GalmuriMono9"').then(() => {
    fadeInText_Start('CLICK TO ROLL THE DICE', 1, 1, 15);
});

// 이미지들 미리 로딩해두기
const rollImages = Array.from({ length: 8 }, (_, i) => {
    return Array.from({ length: 50 }, (_, j) => {
        const img = new Image();
        img.src = `./res/roll/${String(i).padStart(3, '0')}/${String(j + 1).padStart(4, '0')}.png`;
        return img;
    });
});
// 사이트 접속시 바로 보여줄 처음 이미지 그리기
rollImages[0][0].onload = () => {
    drawImage(0);
};

// animation의 index에 해당하는 이미지 그리기
function drawImage(index) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(rollImages[animation][index], 0, 0);
}

function animate() {
    const drawInterval = 1000 / 30;
    let currentTime = performance.now();
    let elapsedTime = currentTime - lastDrawTime;

    if (elapsedTime > drawInterval) {
        lastDrawTime = currentTime;
        if (index === 30) {
            showResult();
        }
        if (index >= 49) {
            return;
        } else {
            index += 1;
        }
        drawImage(index);
    }

    requestAnimationFrame(animate);
}

// 주사위 굴리는 함수
function rollDice() {
    if (!ableToRoll) {
        return;
    }
    ableToRoll = false;
    fadeOut = true;
    // 이미지 초기화
    index = 0;
    // 랜덤 숫자 뽑기
    result = Math.floor(Math.random() * (max - min + 1)) + min;
    // 애니메이션 종류 랜덤 선택
    let imsi = Math.floor(Math.random() * 7);
    console.log(animation === imsi);
    (animation === imsi) ? (animation = (imsi + 1) % 8) : (animation = imsi);
    requestAnimationFrame(animate);
}
// 이벤트 리스너 등록
roll.addEventListener('click', rollDice);

function showResult() {
    fadeInText_Start(`You got ${result}!`, 0, 1.5, 30);
}