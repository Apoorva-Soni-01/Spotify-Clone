let songs;
let currentSong = new Audio();
let currFolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = mins.toString().padStart(2, "0");
  const formattedSecs = secs.toString().padStart(2, "0");

  return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let idx = 0; idx < as.length; idx++) {
    const element = as[idx];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML + `<li data-file="${song}">
                <img src="imgs/music.svg" class="song-img">
                <div class="info">
                  <div>${song.replaceAll("-", " ").replace(".mp3"," ")}</div>
                </div></li>`;
  }

  Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      const originalFile = e.getAttribute("data-file");
      playMusic(originalFile);
    });
  });
  

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    plays.src = "imgs/pause.svg";
  }

  document.querySelector(".song-info").innerHTML = decodeURI(track.replace(".mp3"," ").replaceAll("-"," "));
  document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  let cardContainer = document.querySelector(".card-container");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-1)[0];
      try {
        let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
        let response = await a.json();
        console.log(response);
        cardContainer.innerHTML = cardContainer.innerHTML +`<div data-folder="${folder}" class="cards">
              <div class="play">
                <svg data-encore-id="icon" role="img" aria-hidden="true" class="e-9960-icon e-9960-baseline" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path></svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="">
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`;
      } catch (err) {
        console.warn(`Skipping folder "${folder}": ${err.message}`);
      }
    }
  }

  Array.from(document.getElementsByClassName("cards")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });

}

async function main() {
  await getSongs("songs/Classicals");

  displayAlbums();

  playMusic(songs[0], true);

  plays.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      plays.src = "imgs/pause.svg";
    } else {
      currentSong.pause();
      plays.src = "imgs/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seek-bar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector("#close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  document.querySelector("#prev").addEventListener("click", () => {
    currentSong.pause();
    console.log("prev clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  document.querySelector("#next").addEventListener("click", () => {
    currentSong.pause();
    console.log("next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
      console.log("Volume Value", e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  document.querySelector(".vol img").addEventListener("click", e=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src= e.target.src.replace("volume.svg","mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value= 0;
    }else{
      e.target.src= e.target.src.replace("mute.svg","volume.svg")
      currentSong.volume = 0.5;
      document.querySelector(".range").getElementsByTagName("input")[0].value= 50;
    }
  })


}

main();
