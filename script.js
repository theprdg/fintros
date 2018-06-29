window.onload = function () {

  let numArticles = 30, //number of articles to populate at a time
    indexStart = 0, //starting index for each new block of articles
    bullet = 1, //article numbering
    showNext30 = true; //show next 30 articles (happens once, will become false thereafter)

  //query IDs of top stories from Hacker News
  getData('topstories.json')
    .then((result) => {
      let storyId = JSON.parse(result.response);
      addArticles(storyId, indexStart);
      return storyId;
    })
    .then((storyId) => {

      //function to capture scroll event and trigger loading of the next
      //30 articles upon scrolling to bottom of page
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
    .catch((error) => {
      console.log(error)
    })

  //GET query for IDs of top stories and articles
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

  //function to generate dynamic data from GET query
  function addArticles(storyId, index) {
    let re = /:\/\/(.[^/]+)/, //regex to isolate domain of article URL
      arr = [], //array to store query path for GET query
      url = '',
      domain = '';
    if (showNext30 === true) {

      //generate array of GET query paths
      for (let i = index; i < index + numArticles; i++) {
        arr.push("item/" + storyId[i] + ".json");
      }

      //generate articles to populate front page
      Promise.all(arr.map((item, index) => {
        return getData(item)
      }))
        .then((result) => {
          result.map((item, index) => {
            let story = JSON.parse(item.response),
              newsBox = document.getElementsByClassName("newsBox")[0];

            //conditions dealing with undefined URLs
            if (story.url !== undefined) {
              url = story.url.match(re)[1];
              domain = "(" + url + ")"
            }
            else {
              url = "https://news.ycombinator.com/from?site=" + story.id;
              domain = ''
            }

            //add new articles to page
            newsBox.innerHTML +=
              `
            <div class="article">
              <div class="bullet">
                ${bullet}.
                <span class="upvote">&#x25B2;</span>
              </div>
              <div class="articleDetails">
                <div class="articleTitle">
                <a href="${url}">${story.title} </a>
                <a class="domain" href="https://news.ycombinator.com/from?site=${url}">${domain}</span>
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
            bullet++
          })
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}