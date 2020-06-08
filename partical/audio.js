// 创建音频上下文
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

//获取input元素的变量
var input = document.querySelector("input");
//创建audio元素并付给audio变量
var audio = new Audio();

//声明各个需要的节点
var musicSourceNode = audioCtx.createMediaElementSource(audio);
var gainNode = audioCtx.createGain();
var analyser = audioCtx.createAnalyser();

//一些参数设置
gainNode.gain.value = 0.5;
analyser.fftSize = 1024;

//结点的连接
musicSourceNode.connect(gainNode);
gainNode.connect(analyser);
analyser.connect(audioCtx.destination);

//当input元素改变导入的文件的时候触发的函数
input.onchange = function() {
    audio.pause();
    audio.src = URL.createObjectURL(input.files[0]);
    audio.play();
};

//定义频域数据的容器
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);


function playMusic() {
    musicSourceNode.connect(gainNode);
    audio.play();
}

function pauseMusic() {
    audio.pause();
}




//创建canvas上下文
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//粒子的创建
function createParticle(x,y,r,c,vx,vy,type) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.ratio = 1;
    this.radius = r;
    this.color = c;
    this.vx = vx;
    this.vy = vy;

    this.draw = function (){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.ratio,0,
            Math.PI * 2,true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    };

    //粒子的移动
    this.move = function (sum) {
        if (this.isOutOfLeft()){
            this.x = 0;
            this.vx = -this.vx;
        }
        if (this.isOutOfRight()){
            this.x = canvas.width;
            this.vx = -this.vx;
        }
        if (this.isOutOfTop()){
            this.y = 0;
            this.vy = -this.vy;
        }
        if (this.isOutOfBottom()){
            this.y = canvas.height;
            this.vy = -this.vy;
        }
        this.x += this.vx * sum;
        this.y += this.vy * sum;
    };

    //根据音频改变粒子的状态
    this.changeState = function () {
        analyser.getByteFrequencyData(dataArray);
        let arr = dataArray.slice(0, 2);
        let sum = arr.reduce(function (a, b) {return a + b}, 0) / arr.length / 130;
        sum = sum*sum;
        if(!sum || sum < 0.7) {
            sum = 0.2;
        }
        this.move(sum);

        switch (this.type) {
            case "low":arr = dataArray.slice(0,20);
                sum = arr.reduce(function(a,b){return a+b},0) / arr.length * 0.02;
                break;
            case "mid":
                arr = dataArray.slice(57,67);
                sum = arr.reduce(function(a,b){return a+b},0)/ arr.length * 0.02;
                break;
            case "high":
                arr = dataArray.slice(104,118);
                sum = arr.reduce(function(a,b){return a+b},0)/ arr.length * 0.02;
                break;
        }
        sum = (1+ sum)*(1+ sum/2)/4;
        if(!sum || sum < 0.5) {
            sum = 0.5;
        }
        this.ratio = sum;
    };

//越界判断
    this.isOutOfRight = function () {
        return this.x + this.vx > canvas.width ;
    };
    this.isOutOfLeft = function () {
        return  this.x + this.vx < 0;
    };

    this.isOutOfTop = function () {
        return this.y + this.vy < 0;
    };
    this.isOutOfBottom = function () {
        return this.y + this.vy > canvas.height;
    }
}

//粒子生成
var particles = [];
for(var i = 0; i < 65; i++){
    particles[i] = new createParticle(
        randomInt(0,canvas.width),
        randomInt(0,canvas.height),
        randomInt(10,16),
        colorRgb(randomInt(0,255), randomInt(0,255), randomInt(0,255)),
        randomFloat(-1,1),
        randomFloat(-1,1),
        randomType());
}

//绘制
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(var i = 0; i < particles.length; i++){
        particles[i].changeState();
        particles[i].draw();
    }

    //开启循环动画播放模式用的代码
    requestAnimationFrame(draw);
}
draw();

//


//定义颜色
function colorRgb(r,g,b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}
//生成随机整数函数
function randomInt(from, to){
    return parseInt(Math.random() * (to - from + 1) + from);
}
//生成随机浮点数函数
function randomFloat(from, to){
    return Math.random() * (to - from + 1) + from;
}

function randomType(){
    var value = randomInt(0,2);
    switch (value) {
        case 0:return "low";
        case 1:return "mid";
        case 2:return "high";
    }
}