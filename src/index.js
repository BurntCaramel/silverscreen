import * as youTube from './youTube'
import * as vimeo from './vimeo'

export function typeForVideoURL(videoURL) {
	if (youTube.isValidVideoURL(videoURL)) {
		return youTube.sourceType
	}
	else if (vimeo.isValidVideoURL(videoURL)) {
		return vimeo.sourceType
	}
	else {
		return
	}
}

function handlerForVideoURL(videoURL) {
	switch ((typeForVideoURL(videoURL))) {
	case youTube.sourceType: return youTube
	case vimeo.sourceType: return vimeo
	default: return
	}
}

export function infoForVideoWithURL(videoURL, options) {
	const handler = handlerForVideoURL(videoURL)
	if (handler) {
		return handler.infoForVideoWithURL(videoURL, options)
	}
}
