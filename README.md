# Insta Focus – messages and posts, no Reels

Use Instagram for DMs and your feed without Reels.

Instagram doesn't let other apps read your messages or feed, so Insta Focus
runs on top of **instagram.com** in your browser instead:

- ✅ Keeps: your feed with photos and posts, profiles, stories, **Direct messages**
- 🚫 Hides: the **Reels** tab, Reels in the feed, "suggested reels", the Reels tab on profiles
- ↪️ Redirects: opening `/reels/` sends you to your feed, and `/username/reels/` sends you to that profile
- ⚙️ Optional (on by default): blocks single reels, including ones people send you in DMs, and hides **Explore**

## Install

### Computer (Chrome, Edge, Brave, Arc)
1. Download this folder.
2. Go to `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and choose the `extension` folder.
4. Open instagram.com. To change the settings, click the extension icon.

### Computer (Firefox)
1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and choose `extension/manifest.json`.
   Firefox removes temporary add-ons when it restarts. To keep it, sign the add-on on addons.mozilla.org.

### iPhone / iPad (Safari)
1. Install the free **Userscripts** app from the App Store and turn it on in
   *Settings → Safari → Extensions*.
2. Save `insta-focus.user.js` into the Userscripts folder.
3. Open instagram.com in Safari and log in. Tap **Aa → Add to Home Screen** to get an app icon.

### Android
- **Firefox for Android:** install **Tampermonkey** or **Violentmonkey** from the add-ons menu, then open `insta-focus.user.js` in the browser to install it.
- **Kiwi / other Chromium browsers with extensions:** load the `extension` folder like on a computer.

Then use instagram.com in that browser instead of the Instagram app. You can
delete the app, or at least move it off your home screen.

## Settings
| Setting | Default | What it does |
|---|---|---|
| Filter active | on | Master switch |
| Block single reels | on | Hides reel posts, reel links and reels shared in DMs, and blocks `/reel/…` pages |
| Hide Explore | on | Hides Explore, which is mostly Reels |

The extension has a popup for these settings. In the userscript, edit `DEFAULTS` near the top of the file.

## How it works
`extension/content.js` runs before instagram.com loads. It hides elements
based on where their links point (`/reels/`, `/reel/…`, `/explore/`), because
Instagram's CSS class names are random and change often. Instagram is a
single-page app, so the script also watches for new content and URL changes.

`insta-focus.user.js` is generated from the same file. After editing
`content.js`, run:

```sh
./build-userscript.sh
```

If Instagram changes its site and a Reels entry point shows up again, add a
selector to `STYLES` in `content.js`.
