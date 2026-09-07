# HackerRivals GitHub Pages site

This version is designed so a non programmer can maintain changing website content without editing the HTML, CSS or JavaScript.

## Two configuration files

**`site-config.txt`** is the working configuration and currently contains a complete preview of the site. Current public HackerRivals information is prefilled where available. Clearly marked mock values are used for unfinished items such as cash totals, city states and some destination links.

**`site-config-template.txt`** is the clean starting template. Rename it to `site-config.txt` when you want to remove the mock variable data. Real FAQ content, competition rules, Code of Conduct and the WhatsApp community URL are retained in the template so they do not need to be reentered.

## What `site-config.txt` controls

* external links
* city names, countries, Compete / Host / Celebrate state and destination URLs
* leaderboard team names, members, points and cash totals
* FAQ content
* competition rules
* Code of Conduct content
* past sponsor names and logo paths
* cache version for replaceable images

## Replaceable images

Team logos use permanent filenames in `content/team-logos/`:

* `01-team-logo.png`
* `02-team-logo.png`
* `03-team-logo.png`
* `04-team-logo.png`
* `05-team-logo.png`

Replace the image without changing its filename.

City images use the same approach in `content/city-images/` with `01-city.jpg` through `06-city.jpg`.

Sponsor assets that are stored locally live in `content/sponsor-logos/`. The sponsor list and image paths are controlled by `[SPONSOR]` sections in the text config.

See **`HOW-TO-UPDATE.txt`** for simple step by step instructions.

## GitHub Pages

There is no build process. Commit the site files and enable GitHub Pages for the repository. The browser loads `site-config.txt` at runtime.

Opening `index.html` directly using a `file://` URL may not work because browsers normally block local `fetch()` requests. Use GitHub Pages or any normal local web server for testing.
