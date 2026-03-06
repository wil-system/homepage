'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import dynamic from 'next/dynamic'

const Snowfall = dynamic(() => import('react-snowfall'), {
  ssr: false,
})

const menuItems = [
  {
    title: '라페어 라운지',
    subMenu: [
      { name: '라페어라운지', path: '/pages/branded-products?section=top' },
      { name: '입점상품소개', path: '/pages/branded-products?section=category' },
    ]
  },
  {
    title: '입점브랜드',
    subMenu: [
      { name: '라페어', path: '/pages/BrandStory' },
      { name: '선데이라운지', path: '/pages/SundayLounge' },
    ]
  },
  {
    title: '더블유아이엘',
    subMenu: [
      { name: 'CEO 인사말', path: '/pages/Company#about' },
      { name: '더블유아이엘', path: '/pages/Company#core-value' },
      { name: '연혁', path: '/pages/Company#organization' },
      { name: '오시는 길', path: '/pages/Company#location' }
    ]
  }
  ,
  {
    title: '무인매장',
    subMenu: [
      { name: '매장찾기', path: '/pages/Standalone' },
      { name: '키오스크 가이드', path: '/pages/KioskGuide' },
      { name: '앱 사용 가이드', path: '/pages/AppDownload' },
      { name: 'Q&A', path: '/pages/QnA' },
      // { name: '가맹점혜택', path: '' },
      // { name: '창업절차', path: '' },
      // { name: '창업비용', path: '' },
      // { name: '창업문의', path: '' },
      // { name: 'F&A', path: '' },
      //{ name: '매장찾기', path: '/pages/MuinStore' },
      // { name: '라페어라운지소식', path: '' }
    ]
  }
]

// 섹션별 스크롤 offset 매핑
const SCROLL_OFFSETS = {
  about: 0,
  'core-value': 0,
  organization: 150,
  location: 150,
  // 필요에 따라 추가
};

const Header = () => {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMobileMenu, setActiveMobileMenu] = useState(null)
  const [clickedItemIndex, setClickedItemIndex] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [flowerImages, setFlowerImages] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paths = [
        '/Images/header_img/flower_1.png',
        '/Images/header_img/flower_2.png',
        '/Images/header_img/flower_3.png'
      ]

      const loadedImages = paths.map(path => {
        const img = new window.Image()
        img.src = path
        return img
      })

      // 모든 이미지가 로드될 때까지 기다릴 필요 없이 배열로 설정 가능
      // react-snowfall은 내부적으로 이미지 로딩을 처리함
      setFlowerImages(loadedImages)
    }
  }, [])

  // NOTE: 페이지 이동 시 Header 가 리마운트되면 세션을 다시 조회하는 동안
  // 기존 구현은 `null`(비로그인)로 먼저 렌더되어 "로그인" 버튼이 잠깐 보이는 깜빡임이 발생할 수 있음.
  // 그래서 `undefined`(미확정) 상태를 별도로 두고, 세션 조회가 끝난 뒤에만 로그인/로그아웃 UI를 렌더한다.
  const [currentUser, setCurrentUser] = useState(undefined)
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginUserid, setLoginUserid] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState(null)

  const notifyAuthChanged = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-changed'))
    }
  }

  const loadSession = async (signal) => {
    try {
      setIsSessionLoading(true)
      const res = await fetch('/api/auth/session', { method: 'GET', signal })
      const data = await res.json().catch(() => null)
      if (data && data.user) {
        setCurrentUser(data.user)
      } else {
        setCurrentUser(null)
      }
    } catch (err) {
      // AbortError 는 페이지 이동/언마운트에서 자연스럽게 발생할 수 있으므로 무시
      if (err?.name === 'AbortError') return
      // 네트워크 오류 등: 기존 값이 있으면 유지(불필요한 '로그인' 노출 방지), 없으면 비로그인 처리
      setCurrentUser((prev) => (typeof prev === 'undefined' ? null : prev))
    } finally {
      setIsSessionLoading(false)
    }
  }

  // 화면 너비에 따라 모바일 여부 판별
  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }

    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)

    return () => {
      window.removeEventListener('resize', updateIsMobile)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('header')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mouseover', handleClickOutside);
    return () => {
      document.removeEventListener('mouseover', handleClickOutside);
    };
  }, []);

  const getDisplayName = () => {
    if (!currentUser) return ''
    if (currentUser.name) return currentUser.name
    if (currentUser.loginId) {
      const id = String(currentUser.loginId)
      return id.slice(-4)
    }
    return ''
  }

  // 헤더 최초 진입 시 로그인 세션 확인
  useEffect(() => {
    const controller = new AbortController()
    loadSession(controller.signal)
    return () => controller.abort()
  }, [])

  // 다른 컴포넌트에서 로그인/로그아웃 했을 때 세션 동기화
  useEffect(() => {
    const handler = () => {
      const controller = new AbortController()
      loadSession(controller.signal)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-changed', handler)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-changed', handler)
      }
    }
  }, [])

  const handleSmoothScroll = (e, path) => {
    if (!path) return;
    e.preventDefault();

    if (path.includes('#')) {
      const [pagePath, sectionId] = path.split('#');
      const offset = SCROLL_OFFSETS[sectionId] ?? 80; // 기본값 80

      if (window.location.pathname === pagePath) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const top = rect.top + scrollTop - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      } else {
        router.push(pagePath);
        sessionStorage.setItem('scrollToSection', sectionId);
      }
    } else {
      router.push(path);
    }
  };

  useEffect(() => {
    const sectionId = sessionStorage.getItem('scrollToSection');
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerHeight = 0;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
        sessionStorage.removeItem('scrollToSection');
      }, 0);
    }
  }, []);

  const toggleMobileSubmenu = (idx) => {
    setActiveMobileMenu(activeMobileMenu === idx ? null : idx);
  };

  const handleMobileItemClick = (e, path, subIdx) => {
    e.preventDefault();
    setClickedItemIndex(subIdx);

    setTimeout(() => {
      if (path) {
        if (path.includes('#')) {
          const [pagePath, sectionId] = path.split('#');

          if (window.location.pathname === pagePath) {
            const element = document.getElementById(sectionId);
            if (element) {
              const headerHeight = 0;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
              });
            }
          } else {
            router.push(pagePath);
            sessionStorage.setItem('scrollToSection', sectionId);
          }
        } else {
          router.push(path);
        }
      }
    }, 400);

    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 400);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 z-50 w-full max-w-full bg-[#91000A]"
      onMouseLeave={() => setActiveMenu(null)}
    >
      {/* 헤더 눈 내리는 연출 (react-snowfall) */}
      <Snowfall
        snowflakeCount={isMobile ? 5 : 12}
        speed={[0.25, 1.2]}
        wind={[-0.5, 2.0]}
        radius={[15.0, 45.0]}
        images={flowerImages}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 60,
        }}
      />

      <div className="relative flex w-full justify-center">
        <div className="w-full max-w-[1920px] h-[54px] md:h-[100px] lg:h-[132px] flex items-center justify-between lg:justify-evenly">
          <Link
            href="/"
            className="relative flex items-center"
          >
            <img
              src="/Images/logo.png"
              alt="L&apos;AFFAIR LOUNGE"
              className="w-[180px] md:w-[250px] xl:w-[338px] h-auto object-contain ml-[30px]"
            />
          </Link>

          <button
            className="lg:hidden mr-[26px]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden lg:flex xl:w-[700px] 2xl:w-[1005px] h-[64px] bg-white rounded-full items-center justify-between ml-[8px]">
            <nav className="flex items-center ml-[32px]">
              <ul className="flex space-x-[30px] 2xl:space-x-[58px]">
                {menuItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="relative group"
                    onMouseEnter={() => setActiveMenu(idx)}
                  >
                    <Link
                      href={item.subMenu[0]?.path || '#'}
                      onClick={(e) => handleSmoothScroll(e, item.subMenu[0]?.path)}
                      className="text-[16px] 2xl:text-[18px] font-regular"
                    >
                      <span className="h-[21px] tracking-[-0.47px]">{item.title}</span>
                    </Link>

                    <div className={`absolute left-1/2 -translate-x-1/2 mt-7 bg-white shadow-lg rounded-2xl overflow-hidden ${idx === 3 ? 'w-[135px]' : 'w-[116px]'} pt-[26px] pb-[22px]
                      ${activeMenu === idx ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                      onMouseLeave={() => setActiveMenu(null)}
                    >
                      <ul>
                        {item.subMenu.map((subItem, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              href={subItem.path}
                              onClick={(e) => handleSmoothScroll(e, subItem.path)}
                              className={
                                "block px-4  tracking-[-0.36px] text-left pl-[18px]" +
                                (subIdx !== item.subMenu.length - 1 ? " pb-[10px]" : "")
                              }
                            >
                              <span className="font-regular text-[16px] h-[14px] tracking-[-0.36px] hover:font-medium hover:text-[#92000A]">
                                {subItem.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center space-x-2 mr-[18px]">
              <p className="ml-[4px] mr-[6px]">
                <img src="/Images/icon_L.png" alt="로그인" className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px]" />
              </p>
              {isSessionLoading || typeof currentUser === 'undefined' ? (
                // 세션 미확정 상태에서는 '로그인' 버튼을 렌더하지 않아 깜빡임을 방지
                <div className="h-[28px] w-[74px]" aria-hidden="true" />
              ) : currentUser ? (
                <div className="flex items-center space-x-2">
                  <span className="text-[12px] text-[#2F2E2B]">
                    {getDisplayName()}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch('/api/auth/logout', { method: 'POST' })
                      } finally {
                        setCurrentUser(null)
                        notifyAuthChanged()
                      }
                    }}
                    className="rounded-full border border-[#2F2E2B] px-3 py-1 text-[11px] font-medium text-[#2F2E2B] hover:bg-[#2F2E2B] hover:text-white"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="rounded-full border border-[#2F2E2B] px-4 py-1.5 text-[12px] font-medium text-[#2F2E2B] hover:bg-[#2F2E2B] hover:text-white"
                >
                  로그인
                </button>
              )}
            </div>
          </div>

          <div className={`fixed top-0 left-0 w-full h-full bg-[#91000A] transform transition-transform duration-300 z-50 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="absolute right-[calc(29/360*100vw)] top-[30px] flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <img src="/Images/m_menu/icon.webp" alt="닫기" className="w-[38px] h-[38px]" />
              </button>
              {isSessionLoading || typeof currentUser === 'undefined' ? (
                <div className="h-[26px] w-[60px]" aria-hidden="true" />
              ) : currentUser ? (
                <>
                  <span className="text-xs text-white">
                    {getDisplayName()}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch('/api/auth/logout', { method: 'POST' })
                      } finally {
                        setCurrentUser(null)
                        notifyAuthChanged()
                      }
                    }}
                    className="rounded-full border border-white px-3 py-1 text-[11px] text-white hover:bg-white hover:text-[#91000A]"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="rounded-full border border-white px-3 py-1 text-[11px] text-white hover:bg-white hover:text-[#91000A]"
                >
                  로그인
                </button>
              )}
            </div>

            <nav className="absolute left-[calc(29/360*100vw)] w-full top-[93px] flex flex-col align-top gap-[18px]">
              {menuItems.map((item, idx) => (
                <div key={idx} className="mb-[0px]">
                  <button
                    className={`w-fit mb-[0px] text-[24px] tracking-[-2.4px] text-left flex justify-start items-center transition-colors
                      ${activeMobileMenu === idx ? 'text-[#ffa1a7]' : 'text-white'}`}
                    onClick={() => toggleMobileSubmenu(idx)}
                    onMouseEnter={() => setActiveMobileMenu(idx)}
                  >
                    <span>{item.title}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 ml-[12px] transition-transform ${activeMobileMenu === idx ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeMobileMenu === idx ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className="py-2">
                      {item.subMenu.map((subItem, subIdx) => (
                        <li key={subIdx} className="">
                          <Link
                            href={subItem.path}
                            onClick={(e) => handleMobileItemClick(e, subItem.path, subIdx)}
                            className={`block w-fit py-[3px] text-[#ffa1a7] hover:text-[#ffffff] transition-colors duration-300
                              ${clickedItemIndex === subIdx ? 'text-[#ffffff]' : ''}`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              {/* <div className="border-t-[1px] w-[calc(100vw-58/360*100vw)] mt-[60px] border-[#ffffff]">
                <div className="flex justify-between mt-[15px]">
                  <img src="/Images/m_menu/icon2.webp" alt="로그인" className="w-[39px] h-[39px]" />
                  <div className="bg-[#2f2e2b] w-[140px] h-[38px] rounded-full flex items-center justify-center">
                    <p className="text-white text-[12px] tracking-[-0.62px]">지금 상담신청 하세요!</p>
                  </div>
                </div>
              </div> */}
            </nav>
          </div>
        </div>
      </div>
      {/* 공통 로그인 모달 */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-md bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">로그인</h2>
            {loginError && (
              <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {loginError}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setLoginError(null)
                setLoginLoading(true)
                try {
                  const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userid: loginUserid,
                      password: loginPassword,
                    }),
                  })
                  const data = await res.json().catch(() => null)
                  if (!res.ok) {
                    throw new Error(data?.message || '로그인에 실패했습니다.')
                  }
                  if (data && data.user) {
                    setCurrentUser(data.user)
                    notifyAuthChanged()
                  }
                  setIsSessionLoading(false)
                  setIsLoginOpen(false)
                  setLoginUserid('')
                  setLoginPassword('')
                } catch (err) {
                  setLoginError(err instanceof Error ? err.message : String(err))
                } finally {
                  setLoginLoading(false)
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  아이디
                </label>
                <input
                  type="text"
                  value={loginUserid}
                  onChange={(e) => setLoginUserid(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  placeholder=""
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  required
                />
              </div>
              <div className="mt-4 flex justify-end gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  {loginLoading ? '로그인 중...' : '로그인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header 