# Vue Mastery dl

**Caution: This script was made just for fun as a weekend project without intent to falsify videos or doing any illegal activities related to Vue Mastery videos. Use of downloaded videos is strictly prohibited. If you want to watch them, go to Vue Mastery official site!**

## Install

```bash
git clone git@github.com:serkanerip/vuemastery-dl.git
cd vuemastery-dl
npm install
```

## Prepare Environment File

```bash
cp .env.example .env
```

Fill your email and password, and you can change settings like video quality and chunks. This are default values

```
EMAIL=
PASSWORD=

VIDEO_QUALITY=720p
CHUNKS=10
```

## Set which courses you want to download

In **courses.js** file push the course that you want to download in the array. There is also a bunch of course urls in file but commented you can easly uncomment and download those are.

```js
// Put courses you want in this array

module.exports = [
  "https://www.vuemastery.com/courses/vuex-fundamentals/vuex4-intro-to-vuex",
];
```

## Get Courses Video Lists

```bash
node index.js
```

And for the each course a json file will be created in course-video-lists directory which contains download urls of videos.

## Download Videos

```bash
node scripts/download-from-json.js course-video-lists/example.json
```

There will be an extra file named **all.json**, which contains all download urls of courses. You can use this file to download all courses in one step but if downloading videos take too much time maybe remaining videos will be expired.

Videos will be download in to the downloads directory.
