window.onload = function () {

  let numArticles = 30,
    indexStart = 0,
    newsBlk = '',
    bullet = 0,
    showNext30 = true;

  getData('topstories.json')
    .then((result) => {
      let storyId = JSON.parse(result.response);
      addArticles(storyId, indexStart);
      return storyId;
    })
    .then((storyId) => {
      window.onscroll = function () {
        let body = document.getElementsByClassName("container")[0],
          bodyHeight = body.offsetHeight,
          pageYOffset = window.pageYOffset,
          scrollPos = pageYOffset + window.innerHeight;

        if (scrollPos >= bodyHeight) {
          indexStart += numArticles + 1;
          addArticles(storyId, indexStart);
          showNext30 = false;
        }
      }
    })

  function getData(path) {
    return new Promise(function (resolve, reject) {
      let http = new XMLHttpRequest();
      http.onload = function () {
        if (http.readyState === 4 && http.status === 200) {
          resolve(http);
        }
        else if (http.status !== 200) {
          console.log('Error:', http.status)
        }
      }

      http.open("GET", "https://hacker-news.firebaseio.com/v0/" + path, true);
      http.send();
    })
  }

  function addArticles(storyId, index) {
    let re = /:\/\/(.[^/]+)/;

    if (showNext30 === true) {
      for (let i = index; i < index + numArticles; i++) {

        let promise1 = new Promise(function (resolve, reject) {
          resolve(getData("item/" + storyId[i] + ".json"))
        })
        
        promise1.then((result) => {
          console.log(result)
          if (result) {

            bullet++
            let story = JSON.parse(result.response),
              newsBox = document.getElementsByClassName("newsBox")[0];

            newsBlk +=
              `
            <div class="article">
              <div class="bullet">
                ${bullet}.
                <span class="upvote">&#x25B2;</span>
              </div>
              <div class="articleDetails">
                <div class="articleTitle">
                <a href="${story.url}">${story.title} </a>
                <a class="domain" href="https://news.ycombinator.com/from?site=${story.url}">(${story.url})</span>
              </div>
              <div class="articleSubtext">
                ${story.score} points by 
                <a href="https://news.ycombinator.com/user?id=${story.by}">${story.by}</a>
                <a href="https://news.ycombinator.com/item?id=${story.id}"> ${Math.floor((Date.now() / 1000 - story.time) / (60 * 60))} hours ago
                </a> | 
                <a href="https://news.ycombinator.com/hide?id=${story.id}&goto=news">hide</a> | 
                <a href="https://news.ycombinator.com/item?id=${story.id}">${story.descendants} comments</a>
              </div>
              </div>
            </div>
            `

            if (i === index + numArticles - 1) {
              newsBox.innerHTML += newsBlk;
              newsBlk = '';
            }
          }
        })
      }
    }
  }
}