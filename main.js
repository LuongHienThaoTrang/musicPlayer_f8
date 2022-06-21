
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const playList = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0, 
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem('F8_PLAYER')) || {},
    songs: [
        {
            name: 'Bước Qua Nhau',
            singer: 'Vũ',
            path: './assets/music/Buoc Qua Nhau.mp3',
            image: './assets/img/Buoc Qua Nhau.jpg'
        },
        {
            name: 'Điều Buồn Nhất Khi Yêu',
            singer: 'Hòa Minzy',
            path: './assets/music/Dieu Buon Nhat Khi Yeu.mp3',
            image: './assets/img/Dieu Buon Nhat Khi Yeu.jpg'
        },
        {
            name: 'Hoang Phí Xuân Thì',
            singer: 'Hari Won',
            path: './assets/music/Hoang Phi Xuan Thi.mp3',
            image: './assets/img/Hoang Phi Xuan Thi.jpg'
        },
        {
            name: 'Người Ấy',
            singer: 'Trịnh Thăng Bình',
            path: './assets/music/Nguoi Ay.mp3',
            image: './assets/img/Nguoi Ay.jpg'
        },
        {
            name: 'Sau Này Nếu Có Yêu Ai',
            singer: 'Tăng Phúc - Ngô Kiến Huy',
            path: './assets/music/Sau Nay Neu Co Yeu Ai.mp3',
            image: './assets/img/Sau Nay Neu Co Yeu Ai.jpg'
        },
        {
            name: 'Ta Là Của Nhau',
            singer: 'Ông Cao Thắng - Đông Nhi',
            path: './assets/music/Ta La Cua Nhau.mp3',
            image: './assets/img/Ta La Cua Nhau.jpg'
        }
    ],

    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem('F8_PLAYER', JSON.stringify(this.config))
    },

    render() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('')
    },

    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents() {
        const cdWidth = cd.offsetWidth
        const _this = this;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play()
            }
        }

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ song thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua song
        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
        }

        // Xử lý bật / tắt random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            this.classList.toggle('active', _this.isRandom)
        }

        // Xử lý phát lặp lại 1 song
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },

    scrollToActiveSong() {
        setTimeout(() => {
            if (this.currentIndex < 3) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            } else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }

        }, 3000)
    },

    loadCurrentSong() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của button reapeat & random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    }
}

app.start()