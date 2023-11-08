const extractVideoUrlAndFilename = require('../../src/helpers/extractVideoUrlAndFilename')

describe('extractVideoUrlAndFilename', () => {
  it('returns the videoUrl and filename', () => {
    const url = 'https://v16-web.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068/fad12589f3f14a59a487c18c4b38dfef/?a=1988&br=2078&bt=1039&cd=0%7C0%7C1&ch=0&cr=0&cs=0&cv=1&dr=0&ds=3&er=&expire=1619905803&l=202105011549200101890730770F48E3A2&lr=tiktok_m&mime_type=video_mp4&net=0&pl=0&policy=2&qs=0&rc=M3lwZjc5bzVnZzMzZjczM0ApMzU4ZmY0O2RnN2Y0NjxkNmdnNGJoXzZnaGVfLS0zMTZzc2NgYDQyNDJjLV9gLS1fNi06Yw%3D%3D&signature=c8fcac460fcf208c076e38e226b2fcaf&tk=tt_webid_v2&vl=&vr='
    const contentType = 'video/mp4'

    expect(extractVideoUrlAndFilename(url, contentType)).toEqual({
      videoUrl: url,
      filename: 'fad12589f3f14a59a487c18c4b38dfef.mp4'
    })
  })
})
