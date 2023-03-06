// * Generate interface elements:
const LOCAL_STORAGE_PREFIX = "GEM_PUZZLE_ELIAN";
let cells = [];
let rowLength = 4;
let movesCount = 0;
let timer = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-timer`) * 1;
let timerString = "00:00";
let timerInterval;
let onMove = false;
let onAnimation = false;
let tileSound = new Audio("./assets/tile-sound.wav");
tileSound.volume = 1;

const container = document.createElement("div");
container.classList.add("container");
container.classList.add("pause");
document.body.prepend(container);

const timers = document.createElement("div");
timers.classList.add("timers");
document.body.prepend(timers);

const moves = document.createElement("div");
moves.classList.add("moves");
moves.innerText = `Moves: ${movesCount}`;
timers.append(moves);

const clock = document.createElement("div");
clock.classList.add("clock");
clock.innerText = `Time: ${timerString}`;
timers.append(clock);

const soundButton = document.createElement("button");
soundButton.classList.add("sound-button");
timers.append(soundButton);

const buttons = document.createElement("div");
buttons.classList.add("buttons");
document.body.prepend(buttons);

const restartButton = document.createElement("button");
restartButton.classList.add("button");
restartButton.classList.add("restart-button");
restartButton.innerText = "New Game";
buttons.append(restartButton);

const pauseButton = document.createElement("button");
pauseButton.classList.add("button");
pauseButton.classList.add("pause-button");
pauseButton.innerText = "Start";
buttons.append(pauseButton);

const saveButton = document.createElement("button");
saveButton.classList.add("button");
saveButton.classList.add("save-button");
saveButton.innerText = "Save";
buttons.append(saveButton);

const resultsButton = document.createElement("button");
resultsButton.classList.add("button");
resultsButton.classList.add("results-button");
resultsButton.innerText = "Results";
buttons.append(resultsButton);

const chooseSize = document.createElement("div");
chooseSize.classList.add("choose-size");
document.body.append(chooseSize);

const chooseSizeButton = document.createElement("button");
chooseSizeButton.classList.add("button");
chooseSizeButton.classList.add("choose-size-button");
chooseSizeButton.innerText = "Choose Size";
document.querySelector(".choose-size").append(chooseSizeButton);

const sizeList = document.createElement("div");
sizeList.classList.add("size-list");

sizeList.innerHTML = `
<div class='size-wrapper'>
  <button class='size-button three'>3x3</button>
  <button class='size-button four'>4x4</button>
  <button class='size-button five'>5x5</button>
  <button class='size-button six'>6x6</button>
  <button class='size-button seven'>7x7</button>
  <button class='size-button eight'>8x8</button>
  <button class='close-size-button button'>Close</button>
</div>
`;
sizeList.tabIndex = "0";
document.body.prepend(sizeList);

// * Buttons actions (event listeners):

saveButton.addEventListener("click", saveGame);

resultsButton.addEventListener("click", getResults);

soundButton.addEventListener("click", () => {
  soundButton.classList.toggle("sound-off");
  tileSound.muted === true
    ? (tileSound.muted = false)
    : (tileSound.muted = true);
});

pauseButton.addEventListener("click", () => {
  if (!onAnimation) {
    pauseGame();
  } else {
    setTimeout(() => {
      pauseGame();
    }, 490);
  }
});

restartButton.addEventListener("click", () => {
  if (!onAnimation) {
    restartGame();
  } else {
    setTimeout(() => {
      restartGame();
    }, 490);
  }
});

chooseSizeButton.addEventListener("click", () => {
  sizeList.classList.add("active");
  if (document.querySelector(".pause-button").innerText === "Stop") {
    clearInterval(timerInterval);
  }
});

document.querySelector(".close-size-button").addEventListener("click", () => {
  sizeList.classList.remove("active");
  if (document.querySelector(".pause-button").innerText === "Stop") {
    timerInterval = setInterval(startTimer, 100);
  }
});

// * Functions

// Manage time:

function startTimer() {
  timer += 100;
  let time = timer;
  time = Math.floor(time / 1000);
  let sec = `${time % 60}`;
  sec = sec.length === 1 ? `0${sec}` : sec;
  time = Math.floor(time / 60);
  let min = `${time % 60}`;
  min = min.length === 1 ? `0${min}` : min;
  timerString = `${min}:${sec}`;
  document.querySelector(".clock").innerText = `Time: ${timerString}`;
}
startTimer();

// Puzzle gameboard creation:

function getSavedPuzzle() {
  if (localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-puzzle`)) {
    rowLength = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-rowLength`) * 1;
    createPuzzle(
      localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-puzzle`).split(",")
    );
    timer = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-timer`) * 1;
    movesCount = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-movesCount`) * 1;
    moves.innerText = `Moves: ${movesCount}`;
  } else {
    createPuzzle();
  }
}
getSavedPuzzle();

function createPuzzle(items) {
  let arr = [];
  if (!items) {
    for (let i = 0; i < rowLength * rowLength - 1; i++) {
      arr.push(i + 1);
    }
    arr.push(0);
    let flag = true;
    while (flag) {
      arr = shuffleCells(arr);
      let count = 0;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
          for (let j = 0; j < i; j++) {
            if (arr[j] > arr[i]) {
              count++;
            }
          }
        }
      }
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 0) {
          count += 1 + Math.floor(i / rowLength);
        }
      }
      if (rowLength % 2 !== 0) {
        count++;
      }

      flag = count % 2 !== 0;
    }
  }
  arr = items !== undefined ? items : arr;
  createCells(arr);
}

function createCells(arr) {
  for (let i = 0; i < arr.length; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.innerHTML = arr[i] !== 0 ? arr[i] : "&nbsp;";
    container.append(cell);
  }

  cells = document.querySelectorAll(".cell");

  cells.forEach(item => {
    const size = 100 / rowLength;
    item.style.width = `${size}%`;
    item.style.height = `${size}%`;
  });
}

function shuffleCells(arr) {
  const shuffled = [...arr];
  let index = arr.length;

  while (index) {
    const randomIndex = Math.floor(Math.random() * index);
    index--;

    let value = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = value;
  }

  return shuffled;
}

function pauseGame() {
  if (document.querySelector(".pause-button").innerText === "Stop") {
    document.querySelector(".pause-button").innerText = "Start";
    document.querySelector(".container").classList.add("pause");
    clearInterval(timerInterval);
    const items = [];
    document.querySelectorAll(".cell").forEach(item => {
      items.push(item.innerText);
      item.remove();
    });
    createPuzzle(items);
  } else if (document.querySelector(".pause-button").innerText === "Start") {
    document.querySelector(".pause-button").innerText = "Stop";
    document.querySelector(".container").classList.remove("pause");
    timerInterval = setInterval(() => {
      timer += 100;
      let time = timer;
      time = Math.floor(time / 1000);
      let sec = `${time % 60}`;
      sec = sec.length === 1 ? `0${sec}` : sec;
      time = Math.floor(time / 60);
      let min = `${time % 60}`;
      min = min.length === 1 ? `0${min}` : min;
      timerString = `${min}:${sec}`;
      document.querySelector(".clock").innerText = `Time: ${timerString}`;
    }, 100);
    cells.forEach((item, index) => {
      item.addEventListener("mousedown", e => {
        moveByDrag(e, item, index, "computer");
      });
      item.addEventListener(
        "touchstart",
        e => {
          moveByDrag(e, item, index, "phone");
        },
        { passive: true }
      );
      item.addEventListener("click", e => {
        moveByClick(e, item, index);
      });
    });
  }
}

function handlePuzzleSize() {
  document.querySelectorAll(".size-button").forEach(item => {
    item.addEventListener("click", () => {
      if (item.classList.contains("three")) {
        rowLength = 3;
        createNewGame();
      } else if (item.classList.contains("four")) {
        rowLength = 4;
        createNewGame();
      } else if (item.classList.contains("five")) {
        rowLength = 5;
        createNewGame();
      } else if (item.classList.contains("six")) {
        rowLength = 6;
        createNewGame();
      } else if (item.classList.contains("seven")) {
        rowLength = 7;
        createNewGame();
      } else if (item.classList.contains("eight")) {
        rowLength = 8;
        createNewGame();
      }
    });
  });
}
handlePuzzleSize();

// Restart game
function createNewGame() {
  for (let i = 0; i < cells.length; i++) {
    cells[i].remove();
  }
  createPuzzle();
  timer = 0;
  document.querySelector(".clock").innerText = "Time: 00:00";
  movesCount = 0;
  moves.innerHTML = `Moves: ${movesCount}`;
  if (document.querySelector(".pause-button").innerText === "Stop") {
    document.querySelector(".pause-button").innerText = "Start";
    document.querySelector(".container").classList.add("pause");
    clearInterval(timerInterval);
  }
  sizeList.classList.remove("active");
}

function restartGame() {
  cells.forEach(item => {
    item.remove();
  });
  createPuzzle();
  movesCount = 0;
  moves.innerText = `Moves: ${movesCount}`;
  timer = 0;
  cells.forEach((item, index) => {
    item.addEventListener("mousedown", e => {
      moveByDrag(e, item, index, "computer");
    });
    item.addEventListener("touchstart", e => {
      moveByDrag(e, item, index, "phone");
    });
    item.addEventListener("click", e => {
      moveByClick(e, item, index);
    });
  });
  if (document.querySelector(".pause-button").innerText === "Start") {
    timerInterval = setInterval(startTimer, 100);
    document.querySelector(".pause-button").innerText = "Stop";
    document.querySelector(".container").classList.remove("pause");
  }
}

// Manage winning game:

function handleWin() {
  let flag = true;
  const arr = document.querySelectorAll(".cell");
  let index = 0;
  while (flag && index < arr.length - 1) {
    if (arr[index].innerText * 1 !== index + 1) {
      flag = false;
    }
    index++;
  }
  if (flag) {
    const result = {
      time: timerString,
      moves: movesCount,
    };
    showCongratulation(result);
    saveResults(result);
    return result;
  }
}

function showCongratulation(result) {
  const congratulation = document.createElement("div");
  congratulation.classList.add("congratulation");
  congratulation.innerHTML = `
  <div>Hooray! You solved the puzzle in ${result.time} and ${result.moves} moves!</div>
  <button class='close-congratulation-button button'>Close</button>
`;
  document.body.append(congratulation);
  document
    .querySelector(".close-congratulation-button")
    .addEventListener("click", () => {
      congratulation.remove();
      restartGame();
    });
}

// Saving progress:

function saveGame() {
  const items = [];
  document.querySelectorAll(".cell").forEach(item => {
    items.push(item.innerHTML);
  });
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}-puzzle`, items);
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}-rowLength`, rowLength);
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}-timer`, timer);
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}-movesCount`, movesCount);
}

function saveResults(result) {
  if (localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-results`) === null) {
    const results = [];
    results.push(result);
    localStorage.setItem(
      `${LOCAL_STORAGE_PREFIX}-results`,
      JSON.stringify(results)
    );
  } else {
    let results = JSON.parse(
      localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-results`)
    );
    results.push(result);
    results.sort((a, b) => {
      if (a.moves > b.moves) {
        return 1;
      }
      if (a.moves < b.moves) {
        return -1;
      }

      return 0;
    });
    if (results.length > 10) {
      results = results.slice(0, 10);
    }
    localStorage.setItem(
      `${LOCAL_STORAGE_PREFIX}-results`,
      JSON.stringify(results)
    );
  }
}

function getResults() {
  if (localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-results`) === null) {
    const result = document.createElement("div");
    result.classList.add("results");
    result.innerHTML = `
    <div>No Results</div>
    <button class='button close-results-button'>Close</button>
    `;
    document.body.append(result);
    document
      .querySelector(".close-results-button")
      .addEventListener("click", () => {
        result.remove();
      });
  } else {
    const results = JSON.parse(
      localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-results`)
    );
    const resultWindow = document.createElement("div");
    resultWindow.classList.add("results");
    results.forEach((item, index) => {
      const div = document.createElement("div");
      div.innerHTML = `<div>${index + 1}. Time: ${item.time}, Moves: ${
        item.moves
      }</div>`;
      resultWindow.append(div);
    });
    const closeResults = document.createElement("button");
    closeResults.classList.add("button");
    closeResults.classList.add("close-results-button");
    closeResults.innerHTML = "Close";
    resultWindow.append(closeResults);
    document.body.append(resultWindow);
    closeResults.addEventListener("click", () => {
      resultWindow.remove();
    });
  }
}

// Moving cells

function moveByClick(e, element, index) {
  if (onAnimation) {
    return;
  }
  const item = element;
  if (item.style.animation !== "") {
    return;
  }
  if (onMove) {
    onMove = false;
    return;
  }
  if (
    (index + 1) % rowLength !== 1 &&
    cells[index - 1].innerHTML === "&nbsp;"
  ) {
    item.style.animation = "toLeft 0.5s";
    onAnimation = true;
    tileSound.play();
    setTimeout(() => {
      cells[index - 1].innerHTML = item.innerHTML;
      item.innerHTML = "&nbsp;";
      item.style.animation = "";
      movesCount++;
      moves.innerText = `Moves: ${movesCount}`;
      handleWin();
    }, 440);
  } else if (
    (index + 1) % rowLength !== 0 &&
    cells[index + 1].innerHTML === "&nbsp;"
  ) {
    item.style.animation = "toRight 0.5s";
    onAnimation = true;
    tileSound.play();
    setTimeout(() => {
      cells[index + 1].innerHTML = item.innerHTML;
      item.innerHTML = "&nbsp;";
      item.style.animation = "";
      movesCount++;
      moves.innerText = `Moves: ${movesCount}`;
      handleWin();
    }, 440);
  } else if (
    index + 1 > rowLength &&
    cells[index - rowLength].innerHTML === "&nbsp;"
  ) {
    item.style.animation = "toTop 0.5s";
    onAnimation = true;
    tileSound.play();
    setTimeout(() => {
      cells[index - rowLength].innerHTML = item.innerHTML;
      item.innerHTML = "&nbsp;";
      item.style.animation = "";
      movesCount++;
      moves.innerText = `Moves: ${movesCount}`;
      handleWin();
    }, 440);
  } else if (
    index + 1 <= rowLength * (rowLength - 1) &&
    cells[index + rowLength].innerHTML === "&nbsp;"
  ) {
    item.style.animation = "toDown 0.5s";
    onAnimation = true;
    tileSound.play();
    setTimeout(() => {
      cells[index + rowLength].innerHTML = item.innerHTML;
      item.innerHTML = "&nbsp;";
      item.style.animation = "";
      movesCount++;
      moves.innerText = `Moves: ${movesCount}`;
      handleWin();
    }, 440);
  }
  if (onAnimation) {
    setTimeout(() => {
      onAnimation = false;
    }, 440);
  }
}

function moveByDrag(e, element, index, device) {
  const item = element;
  const end = device === "computer" ? "mouseup" : "touchend";
  const middle = device === "computer" ? "mousemove" : "touchmove";
  let direction;
  if (
    (index + 1) % rowLength !== 1 &&
    cells[index - 1].innerHTML === "&nbsp;"
  ) {
    direction = "left";
    tileSound.play();
  } else if (
    (index + 1) % rowLength !== 0 &&
    cells[index + 1].innerHTML === "&nbsp;"
  ) {
    direction = "right";
    tileSound.play();
  } else if (
    index + 1 > rowLength &&
    cells[index - rowLength].innerHTML === "&nbsp;"
  ) {
    direction = "top";
    tileSound.play();
  } else if (
    index + 1 <= rowLength * (rowLength - 1) &&
    cells[index + rowLength].innerHTML === "&nbsp;"
  ) {
    direction = "bottom";
    tileSound.play();
  }
  item.style["z-index"] = 1;
  const top = device === "computer" ? e.pageY : e.targetTouches[0].pageY;
  const left = device === "computer" ? e.pageX : e.targetTouches[0].pageX;
  const { width } = item.getBoundingClientRect();
  const { height } = item.getBoundingClientRect();
  let isDeleteListener = false;

  function moveAt(pageX, pageY) {
    if (direction === "left") {
      item.style.left = pageX - left <= 0 ? `${pageX - left}px` : "0px";
    } else if (direction === "right") {
      item.style.left = pageX - left >= 0 ? `${pageX - left}px` : "0px";
    } else if (direction === "bottom") {
      item.style.top = pageY - top >= 0 ? `${pageY - top}px` : "0px";
    } else if (direction === "top") {
      item.style.top = pageY - top <= 0 ? `${pageY - top}px` : "0px";
    }
    const leftNow = item.style.left.slice(0, item.style.left.length - 2);
    const topNow = item.style.top.slice(0, item.style.top.length - 2);
    if (
      leftNow >= width ||
      leftNow <= -width ||
      topNow >= height ||
      topNow <= -height
    ) {
      isDeleteListener = true;
      item.onmouseup = null;
      item.style.left = 0;
      item.style.top = 0;
      item.style["z-index"] = 0;
      let directionNumber;
      if (direction === "left") directionNumber = -1;
      else if (direction === "right") directionNumber = 1;
      else if (direction === "top") directionNumber = -rowLength;
      else if (direction === "bottom") directionNumber = rowLength;
      cells[index + directionNumber].innerHTML = item.innerHTML;
      item.innerHTML = "&nbsp;";
      movesCount++;
      moves.innerText = `Moves: ${movesCount}`;
      handleWin();
    }
  }

  function onMouseMove(event) {
    const pageX =
      device === "computer" ? event.pageX : event.targetTouches[0].pageX;
    const pageY =
      device === "computer" ? event.pageY : event.targetTouches[0].pageY;
    moveAt(pageX, pageY);
    if (isDeleteListener) {
      document.removeEventListener(middle, onMouseMove);
    }
    isDeleteListener = false;
    onMove = true;
  }

  document.addEventListener(middle, onMouseMove);

  document.addEventListener(end, () => {
    const leftNow = item.style.left.slice(0, item.style.left.length - 2);
    const topNow = item.style.top.slice(0, item.style.top.length - 2);

    if (
      leftNow >= width / 2 ||
      leftNow <= -width / 2 ||
      topNow >= height / 2 ||
      topNow <= -height / 2
    ) {
      isDeleteListener = true;
      item.onmouseup = null;
      item.style.left = 0;
      item.style.top = 0;
      item.style["z-index"] = 0;
      let directionNumber;
      if (
        (index + 1) % rowLength !== 1 &&
        cells[index - 1].innerHTML === "&nbsp;"
      ) {
        direction = "left";
      } else if (
        (index + 1) % rowLength !== 0 &&
        cells[index + 1].innerHTML === "&nbsp;"
      ) {
        direction = "right";
      } else if (
        index + 1 > rowLength &&
        cells[index - rowLength].innerHTML === "&nbsp;"
      ) {
        direction = "top";
      } else if (
        index + 1 <= rowLength * (rowLength - 1) &&
        cells[index + rowLength].innerHTML === "&nbsp;"
      ) {
        direction = "bottom";
      }
      if (direction === "left") directionNumber = -1;
      else if (direction === "right") directionNumber = 1;
      else if (direction === "top") directionNumber = -rowLength;
      else if (direction === "bottom") directionNumber = rowLength;
      cells[index + directionNumber].innerHTML = item.innerHTML;
      item.innerHTML = "&nbsp;";
      movesCount++;
      moves.innerText = `Moves: ${movesCount}`;
      handleWin();
    } else {
      item.onmouseup = null;
      item.style.left = 0;
      item.style.top = 0;
      item.style["z-index"] = 0;
    }
    document.removeEventListener(middle, onMouseMove);
  });
}

window.addEventListener("touchmove", event => event.preventDefault(), {
  passive: false,
});
