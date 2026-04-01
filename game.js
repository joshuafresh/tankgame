// 游戏常量
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TANK_SIZE = 40;
const BULLET_SIZE = 8;
const BULLET_SPEED = 8;
const TANK_SPEED = 4;
const ENEMY_SPEED = 2;
const ENEMY_SPAWN_INTERVAL = 2000;

// 游戏状态
let gameState = 'ready'; // ready, playing, gameOver
let score = 0;
let lives = 3;

// 游戏元素
let playerTank = null;
let enemyTanks = [];
let bullets = [];
let obstacles = [];

// 画布和上下文
let canvas = null;
let ctx = null;

// 键盘状态
let keys = {};

// 游戏循环ID
let gameLoopId = null;
let lastEnemySpawnTime = 0;

// 初始化游戏
function initGame() {
    // 获取画布和上下文
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // 初始化玩家坦克
    playerTank = {
        x: CANVAS_WIDTH / 2 - TANK_SIZE / 2,
        y: CANVAS_HEIGHT - TANK_SIZE - 20,
        width: TANK_SIZE,
        height: TANK_SIZE,
        direction: 'up',
        speed: TANK_SPEED,
        color: '#00ff00'
    };
    
    // 初始化障碍物
    initObstacles();
    
    // 绑定事件
    bindEvents();
}

// 初始化障碍物
function initObstacles() {
    obstacles = [];
    
    // 添加一些随机障碍物
    for (let i = 0; i < 20; i++) {
        obstacles.push({
            x: Math.random() * (CANVAS_WIDTH - 30),
            y: Math.random() * (CANVAS_HEIGHT - 30),
            width: 30,
            height: 30,
            color: '#888'
        });
    }
}

// 绑定事件
function bindEvents() {
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // 鼠标事件（射击）
    canvas.addEventListener('click', (e) => {
        if (gameState === 'playing') {
            shootBullet();
        }
    });
    
    // 开始按钮
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // 重新开始按钮
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

// 开始游戏
function startGame() {
    gameState = 'playing';
    score = 0;
    lives = 3;
    enemyTanks = [];
    bullets = [];
    lastEnemySpawnTime = Date.now();
    
    // 隐藏开始按钮
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    
    // 更新UI
    updateUI();
    
    // 开始游戏循环
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    gameLoop();
}

// 重新开始游戏
function restartGame() {
    startGame();
}

// 游戏循环
function gameLoop() {
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 处理玩家输入
    handleInput();
    
    // 更新游戏元素
    updateGameElements();
    
    // 绘制游戏元素
    drawGameElements();
    
    // 检查游戏状态
    checkGameState();
    
    // 继续游戏循环
    gameLoopId = requestAnimationFrame(gameLoop);
}

// 处理玩家输入
function handleInput() {
    if (gameState !== 'playing') return;
    
    // 移动坦克
    if (keys['ArrowUp']) {
        playerTank.direction = 'up';
        if (playerTank.y > 0) {
            playerTank.y -= playerTank.speed;
        }
    } else if (keys['ArrowDown']) {
        playerTank.direction = 'down';
        if (playerTank.y < CANVAS_HEIGHT - playerTank.height) {
            playerTank.y += playerTank.speed;
        }
    } else if (keys['ArrowLeft']) {
        playerTank.direction = 'left';
        if (playerTank.x > 0) {
            playerTank.x -= playerTank.speed;
        }
    } else if (keys['ArrowRight']) {
        playerTank.direction = 'right';
        if (playerTank.x < CANVAS_WIDTH - playerTank.width) {
            playerTank.x += playerTank.speed;
        }
    }
    
    // 射击
    if (keys[' ']) {
        shootBullet();
        keys[' '] = false; // 防止连续射击
    }
}

// 射击子弹
function shootBullet() {
    let bulletX, bulletY;
    
    // 根据坦克方向计算子弹初始位置
    switch (playerTank.direction) {
        case 'up':
            bulletX = playerTank.x + playerTank.width / 2 - BULLET_SIZE / 2;
            bulletY = playerTank.y - BULLET_SIZE;
            break;
        case 'down':
            bulletX = playerTank.x + playerTank.width / 2 - BULLET_SIZE / 2;
            bulletY = playerTank.y + playerTank.height;
            break;
        case 'left':
            bulletX = playerTank.x - BULLET_SIZE;
            bulletY = playerTank.y + playerTank.height / 2 - BULLET_SIZE / 2;
            break;
        case 'right':
            bulletX = playerTank.x + playerTank.width;
            bulletY = playerTank.y + playerTank.height / 2 - BULLET_SIZE / 2;
            break;
    }
    
    // 添加子弹
    bullets.push({
        x: bulletX,
        y: bulletY,
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        direction: playerTank.direction,
        speed: BULLET_SPEED,
        color: '#ff0000'
    });
}

// 更新游戏元素
function updateGameElements() {
    if (gameState !== 'playing') return;
    
    // 生成敌人坦克
    if (Date.now() - lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
        spawnEnemy();
        lastEnemySpawnTime = Date.now();
    }
    
    // 更新敌人坦克
    enemyTanks.forEach((enemy, index) => {
        // 简单的AI移动
        switch (enemy.direction) {
            case 'down':
                if (enemy.y < CANVAS_HEIGHT - enemy.height) {
                    enemy.y += enemy.speed;
                } else {
                    enemy.direction = 'up';
                }
                break;
            case 'up':
                if (enemy.y > 0) {
                    enemy.y -= enemy.speed;
                } else {
                    enemy.direction = 'down';
                }
                break;
            case 'left':
                if (enemy.x > 0) {
                    enemy.x -= enemy.speed;
                } else {
                    enemy.direction = 'right';
                }
                break;
            case 'right':
                if (enemy.x < CANVAS_WIDTH - enemy.width) {
                    enemy.x += enemy.speed;
                } else {
                    enemy.direction = 'left';
                }
                break;
        }
        
        // 随机改变方向
        if (Math.random() < 0.01) {
            const directions = ['up', 'down', 'left', 'right'];
            enemy.direction = directions[Math.floor(Math.random() * directions.length)];
        }
        
        // 随机射击
        if (Math.random() < 0.005) {
            shootEnemyBullet(enemy);
        }
    });
    
    // 更新子弹
    bullets.forEach((bullet, index) => {
        switch (bullet.direction) {
            case 'up':
                bullet.y -= bullet.speed;
                break;
            case 'down':
                bullet.y += bullet.speed;
                break;
            case 'left':
                bullet.x -= bullet.speed;
                break;
            case 'right':
                bullet.x += bullet.speed;
                break;
        }
        
        // 移除超出画布的子弹
        if (bullet.x < 0 || bullet.x > CANVAS_WIDTH || bullet.y < 0 || bullet.y > CANVAS_HEIGHT) {
            bullets.splice(index, 1);
        }
    });
    
    // 碰撞检测
    checkCollisions();
}

// 生成敌人坦克
function spawnEnemy() {
    const x = Math.random() * (CANVAS_WIDTH - TANK_SIZE);
    
    enemyTanks.push({
        x: x,
        y: 20,
        width: TANK_SIZE,
        height: TANK_SIZE,
        direction: 'down',
        speed: ENEMY_SPEED,
        color: '#ff0000'
    });
}

// 敌人射击
function shootEnemyBullet(enemy) {
    let bulletX, bulletY;
    
    // 根据坦克方向计算子弹初始位置
    switch (enemy.direction) {
        case 'up':
            bulletX = enemy.x + enemy.width / 2 - BULLET_SIZE / 2;
            bulletY = enemy.y - BULLET_SIZE;
            break;
        case 'down':
            bulletX = enemy.x + enemy.width / 2 - BULLET_SIZE / 2;
            bulletY = enemy.y + enemy.height;
            break;
        case 'left':
            bulletX = enemy.x - BULLET_SIZE;
            bulletY = enemy.y + enemy.height / 2 - BULLET_SIZE / 2;
            break;
        case 'right':
            bulletX = enemy.x + enemy.width;
            bulletY = enemy.y + enemy.height / 2 - BULLET_SIZE / 2;
            break;
    }
    
    // 添加子弹
    bullets.push({
        x: bulletX,
        y: bulletY,
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        direction: enemy.direction,
        speed: BULLET_SPEED,
        color: '#ffff00'
    });
}

// 碰撞检测
function checkCollisions() {
    // 子弹与敌人碰撞
    bullets.forEach((bullet, bulletIndex) => {
        // 只检查玩家的子弹
        if (bullet.color === '#ff0000') {
            enemyTanks.forEach((enemy, enemyIndex) => {
                if (checkCollision(bullet, enemy)) {
                    // 移除子弹和敌人
                    bullets.splice(bulletIndex, 1);
                    enemyTanks.splice(enemyIndex, 1);
                    
                    // 增加得分
                    score += 100;
                    updateUI();
                }
            });
        }
        
        // 子弹与障碍物碰撞
        obstacles.forEach((obstacle, obstacleIndex) => {
            if (checkCollision(bullet, obstacle)) {
                // 移除子弹
                bullets.splice(bulletIndex, 1);
            }
        });
        
        // 敌人子弹与玩家碰撞
        if (bullet.color === '#ffff00') {
            if (checkCollision(bullet, playerTank)) {
                // 移除子弹
                bullets.splice(bulletIndex, 1);
                
                // 减少生命值
                lives--;
                updateUI();
                
                // 检查游戏是否结束
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    });
    
    // 玩家与敌人碰撞
    enemyTanks.forEach((enemy, enemyIndex) => {
        if (checkCollision(playerTank, enemy)) {
            // 移除敌人
            enemyTanks.splice(enemyIndex, 1);
            
            // 减少生命值
            lives--;
            updateUI();
            
            // 检查游戏是否结束
            if (lives <= 0) {
                gameOver();
            }
        }
    });
    
    // 玩家与障碍物碰撞
    obstacles.forEach(obstacle => {
        if (checkCollision(playerTank, obstacle)) {
            // 简单处理：将玩家坦克移回碰撞前的位置
            // 这里可以实现更复杂的碰撞响应
        }
    });
}

// 检查两个矩形是否碰撞
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 绘制游戏元素
function drawGameElements() {
    // 绘制玩家坦克
    drawTank(playerTank);
    
    // 绘制敌人坦克
    enemyTanks.forEach(enemy => {
        drawTank(enemy);
    });
    
    // 绘制子弹
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // 绘制障碍物
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// 绘制坦克
function drawTank(tank) {
    ctx.fillStyle = tank.color;
    ctx.fillRect(tank.x, tank.y, tank.width, tank.height);
    
    // 绘制炮管
    ctx.fillStyle = '#333';
    switch (tank.direction) {
        case 'up':
            ctx.fillRect(tank.x + tank.width / 2 - 2, tank.y - 10, 4, 10);
            break;
        case 'down':
            ctx.fillRect(tank.x + tank.width / 2 - 2, tank.y + tank.height, 4, 10);
            break;
        case 'left':
            ctx.fillRect(tank.x - 10, tank.y + tank.height / 2 - 2, 10, 4);
            break;
        case 'right':
            ctx.fillRect(tank.x + tank.width, tank.y + tank.height / 2 - 2, 10, 4);
            break;
    }
}

// 检查游戏状态
function checkGameState() {
    // 游戏结束条件已在碰撞检测中处理
}

// 游戏结束
function gameOver() {
    gameState = 'gameOver';
    
    // 显示游戏结束界面
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'block';
    
    // 停止游戏循环
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
}

// 更新UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);