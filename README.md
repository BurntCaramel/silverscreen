# silverscreen

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

## Example

```js
import SilverScreen from 'silverscreen'

typeForVideoURL('https://vimeo.com/165384179')
// => 'vimeo'
 
infoForVideoWithURL('https://vimeo.com/165384179') 
/* =>
{
  "sourceType": "vimeo",
  "videoID": 165384179,
  "url": "https://vimeo.com/165384179",
  "title": "Georgia Dow: Release Notes 2015",
  "publishedDate": "2016-05-04 21:35:32",
  "updatedDate": null,
  "description": "Psychotherapist Georgia Dow explores the psychology of making your customers happy. Every app leaves its user with a feeling. How can you craft your user experience of your product to help ensure that feeling is a positive one? Georgia offers concrete tips on doing exactly that,
   and explores ideas for building a happy community of customers around your apps.",
  "thumbnailImageURL": "https://i.vimeocdn.com/video/569280413_640.jpg"
}
*/
```

## Demo

```
POST https://silverscreen-0-1-2.now.sh/infoForVideoWithURL { "args": [ "https://vimeo.com/165384179" ] }
```

[build-badge]: https://img.shields.io/travis/RoyalIcing/silverscreen/master.svg?style=flat-square
[build]: https://travis-ci.org/RoyalIcing/silverscreen

[npm-badge]: https://img.shields.io/npm/v/silverscreen.svg?style=flat-square
[npm]: https://www.npmjs.org/package/silverscreen

[coveralls-badge]: https://img.shields.io/coveralls/RoyalIcing/silverscreen/master.svg?style=flat-square
[coveralls]: https://coveralls.io/github/RoyalIcing/silverscreen
