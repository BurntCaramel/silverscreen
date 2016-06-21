import axios from 'axios'
import URL from 'url'
import querystring from 'querystring'
import openGraph from 'open-graph'
import VerEx from 'verbal-expressions'


export const sourceType = 'vimeo'

const digitRE = VerEx().range('0', '9').stopAtFirst(true)

const nameComponentRE = VerEx()
.anythingBut(digitRE)
.anythingBut('/')
.then('/')
.stopAtFirst(true)
	
const vimeoURLRegEx = VerEx()
.startOfLine()
.maybe('http')
.maybe('s')
.maybe(':')
.maybe('//')
.maybe('www.')
.then('vimeo.com/')
.maybe('ondemand/')
.maybe(nameComponentRE)
.maybe(nameComponentRE)
.multiple(digitRE)
.maybe('/')
.endOfLine()
.withAnyCase()
.stopAtFirst(true) // Remove stateful g flag: http://stackoverflow.com/questions/1520800/why-regexp-with-global-flag-in-javascript-give-wrong-results
	
	
function videoIDForURL(videoURL) {
	const matches = videoURL.match(vimeoURLRegEx)
	if (matches.length === 1) {
		return matches[0]
	}
	else {
		return null
	}
}

export function isValidVideoURL(videoURL) {
	return vimeoURLRegEx.test(videoURL)
}

function videoInfosInVimeoInfoList(videoInfoList, videoInfoOptions) {
	return Promise.all(videoInfoList.forEach((videoInfo) => (
		videoInfoForAPIInfo(videoInfo[0], videoInfoOptions)
	)))
}
	
function videoInfoForAPIInfo(
	videoInfoFromAPI,
	{
		embedding,
		includeDimensions = false,
		includeDescription = true,
		includeThumbnail = true
	}
) {
	// /video or /oembed API
	const videoID = videoInfoFromAPI['id'] || videoInfoFromAPI['video_id']
	
	// /oembed API doesn't provide a URL
	const url = videoInfoFromAPI['url'] || `https://www.vimeo.com/${videoID}`
	
	const title = videoInfoFromAPI['title']
	
	const publishedDate = videoInfoFromAPI['upload_date']
	const updatedDate = null
	
	const description = videoInfoFromAPI['description']
	
	// Differences between /oembed and /video
	const thumbnailImageURL = videoInfoFromAPI['thumbnail_url'] || videoInfoFromAPI['thumbnail_large'] 
	
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
	
	let oEmbedPromise = null
	
	if (includeDimensions || embedding) {
		const { width, height } = videoInfoFromAPI
		
		videoInfo.originalDimensions = {
			width,
			height
		}
		
		// TODO: Extend to work with multiple sizes (e.g. Desktop, Mobile, etc)
		if (embedding) {
			const embeddedWidth = embedding.width
			let embeddedHeight
			if (!!embedding.aspectRatio) {
				embeddedHeight = Math.round(embeddedWidth / embedding.aspectRatio)
			}
			else {
				const scaleFactor = embeddedWidth / width
				embeddedHeight = Math.round(height * scaleFactor)
			}
			
			/*
			embedCode = "<iframe width=\"#{embeddedWidth}\" height=\"#{embeddedHeight}\" src=\"http://www.youtube.com/embed/#{videoID}?wmode=opaque&feature=oembed&showinfo=0&theme=light\" frameborder=\"0\" allowfullscreen></iframe>"
			*/
			
			return promiseVimeoOEmbed({
				url,
				maxwidth: embeddedWidth,
				width: embeddedWidth,
				maxheight: embeddedHeight,
				byline: false,
				title: false
			})
			.then((oembedInfo) => {
				videoInfo.desktopSize = {
					embedCode: oembedInfo['html'],
					dimensions: {
						width: oembedInfo['width'] || embeddedWidth,
						height: oembedInfo['height'] || embeddedHeight
					}
				}
	
				// /oembed has a larger thumbnail for some reason.
				videoInfo.thumbnailImageURL = oembedInfo['thumbnail_url']
	
				return videoInfo
			})
		}
	}
	
	return Promise.resolve(videoInfo)
}


function promiseVimeoOEmbed(options = {}) {
const url = `https://vimeo.com/api/oembed.json?${querystring.stringify(options)}`
return axios.get(url)
.then(({ data }) => data)
}		
	
export function infoForVideoWithURL(
	videoURL,
	videoInfoOptions
) {
	return promiseVimeoOEmbed({ url: videoURL })
	.then((oembedData) => (
		axios.get(`https://vimeo.com/api/v2/video/${oembedData.video_id}.json`)
		.then(({ data }) => (
			videoInfoForAPIInfo(data[0], videoInfoOptions)
		))
		.catch((error) => {
			console.log('Vimeo /video API error', error)
			return videoInfoForAPIInfo(oembedData, videoInfoOptions)
		})
	))
}