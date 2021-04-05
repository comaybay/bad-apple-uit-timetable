(async () => {
  const PATH = "http://localhost:9999"
  const res = await fetch(`${PATH}/frames.json`);
  const frames = await res.json();

  const table = document.querySelector(".tableheader-processed")
  const thead = table.firstElementChild;
  const tbody = thead.nextElementSibling;

  const TEXT_SPEED = 30;
  const MAX_FRAME_RATE = 30;

  const width = frames[0][0].length;
  const height = frames[0].length;
  const aspectRatio = width / height;

  const rowWidth = parseInt(getComputedStyle(thead).width);
  const rowHeight = Math.round((rowWidth / aspectRatio) / height);


  startIntro();
  await setup();  //setup need to finish before startBadApple function
  startBadApple();

  async function setup() {
    table.style.tableLayout = "fixed";

    for (const tr of tbody.children) {
      tr.firstElementChild.style.overflow = "hidden";
      tr.firstElementChild.style.textOverflow = "ellipsis";
    }

    for (const th of thead.firstElementChild.children) {
      th.style.overflow = "hidden";
      th.style.textOverflow = "ellipsis";
    }

    //special case: cell represents a course of type HT2
    let cell = tbody.lastElementChild.firstElementChild;
    if (cell.colSpan === 7)
      tbody.lastElementChild.remove();

    const INITIAL_CELLS_IN_ROW = 7;
    //remove initial cells
    await new Promise(resolve => {
      let i = 0;
      const id = setInterval(removeCells, 100);

      function removeCells() {
        for (const tr of tbody.children) {
          if (tr.lastElementChild)
            tr.lastElementChild.remove();
        }

        i++;
        if (i === INITIAL_CELLS_IN_ROW) {
          clearInterval(id);
          resolve();
        }
      }
    });

    //create display screen from cells 
    await new Promise(resolve => {
      tbody.innerHTML = "";
      let i = 0;
      let j = 0;
      const id = setInterval(createScreen, 10);

      function createScreen() {
        if (j < INITIAL_CELLS_IN_ROW)
          j++;
        else if (j >= INITIAL_CELLS_IN_ROW && j < width) {
          const th = document.createElement("th");
          thead.firstElementChild.append(th);

          for (const tr of tbody.children) {
            const td = document.createElement("td");
            td.style.padding = 0;
            tr.appendChild(td);
          }
          j++;
        }

        if (i < height) {
          const tr = document.createElement("tr");
          tr.style.height = `${rowHeight}px`;
          tr.className = (i % 2) ? "odd" : "even";

          const cellCount = Math.max(j, INITIAL_CELLS_IN_ROW);
          for (let k = 0; k < cellCount; k++) {
            const td = document.createElement("td");
            td.style.padding = 0;
            tr.appendChild(td);
          }
          tbody.append(tr);

          i++;
        }

        if (j === width && i === height) {
          clearInterval(id);
          resolve();
        }
      }
    });
  }

  async function startIntro() {
    const title = document.querySelector(".title_thongtindangky");

    await new Promise(resolve => {
      let id = setInterval(removeTitle, TEXT_SPEED);

      function removeTitle() {
        const text1 = title.firstChild.nodeValue;
        const text2 = title.firstElementChild.innerText;
        title.firstChild.nodeValue = text1.slice(0, -1);
        title.firstElementChild.innerText = text2.slice(0, -1);

        if (text1.length === 0 && text2.length === 0) {
          clearInterval(id);
          resolve();
        }
      }
    });

    await new Promise(resolve => {
      let i = 1;
      let j = 1;
      const id = setInterval(createSongTitle, TEXT_SPEED);

      function createSongTitle() {
        const text1 = "【東方】Bad Apple!!【影絵】";
        const text2 = "Nomico";
        title.firstChild.nodeValue = text1.slice(0, i);
        title.firstElementChild.innerText = text2.slice(0, j);

        if (i !== text1.length || j !== text2.length) {
          i = Math.min(i + 1, text1.length);
          j = Math.min(j + 1, text2.length);
        }
        else {
          clearInterval(id);
          resolve();
        }
      }
    });
  }

  function startBadApple() {
    const audio = document.createElement("audio");
    audio.style.position = "fixed";
    audio.style.top = "0";
    audio.style.left = "0";
    audio.controls = true;
    audio.src = `${PATH}/Bad Apple!!.mp3`;
    document.body.appendChild(audio);
    audio.play();
    audio.onplaying = () => setTimeout(playAnimation, 150); //try to sync the music with the animation 
  }

  function playAnimation() {
    let i = 0;
    const id = setInterval(render, 1000 / MAX_FRAME_RATE);

    function render() {
      for (const tr of tbody.children) {
        tr.innerHTML = "";
      }

      const frame = frames[i];
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          const code = frame[y][x];
          if (code === 2)
            continue;
          else {
            rect = getMaxRect(x, y, frame);
            addCell(rect, code);
          }
        }

      i++;
      if (i === frames.length)
        clearInterval(id);
    };
  }

  function getMaxRect(left, top, frame) {
    let code = frame[top][left];
    let right = left;
    let bottom = top;
    let foundRight = false;
    let foundBottom = false;

    while (!foundRight || !foundBottom) {
      if (right === width) {
        right--;
        foundRight = true;
      }
      if (bottom === height) {
        bottom--;
        foundBottom = true;
      }


      if (!foundRight) {
        for (let i = top; i <= bottom; i++) {
          if (frame[i][right] !== code) {
            right--;
            foundRight = true;
            break;
          }
        }
      }

      if (!foundBottom) {
        for (let j = left; j <= right; j++) {
          if (frame[bottom][j] !== code) {
            bottom--;
            foundBottom = true;
            break;
          }
        }
      }

      if (!foundRight) {
        for (let i = top; i <= bottom; i++)
          frame[i][right] = 2;
      }

      if (!foundBottom) {
        for (let j = left; j <= right; j++)
          frame[bottom][j] = 2;
      }

      if (!foundRight) right++;
      if (!foundBottom) bottom++;

    }

    return {
      x: left,
      y: top,
      width: right - left + 1,
      height: bottom - top + 1,
    }
  }

  function addCell(rect, code) {
    const tr = Array.from(tbody.children)[rect.y];
    const td = document.createElement("td");
    td.colSpan = rect.width;
    td.rowSpan = rect.height;
    td.style.padding = 0;
    td.className = (code === 1) ? "" : "rowspan_data";
    tr.appendChild(td);
  }
})();


