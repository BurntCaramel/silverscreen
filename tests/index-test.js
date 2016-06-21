import expect from 'expect'

import { typeForVideoURL } from 'src/index'

import { canWorkWithVideoURL as isYouTubeURL, sourceType as youTubeType } from './youTube'
import { canWorkWithVideoURL as isVimeoURL, sourceType as vimeoType } from './vimeo'

const exampleVideoURLs = {
	youTube1: 'https://youtube.com/watch?v=sSZj8v_Dqzk',
	vimeo1: 'https://vimeo.com/165384179'
}

describe('Module template', () => {
  it('Validate video URLs', () => {
    expect(isYouTubeURL(exampleVideoURLs.youTube1)).toBe(true)
		expect(isVimeoURL(exampleVideoURLs.youTube1)).toBe(false)

		expect(isYouTubeURL(exampleVideoURLs.vimeo1)).toBe(false)
		expect(isVimeoURL(exampleVideoURLs.vimeo1)).toBe(true)

		expect(typeForVideoURL(exampleVideoURLs.youTube1)).toBe(youTubeType)
		expect(typeForVideoURL(exampleVideoURLs.vimeo1)).toBe(vimeoType)
  })
})
