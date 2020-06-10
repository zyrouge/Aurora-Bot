async function reddit(subreddit, options = {}) {
  options.image = !!options.image || true;
  options.nsfw = !!options.nsfw || false;
  options.description = !!options.description || true;
  const base = `https://api.reddit.com/r/${subreddit}/random`;
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
        if (post.over_18 && !options.nsfw) return reject(`Post found was NSFW.`);
        let image = null;
        if(
          post.crosspost_parent_list &&
          post.crosspost_parent_list.secure_media &&
          post.crosspost_parent_list.secure_media.thumbnail_url &&
          checkURL(post.crosspost_parent_list.secure_media.thumbnail_url)
        ) image = post.crosspost_parent_list.secure_media.thumbnail_url;
        if(post.url && checkURL(post.url)) image = post.url;
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
          image,
          thumbnail: post.thumbnail && checkURL(post.thumbnail) ? post.thumbnail : null,
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

module.exports = reddit;

function checkURL(url) {
  return url.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i) != null;
}
