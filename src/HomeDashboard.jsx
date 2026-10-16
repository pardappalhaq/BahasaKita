import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './components/Icon.jsx'
import { displayName } from './displayName.js'
import { aspects, level, learningDestination, useStore } from './learning.jsx'
import { youtubeMaterials, youtubeEmbedUrl } from './youtubeMaterials.js'
import './home.css'

function BookArt() {
 return <div className="book-art" aria-hidden="true"><div className="art-scene"><span className="art-star one">✦</span><span className="art-dot"/><div className="art-orbit"/><div className="art-card card-back"/><div className="art-card card-front"><Icon name="hand" size={54}/><span>ISYARAT</span></div><div className="art-book"><div className="book-page left"><i/><i/><i/></div><div className="book-page right"><span>✦</span><i/><i/></div></div></div><div className="art-small"><Icon name="check" size={18}/><span>Langkah kecil, kemajuan besar</span></div></div>
}

function HomeVideoModal({ video, onClose }) {
 const dialog = useRef(null)
 const trigger = useRef(document.activeElement)
 const close = () => {
  dialog.current.close()
  onClose()
  if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true })
 }
 useEffect(() => {
  const element = dialog.current
  element.showModal()
  return () => element.close()
 }, [])

 return <dialog ref={dialog} className="word-dialog source-word-dialog home-video-dialog" aria-labelledby="home-video-modal-title" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === dialog.current) close() }}>
  <button type="button" className="dialog-close icon-btn" onClick={close} aria-label="Tutup video pembelajaran"><Icon name="close"/></button>
  <div className="inline-tags"><span className="tag">{video.grade} · {video.topic}</span></div>
  <h2 id="home-video-modal-title">{video.title}</h2>
  <p className="home-video-description">{video.description}</p>
  <div className="youtube-frame"><iframe src={youtubeEmbedUrl(video.id)} title={'Video ' + video.grade + ': ' + video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>
 </dialog>
}

export function PhotoStoriesCarousel({ state }) {
 const track = useRef(null)
 const drag = useRef({ moved: false, cleanup: null })
 const [dragging, setDragging] = useState(false)
 const [selectedVideo, setSelectedVideo] = useState(null)
 const [activeIndex, setActiveIndex] = useState(0)
 const [reducedMotion, setReducedMotion] = useState(() => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
 const grade = state.profile?.grade || 'SD'
 const videos = youtubeMaterials[grade] || youtubeMaterials.SD
 const comfortable = state.settings?.comfortable || reducedMotion

 useEffect(() => {
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  if (!media) return
  const update = () => setReducedMotion(media.matches)
  update()
  media.addEventListener('change', update)
  return () => media.removeEventListener('change', update)
 }, [])
 useEffect(() => {
  track.current?.scrollTo({ left: 0, behavior: 'auto' })
  setActiveIndex(0)
  setSelectedVideo(null)
 }, [grade])
 useEffect(() => () => drag.current.cleanup?.(), [])

 const scroll = direction => {
  const element = track.current
  if (!element) return
  const card = element.querySelector('.home-video-card')
  element.scrollBy({ left: direction * ((card?.offsetWidth || element.clientWidth) + 16), behavior: comfortable ? 'auto' : 'smooth' })
 }
 const startDrag = event => {
  if (event.button !== 0) return
  drag.current.cleanup?.()
  const element = track.current
  const startX = event.pageX, startScroll = element.scrollLeft
  drag.current.moved = false
  const move = nextEvent => {
   const delta = nextEvent.pageX - startX
   if (Math.abs(delta) <= 5 && !drag.current.moved) return
   drag.current.moved = true
   setDragging(true)
   element.scrollLeft = startScroll - delta
  }
  const cleanup = () => {
   window.removeEventListener('mousemove', move)
   window.removeEventListener('mouseup', finish)
  }
  const finish = () => { cleanup(); setDragging(false) }
  drag.current.cleanup = cleanup
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', finish)
 }

 return <section className="home-video-section" aria-labelledby="home-videos-title">
  <div className="home-section-heading">
   <div><p className="home-eyebrow">VIDEO PILIHAN · {grade}</p><h2 id="home-videos-title">Caramu belajar, <span>cerita hebatmu.</span></h2><p>Amati isyarat dan visual dari video pembelajaran sesuai jenjangmu.</p></div>
   <div className="home-video-controls"><span className="home-video-position" aria-live="polite">{activeIndex + 1} / {videos.length}</span><button type="button" data-public-navigation className="home-icon-button" aria-label="Geser ke kiri" aria-controls="home-video-track" disabled={activeIndex === 0} onClick={() => scroll(-1)}><Icon name="arrowLeft" size={20}/></button><button type="button" data-public-navigation className="home-icon-button" aria-label="Geser ke kanan" aria-controls="home-video-track" disabled={activeIndex === videos.length - 1} onClick={() => scroll(1)}><Icon name="arrow" size={20}/></button></div>
  </div>
  <div id="home-video-track" ref={track} className={'home-video-track' + (dragging ? ' is-dragging' : '')} role="group" aria-label={'Video pembelajaran ' + grade} onMouseDown={startDrag} onScroll={event => { const card = event.currentTarget.querySelector('.home-video-card'); setActiveIndex(Math.min(videos.length - 1, Math.max(0, Math.round(event.currentTarget.scrollLeft / ((card?.offsetWidth || event.currentTarget.clientWidth) + 16))))) }}>
   {videos.map(video => <button type="button" className="home-video-card" key={video.id} aria-label={'Tonton video ' + grade + ': ' + video.title} onClick={event => { if (!event.detail || !drag.current.moved) setSelectedVideo({ ...video, grade }) }}>
    <span className="home-video-thumbnail"><img src={'https://img.youtube.com/vi/' + video.id + '/hqdefault.jpg'} alt="" draggable={false} loading="lazy" width="480" height="360"/></span>
    <span className="home-video-copy"><span className="home-video-topic">{video.topic}</span><strong>{video.title}</strong><span className="home-video-play"><Icon name="play" size={17}/>Tonton video</span></span>
   </button>)}
  </div>
  {selectedVideo && <HomeVideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)}/>}
 </section>
}

export function Dashboard() {
 const { state, next, lessons, masteredLessons } = useStore()
 const destination = learningDestination(state)
 const assessed = !!state.assessment
 const basic = destination === '/basic-class'
 const ready = destination === '/'
 const total = masteredLessons.length
 const percentage = Math.round(total / Math.max(lessons.length, 1) * 100)
 const complete = ready && lessons.length > 0 && !next
 const recommended = ready ? next : null
 const resumeAssessment = !!state.activeAssessment || !!state.assessmentDraft?.length
 const action = basic ? { to: '/basic-class', label: 'Lanjutkan kelas dasar' }
  : recommended ? { to: '/lesson/' + recommended.id, label: 'Lanjutkan belajar' }
  : complete ? { to: '/progress', label: 'Lihat kemajuanmu' }
  : ready ? { to: '/learning', label: 'Lihat materi belajar' }
  : { to: state.profile ? '/assessment' : '/signup', label: resumeAssessment ? 'Lanjutkan asesmen' : 'Mulai asesmen awal' }
 const title = basic ? 'Kita kuatkan dasar bersama.' : recommended ? recommended.title : complete ? 'Semua materi sudah kamu kuasai!' : ready ? 'Temukan langkah belajarmu.' : 'Kenali kemampuan awalmu.'
 const description = basic ? 'Pelajari video dan latihan pendamping, lalu coba asesmen kembali saat kamu siap.'
  : recommended ? recommended.description
  : complete ? 'Setiap usaha membawamu sampai di sini. Kamu bisa melihat kemajuan atau mengulang materi di jalur belajar.'
  : ready ? 'Materi mengikuti jenjang dan kemampuanmu. Buka jalur belajar untuk melihat materi yang tersedia.'
  : '8 soal singkat untuk mengenali titik awalmu. Hasilnya membantu memilih materi yang sesuai untukmu.'

 return <div className="home-dashboard">
  <header className="home-heading"><div><p className="home-eyebrow">RUANG UNTUK BERTUMBUH</p><h1>{'Halo, ' + displayName(state.profile?.name || 'teman belajar') + '!'}</h1><p>Siap menemukan hal baru hari ini? Kita mulai dari langkah kecil.</p></div>{state.profile?.grade && <span className="home-grade"><Icon name="graduation" size={19}/>{state.profile.grade}</span>}</header>
  <div className="home-overview">
   <section className="home-focus" aria-labelledby="home-focus-title">
    <div className="home-focus-copy">{!basic && <p className="home-eyebrow">{complete ? 'LANGKAH YANG SUDAH TERCAPAI' : recommended ? 'LANGKAH BERIKUTNYA' : 'LANGKAH PERTAMAMU'}</p>}<h2 id="home-focus-title">{title}</h2><p>{description}</p>
     <div className="home-lesson-details">{recommended ? <><span><Icon name="clock" size={16}/>{recommended.time} menit</span><span><Icon name="path" size={16}/>4 tahap belajar</span><span>{aspects.find(aspect => aspect.id === recommended.aspect)?.name}</span></> : !ready && !basic ? <><span><Icon name="clock" size={16}/>Sekitar 5 menit</span><span><Icon name="shapes" size={16}/>4 aspek kemampuan</span></> : basic ? <span><Icon name="refresh" size={16}/>Belajar dan coba kembali sesuai ritmemu</span> : <span><Icon name="check" size={16}/>Kemajuan tersimpan di akunmu</span>}</div>
     <Link data-public-navigation={!state.profile || undefined} className="btn home-primary-action" to={action.to} aria-label={recommended ? action.label + ': ' + recommended.title : undefined}>{action.label}<Icon name="arrow" size={19}/></Link>
     {!ready && !basic && <p className="home-access-hint"><Icon name="lock" size={16}/><span>Kamu bisa menjelajahi halaman. Selesaikan asesmen awal untuk membuka fitur belajar.</span></p>}
    </div>
    {!recommended && <div className="home-focus-art" aria-hidden="true"><BookArt/></div>}
   </section>
   <section className="home-progress" aria-labelledby="home-progress-title">
    <div className="home-progress-heading"><span className="icon-tile purple"><Icon name="chart"/></span><h2 id="home-progress-title">Perjalananmu</h2></div>
    <div className="home-progress-value"><strong>{assessed ? total : '4'}</strong><span>{assessed ? 'dari ' + lessons.length + ' materi dikuasai' : 'tahap dalam setiap sesi belajar'}</span></div>
    {assessed ? <><progress aria-label="Materi yang dikuasai" value={total} max={Math.max(lessons.length, 1)}/><p className="home-progress-caption">{percentage}% selesai</p></> : <p className="home-progress-caption">Pengantar, isyarat & visual, latihan, lalu evaluasi.</p>}
    <p className="home-study-note"><Icon name="clock" size={17}/>Panduan durasi: 8–10 menit per sesi.</p>
    {assessed ? <Link className="text-link" to="/progress">Lihat kemajuan saya<Icon name="arrow" size={17}/></Link> : <p className="home-progress-hint">Selesaikan asesmen untuk memulai catatan belajarmu.</p>}
   </section>
  </div>
  <section className="home-aspects" aria-labelledby="home-aspects-title">
   <div className="home-section-heading"><div><h2 id="home-aspects-title">Empat ruang untuk bertumbuh</h2><p>Kenali kekuatanmu, latih selangkah demi selangkah.</p></div><Link className="text-link" to={basic ? '/basic-class' : '/learning'}>{basic ? 'Buka kelas dasar' : 'Lihat jalur belajar'}<Icon name="arrow" size={17}/></Link></div>
   <div className="home-aspect-grid">{aspects.map(aspect => <Link className="home-aspect-card" key={aspect.id} to={basic ? '/basic-class' : assessed ? '/learning' : '/assessment'}><div className="home-aspect-top"><span className={'icon-tile ' + aspect.color}><Icon name={aspect.icon}/></span><Icon name="arrow" size={18}/></div><h3>{aspect.name}</h3><p>{aspect.description}</p><div className="home-aspect-status">{assessed ? <><span>{level(state.assessment[aspect.id])}</span><strong>{state.assessment[aspect.id]}%</strong></> : <span>Kenali kemampuanmu</span>}</div>{assessed && <progress aria-label={'Kemampuan ' + aspect.name} value={state.assessment[aspect.id] ?? 0} max={100}/>}</Link>)}</div>
  </section>
  <PhotoStoriesCarousel state={state}/>
  <section className="home-dictionary" aria-labelledby="home-dictionary-title"><span className="home-dictionary-icon"><Icon name="dictionary" size={31}/></span><div><p className="home-eyebrow">TEMAN BELAJARMU</p><h2 id="home-dictionary-title">Satu kata baru, satu dunia terbuka.</h2><p>Cari arti kata dan contoh kalimat di Kamus Visual.</p></div><Link className="btn secondary" to="/dictionary">Buka kamus<Icon name="arrow" size={18}/></Link></section>
 </div>
}
