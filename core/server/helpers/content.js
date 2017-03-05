// # Content Helper
// Usage: `{{content}}`, `{{content words="20"}}`, `{{content characters="256"}}`
//
// Turns content html into a safestring so that the user doesn't have to
// escape it or tell handlebars to leave it alone with a triple-brace.
//
// Enables tag-safe truncation of content by characters or words.

var hbs             = require('express-hbs'),
    _               = require('lodash'),
    downsize        = require('downsize'),
    downzero        = require('../utils/downzero'),
    content;

content = function (options) {
    var truncateOptions = (options || {}).hash || {};
    truncateOptions = _.pick(truncateOptions, ['words', 'characters', 'more']);
    _.keys(truncateOptions).map(function (key) {
        truncateOptions[key] = parseInt(truncateOptions[key], 10);
    });

    if (truncateOptions.hasOwnProperty('more')) {
        var m = this.html.indexOf("<!--more-->");
        if (m != -1) {
            this.html = this.html.slice(0,m);
        }
        return new hbs.handlebars.SafeString(this.html);
    }

    if (truncateOptions.hasOwnProperty('words') || truncateOptions.hasOwnProperty('characters')) {
        // Legacy function: {{content words="0"}} should return leading tags.
        if (truncateOptions.hasOwnProperty('words') && truncateOptions.words === 0) {
            return new hbs.handlebars.SafeString(
                downzero(this.html)
            );
        }

        return new hbs.handlebars.SafeString(
            downsize(this.html, truncateOptions)
        );
    }

    this.html = this.html.replace(/<pre><code>/ig,'<pre><code class="language-none">').replace(/<a href=\"(\/|http|ftp)/ig,'<a target="_blank" href="$1').replace(/\[coll title="(.+?)"\]/ig,'<h3>$1<sup><a href="javascript:void(0)" class="coll-btn">展开</a></sup></h3><section class="coll-content" style="display:none;">').replace(/\[\/coll\]/ig,'</section>').replace(/<img src=/ig,'<img class="lazy" data-original=');

    return new hbs.handlebars.SafeString(this.html);
};

module.exports = content;
