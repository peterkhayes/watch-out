// Constants.
var size = 700;
var startingNumEnemies = 6;
var radius = 8;
var startingMoveInt = 3000;
var boundaryFactor = Math.sqrt(2);
var flashSpeed = 100;
var scoreMultiplier = 9;

// Global variables.
var score = 0;
var highScore = 0;
var currentNumEnemies = startingNumEnemies;
var currentMoveInt = startingMoveInt;
var level = 1;
var newRecord = false;

// Helper functions.
var genEnemyLocations = function (){
  var enemyArr = [];
  for(var i = 0; i < currentNumEnemies; i++) {
    enemyArr.push({x:Math.random()*(size-2*radius)+radius, y:Math.random()*(size-2*radius)+radius});
  }
  return enemyArr;
};

var updateEnemies = function () {
  var startData = genEnemyLocations();
  var newData = genEnemyLocations();
  var enemies = d3Canvas.selectAll('circle.enemy').data(newData);


  // adds new enemies (on level up or game init)
  enemies
    .enter().append('circle')
    .attr('class', 'enemy')
    .attr('r', radius)
    .attr('cy', function (d, i) { return startData[i].y;})
    .attr('cx', function (d, i) { return startData[i].x;})
    .style('fill', 'red');

  // moves enemies
  enemies.transition().duration(currentMoveInt).ease('linear').tween('custom', collisionTween);

  setTimeout(updateEnemies, currentMoveInt);
};


var collisionTween = function(endPoint) {
  var enemy = d3.select(this);
  var startX = parseFloat(enemy.attr("cx"));
  var startY = parseFloat(enemy.attr("cy"));

  return function (t) {
    checkCollision(enemy);
    enemy.attr({cx: startX + (endPoint.x - startX)*t,
                cy: startY + (endPoint.y - startY)*t});
  };
};

var checkDistance = function(d, x1, y1, x2, y2) {
  return ((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1) < d*d);
};

var checkCollision = function(enemy) {
  var playerX = player.datum().x + radius;
  var playerY = player.datum().y + radius;

  var enemyX = parseFloat(enemy.attr("cx"));
  var enemyY = parseFloat(enemy.attr("cy"));
  if(checkDistance(2*radius, enemyX, enemyY, playerX, playerY)) {
    restartRound();
  }
};

var restartRound = function () {
  playerHitFlash();
  score = 0;
  level = 1;
  newRecord = false;
  currentMoveInt = startingMoveInt;
  currentNumEnemies = startingNumEnemies;
  d3.select('.level').text(level);
  d3Canvas.selectAll('circle.enemy').data([]).exit().remove();
};

var playerHitFlash = function() {
  player.style('fill', 'none');
  setTimeout(function() {player.style('fill', '#0C0');}, flashSpeed);
  setTimeout(function() {player.style('fill', 'none');}, flashSpeed*2);
  setTimeout(function() {player.style('fill', '#0C0');}, flashSpeed*3);
  setTimeout(function() {player.style('fill', 'none');}, flashSpeed*4);
  setTimeout(function() {player.style('fill', '#0C0');}, flashSpeed*5);
};

var flashText = function(text) {
  msgText.text(text).attr({opacity: 1, 'font-size': 30});
  msgText.transition().duration(500).ease('linear').attr({opacity: 0, 'font-size': 50});
};

var incrementScore = function() {
  score++;
  if (bonusCircle.attr("r") && checkDistance(bonusCircle.attr("r"), bonusCircle.attr("cx"), bonusCircle.attr("cy"), player.attr("x"), player.attr("y"))) {
    score += Math.round((12+level)*bonusCircle.attr("opacity"));
  }
  d3.select('.score').text(score);
  if (score > highScore) {
    highScore = score;
    if (!newRecord) {
      newRecord = true;
      if (score > 10) {
        flashText("NEW HIGH SCORE!!!");
      }
    }
    d3.select('.highScore').text(highScore);
  }

  if(score > 25*Math.pow(level, 1.7)) {
    currentMoveInt *= 0.95;
    currentNumEnemies = startingNumEnemies + 2*(level-1);
    level++;
    flashText('LEVEL UP');
    d3.select('.level').text(level);
  }

  if (score % 100 === 0) {
    flashText(score + " POINTS!");
  }
  setTimeout(incrementScore, Math.sqrt(currentMoveInt)*scoreMultiplier/(currentNumEnemies));
};

var activateBonus = function () {
  bonusCircle.attr({r: Math.random()*100 + 50,
                    cx: size/2 + (Math.random()*size/3) - size/6,
                    cy: size/2 + (Math.random()*size/3) - size/6,
                    opacity: 0.6});

  bonusCircle.transition().duration(2000).ease('linear')
    .attr({r: 0, opacity: 0});
};

// Initialize game.
var d3Canvas = d3.select('svg')
  .attr('width', size)
  .attr('height', size);

var msgText = d3.select('text')
                   .attr({
                     x: size/2,
                     y: size/2,
                     'text-anchor': 'middle',
                     'font-family': 'courier',
                     fill: '#0C0',
                     opacity: 0
                    });

var boundary = d3Canvas.append('circle')
  .attr({r: radius + size/(2*boundaryFactor),
         cx: size/2,
         cy: size/2,
         fill: "none",
         stroke: "#0C0",
         "stroke-width": 7});

var bonusCircle = d3Canvas.append('circle').attr("fill", "white");

var player = d3Canvas.selectAll('rect').data([{x:size/2, y:size/2}])
  .enter()
  .append('rect')
  .attr({x: function (p) { return p.x;},
         y: function (p) { return p.y;},
         rx: 5,
         ry: 5,
         fill: "#0C0",
         width: radius*2,
         height: radius*2});

d3Canvas.on('mousemove', function(clickEvent) {
  var coordinates = d3.mouse(this);
  var mX = coordinates[0] - size/2 + radius;
  var mY = coordinates[1] - size/2 + radius;
  if(mX * mX + mY * mY < size*size/(4*boundaryFactor*boundaryFactor)) {
    player.data([{x:coordinates[0], y:coordinates[1]}])
          .attr('x', function (d) { return d.x;})
          .attr('y', function (d) { return d.y;});
  }
});

// Make everything go!

updateEnemies();
incrementScore();
setInterval(function() { if (Math.random() < 0.7) activateBonus(); },1500);





















