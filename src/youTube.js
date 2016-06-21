import axios from 'axios'
import URL from 'url'
import querystring from 'querystring'
import openGraph from 'open-graph'
import VerEx from 'verbal-expressions'


export const sourceType = 'youTube'

const youTubeURLRegEx = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/i

function videoIDForURL(videoURL) {
	const matches = videoURL.match(youTubeURLRegEx)
	if (matches.length === 1) {
		return matches[0]
	}
	else {
		return null
	}
}

export function isValidVideoURL(videoURL) {
	return youTubeURLRegEx.test(videoURL)
}

function videoInfosInFeedInfo(feedInfo, videoInfoOptions) {
	return Promise.all(feedInfo['entry'].forEach((feedEntry) => (
		videoInfoForFeedEntry(feedEntry, videoInfoOptions)
	)))
}

function videoInfoForFeedEntry(feedEntry, { embedding, includeDimensions = false }) {
	const entryURL = feedEntry['id']['$t']
	const entryURLComponents = entryURL.split(':')
	const videoID = entryURLComponents[ entryURLComponents.length - 1 ]
	// TODO: change to https
	const url = `https://www.youtube.com/watch?v=${videoID}`
	
	const title = feedEntry['title']['$t']
	
	const publishedDate = feedEntry['published']['$t']
	const updatedDate = feedEntry['updated']['$t']
	
	const description = feedEntry['media$group']['media$description']['$t']
	
	const thumbnailImageURL = `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg`
	
	let videoInfo = {
		sourceType,
		videoID,
		url,
		title,
		publishedDate,
		updatedDate,
		description,
		thumbnailImageURL 
	}
	
	if (includeDimensions || embedding) {
		// Get OpenGraph info for the video URL.
		return openGraph(url)
		.then((openGraphTags) => {
			const width = parseInt(openGraphTags.video.width, 10)
			const height = parseInt(openGraphTags.video.height, 10)
			
			videoInfo.originalDimensions = {
				width,
				height
			}
			
			// TODO: Extend to work with multiple sizes (e.g. Desktop, Mobile, etc)
			if (!!embedding) {
				const embeddedWidth = embedding.width
				let embeddedHeight
				
				if (!!embedding.aspectRatio) {
					embeddedHeight = Math.round(embeddedWidth / embedding.aspectRatio)
				} else {
					const scaleFactor = embeddedWidth / width
					embeddedHeight = Math.round(height * scaleFactor)
				}
				
				const embedCode = `<iframe width="${embeddedWidth}" height="${embeddedHeight}" src="https://www.youtube.com/embed/${videoID}?wmode=opaque&amp;feature=oembed&amp;showinfo=0&amp;theme=light" frameborder="0" allowfullscreen></iframe>`
				
				videoInfo.desktopSize = {
					embedCode,
					dimensions: {
						width: embeddedWidth,
						height: embeddedHeight
					}
				}
			}
			//console.log('videoInfo', videoInfo)
			return videoInfo
		})
	}
	else {
		return Promise.resolve(videoInfo)
	}
}

export function infoForVideoWithURL(
	videoURL,
	{
		embedding,
		includeDimensions = false,
		includeDescription = true,
		includeThumbnail = true
	}
) {
	// Only accepts URLs like: www.youtube.com/watch?v=# 
	const videoURLObject = URL.parse(videoURL, true)
	// TODO: use videoIDForURL
	const videoID = videoURLObject.query['v']
	// TODO: change to https
	const youTubeVideoFeedURL = `https://gdata.youtube.com/feeds/api/videos/${videoID}?alt=json&v=2`
	
	return (
		axios.get(youTubeVideoFeedURL)
		.then(({ data }) => (
			videoInfoForFeedEntry(data['entry'], {
				embedding,
				includeDimensions,
				includeDescription,
				includeThumbnail
			})
		))
	)
}
