// ===== 基础数据（可通过右侧 JSON 配置覆盖）=====
const defaultSegments = [
  { label: "锄田",  color: "#f43f5e", weight: 1 },
  { label: "爱深邃会员", color: "#334155", weight: 1 },
  { label: "deep no.1 promise",  color: "#10b981", weight: 1 },
  { label: "黄龙",  color: "#0ea5e9", weight: 1 },
  { label: "少爷",  color: "#f59e0b", weight: 1 },
  { label: "東風来", color: "#475569", weight: 1 },
  { label: "十步没杀一人", color: "#a78bfa", weight: 1 },
  { label: "直视深邃的直女",  color: "#14b8a6", weight: 1 },
  { label: "红笺浣花",  color: "#f43f5e", weight: 1 },
  { label: "深邃木可", color: "#334155", weight: 1 },
  { label: "Deep broth ramen 🍜",  color: "#10b981", weight: 1 },
  { label: "穆森煦",  color: "#0ea5e9", weight: 1 },
  { label: "千少羽",  color: "#f59e0b", weight: 1 },
  { label: "殇凝玖", color: "#475569", weight: 1 },
  { label: "傅辉", color: "#a78bfa", weight: 1 },
  { label: "饮霜白",  color: "#14b8a6", weight: 1 },
  { label: "尚少珩",  color: "#f43f5e", weight: 1 },
  { label: "朝朝笙歌Naomi", color: "#334155", weight: 1 },
  { label: "Deep Deep Blue Blue Blue",  color: "#10b981", weight: 1 },
  { label: "深邃的氜氜",  color: "#0ea5e9", weight: 1 },
  { label: "樊胜美",  color: "#f59e0b", weight: 1 },
  { label: "暮斟酒酒", color: "#475569", weight: 1 },
  { label: "Deep dark leaves ears👂 之求等价替换", color: "#a78bfa", weight: 1 },
  { label: "饭［江国公］",  color: "#14b8a6", weight: 1 },
  { label: "木鱼",  color: "#f43f5e", weight: 1 },
  { label: "曲千千", color: "#334155", weight: 1 },
  { label: "黎半夏",  color: "#10b981", weight: 1 },
  { label: "唐染苒",  color: "#0ea5e9", weight: 1 },
  { label: "好孤独啊～",  color: "#f59e0b", weight: 1 },
  { label: "我智力有问题", color: "#475569", weight: 1 },
  { label: "姜辰巳", color: "#a78bfa", weight: 1 },
  { label: "顾小嫚",  color: "#14b8a6", weight: 1 },
];

const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resetBtn = document.getElementById('resetBtn');
const configTA = document.getElementById('config');
const applyBtn = document.getElementById('applyBtn');
const resultBox = document.getElementById('result');

let segments = JSON.parse(JSON.stringify(defaultSegments));
let startAngleDeg = -90; // 以顶部为 0
let currentRotation = 0;  // 累积旋转角度（度）
let spinning = false;

// 初始化配置文本
configTA.value = JSON.stringify(segments, null, 2);

function deg2rad(d){ return d * Math.PI / 180 }

// 画转盘
function drawWheel(){
  const size = wheel.width; // 正方形
  const cx = size/2, cy = size/2; const R = size/2 - 12; // 预留边缘
  ctx.clearRect(0,0,size,size);

  const total = segments.length;
  const arcDeg = 360 / total;

  // 边缘圈
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx,cy,R+6,0,Math.PI*2);
  const grd = ctx.createLinearGradient(0,0,size,size);
  grd.addColorStop(0, '#22d3ee');
  grd.addColorStop(1, '#a78bfa');
  ctx.strokeStyle = grd; ctx.lineWidth = 12; ctx.stroke();
  ctx.restore();

  // 扇区
  for(let i=0;i<total;i++){
    const start = deg2rad(startAngleDeg + i*arcDeg);
    const end   = deg2rad(startAngleDeg + (i+1)*arcDeg);

    // 节段底色
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,R,start,end);
    ctx.closePath();
    ctx.fillStyle = segments[i].color || `hsl(${(i*360/total)|0} 70% 50%)`;
    ctx.fill();

    // 分割线
    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 标签文字
    const mid = (start + end)/2;
    const tx = cx + Math.cos(mid) * (R*0.65);
    const ty = cy + Math.sin(mid) * (R*0.65);
    ctx.save();
    ctx.translate(tx, ty);

    // === 文字方向关键行 ===
    // “垂直于圆心 / 沿半径方向” → 保持如下：
    ctx.rotate(mid);
    // 如果想改为“沿切线方向”，请改为：
    // ctx.rotate(mid + Math.PI / 2);
    // =====================

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f8fafc';
    ctx.font = `bold ${Math.max(14, (size/700)*18)}px ui-sans-serif`;
    const text = String(segments[i].label ?? `奖项${i+1}`);
    wrapFillText(ctx, text, 0, 0, R*0.8, 20);
    ctx.restore();
  }

  // 中心高光圈
  ctx.beginPath();
  ctx.arc(cx,cy,86,0,Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,.06)';
  ctx.fill();
}

// 多行文本
function wrapFillText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(/\s+/);
  let line = '';
  let lines = [];
  for (let w of words){
    const test = line ? line + ' ' + w : w;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && line){
      lines.push(line); line = w;
    } else { line = test; }
  }
  if (line) lines.push(line);
  lines = lines.slice(0,3);
  const totalH = (lines.length-1)*lineHeight;
  lines.forEach((ln, i)=> ctx.fillText(ln, x, y - totalH/2 + i*lineHeight));
}

function weightedPick(items){
  const weights = items.map(s => Math.max(0, Number(s.weight)||0) || 1);
  const sum = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*sum;
  for (let i=0;i<items.length;i++){
    if (r < weights[i]) return i; r -= weights[i];
  }
  return items.length-1; // 兜底
}

function formatResult(seg){
  return `🎉 恭喜抽中：<b>${escapeHTML(seg.label)}</b>`;
}

function escapeHTML(s){
  return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

// 触发旋转
function spin(){
  if (spinning || !segments.length) return;
  spinning = true; resultBox.classList.remove('show');

  const n = segments.length;
  const arc = 360/n; // 每段角度
  const pickIndex = weightedPick(segments);

  // 目标：让 pickIndex 的扇区中心对准顶部指针（-90°）
  const centerDeg = startAngleDeg + pickIndex*arc + arc/2;
  const pointerDeg = -90; // 指针方向（顶部）

  // 允许在本段内做一个微小抖动，避免每次都停在正中心
  const jitter = Math.min(arc/2 - 2, 10) * (Math.random()*2 - 1); // ±10° 或半段-2 取小

  // 需要转到的绝对角度（相对初始轮盘坐标系），再叠加若干整圈
  const needed = pointerDeg - centerDeg + jitter; // 让中心对齐指针
  const spins = 6 + Math.floor(Math.random()*2);  // 6~7 圈
  const target = currentRotation + needed + 360*spins;

  // 设置过渡动画（使用自定义缓动）
  const duration = 4800 + Math.floor(Math.random()*600); // 4.8~5.4s
  wheel.style.transition = `transform ${duration}ms cubic-bezier(.12,.6,0,1)`;
  wheel.style.transform = `rotate(${target}deg)`;

  // 结束后锁定最终角度，清理过渡以免累积误差
  const onEnd = ()=>{
    wheel.removeEventListener('transitionend', onEnd);
    currentRotation = target % 360; // 记录绝对角
    wheel.style.transition = 'none';
    wheel.style.transform = `rotate(${currentRotation}deg)`;
    spinning = false;
    resultBox.innerHTML = formatResult(segments[pickIndex]);
    resultBox.classList.add('show');
    burstConfetti();
  };
  wheel.addEventListener('transitionend', onEnd);
}

function resetAngle(){
  if (spinning) return;
  currentRotation = 0;
  wheel.style.transition = 'transform 400ms ease';
  wheel.style.transform = 'rotate(0deg)';
  setTimeout(()=>{wheel.style.transition='none'}, 420);
}

function applyConfig(){
  if (spinning) return;
  try{
    const data = JSON.parse(configTA.value);
    if (!Array.isArray(data) || data.length === 0) throw new Error('配置必须是非空数组');
    segments = data.map((s, i)=> ({
      label: s.label ?? `奖项${i+1}`,
      color: s.color ?? `hsl(${(i*360/data.length)|0} 70% 50%)`,
      weight: Number(s.weight ?? 1)
    }));
    drawWheel();
    resetAngle();
  }catch(err){
    alert('配置解析失败：' + err.message);
  }
}

// ===== 简易彩带 =====
const confettiCanvas = document.getElementById('confetti');
const cctx = confettiCanvas.getContext('2d');
let confettiParticles = [];
function resizeConfetti(){
  confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti); resizeConfetti();

function burstConfetti(){
  const count = 140;
  for(let i=0;i<count;i++){
    confettiParticles.push({
      x: window.innerWidth/2 + (Math.random()*160 - 80),
      y: 60 + Math.random()*40,
      vx: (Math.random()*4 - 2),
      vy: (Math.random()*-6 - 4),
      g: .18 + Math.random()*.05,
      w: 6 + Math.random()*6,
      h: 10 + Math.random()*10,
      r: Math.random()*Math.PI,
      vr: (Math.random()*0.2 - 0.1),
      alpha: 1,
      color: `hsl(${(Math.random()*360)|0} 85% 60%)`
    });
  }
}

function tick(){
  cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach(p=>{
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.alpha -= 0.007;
  });
  confettiParticles = confettiParticles.filter(p=> p.alpha>0 && p.y < confettiCanvas.height+60);
  confettiParticles.forEach(p=>{
    cctx.save();
    cctx.globalAlpha = Math.max(0, p.alpha);
    cctx.translate(p.x, p.y); cctx.rotate(p.r);
    cctx.fillStyle = p.color; cctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    cctx.restore();
  });
  requestAnimationFrame(tick);
}
tick();

// 初始渲染 + 绑定
drawWheel();
spinBtn.addEventListener('click', spin);
resetBtn.addEventListener('click', resetAngle);
applyBtn.addEventListener('click', applyConfig);
