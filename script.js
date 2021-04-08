(async () => {
  const PATH = "http://localhost:9999"
  const fetchJson = async (path) => (await fetch(path)).json();

  const transcriptJp = await fetchJson(`${PATH}/transcript_jp.json`)
  const transcriptRomaji = await fetchJson(`${PATH}/transcript_romaji.json`);
  const transcriptEn = await fetchJson(`${PATH}/transcript_en.json`);
  const transcriptVn = await fetchJson(`${PATH}/transcript_vn.json`);
  const transcripts = [transcriptJp, transcriptRomaji, transcriptEn, transcriptVn];

  const frames = await fetchJson(`${PATH}/frames.json`);
  const audio = createAudioElem();

  const table = document.querySelector(".tableheader-processed")
  const thead = table.firstElementChild;
  const tbody = thead.nextElementSibling;

  const title = document.querySelector(".title_thongtindangky");

  const clonedTable = table.cloneNode(true);
  const clonedTitle = title.cloneNode(true);

  const MAX_FRAME_RATE = 30;
  const TEXT_INTERVAL = 30;
  const CELL_REMOVE_INTERVAL = 100;
  const CELL_ADD_INTERVAL = 5;
  const TIMETABLE_SCALE_Y_INTERVAL = 20;

  const WIDTH = frames[0][0].length;
  const HEIGHT = frames[0].length;
  const ASPECT_RATIO = WIDTH / HEIGHT;

  const ROW_WIDTH = parseInt(getComputedStyle(thead).width);
  const ROW_HEIGHT = Math.round((ROW_WIDTH / ASPECT_RATIO) / HEIGHT);

  startIntro();
  const stop_id = focusOnTable();
  await modifyTimetable();  //setup need to finish before startBadApple function
  clearInterval(stop_id);
  await startBadApple();

  await wait(1000);
  console.clear();
  console.log("\nNext Dream...");
  await restoreTimetableToOriginal(clonedTable);
  await wait(1500);
  console.clear();

  //remove this script from dom
  document.querySelector("script[src='http://localhost:9999/script.js']").remove();

  //====
  async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function createAudioElem() {
    const audio = document.createElement("audio");
    audio.style.position = "fixed";
    audio.style.top = "0";
    audio.style.left = "0";
    audio.controls = true;
    audio.src = `${PATH}/Bad Apple!!.mp3`;
    return audio;
  }

  async function startIntro() {
    await new Promise(resolve => {
      let id = setInterval(removeTitle, TEXT_INTERVAL);

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
      const id = setInterval(createSongTitle, TEXT_INTERVAL);

      function createSongTitle() {
        const text1 = "【東方】Bad Apple!!【影絵】";
        const text2 = "Alstroemeria Records";
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

  function focusOnTable() {
    return setInterval(() => {
      title.scrollIntoView();
      window.scrollBy(0, -20);
    }, CELL_ADD_INTERVAL);
  }

  async function modifyTimetable() {
    table.style.tableLayout = "fixed";

    for (const tr of tbody.children) {
      tr.firstElementChild.style.overflow = "hidden";
      tr.firstElementChild.style.textOverflow = "ellipsis";
    }

    for (const th of thead.firstElementChild.children) {
      th.style.overflow = "hidden";
      th.style.textOverflow = "ellipsis";
      th.style.whiteSpace = "nowrap";
    }

    //special case: cell represents a course of type HT2
    let cell = tbody.lastElementChild.firstElementChild;
    if (cell.colSpan === 7)
      tbody.lastElementChild.remove();

    const INITIAL_CELLS_IN_ROW = 7;
    //remove initial cells
    await new Promise(resolve => {
      let i = 0;
      const id = setInterval(removeCells, CELL_REMOVE_INTERVAL);

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
      const id = setInterval(createScreen, CELL_ADD_INTERVAL);

      function createScreen() {
        if (j < INITIAL_CELLS_IN_ROW)
          j++;
        else if (j >= INITIAL_CELLS_IN_ROW && j < WIDTH) {
          const th = document.createElement("th");
          thead.firstElementChild.append(th);

          for (const tr of tbody.children) {
            const td = document.createElement("td");
            td.style.padding = 0;
            tr.appendChild(td);
          }
          j++;
        }

        if (i < HEIGHT) {
          const tr = document.createElement("tr");
          tr.style.height = `${ROW_HEIGHT}px`;
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

        if (j === WIDTH && i === HEIGHT) {
          clearInterval(id);
          resolve();
        }
      }
    });
  }

  async function startBadApple() {
    document.body.appendChild(audio);
    audio.play();

    let animationPromise;
    let subtitlesPromise;

    await new Promise(resolve => {
      audio.onplaying = () => {
        setTimeout(() => {
          animationPromise = playAnimation();
          resolve();
        }, 150); //setTimeout will try to sync the music with the animation
        setTimeout(console.clear, 0); //setTimeout to clear the mixed-content warning 
        subtitlesPromise = displaySubtitles(transcripts, audio);
        audio.onplaying = null; //prevent this handler from being called twice
      };
    });

    const songFinishedPromise = new Promise(resolve => {
      audio.addEventListener("ended", resolve);
    });

    await subtitlesPromise
    setTimeout(logCredits, 1000);

    await animationPromise;
    await songFinishedPromise
  }

  async function playAnimation() {
    return new Promise(resolve => {
      let i = 0;
      const id = setInterval(render, 1000 / MAX_FRAME_RATE);

      function render() {
        for (const tr of tbody.children) {
          tr.innerHTML = "";
        }

        const frame = frames[i];
        for (let y = 0; y < HEIGHT; y++)
          for (let x = 0; x < WIDTH; x++) {
            const code = frame[y][x];
            if (code === 2)
              continue;
            else {
              rect = getMaxRect(x, y, frame);
              addCell(rect, code);
            }
          }

        i++;
        if (i === frames.length) {
          clearInterval(id);
          resolve();
        }
      };
    });
  }

  function getMaxRect(left, top, frame) {
    let code = frame[top][left];
    let right = left;
    let bottom = top;
    let foundRight = false;
    let foundBottom = false;

    while (!foundRight || !foundBottom) {
      if (right === WIDTH) {
        right--;
        foundRight = true;
      }
      if (bottom === HEIGHT) {
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

  async function displaySubtitles(transcripts, audio) {
    const TIME_OFFSET = 0.3; //unfortunately, timeupdate event doesn't update very frequently.
    return new Promise(resolve => {
      let i = 0;
      let showed = false;
      audio.addEventListener("timeupdate", updateSubtitles);
      audio.addEventListener("ended", endAndResolve)

      function updateSubtitles() {
        const time = audio.currentTime + 0.4;
        const { from, to } = transcripts[0][i];

        if (!showed && from < time && time < to) {
          showed = true;
          const subtitles = transcripts.map(t => t[i].caption).reduce((sum, caption) => sum + "\n" + caption);
          const color = (i % 2) ? "color: white; background-color: black;" : "color: black; background-color: white;"
          console.log(`%c${subtitles}`, `${color} font-size: 13px; text-align: center; padding: 12px 100px; display:block`);
        }
        else if (showed && (time < from || to < time)) {
          showed = false;
          console.clear();
          i++;
          if (i === transcripts[0].length)
            endAndResolve();
        }
      }

      function endAndResolve() {
        audio.removeEventListener("timeupdate", updateSubtitles);
        resolve();
      }
    })
  }

  function logCredits() {
    console.log(
      "Bad Apple!! (Alstroemeria Records)" +
      "\nOriginal Composition: ZUN" +
      "\nArrangement: Masayoshi Minoshima" +
      "\nLyrics: Haruka" +
      "\nVocals: nomico" +
      "\nSource: 東方幻想郷　～ Lotus Land Story" +
      "\n======================================" +
      "\n@2021" +
      "\nCoding, Subtitles editing, Vietnamese transcript: CMB" +
      "\nSource code: https://github.com/comaybay/bad-apple-uit-timetable" +
      "\n======================================" +
      "\nSpecial thanks to:" +
      "\n  kevinjycui: for inspiring me to make this" +
      "\n  touhouwiki.net and kafkafuura: for providing song lyrics and translations" +
      "\n======================================" +
      "\nThank you for watching!"
    );
  }

  async function restoreTimetableToOriginal() {
    audio.remove();

    {
      const tablePromise = scaleTimetable(table, 1, 0);
      const titlePromise = scaleTimetable(title, 1, 0);

      await tablePromise;
      await titlePromise;
    }

    table.replaceWith(clonedTable);
    clonedTable.style.transform = `scaleY(0)`;
    title.replaceWith(clonedTitle);
    clonedTitle.style.transform = `scaleY(0)`;

    {
      const tablePromise = scaleTimetable(clonedTable, 0, 1);
      const titlePromise = scaleTimetable(clonedTitle, 0, 1);

      await tablePromise;
      await titlePromise;
    }

    async function scaleTimetable(table, start, end) {
      const startLarger = (start - end > 0);
      const speed = startLarger ? -0.005 : 0.005;
      const acc = startLarger ? -0.002 : 0.002;
      const cond = startLarger ? (val) => val <= end : (val) => val >= end;

      return new Promise(resolve => {
        let val = start;
        let sumAcc = 0;
        const id = setInterval(animation, TIMETABLE_SCALE_Y_INTERVAL);

        function animation() {
          if (cond(val)) {
            table.style.transform = `scaleY(${end})`;
            clearInterval(id);
            resolve();
            return;
          }

          table.style.transform = `scaleY(${val})`;
          val += speed + sumAcc;
          sumAcc += acc;
        }
      });
    }
  }
})();