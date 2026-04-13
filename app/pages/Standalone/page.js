'use client'

import { useState, useEffect } from 'react'
import Footer from '../../components/Footer.js'

 
// 스토어별 데이터 매핑
const STORES = {
  nonhyeon: {
    id: 'nonhyeon',
    displayName: '논현역점',
    hero: {
      imageSrc: '/Images/muin/nonhyeon/nonhyeon.webp',
      subtitle: '누구의 시선도, 재촉도 없는 공간이 필요할 때.',
      description:
        '당신이 원할 때 언제든 열려있는 논현역점에서,<br/> 방해받지 않는 편안한 쇼핑을 즐겨보세요.',
    },
    gallery: [
      { id: 1, src: '/Images/muin/nonhyeon/nonhyeon_1.webp', alt: '논현역점 매장 전경 1' },
      { id: 2, src: '/Images/muin/nonhyeon/nonhyeon_2.webp', alt: '논현역점 매장 전경 2' },
      { id: 3, src: '/Images/muin/nonhyeon/nonhyeon_3.webp', alt: '논현역점 매장 전경 3' },
      { id: 4, src: '/Images/muin/nonhyeon/nonhyeon_4.webp', alt: '논현역점 매장 전경 4' },
      { id: 5, src: '/Images/muin/nonhyeon/nonhyeon_5.webp', alt: '논현역점 매장 전경 5' },
      { id: 6, src: '/Images/muin/nonhyeon/nonhyeon_6.webp', alt: '논현역점 매장 전경 6' },
      { id: 7, src: '/Images/muin/nonhyeon/nonhyeon_7.webp', alt: '논현역점 매장 전경 7' },
      { id: 8, src: '/Images/muin/nonhyeon/nonhyeon_8.webp', alt: '논현역점 매장 전경 8' },
      { id: 9, src: '/Images/muin/nonhyeon/nonhyeon_9.webp', alt: '논현역점 매장 전경 9' },
      { id: 10, src: '/Images/muin/nonhyeon/nonhyeon_10.webp', alt: '논현역점 매장 전경 10' },
      { id: 11, src: '/Images/muin/nonhyeon/nonhyeon_11.webp', alt: '논현역점 매장 전경 11' },
      { id: 12, src: '/Images/muin/nonhyeon/nonhyeon_12.webp', alt: '논현역점 매장 전경 12' },
      { id: 13, src: '/Images/muin/nonhyeon/nonhyeon_13.webp', alt: '논현역점 매장 전경 13' },
      { id: 14, src: '/Images/muin/nonhyeon/nonhyeon_14.webp', alt: '논현역점 매장 전경 14' },
      { id: 15, src: '/Images/muin/nonhyeon/nonhyeon_15.webp', alt: '논현역점 매장 전경 15' },
      { id: 16, src: '/Images/muin/nonhyeon/nonhyeon_16.webp', alt: '논현역점 매장 전경 16' },
      { id: 17, src: '/Images/muin/nonhyeon/nonhyeon_17.webp', alt: '논현역점 매장 전경 17' },
      { id: 18, src: '/Images/muin/nonhyeon/nonhyeon_18.webp', alt: '논현역점 매장 전경 18' },
      { id: 19, src: '/Images/muin/nonhyeon/nonhyeon_19.webp', alt: '논현역점 매장 전경 19' },
      { id: 20, src: '/Images/muin/nonhyeon/nonhyeon_20.webp', alt: '논현역점 매장 전경 20' },
    ],
    location: {
      addressHtml: '서울특별시 강남구 학동로 102<br/>논현역 신분당선 B2-1호 LAFFAIR매장',
      hoursHtml: '연중무휴 06:00 - 24:00 운영<br/>완전 무인 자율 쇼핑',
      mapImageSrc: '/Images/muin/nonhyeon/map01_nonhyeon.png',
    },
  },
  sinnonhyeon: {
    id: 'sinnonhyeon',
    displayName: '신논현역점',
    hero: {
      imageSrc: '/Images/muin/sinnonhyeon/sinnonhyeon.webp',
      subtitle: '도심 속에서 누리는 온전한 쉼, 신논현역점에서.',
      description:
        '바쁜 하루 속, 나만의 시간을 경험해보세요.<br/> 언제든 편하게 들러 쇼핑 할 수 있는 신논현역점 입니다.',
    },
    gallery: [
      { id: 1, src: '/Images/muin/sinnonhyeon/sinnonhyeon_1.webp', alt: '신논현역점 매장 전경 1' },
      { id: 2, src: '/Images/muin/sinnonhyeon/sinnonhyeon_2.webp', alt: '신논현역점 매장 전경 2' },
      { id: 3, src: '/Images/muin/sinnonhyeon/sinnonhyeon_3.webp', alt: '신논현역점 매장 전경 3' },
      { id: 4, src: '/Images/muin/sinnonhyeon/sinnonhyeon_4.webp', alt: '신논현역점 매장 전경 4' },
      { id: 5, src: '/Images/muin/sinnonhyeon/sinnonhyeon_5.webp', alt: '신논현역점 매장 전경 5' },
      { id: 6, src: '/Images/muin/sinnonhyeon/sinnonhyeon_6.webp', alt: '신논현역점 매장 전경 6' },
      { id: 7, src: '/Images/muin/sinnonhyeon/sinnonhyeon_7.webp', alt: '신논현역점 매장 전경 7' },
      { id: 8, src: '/Images/muin/sinnonhyeon/sinnonhyeon_8.webp', alt: '신논현역점 매장 전경 8' },
      { id: 9, src: '/Images/muin/sinnonhyeon/sinnonhyeon_9.webp', alt: '신논현역점 매장 전경 9' },
      { id: 10, src: '/Images/muin/sinnonhyeon/sinnonhyeon_10.webp', alt: '신논현역점 매장 전경 10' },
      { id: 11, src: '/Images/muin/sinnonhyeon/sinnonhyeon_11.webp', alt: '신논현역점 매장 전경 11' },
      { id: 12, src: '/Images/muin/sinnonhyeon/sinnonhyeon_12.webp', alt: '신논현역점 매장 전경 12' },
      { id: 13, src: '/Images/muin/sinnonhyeon/sinnonhyeon_13.webp', alt: '신논현역점 매장 전경 13' },
      { id: 14, src: '/Images/muin/sinnonhyeon/sinnonhyeon_14.webp', alt: '신논현역점 매장 전경 14' },
      { id: 15, src: '/Images/muin/sinnonhyeon/sinnonhyeon_15.webp', alt: '신논현역점 매장 전경 15' },
      { id: 16, src: '/Images/muin/sinnonhyeon/sinnonhyeon_16.webp', alt: '신논현역점 매장 전경 16' },
      { id: 17, src: '/Images/muin/sinnonhyeon/sinnonhyeon_17.webp', alt: '신논현역점 매장 전경 17' },
      { id: 18, src: '/Images/muin/sinnonhyeon/sinnonhyeon_18.webp', alt: '신논현역점 매장 전경 18' },
      { id: 19, src: '/Images/muin/sinnonhyeon/sinnonhyeon_19.webp', alt: '신논현역점 매장 전경 19' },
      { id: 20, src: '/Images/muin/sinnonhyeon/sinnonhyeon_20.webp', alt: '신논현역점 매장 전경 20' },
    ],
    location: {
      addressHtml: '서울특별시 강남구 봉은사로 102<br/>신논현역 신분당선 B3-1호 LAFFAIR매장',
      hoursHtml: '연중무휴 06:00 - 24:00 운영<br/>완전 무인 자율 쇼핑',
      mapImageSrc: '/Images/muin/sinnonhyeon/map01_sinnonhyeon.png',
    },
  },
}


function Button({ children, variant = 'default', size = 'lg', className = '', ...props }) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variants = {
    default: "bg-[#030213] text-white hover:bg-[#030213]/90",
    outline: "border border-[#e5e7eb] bg-white text-[#111827] hover:bg-[#f9fafb]",
  }
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[calc(100%-2rem)] max-w-4xl bg-white rounded-lg shadow-lg">
        <button onClick={onClose} aria-label="닫기" className="absolute top-3 right-3 rounded-md bg-white/80 hover:bg-white p-1 shadow">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        {children}
      </div>
    </div>
  )
}

function HeroSection({ store, selectedStoreId, onSelect }) {
  return (
    <section className="min-h-screen bg-white mt-[54px] md:mt-[100px] xl:mt-[132px]">
      <div className="container mx-auto px-6 text-center">
        <div className="w-auto mx-auto mt-[70px] lg:mt-[100px] space-y-[12px] lg:space-y-[24px] mb-[36px] lg:mb-[60px]">
          <h1 className="mb-24 tracking-tight text-5xl font-medium md:text-6xl">무인매장 직영점</h1>
          <p className="text-[17px] lg:text-[30px] text-[#92000a] font-semibold break-keep">
          {store.hero.subtitle}
          </p>
          <p className="text-[15px] lg:text-[22px] text-center font-normal tracking-[-0.39px] lg:tracking-[-0.35px] leading-[23px] lg:leading-[38px] text-[#323232]" dangerouslySetInnerHTML={{ __html: store.hero.description }} />
          <div className="!mt-16 flex flex-col sm:flex-row gap-6 justify-center items-top">
            <Button
              size="lg"
              variant={selectedStoreId === 'nonhyeon' ? 'default' : 'outline'}
              className="px-8 py-6 text-lg"
              onClick={() => onSelect('nonhyeon')}
              aria-pressed={selectedStoreId === 'nonhyeon'}
            >
              {STORES.nonhyeon.displayName}
            </Button>
            <Button
              size="lg"
              variant={selectedStoreId === 'sinnonhyeon' ? 'default' : 'outline'}
              className="px-8 py-6 text-lg"
              onClick={() => onSelect('sinnonhyeon')}
              aria-pressed={selectedStoreId === 'sinnonhyeon'}
            >
              {STORES.sinnonhyeon.displayName}
            </Button>
          </div>
        </div>
        <div className="mt-24 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
          <img
            src={store.hero.imageSrc}
            alt="매장 대표 이미지"
            className="w-full h-96 object-cover rounded-lg shadow-2xl"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

function GallerySection({ images, selectedStoreId }) {
  const [open, setOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const gridRef = useState(null)[0]
  const [_, setGridRef] = useState(null)
  const displayedImages = showAll ? images : images.slice(0, 8)

  // 지점 변경 시 더보기 상태 초기화
  
  useEffect(() => {
    setShowAll(false)
  }, [selectedStoreId])

  function setGridNode(node) {
    setGridRef(node)
  }

  const getNumColumns = () => {
    if (typeof window === 'undefined') return 4
    if (window.innerWidth >= 1280) return 4 // xl
    if (window.innerWidth >= 1024) return 3 // lg
    if (window.innerWidth >= 768) return 2 // md
    return 1 // base
  }

  const handleShowMore = () => {
    const numColumns = getNumColumns()
    const firstNewIndex = Math.floor(8 / numColumns) * numColumns // 8번째 아이템이 포함된 첫 행의 시작 인덱스
    setShowAll(true)
    setTimeout(() => {
      const container = document.getElementById('gallery-grid')
      const target = container?.querySelector(`[data-index="${firstNewIndex}"]`)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 0)
  }

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="mb-20 tracking-tight text-5xl font-medium md:text-6xl">매장 둘러보기</h2>
          <p className="text-[15px] lg:text-[22px] text-center font-normal tracking-[-0.39px] lg:tracking-[-0.35px] leading-[23px] lg:leading-[38px] text-[#323232]">편안함과 새로움이 가득한 저희 무인매장으로 여러분을 초대합니다. <br/>지금 바로 그 특별한 공간을 둘러보세요.</p>
        </div>
        <div id="gallery-grid" ref={setGridNode} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedImages.map((image) => {
            const originalIndex = images.findIndex((i) => i.id === image.id)
            return (
            <div key={image.id} data-index={originalIndex} className="group cursor-pointer overflow-hidden rounded-lg bg-[#f5f6f8] hover:bg-[#eef1f4] transition-colors" onClick={() => { setOpen(true); setImageSrc(image.src) }}>
              <img src={image.src} alt={image.alt} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
          )})}
        </div>
        {images.length > 8 && !showAll && (
          <div className="text-center mt-[70px] lg:mt-[100px]">
            <button
              className="bg-[#323232] w-[148px] lg:w-[310px] h-[43px] lg:h-[72px] text-white rounded-full text-[18px] lg:text-[30px] leading-[18px] lg:leading-[36px] tracking-[-0.47px] lg:tracking-[-0.78px]"
              aria-expanded={showAll}
              onClick={handleShowMore}
            >
              {'더보기'}
            </button>
          </div>
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-0">
          <img src={imageSrc ?? ''} alt="Selected" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
        </div>
      </Modal>
    </section>
  )
}

function Icon({ name, className = "w-6 h-6" }) {
  if (name === 'map') {
    return (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.948L9 1m0 19l6-3m-6 3V1m6 16l5.447 2.724A2 2 0 0021 18.382V8.618a2 2 0 00-1.553-1.948L15 5m0 12V5"/></svg>)
  }
  if (name === 'clock') {
    return (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>)
  }
  if (name === 'phone') {
    return (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.515l.7 2.8a2 2 0 01-.5 1.94L9.91 11.09a16 16 0 006 6l1.835-1.51a2 2 0 011.94-.5l2.8.7A2 2 0 0122 17.72V21a2 2 0 01-2 2h-1C9.163 23 1 14.837 1 4V3a2 2 0 012-2h0z"/></svg>)
  }
  return null
}

function LocationSection({ location }) {
  return (
    <section className="py-24 bg-[#e9ebef]/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="mb-6  tracking-tight text-5xl font-medium md:text-6xl">오시는 길</h2>
          <p className="text-[15px] lg:text-[22px] text-center font-normal tracking-[-0.39px] lg:tracking-[-0.35px] leading-[23px] lg:leading-[38px] text-[#323232] max-w-2xl mx-auto">매장에 방문하여 새로운 쇼핑을 즐겨보세요</p>
        </div>
        <div className="grid  2xl:grid-cols-10 gap-12 items-center">
          <div className="space-y-8 xl:col-span-3">
            <div className="flex items-start gap-4">
              <Icon name="map" className="w-6 h-6 text-[#323232] mt-1 flex-shrink-0" />
              <div>
                <h3 className="mb-2 text-xl font-poppins">Address</h3>
                <p className="text-[#323232]" dangerouslySetInnerHTML={{ __html: location.addressHtml }} />
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Icon name="clock" className="w-6 h-6 text-[#323232] mt-1 flex-shrink-0" />
              <div>
                <h3 className="mb-2 text-xl font-poppins">Store Hours</h3>
                <p className="text-[#323232]" dangerouslySetInnerHTML={{ __html: location.hoursHtml }} />
              </div>
            </div>

          </div>
          <div className="relative xl:col-span-7">
            <img
              src={location.mapImageSrc}
              alt="Store location map"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              loading="lazy"
            />
          
          </div>
        </div>
      </div>
    </section>
  )
}

export default function StandalonePage() {
  const [selectedStoreId, setSelectedStoreId] = useState('nonhyeon')
  const store = STORES[selectedStoreId]
  return (
    <div className='min-h-screen bg-white'>
      <main className="pt-[54px] md:pt-[100px] lg:pt-[132px]">
        <section id="home">
          <HeroSection store={store} selectedStoreId={selectedStoreId} onSelect={setSelectedStoreId} />
        </section>
        <section id="gallery">
          <GallerySection images={store.gallery} selectedStoreId={selectedStoreId} />
        </section>
        <section id="location">
          <LocationSection location={store.location} />
        </section>
      </main>
      <Footer />
    </div>
  )
}


