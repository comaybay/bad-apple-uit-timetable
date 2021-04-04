const TEXT_ANI_SPEED = 30;

const WIDTH = 36;
const HEIGHT = 28;

const tbody = document.querySelector("table[class~='tableheader-processed'] > tbody");
const thead = document.querySelector("table[class~='tableheader-processed'] > thead");

tbody.innerHTML = "";
thead.innerHTML = "";

addRow(tbody, HEIGHT);
for (const child of tbody.children) {
  addCell(child, WIDTH);
}

startIntro().then(startBadApple);

function addRow(target, amount) {
  for (let i = 0; i < amount; i++) {
    const tr = document.createElement("tr");
    tr.className = (i % 2) ? "even" : "odd";
    target.appendChild(tr);
  }
}

function addCell(target, amount) {
  for (let i = 0; i < amount; i++) {
    const td = document.createElement("td");
    target.appendChild(td);
  }
}

function startIntro() {
  let callback;
  const title = document.querySelector(".title_thongtindangky");

  const phase1 = () => {
    const text1 = title.firstChild.nodeValue;
    const text2 = title.firstElementChild.innerText;
    title.firstChild.nodeValue = text1.slice(0, -1);
    title.firstElementChild.innerText = text2.slice(0, -1);

    if (text1.length === 0 && text2.length === 0)
      setTimeout(phase2, TEXT_ANI_SPEED)
    else
      setTimeout(phase1, TEXT_ANI_SPEED);
  }

  let i = 1;
  let j = 1;
  const phase2 = () => {
    const text1 = "【東方】Bad Apple!!【影絵】";
    const text2 = "Nomico";
    title.firstChild.nodeValue = text1.slice(0, i);
    title.firstElementChild.innerText = text2.slice(0, j);

    if (i !== text1.length || j !== text2.length) {
      i = Math.min(i + 1, text1.length);
      j = Math.min(j + 1, text2.length);
      setTimeout(phase2, TEXT_ANI_SPEED);
    }
    else
      callback();
  }

  phase1();

  return {
    then: (f) => { callback = f; },
  }
}

async function startBadApple() {
  const res = await fetch("http://localhost:9999/data");
  const frames = await res.json();
  let i = 0;

  const badApple = () => {
    const frame = frames[i];
    for (let y = 0; y < HEIGHT; y++)
      for (let x = 0; x < WIDTH; x++) {
        if (frame[y][x] === 1)
          toBlack(x, y)
        else
          toWhite(x, y)
      }

    i++;
    if (i !== frames.length)
      setTimeout(badApple, 1000 / 60);
  }

  badApple();
}

function toWhite(x, y) {
  const tr = Array.from(tbody.children)[y];
  const td = Array.from(tr.children)[x];
  td.className = "rowspan_data";
}

function toBlack(x, y) {
  const tr = Array.from(tbody.children)[y];
  const td = Array.from(tr.children)[x];
  td.className = "";
}