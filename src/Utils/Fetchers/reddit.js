module.exports = async function (reddit, options = {}) {
  options.image = !!options.image || true;
  options.nsfw = !!options.nsfw || false;
  options.description = !!options.description || true;
  options._tries = options._tries || 0;
  const base = `https://api.reddit.com/r/${reddit}/random`;
  const axios = require("axios");
  return new Promise((resolve, reject) => {
    axios
      .get(base)
      .then((res) => {
        if (!res.data) return reject(`No such Subreddit was found.`);
        let listing;
        if (Array.isArray(res.data)) listing = res.data[0].data;
        else if (typeof res.data == "object") listing = res.data.data;
        if (!listing) return reject(`No Listing was found.`);
        const post = listing.children[0] ? listing.children[0].data : false;
        if (!post) return reject(`No Post was found.`);
        if (options._tries > 3) return reject(`Too Many Tries`);
        if (post.over_18 && !options.nsfw) {
          ++options._tries;
          return redditF(reddit, options);
        }
        const result = {
          name: post.title || null,
          text: options.description && post.selftext ? post.selftext : null,
          subreddit: {
            name: post.subreddit_name_prefixed || null,
            subreddit: post.subreddit_name_prefixed || null,
            url: post.subreddit_name_prefixed
              ? `https://reddit.com/${post.subreddit_name_prefixed}`
              : null,
            subscribers: post.subreddit_subscribers || 0,
          },
          url: `https://reddit.com${post.permalink}` || null,
          image:
            options.image && post.url && checkURL(post.url) ? post.url : null,
          score: post.score || null,
          likes: post.ups || 0,
          dislikes: post.downs || 0,
          comments: post.num_comments,
          nsfw: post.over_18,
          source: "Reddit",
          raw: post,
        };
        resolve(result);
      })
      .catch((e) => reject(e));
  });
}

function checkURL(url) {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}
