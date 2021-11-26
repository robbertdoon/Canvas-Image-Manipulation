var canvas = document.getElementById('myCanvas'),
  c = canvas.getContext('2d'),
  myImage = {
    panda: 'https://res.cloudinary.com/practicaldev/image/fetch/s--D6vtkVyE--/c_fill,f_auto,fl_progressive,h_320,q_auto,w_320/https://dev-to-uploads.s3.amazonaws.com/uploads/user/profile_image/268788/c732e996-e1ff-4572-ba94-e4a7a7605346.png',
    autoBasL: 'https://i0.wp.com/www.bmill.nl/wp-content/uploads/2020/12/IMG_3198-scaled.jpg',
    autoBasP: 'https://i1.wp.com/www.bmill.nl/wp-content/uploads/2021/02/IMG_3192-1-scaled.jpg'
  },
  drawing = new Image(),
  partsArray,
  requestId,
  circleMode = true,
  isPaused = false,
  myImageURL = myImage.panda,
  myParts = 40;

var btnPause = document.getElementById('btnPause');
btnPause.addEventListener('click', function() {
  isPaused = !isPaused;
  if (!isPaused) {
    animate();
  }
});

var btnLog = document.getElementById('myLog');
btnLog.addEventListener('click', function() {
  console.log(partsArray[105].speedX, partsArray[105].speedY);
})

function fillArray() {
  var x = 0,
    y = 0,
    sizeX,
    sizeY,
    imgData,
    color;

  if (canvas.width > canvas.height) {
    sizeX = canvas.width / myParts;
    sizeY = sizeX;
  } else if (canvas.height > canvas.width) {
    sizeY = canvas.height / myParts;
    sizeX = sizeY;
  } else {
    sizeX = canvas.width / myParts;
    sizeY = canvas.height / myParts;
  }

  partsArray = [];

  for (var i = 0; i < (Math.pow(myParts, 2)); i++) {
    imgData = c.getImageData(x, y, sizeX, sizeY);
    color = 'rgba(' + imgData.data[0] + ',' + imgData.data[1] + ',' + imgData.data[2] + ',' + imgData.data[3] + ')';
    partsArray.push(new Particle(x, y, imgData, color));
    x += sizeX;
    if (x >= canvas.width) {
      x = 0;
      y += sizeY;
    }
    if (y >= canvas.height) {
      return;
    }
  }
}

function animate() {
  if (!isPaused) {
    c.clearRect(0, 0, canvas.width, canvas.height);
    partsArray.forEach(part => {
      part.update();
    });
    requestId = requestAnimationFrame(animate);
  }
}

function init() {
  drawing.crossOrigin = "Anonymous";
  drawing.src = myImageURL;
  drawing.onload = function() {
    // hier wordt de grootte bepaald van het canvas
    var maxSize = 600;
    var divideBy;
    if (drawing.width > drawing.height && drawing.width > maxSize) {
      divideBy = drawing.width / maxSize;
      drawing.width = drawing.width / divideBy;
      drawing.height = drawing.height / divideBy;

      // het lijkt erop dat de grootte van de lege ruimte tussen de circles in portrait veel groter is dan in landscape of square afbeeldingen. onderzoeken en oplossen
    } else if (drawing.height > drawing.width && drawing.height > maxSize) {
      divideBy = drawing.height / maxSize;
      drawing.width = drawing.width / divideBy;
      drawing.height = drawing.height / divideBy;
    } else if (drawing.width > 400) {
      divideBy = drawing.width / maxSize;
      drawing.width = drawing.width / divideBy;
      drawing.height = drawing.height / divideBy;
    }
    canvas.width = drawing.width;
    canvas.height = drawing.height;
    c.drawImage(drawing, 0, 0, canvas.width, canvas.height);
    fillArray();
    partsArray.forEach(part => {
      part.distanceFromCenter();
    });
    animate();
  };
}

window.addEventListener('load', init);

// TODO: 1. de snelheid per particle van langzaam naar snel naar langzaam gaan tijdens toTarget;

function Particle(x, y, imageData, color) {
  this.currentX = x;
  this.currentY = y;
  this.initialX = x;
  this.initialY = y;
  this.size = function() {
    if (canvas.height > canvas.width) {
      return (canvas.height / myParts / 2) - 0.5;
    } else {
      return (canvas.width / myParts / 2) - 0.5;
    }
  }
  this.color = color;
  this.imageData = imageData;
  this.radians = Math.random() * Math.PI * 2;
  this.velocity = 0.001;
  this.randomNumber = Math.random();
  this.randomBetween = randomBetween(500, 5000);
  this.randomBetween2 = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  this.highestSpeed = function() {

    var divideBy = 3;

    this.currentDistance();
    // grootste afstand moet de hoogste snelheid krijgen, de ander daarop gebaseerd
    if (this.currentDistanceX >= this.currentDistanceY) {
      this.speedX = this.currentDistanceX / this.currentDistanceX / divideBy;
      this.speedY = this.currentDistanceY / this.currentDistanceX / divideBy;
    } else {
      this.speedY = this.currentDistanceY / this.currentDistanceY / divideBy;
      this.speedX = this.currentDistanceX / this.currentDistanceY / divideBy;
    }
  }
  this.mode = 1;
  this.myX = null;
  this.myY = null;
  this.currentDistance = function() {
    this.currentDistanceX = Math.abs(this.initialX - this.currentX);
    this.currentDistanceY = Math.abs(this.initialY - this.currentY);
  }
  // onderstaande functie maakt de verdeling van de particles (dit is de standaard  weergave, voordat toTarget wordt aangeroepen)
  this.distanceFromCenter = function() {
    if (this.randomNumber > 0.2) { // middenspreiding
      this.myX = canvas.width / 2;
      this.myY = this.randomBetween2(canvas.height / -2, canvas.height / 2);
    } else if (this.randomNumber > 0.05 && this.randomNumber < 0.2) { // tussenring
      this.myX = randomBetween(canvas.width / 2 / 4 * 3, (canvas.width / 2) - 2);
      this.myY = randomBetween(canvas.height / 2 / 4 * 3, (canvas.height / 2) - 2);
    } else { // buitenring
      this.myX = randomBetween((canvas.width / 2) - 2, canvas.width / 2);
      this.myY = randomBetween((canvas.height / 2) - 2, canvas.height / 2);
    }
  }
  this.update = function() {
    if (this.mode == 1) {
      this.initial();
    }
    if (this.mode == 2) {
      this.toTarget();
    }
    this.draw();
  }
  // dit is de initiele functie, deze functie gaat goed (initieel wordt de animatie juist ingeladen).
  this.initial = function() {
    this.radians += this.velocity;
    this.currentX = canvas.width / 2 + Math.cos(this.radians) * this.myX - (canvas.width / myParts / 2);
    this.currentY = canvas.height / 2 + Math.sin(this.radians) * this.myY - (canvas.width / myParts / 2);
  }


  // deze functie nog verfijnen
  this.dynamicSpeed = function() {
    this.currentDistance();

    var speedUp = 1.03;
    var speedDown = 0.97;

    // VERSNELLING als huidige afstand groter is dan 75% van de totale afstand
    if (this.currentDistanceX >= this.totalDistanceX / 4 * 3) {
      this.speedX *= speedUp;
      this.speedY *= speedUp;
    }

    if (this.currentDistanceY >= this.totalDistanceY / 4 * 3) {
      this.speedY *= speedUp;
      this.speedX *= speedUp;

    }

    // VERTRAGING als huidige afstand kleiner is dan ...% van de totale afstand
    // HIER NOG NAAR KIJKEN

    if (this.currentDistanceX > this.currentDistanceY) {
      if (this.currentDistanceX < this.totalDistanceX / 4) {
        if (this.speedX > 0.7) {
          this.speedX *= speedDown;
          this.speedY *= speedDown;
        }
      }
    } else if (this.currentDistanceY > this.currentDistanceX) {
      if (this.currentDistanceY < this.totalDistanceY / 4) {
        if (this.speedY > 0.7) {
          this.speedX *= speedDown;
          this.speedY *= speedDown;
        }
      }
    }






  }

  this.toTarget = function() {

    this.dynamicSpeed();

    // hiermee gaan de objecten terug naar hun originele posities
    if (this.currentX > this.initialX) {
      this.currentX -= this.speedX;
      if ((this.currentX - this.initialX) < 0.5) {
        this.currentX = this.initialX;
      }
    } else if (this.currentX < this.initialX) {
      this.currentX += this.speedX;
      if ((this.initialX - this.currentX) < 0.5) {
        this.currentX = this.initialX;
      }
    }

    if (this.currentY > this.initialY) {
      this.currentY -= this.speedY;
      if ((this.currentY - this.initialY) < 0.5) {
        this.currentY = this.initialY;
      }
    } else if (this.currentY < this.initialY) {
      this.currentY += this.speedY;
      if ((this.initialY - this.currentY) < 0.5) {
        this.currentY = this.initialY;
      }
    }
  }

  this.draw = function() {
    if (circleMode) {
      c.beginPath();
      c.fillStyle = this.color;
      c.arc(this.currentX + this.size(), this.currentY + this.size(), this.size(), 0, Math.PI * 2);
      c.fill();
    } else {
      c.putImageData(this.imageData, this.currentX, this.currentY);
    }
  }
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

canvas.addEventListener('click', function() {
  partsArray.forEach(part => {
    //eenmalig de totale afstand van a naar b bepalen
    part.totalDistanceX = Math.abs(part.initialX - part.currentX);
    part.totalDistanceY = Math.abs(part.initialY - part.currentY);
    setTimeout(function() {
      part.highestSpeed();
      part.mode++;
      if (part.mode == 3) {
        part.mode = 1;
      }
    }, part.randomBetween);
  });
});
