const { existsSync, mkdirSync } = require('fs')

const { firefox } = require('playwright')
const ora = require('ora')

const getUser = require('./helpers/getUser')
const getFilesIn = require('./helpers/getFilesIn')
const scrollToBottom = require('./helpers/scrollToBottom')
const extractVideoUrlAndFilename = require('./helpers/extractVideoUrlAndFilename')
const downloadVideo = require('./helpers/downloadVideo')
const CaptchaSolver = require('tiktok-captcha-solver')

class TikTokPlaywright {
  user
  downloadDir
  redownload

  browser
  context
  page

  filesInDownloadDir = {}
  videoFeedUrls = []
  videoFeedItems = []
  pendingDownloads = {}
  downloadsCompleted = 0

  spinner

  get defaults() {
    return {
      quiet: true,
      redownload: false,
    }
  }

  async download(user, options) {
    const { downloadDir, redownload, quiet } = Object.assign(
      this.defaults,
      { downloadDir: `./${getUser(user)}` },
      options
    )

    this.user = user
    this.downloadDir = downloadDir
    this.redownload = redownload

    this.spinner = ora({ isSilent: quiet }).start('Initializing')

    return await this._initialize()
      .then(async () => await this._navigateTo(this.user))
      .then(async () => await this._scrollToBottom())
      .then(async () => await this._getVideoFeedItems())
      .then(async () => await this._waitForDownloads())
      .catch(async (e) => await this._onError(e))
  }

  async _initialize() {
    this.browser = await firefox.launch({
      headless: true,
      devtools: false,
    })

    this.context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36 Edg/103.0.1264.37'
    })
    this.page = await this.context.newPage()

    TikTokPlaywright.createDownloadDir(this.downloadDir)
    this.filesInDownloadDir = await getFilesIn(this.downloadDir)
  }

  async _navigateTo(user) {
    this.catchaSolver = new CaptchaSolver(this.page)


    this.spinner.text = `Navigating to ${user}`

    await this.page.goto(`https://www.tiktok.com/login`)
    await this.page.goto(`https://www.tiktok.com/@${user}`)
    await this.page.waitForLoadState('networkidle')

    this.spinner.text = `Solving captcha`
    return await this.catchaSolver.solve()
  }

  async _scrollToBottom() {
    await this.page.click('button:has-text("Accept all")')
    this.spinner.text = 'Scrolling through videos'
    await scrollToBottom(this.page, this.catchaSolver, 2000, 1000)
    this.spinner.text = `Solving captcha`
    await this.catchaSolver.solve()
    await this.page.waitForTimeout(3000)
    this.spinner.text = 'Scrolling through videos again'
    await scrollToBottom(this.page, this.catchaSolver, 2000, 1000)
  }

  async _getVideoFeedItems() {
    this.spinner.text = 'Downloading videos'
    this.videoFeedUrls = await this.page.$$('[data-e2e="user-post-item-desc"] a');

    await Promise.all(this.videoFeedUrls.map(async (item) => {
      let href = await item.getProperty('href');
      let url = await href.jsonValue();
        try {
          if(url.includes("/video/")){
            await this._getVideoNoWM(url)
          }
        } catch (error) {
          await this.catchaSolver.solve()
        }
    }));
  }

  async _getVideoNoWM(url) {
    const idMedia = await this._getIdMedia(url)
    const API_URL = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idMedia}`;

    const request = await fetch(API_URL, {
        method: "GET",
        headers: {
          'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet'
      }
    });

    const body = await request.text();
    try {
        var res = JSON.parse(body);
    } catch (err) {
        console.error("Error:", err);
        console.error("Response body:", body);
    }
    
    if(res.aweme_list[0].image_post_info){
      let items = []
      for(const index in res.aweme_list[0].image_post_info.images){
        const urlMedia = res.aweme_list[0].image_post_info.images[index].display_image.url_list[1]
        const idMediaIterator = `${idMedia} - ${index}`
        const data = {
          url: urlMedia,
          id: idMediaIterator,
          type: 'jpeg'
        }
        items.push(data);
      }
      return await this._downloadImages(items)
    }else{
      const urlMedia = res.aweme_list[0].video.play_addr.url_list[0]
      const data = {
        url: urlMedia,
        id: idMedia,
        type: 'mp4'
      }
      return await this._downloadVideo(data)
    }
    
  }

  async _getIdMedia(url) {
    const matching = url.includes("/video/")
    if (!matching) {
        exit();
    }
    const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
    return (idVideo.length > 19) ? idVideo.substring(0, idVideo.indexOf("?")) : idVideo;
  }

  static createDownloadDir(dir) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

  async _downloadVideo(item) {
    Promise.allSettled(Object.values(item)).then(() => {
      if (this._shouldDownload(item.url, item.id, 'mp4')) {
        this.pendingDownloads[item.url] = downloadVideo(
          item.url,
          `${this.downloadDir}/${item.id}.mp4`
        ).then(() => this._onDownloadComplete())
      };
    })
  }

  async _downloadImages(items) {
    Promise.allSettled(Object.values(items)).then(() => {
    for (const index in items){
      const item = items[index]
      if (this._shouldDownload(item.url, item.id, 'jpeg')) {
        this.pendingDownloads[item.url] = downloadVideo(
          item.url,
          `${this.downloadDir}/${item.id}.jpeg`
        ).then(() => this._onDownloadComplete())
      };
    }
  })
  }

  _shouldDownload(url, id, type) {
    const inDownloadsDir = `${id}.${type}`  in this.filesInDownloadDir
    const inPendingDownloads = url in this.pendingDownloads

    return (
      (this.redownload && !inPendingDownloads) ||
      (!this.redownload && !inDownloadsDir && !inPendingDownloads)
    )
  }

  _onDownloadComplete() {
    this.downloadsCompleted++

    if (this.videoFeedItems.length) {
      this.spinner.text = `Downloading videos [${this.downloadsCompleted} completed]`
    }
  }

  _waitForDownloads() {
    Promise.allSettled(Object.values(this.pendingDownloads)).then(async () => {
      this.spinner.succeed(
        `Downloaded ${this.downloadsCompleted} video${this.downloadsCompleted > 1 ? 's' : ''
        } for ${this.user}`
      )
      await this._tearDown()
    })
  }

  async _onError(e) {
    this.spinner.fail(e.message)

    await this._tearDown()
    return Promise.reject(e)
  }

  async _tearDown() {
    await this.page.close()
    await this.context.close()
    await this.browser.close()
  }
}

module.exports = TikTokPlaywright
