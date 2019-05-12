// 创建音频上下文
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

//获取input元素的变量
var input = document.querySelector("input");
//创建audio元素并付给audio变量
var audio = new Audio();

//声明各个需要的节点
var musicSourceNode = audioCtx.createMediaElementSource(audio);
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var analyser = audioCtx.createAnalyser();

//一些参数设置
oscillator.type = 'sine';
oscillator.frequency.value = 440;
gainNode.gain.value = 0.5;

//结点的连接
oscillator.connect(gainNode);
musicSourceNode.connect(gainNode);
gainNode.connect(analyser);
analyser.connect(audioCtx.destination);

//当input元素改变导入的文件的时候触发的函数
input.onchange = function() {
    audio.pause();
    audio.src = URL.createObjectURL(input.files[0]);
    audio.play();
};

//一些播放暂停的操作
function playMusic() {
    musicSourceNode.connect(gainNode);
    audio.play();
}

function pauseMusic() {
    audio.pause();
}

function playWave() {
    oscillator.connect(gainNode);
    oscillator.start();
}

function stopWave() {
    oscillator.disconnect(gainNode);
}

//振荡器的频率变化，利用的十二平均律
function risingHalfTone() {
    oscillator.frequency.value *= Math.pow(2,1/12);
}

function fallingHalfTone() {
    oscillator.frequency.value /= Math.pow(2,1/12);
}

function risingTone() {
    oscillator.frequency.value = oscillator.frequency.value * Math.pow(2,1/12) * Math.pow(2,1/12);
}

function fallingTone() {
    oscillator.frequency.value = oscillator.frequency.value / Math.pow(2,1/12) / Math.pow(2,1/12);
}

//定义绘图部分
//绘图上下文
var canvas = document.querySelector("canvas")
canvasCtx = canvas.getContext("2d");

//绘制函数
function draw() {
    var styleSelect = document.getElementById("styleSelect");
    var styleSetting = styleSelect.value;  //获取用户选择的样式
    canvasCtx.clearRect(0, 0,canvas.width,canvas.height);//每次重绘先清屏
//波形的显示
    if (styleSetting === "wave") {
        analyser.fftSize = 256;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);//使用时域信息
        canvasCtx.beginPath();
        var sliceWidth = canvas.width * 1.0 / (bufferLength -1) ;
        var v = dataArray[i] / 128.0;
        var x = 0;
        canvasCtx.fillStyle = "#FF0000";
        for (var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0;
            var y = v * canvas.height / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasCtx.stroke();
    }
//频谱的显示
    if (styleSetting === "spectrum") {

        analyser.fftSize = 2048;
        analyser.maxDecibels = 4;
        var bufferLength = analyser.frequencyBinCount;//使用频域信息
        var dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.beginPath();
        var sliceWidth = canvas.width * 4.0 / bufferLength;
        var x = 0;
        canvasCtx.fillStyle = "#FF0000";
        for (var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0;
            var y = v * canvas.height / 2;

            canvasCtx.fillRect(x, canvas.height, sliceWidth, -y);

            x += sliceWidth;
        }
    }

    requestAnimationFrame(draw);
}

draw();
