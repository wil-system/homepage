'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ReactLenis } from '@studio-freight/react-lenis'
import { SlArrowLeft, SlArrowRight } from "react-icons/sl"

// 지도 컴포넌트를 동적으로 import
const KakaoMap = dynamic(() => import('./KakaoMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />
})

const GoogleMap = dynamic(() => import('./GoogleMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />
})

const getMotionSettings = (windowWidth , index) => {
  if (windowWidth < 640) { // 모바일
    return {
      initial: { opacity: 0, x: 0 },
      whileInView: { opacity: 1, x: 0 },
      transition: { duration: 0, delay: 0 }
    };
  } else if (windowWidth < 1280) { // 태블릿
    return {
      initial: { opacity: 0, x: 0 },
      whileInView: { opacity: 1, x: 0 },
      transition: { duration: 0.25, delay: index * 0.3 }
    };
  } else { // 데스크톱
    return {
      initial: { opacity: 0, x: 0 },
      whileInView: { opacity: 1, x: 0},
      transition: { duration: 0.3, delay: index * 0.3 }
    };
  }
};

const Company = () => {
  const containerRef = useRef(null);
  const containerRef_Org = useRef(null);
  const childRef_Org = useRef(null);
  const [activeYear, setActiveYear] = useState(null);
  const historyContainerRef = useRef(null);
  const historyScrollRef = useRef(null); // 추가: 실제 스크롤 컨테이너를 위한 ref
  const partnersTitleRef = useRef(null);
  const [maps, setMaps] = useState({
    kakaoMap: null,
    googleMap: null,
    sinsaMap: null,
    sinnonhyeonMap: null,
    nonhyeonMap: null,
    currentMarker: null  // 현재 활성화된 마커를 저장
  });

  // 현재 선택된 탭을 관리하는 state 추가
  const [selectedTab, setSelectedTab] = useState('headquarters');
  
  // 탭 순서 배열 추가
  const tabOrder = ['headquarters', 'logistics', 'vietnam', 'shinsegae'];

  // 각 위치의 정보를 객체로 관리
  const locations = {
    headquarters: {
      title: '더블유아이엘 본사',
      address: '서울특별시 금천구 벚꽃로 234, 1703호 (가산동, 에이스하이엔드타워6차)',
      phone: '02-6925-0733',
      coordinates: { lat: 37.476065205134795, lng: 126.88628511060199 }
    },
    logistics: {
      title: '더블유아이엘 물류센터',
      address: '인천시 서구 봉수대로 206, 포레스코 1층',
      phone: '031-460-2200',
      coordinates: { lat: 37.4933158418763, lng: 126.661442401082 }
    },
    vietnam: {
      title: '더블유아이엘 베트남법인',
      address: '8/34A Kenh T14, Ap 4, xa Tan Quy Tay, H.binh Chanh',
      phone: '+84-70-4070-7161',
      coordinates: {lat: 10.6549298280632, lng: 106.59041829623274 }
    },
    shinsegae: {
      title: '신세계백화점 김해점',
      address: '경상남도 김해시 김해대로 2232 2층 라페어',
      phone: '055-272-1234',
      coordinates: { lat: 35.2293396295983, lng: 128.872242572055 }
    }
  };

  const [windowWidth, setWindowWidth] = useState(0);

  // 드래그 상태를 관리하기 위한 state 추가
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragRef = useRef(null);

  // 조직도 드래그 상태를 관리하기 위한 state 추가
  const [isOrgDragging, setIsOrgDragging] = useState(false);
  const [orgStartX, setOrgStartX] = useState(0);
  const [orgScrollLeft, setOrgScrollLeft] = useState(0);

  useEffect(() => {
    // 초기 윈도우 너비 설정
    setWindowWidth(window.innerWidth);

    // 리사이즈 이벤트 핸들러
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // updateHistoryColors 함수를 컴포넌트 내부에서 정의
  const updateHistoryColors = () => {
    const historyContainer = historyScrollRef.current; // historyScrollRef 사용
    if (!historyContainer) return;
    
    const historyItems = historyContainer.querySelectorAll('.history-item');
    const titleRect = document.querySelector('.sticky-title')?.getBoundingClientRect();
    const titleBottom = titleRect?.bottom || 0;
    const titleTop = titleRect?.top || 0;
    let foundFirstVisible = false;

    historyItems.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const isSmallScreen = window.innerWidth < 640; // sm 해상도 기준

      if (isSmallScreen) {
        // 모바일에서는 타이틀 아래의 첫 번째 아이템만 검정색
        if (itemRect.bottom - 60 > titleBottom && !foundFirstVisible) {
          item.querySelectorAll('p').forEach(p => {
            p.style.color = '#1b1b1b';
          });
          foundFirstVisible = true;
        } else {
          item.querySelectorAll('p').forEach(p => {
            p.style.color = '#979797';
          });
        }
      } else {
        // 태블릿/데스크톱에서는 타이틀과 같은 라인에 있는 아이템만 검정색
        if (itemRect.top <= titleBottom && itemRect.bottom >= titleBottom) {
          item.querySelectorAll('p').forEach(p => {
            p.style.color = '#1b1b1b';
          });
        } else {
          item.querySelectorAll('p').forEach(p => {
            p.style.color = '#979797';
          });
        }
      }
    });
  };

  useEffect(() => {
    // 스크롤 이벤트 리스너
    const handleScroll = () => {
      updateHistoryColors();
    };

    // 리사이즈 이벤트 리스너
    const handleResize = () => {
      updateHistoryColors();
    };

    // 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // 초기 실행
    updateHistoryColors();

    // 클린업 함수
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // 타이틀 애니메이션
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    });

    if (partnersTitleRef.current) {
      observer.observe(partnersTitleRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Lenis 옵션 수정
  const lenisOptions = {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
    
  };

  // 히스토리 컨테이너용 Lenis 옵션
  const historyLenisOptions = {
    ...lenisOptions,
    infinite: false,
  };

  useEffect(() => {
    let kakaoMapScript = null;
    let googleMapScript = null;

    // 카카오맵 초기화 함수 수정
    const initializeKakaoMaps = () => {
      // 무인매장 지도 초기화
      const storeLocations = {
        'sinsa-map': { lat: 37.5276, lng: 127.0388 },
        'sinnonhyeon-map': { lat: 37.5044, lng: 127.0252 },
        'nonhyeon-map': { lat: 37.5073, lng: 127.0228 }
      };

      Object.entries(storeLocations).forEach(([mapId, coords]) => {
        const container = document.getElementById(mapId);
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(coords.lat, coords.lng),
          level: 3,
          draggable: false,
          scrollwheel: false,
          disableDoubleClick: true,
          disableDoubleClickZoom: true
        };

        const map = new window.kakao.maps.Map(container, options);
        map.setZoomable(false);

        const markerPosition = new window.kakao.maps.LatLng(coords.lat, coords.lng);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);

        setMaps(prev => ({
          ...prev,
          [mapId.replace('-map', '')]: map
        }));
      });

      // 본사 지도 초기화
      const companyContainer = document.getElementById('kakao-map-container');
      if (companyContainer) {
        const { coordinates } = locations.headquarters;
        const options = {
          center: new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng),
          level: 3,
          draggable: false,
          scrollwheel: false,
          disableDoubleClick: true,
          disableDoubleClickZoom: true
        };

        const map = new window.kakao.maps.Map(companyContainer, options);
        map.setZoomable(false);

        const markerPosition = new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);

        setMaps(prev => ({ 
          ...prev, 
          kakaoMap: map,
          currentMarker: marker
        }));
      }
    };

    // Google Maps 스크립트 동적 삽입 코드 완전히 제거
    // window.google?.maps가 있을 때만 지도 초기화
    const initializeGoogleMap = () => {
      const container = document.getElementById('google-map-container');
      if (!container) return;
      const { coordinates } = locations.vietnam;
      const map = new window.google.maps.Map(container, {
        center: { lat: coordinates.lat, lng: coordinates.lng },
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: 'none'
      });
      new window.google.maps.Marker({
        position: { lat: coordinates.lat, lng: coordinates.lng },
        map: map
      });
      setMaps(prev => ({ ...prev, googleMap: map }));
    };

    // 스크립트 로드 및 지도 초기화
    const loadMaps = async () => {
      // 카카오맵 로드
      if (!window.kakao?.maps) {
        kakaoMapScript = document.createElement('script');
        kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=b17a7dbb6f34a703cfdfce78a318870a&autoload=false`;
        kakaoMapScript.async = true;
        document.head.appendChild(kakaoMapScript);

        await new Promise(resolve => {
          kakaoMapScript.onload = () => {
            window.kakao.maps.load(() => {
              initializeKakaoMaps();
              resolve();
            });
          };
        });
      } else {
        initializeKakaoMaps();
      }

      // Google Maps API polling 로직
      let retryCount = 0;
      const maxRetries = 10;
      const retryDelay = 300; // ms
      function tryInitializeGoogleMap() {
        if (window.google?.maps) {
          initializeGoogleMap();
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryInitializeGoogleMap, retryDelay);
        } else {
          // 필요시 로딩 실패 안내
          console.warn('Google Maps API 로드 실패');
        }
      }
      tryInitializeGoogleMap();
    };

    loadMaps();

    return () => {
      if (kakaoMapScript) document.head.removeChild(kakaoMapScript);
      if (googleMapScript) document.head.removeChild(googleMapScript);
    };
  }, []);

  // 탭 변경 핸들러 수정
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    
    // 지도 컨테이너 표시/숨김 처리
    const kakaoContainer = document.getElementById('kakao-map-container');
    const googleContainer = document.getElementById('google-map-container');
    
    if (tab === 'vietnam') {
      if (kakaoContainer) kakaoContainer.style.display = 'none';
      if (googleContainer) googleContainer.style.display = 'block';
      
      // 구글맵 리사이즈 처리
      if (maps.googleMap) {
        maps.googleMap.setCenter(locations.vietnam.coordinates);
        window.google.maps.event.trigger(maps.googleMap, 'resize');
      }
    } else {
      if (kakaoContainer) kakaoContainer.style.display = 'block';
      if (googleContainer) googleContainer.style.display = 'none';
      
      // 카카오맵 업데이트
      if (maps.kakaoMap) {
        const { coordinates } = locations[tab];
        const newCenter = new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng);
        
        // 기존 마커가 있다면 제거
        if (maps.currentMarker) {
          maps.currentMarker.setMap(null);
        }
        
        // 새로운 마커 생성 및 설정
        const marker = new window.kakao.maps.Marker({
          position: newCenter
        });
        marker.setMap(maps.kakaoMap);
        
        // 현재 마커 저장
        setMaps(prev => ({
          ...prev,
          currentMarker: marker
        }));
        
        // 지도 중심 이동
        maps.kakaoMap.setCenter(newCenter);
        maps.kakaoMap.relayout();
      }
    }
  };

  // 이전/다음 탭으로 이동하는 함수 추가
  const handleArrowClick = (direction) => {
    const currentIndex = tabOrder.indexOf(selectedTab);
    let nextIndex;
    
    if (direction === 'prev') {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = tabOrder.length - 1;
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= tabOrder.length) nextIndex = 0;
    }
    
    handleTabChange(tabOrder[nextIndex]);
  };

  useEffect(() => {
    const container = containerRef_Org.current;
    const child = childRef_Org.current;
    
    if (container && child) {
      // 초기 스크롤 위치 설정
      const scrollableWidth = container.scrollWidth - container.clientWidth;
      container.scrollLeft = scrollableWidth / 2;
    }
    
    // 스크롤 이벤트 리스너 추가
    const handleScroll = () => {
      if (container) {
        // 스크롤 위치의 퍼센트 계산 (0% ~ 100%)
        const scrollPercentage = (container.scrollLeft / (container.scrollWidth - container.clientWidth)) * 100;
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    
    // 클린업 함수
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // 휠 이벤트 핸들러 추가
  // useEffect(() => {
  //   const historyContainer = historyContainerRef.current;
  //   let smoothScroll = null;
    
  //   class SmoothScroll {
  //     constructor({element, strength = 10, acceleration = 1.0, deceleration = 0.975} = {}) {
  //       this.element = element;
  //       this.distance = strength;
  //       this.acceleration = acceleration;
  //       this.deceleration = deceleration;
  //       this.running = false;
  //       this.currentDistance = 0;
  //       this.isDistanceAsc = false;
  //       this.scrollTop = 0;

  //       this.handleWheel = this.handleWheel.bind(this);
  //       this.animate = this.animate.bind(this);
  //     }

  //     handleWheel(e) {
  //       e.stopPropagation();
  //       e.preventDefault();

  //       if (!this.running) {
  //         this.scrollTop = this.element.scrollTop;
  //         this.running = true;
  //         this.currentDistance = e.deltaY > 0 ? 0.1 : -0.1;
  //         this.isDistanceAsc = true;
  //         this.animate();
  //       } else {
  //         this.isDistanceAsc = false;
  //         this.currentDistance = e.deltaY > 0 ? this.distance : -this.distance;
  //       }
  //     }

  //     animate() {
  //       if (this.running) {
  //         this.currentDistance *= this.isDistanceAsc ? this.acceleration : this.deceleration;
          
  //         if (Math.abs(this.currentDistance) < 0.1 && !this.isDistanceAsc) {
  //           this.running = false;
  //         }
          
  //         if (Math.abs(this.currentDistance) >= Math.abs(this.distance)) {
  //           this.isDistanceAsc = false;
  //         }

  //         this.scrollTop += this.currentDistance;
  //         this.element.scrollTop = this.scrollTop;
          
  //         requestAnimationFrame(this.animate);
  //       }
  //     }

  //     destroy() {
  //       if (this.element) {
  //         this.element.removeEventListener('wheel', this.handleWheel);
  //       }
  //     }
  //   }

  //   const initSmoothScroll = () => {
  //     // 이전 인스턴스가 있다면 제거
  //     if (smoothScroll) {
  //       smoothScroll.destroy();
  //       smoothScroll = null;
  //     }

  //     if (historyContainer  ) {
  //       if(window.innerWidth <= 640){
  //         smoothScroll = new SmoothScroll({
  //           element: historyContainer,
  //           strength: 5,
  //           acceleration: 1.3,
  //           deceleration: 0.96,
  //        });
  //        historyContainer.addEventListener('wheel', smoothScroll.handleWheel, { passive: false });
  //       }else{
  //         smoothScroll = new SmoothScroll({
  //           element: historyContainer,
  //           strength: 10,
  //           acceleration: 1.3,
  //           deceleration: 0.96,
  //         });
  //         historyContainer.addEventListener('wheel', smoothScroll.handleWheel, { passive: false });
  //       }

        
  //     }
  //   };

  //   // 초기 설정
  //   initSmoothScroll();

  //   // 리사이즈 이벤트 리스너 추가
  //   window.addEventListener('resize', initSmoothScroll);

  //   return () => {
  //     if (smoothScroll) {
  //       smoothScroll.destroy();
  //     }
  //     window.removeEventListener('resize', initSmoothScroll);
  //   };
  // }, []);

  // motion 설정 가져오기
  const motionSettings1 = getMotionSettings(windowWidth,1);
  const motionSettings2 = getMotionSettings(windowWidth,2);
  const motionSettings3 = getMotionSettings(windowWidth,3);

  // 마우스 드래그 이벤트 핸들러들
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - dragRef.current.offsetLeft);
    setScrollLeft(dragRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - dragRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    dragRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 조직도 마우스 드래그 이벤트 핸들러들
  const handleOrgMouseDown = (e) => {
    setIsOrgDragging(true);
    setOrgStartX(e.pageX - containerRef_Org.current.offsetLeft);
    setOrgScrollLeft(containerRef_Org.current.scrollLeft);
  };

  const handleOrgMouseMove = (e) => {
    if (!isOrgDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef_Org.current.offsetLeft;
    const walk = (x - orgStartX) * 2; // 스크롤 속도 조절
    let nextScrollLeft = orgScrollLeft - walk;

    const container = containerRef_Org.current;
    const totalScroll = container.scrollWidth - container.clientWidth;
    let minScroll = 0, maxScroll = totalScroll;
    if (windowWidth <= 400) {
      minScroll = totalScroll * 0.3;
      maxScroll = totalScroll * 0.7;
    }
    if (nextScrollLeft < minScroll) nextScrollLeft = minScroll;
    if (nextScrollLeft > maxScroll) nextScrollLeft = maxScroll;

    container.scrollLeft = nextScrollLeft;
  };

  const handleOrgMouseUp = () => {
    setIsOrgDragging(false);
  };

  const handleOrgMouseLeave = () => {
    setIsOrgDragging(false);
  };

  // 조직도 터치 드래그 이벤트 핸들러들
  const handleOrgTouchStart = (e) => {
    setIsOrgDragging(true);
    setOrgStartX(e.touches[0].clientX - containerRef_Org.current.offsetLeft);
    setOrgScrollLeft(containerRef_Org.current.scrollLeft);
  };

  const handleOrgTouchMove = (e) => {
    if (!isOrgDragging) return;
    const x = e.touches[0].clientX - containerRef_Org.current.offsetLeft;
    const walk = (x - orgStartX) * 2;
    let nextScrollLeft = orgScrollLeft - walk;

    const container = containerRef_Org.current;
    const totalScroll = container.scrollWidth - container.clientWidth;
    let minScroll = 0, maxScroll = totalScroll;
    if (windowWidth <= 640) {
      minScroll = totalScroll * 0.3;
      maxScroll = totalScroll * 0.7;
    }
    if (nextScrollLeft < minScroll) nextScrollLeft = minScroll;
    if (nextScrollLeft > maxScroll) nextScrollLeft = maxScroll;

    container.scrollLeft = nextScrollLeft;
  };

  // 조직도 스크롤 제한 함수
  const clampOrgScroll = () => {
    const container = containerRef_Org.current;
    if (!container) return;
    const totalScroll = container.scrollWidth - container.clientWidth;
    let minScroll = 0, maxScroll = totalScroll;
    if (windowWidth <= 640) {
      minScroll = totalScroll * 0.3;
      maxScroll = totalScroll * 0.7;
    }
    if (container.scrollLeft < minScroll) container.scrollLeft = minScroll;
    if (container.scrollLeft > maxScroll) container.scrollLeft = maxScroll;
  };

  // onTouchEnd, onScroll에서 호출
  const handleOrgTouchEnd = () => {
    setIsOrgDragging(false);
    clampOrgScroll();
  };

  const handleOrgScroll = () => {
    clampOrgScroll();
  };

  // 지도 관련 코드를 별도 컴포넌트로 분리
  const MapSection = ({ selectedTab }) => {
    return (
      <div className="relative w-full mt-[16px] sm:mt-[32px] h-[258px] sm:h-[400px] md:h-[500px] xl:h-[516px] bg-[#f8f8f2]">
        {selectedTab === 'vietnam' ? (
          <GoogleMap />
        ) : (
          <KakaoMap location={locations[selectedTab]} />
        )}
      </div>
    )
  }

  // selectedTab이 'vietnam'이 될 때마다 구글맵 초기화 시도
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      selectedTab === 'vietnam' &&
      !maps.googleMap &&
      window.google?.maps
    ) {
      const container = document.getElementById('google-map-container');
      if (container) {
        initializeGoogleMap();
      }
    }
  }, [selectedTab, maps.googleMap]);

  return (
    <ReactLenis root options={lenisOptions}>
      <div className="mx-auto z-1 mt-[54px] md:mt-[100px] xl:mt-[132px] bg-white min-h-screen">
        <div className="w-full mx-auto">
          <main className="relative w-full">
            <div className="relative h-fit flex flex-col items-center justify-start">
              
              {/* 회사 소개 섹션 */}
              <div id="about" className="w-full pt-[90px] md:pt-[150px] xl:pt-[200px] bg-[#f8f8f2] flex flex-col items-center justify-start">
                <div className="w-full md:max-w-[700px] xl:max-w-[1257px] pl-[29px] pr-[25px] md:px-8 xl:px-0 flex flex-col items-start justify-start">
                  <motion.p 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-[17px] md:text-[26px] xl:text-[30px] font-poppins font-medium sm:font-semibold text-left text-[#1b1b1b]"
                  > About us</motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="mt-[12px] sm:mt-[16px] md:mt-[20px] xl:mt-[24px] text-[32px] md:text-[46px] xl:text-[56px] font-medium text-left text-[#92000a] tracking-[-1.6px] md:tracking-[-2.3px] xl:tracking-[-2.8px] leading-[40px] md:leading-[62px] xl:leading-[74px]"
                  > 언제 어디서나<br/>함께하는 더블유아이엘</motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mt-[36px] md:mt-[80px] xl:mt-[100px] text-[15px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.39px] leading-[23px] md:leading-[32px] xl:leading-[38px] text-[#323232] break-keep"
                  > &nbsp;안녕하세요.<br/>
                  &nbsp;더블유아이엘을 찾아주신 고객여러분, 진심으로 감사드립니다.<br/> 
                    <br/> &nbsp;더블유아이엘은 하루의 시작과 끝, 평범한 일상을 함께 할 수 있는 데일리 라이프웨어 브랜드를 꿈꾸며 시작했습니다. 라페어는 더블유아이엘의 언더웨어&라운지웨어 대표 브랜드입니다. 언더웨어에서 인견 팬티를 런칭하고 지난 7년 동안 누적 &quot;800만장&quot; 이상을 판매하며 꾸준히 사랑받고 있으며, 매 시즌 새로운 소재와 디자인을 개발하고 있습니다. 라운지웨어는 &quot;프린트맛집&quot; 이란 별명을 가지고 퀄리티 높은 프린트원단을 개발하여 홈웨어부터 데일리웨어까지 다양한 스타일의 제품을 선보이고 있습니다. <br/>
                  <br/>
                  &nbsp;라페어는 대표 슬로건 &quot;언제, 어디서나&quot; &quot;아침부터 저녁까지&quot; 함께 할 수 있는 브랜드로 한번 더 성장하려 합니다. 온라인 시장을 넘어 라페어
                  상품을 직접 만져보고 쇼핑을 즐길 수 있도록  &quot;라페어라운지&quot; 무인매장을 시작합니다. 라페어라운지 무인매장은 첨단 기술과 고객의 편의성을 결합하여 언제든지 방문할 수 있고, 자유롭게 쇼핑할 수 있는 공간이 되기 위해 최선을 다할 것입니다. <br/>
                  <br/>
                  &nbsp;&nbsp;감사합니다.</motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="w-full flex justify-end items-end"
                  >
                    <p className="mt-[24px] md:mt-[28px] xl:mt-[32px] mr-[10px] md:mr-[36px] xl:mr-[48px] mb-[90px] sm:mb-[100px] md:mb-[150px] xl:mb-[200px] text-[16px] md:text-[18px] xl:text-[22px] font-normal text-right text-[#323232]">
                    (주)W.I.L 대표이사 조경화
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* 핵심 가치 */}
              <div id="core-value" className="relative w-full md:w-full xl:w-[1504px] pt-[90px] md:pt-[150px] xl:pt-[200px] bg-white md:px-8 xl:px-0 flex flex-col items-center justify-center">
                <motion.p 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-[17px] md:text-[26px] xl:text-[30px] font-poppins font-medium sm:font-semibold text-center text-[#323232]"
                >
                  Core value
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="pt-[12px] md:pt-[20px] xl:pt-[24px] text-[32px] md:text-[46px] xl:text-[56px] font-medium text-center text-[#92000a] tracking-[-1.8px] md:tracking-[-2.3px] xl:tracking-[-2.8px] leading-[48px] md:leading-[62px] xl:leading-[74px]"
                >
                  핵심 가치
                </motion.p>
                <div 
                  ref={dragRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  className="relative w-full sm:w-full mt-[36px] sm:mt-[60px] md:mt-[80px] xl:mt-[100px] flex flex-row overflow-y-hidden overflow-x-auto sm:overflow-x-auto md:flex-row items-center justify-start lg:justify-center gap-[15px] sm:gap-[20px] md:gap-[20px] lg:gap-[20px] lg:mx-auto xl:gap-[20px] cursor-grab active:cursor-grabbing"
                  style={{
                    userSelect: 'none',
                    scrollBehavior: isDragging ? 'auto' : 'smooth'
                  }}
                >
                  <motion.div 
                    {...motionSettings1}
                    initial={{ opacity: 0, x: -100 }}
                    viewport={{ once: true }}
                    className='w-full md:w-[320px] xl:w-[488px] h-auto md:h-[fit]'
                  >
                    <div className="w-[214px] max-md:ml-[30px] md:w-[320px] lg:w-[320px] xl:w-[488px] h-[162px] md:h-[250px] xl:h-[324px] bg-[#92000a] flex justify-center items-center">
                      <img src="/Images/company/icon/icon_1.webp" className="w-[90px] sm:w-auto h-[90px] md:h-[150px] xl:h-auto" alt="라페어라운지 아이콘1"/>
                    </div>
                    <div className="w-[214px]  max-md:ml-[30px]  md:w-[320px] lg:w-[320px] xl:w-[488px] h-[82px] md:h-[140px] xl:h-[158px] bg-[#f8f8f2]">
                      <p className="pt-[19px] md:pt-[28px] xl:pt-[32px] text-[15px] md:text-[26px] xl:text-[30px] h-auto md:h-[55px] xl:h-[75px] font-poppins font-bold text-center text-[#1b1b1b]">
                        <span className='text-[#92000a]'>W</span>ORTH
                      </p>
                      <p className="pt-[0px] md:pt-[10px] xl:pt-[12px] text-[15px] md:text-[18px] xl:text-[22px] font-normal text-center text-[#1b1b1b] tracking-[-0.35px] md:tracking-[-0.45px] xl:tracking-[-0.55px]">
                        가치를 찾아가는 도전정신
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                   {...motionSettings2}
                   initial={{ opacity: 0, x: -100 }}
                    viewport={{ once: true }}
                    className='w-full md:w-[320px] xl:w-[488px] h-auto md:h-[fit]'
                  >
                    <div className="w-[214px] md:w-[320px] lg:w-[320px] xl:w-[488px] h-[162px] md:h-[250px] xl:h-[324px] bg-[#92000a] flex justify-center items-center">
                      <img src="/Images/company/icon/icon_2.webp" className="w-[90px] sm:w-auto h-[90px] md:h-[150px] xl:h-auto" alt="라페어라운지 아이콘2"/>
                    </div>
                    <div className="w-[214px] md:w-[320px] lg:w-[320px] xl:w-[488px] h-[82px] md:h-[140px] xl:h-[158px] bg-[#f8f8f2]">
                      <p className="pt-[19px] md:pt-[28px] xl:pt-[32px] text-[15px] md:text-[26px] xl:text-[30px] h-auto md:h-[55px] xl:h-[75px] font-poppins font-bold text-center text-[#1b1b1b]">
                        <span className='text-[#92000a]'>I</span>DENTITY
                      </p>
                      <p className="pt-[0px] md:pt-[10px] xl:pt-[12px] text-[15px] md:text-[18px] xl:text-[22px] font-normal text-center text-[#1b1b1b] tracking-[-0.35px] md:tracking-[-0.45px] xl:tracking-[-0.55px]">
                        정체성을 잃지 않는 개발의지
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    {...motionSettings3}
                    initial={{ opacity: 0, x: -100 }}
                    viewport={{ once: true }}
                    className='w-full md:w-[320px] xl:w-[488px] h-auto md:h-[fit]'
                  >
                    <div className="w-[214px] max-md:mr-[30px] md:w-[320px] lg:w-[320px] xl:w-[488px] h-[162px] md:h-[250px] xl:h-[324px] bg-[#92000a] flex justify-center items-center">
                      <img src="/Images/company/icon/icon_3.webp" className="w-[90px] sm:w-auto h-[90px] md:h-[150px] xl:h-auto" alt="라페어라운지 아이콘3"/>
                    </div>
                    <div className="w-[214px] md:w-[320px] lg:w-[320px] xl:w-[488px] h-[82px] md:h-[140px] xl:h-[158px] bg-[#f8f8f2]">
                      <p className="pt-[19px] md:pt-[28px] xl:pt-[32px] text-[15px] md:text-[26px] xl:text-[30px] h-auto md:h-[55px] xl:h-[75px] font-poppins font-bold text-center text-[#1b1b1b]">
                        <span className='text-[#92000a]'>L</span>IFE STYLE
                      </p>
                      <p className="pt-[0px] md:pt-[10px] xl:pt-[12px] text-[15px] md:text-[18px] xl:text-[22px] font-normal text-center text-[#1b1b1b] tracking-[-0.35px] md:tracking-[-0.45px] xl:tracking-[-0.55px]">
                        생의 주기를 함께 하는 회사
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* 조직도 */}
              <div className="relative w-full max-w-[1920px] mx-auto pt-[90px] md:pt-[150px] lg:pt-[180px] xl:pt-[200px] bg-white">
                <div className="relative w-full">
                  <motion.p 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-[17px] md:text-[26px] lg:text-[28px] xl:text-[30px] font-poppins font-medium sm:font-semibold text-center text-[#1b1b1b] "
                  >
                    Organizational chart
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="h-[38px] lg:h-[68px] mt-[12px] md:mt-[20px] lg:mt-[22px] xl:mt-[24px] text-[32px] md:text-[46px] lg:text-[50px] xl:text-[56px] font-medium text-center text-[#92000a] tracking-[-1.6px] md:tracking-[-2.8px] leading-[40px] md:leading-[74px]"
                  >
                    조직도
                  </motion.p>
                  <div 
                    ref={containerRef_Org}
                    onMouseDown={handleOrgMouseDown}
                    onMouseMove={handleOrgMouseMove}
                    onMouseUp={handleOrgMouseUp}
                    onMouseLeave={handleOrgMouseLeave}
                    onTouchStart={handleOrgTouchStart}
                    onTouchMove={handleOrgTouchMove}
                    onTouchEnd={handleOrgTouchEnd}
                    onScroll={handleOrgScroll}
                    className="relative mt-[20px]  md:aspect-[1920/1280] overflow-y-hidden md:overflow-x-auto justify-items-center cursor-grab active:cursor-grabbing"
                    style={{
                      userSelect: 'none',
                      scrollBehavior: isOrgDragging ? 'auto' : 'auto'
                    }}
                  >
                    {/* 조직도 컨테이너 */}
                    <div ref={childRef_Org} className="relative w-full md:w-full h-[530px] md:h-full mt-[0px] md:mt-[-30px]  ">
                      <div className="absolute w-[810px] md:w-full h-[530px]  md:h-full top-[10%] md:top-[20%] xl:top-[18%]  ">
                        
                        {/* 배경 이미지 추가 */}
                        <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2   h-auto">
                          <img 
                            src="/Images/company/grid_bg.webp" 
                            alt="grid background" 
                            className="w-full h-full object-contain"
                          />
                        </div> 
                        {/* 중앙 W.I.L 로고 */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          viewport={{ once: true }}
                          className="absolute top-[22.5%] left-[38.2%] w-[23.125%] aspect-1 bg-[#92000a] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[45px] md:text-[5.208vw] 2xl:text-[100px] font-poppins font-semibold text-white">W.I.L</p>
                        
                        </motion.div>

                        {/* 왼쪽 그룹 */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 100, y: 100 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          viewport={{ once: true }}
                          className="absolute top-[3.6%] left-[26.3%] w-[13.5%] aspect-1 bg-[#e6646c] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[13px] md:text-[2vw] 2xl:text-[32px] text-normal text-center tracking-[-0.35px] text-[#ffffff]"><span className="font-poppins font-normal">R&D</span>본부</p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 50, y: 50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          viewport={{ once: true }}
                          className="absolute top-[-7.5%] left-[26.5%] w-[6.25%] aspect-1 bg-[#FFD7D7] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[7px] md:text-[1vw] 2xl:text-[16px] text-normal text-center tracking-[-0.35px]">언더웨어</p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 50, y: 50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          viewport={{ once: true }}
                          className="absolute top-[-2%] left-[20%] w-[6.25%] aspect-1 bg-[#FFD7D7] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[7px] md:text-[1vw] 2xl:text-[16px] text-normal text-center tracking-[-0.35px]">라운지웨어</p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 50, y: 50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          viewport={{ once: true }}
                          className="absolute top-[-6.8%] left-[34.2%] w-[6.25%] aspect-1 bg-[#FFD7D7] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[7px] md:text-[1vw] 2xl:text-[16px] text-normal text-center tracking-[-0.35px]">텍스타일</p>
                        </motion.div>
                       
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 50, y: 50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          viewport={{ once: true }}
                          className="absolute top-[9.3%] left-[18.6%] w-[6.25%] aspect-1 bg-[#FFD7D7] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[7px] md:text-[1vw] 2xl:text-[16px] text-normal text-center tracking-[-0.35px]">콘텐츠기획</p>
                        </motion.div>

                        {/* 오른쪽 그룹 */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: -20, y: 100 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          viewport={{ once: true }}
                          className="absolute top-[3.8%] right-[42.2%] w-[7.292%] aspect-1 bg-[#f2999f] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[8px] md:text-[1vw] 2xl:text-[20px] text-normal text-center tracking-[-0.32px] text-[#ffffff]">기획생산팀</p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: -100, y: 50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          viewport={{ once: true }}
                          className="absolute top-[16.4%] right-[21.5%] w-[13.5%] aspect-1 bg-[#d5525b] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[13px] md:text-[2vw] 2xl:text-[32px] text-normal text-center tracking-[-0.51px] text-[#ffffff]">물류센터</p>
                        </motion.div>
                        {/* <motion.div 
                          initial={{ opacity: 0, scale: 0, x: -100, y: 100 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          viewport={{ once: true }}
                          className="absolute top-[4.5%] right-[40.2%] w-[7.292%] aspect-square bg-[#f2999f] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[8px] md:text-[0.833vw] text-normal text-center tracking-[-0.32px] text-[#ffffff]">경영지원팀</p>
                        </motion.div> */}
                        
                        {/* <motion.div 
                          initial={{ opacity: 0, scale: 0, x: -100, y: 100 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          viewport={{ once: true }}
                          className="absolute top-[11%] right-[14%] w-[13.021%] aspect-square bg-[#ce5f66] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[14px] md:text-[1.521vw] text-normal text-center tracking-[-0.51px] text-[#ffffff]">베트남<br/>제조법인</p>
                        </motion.div> */}
                        
                        {/* 왼쪽 아래 그룹 */}
                         <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 150, y: -50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          viewport={{ once: true }}
                          className="absolute top-[40%] left-[20%] w-[13.5%]
                           aspect-1 bg-[#ce5f66] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[13px] md:text-[2vw] 2xl:text-[32px] text-normal text-center tracking-[-0.51px] text-[#ffffff]">베트남생산법인</p>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 50, y: -50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          viewport={{ once: true }}
                          className="absolute top-[64.5%] left-[41%] w-[7.292%] aspect-1 bg-[#df9398] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[8px] md:text-[1vw] 2xl:text-[20px] text-normal text-center tracking-[-0.32px] text-[#ffffff]">경영지원팀</p>
                        </motion.div>

                        {/* <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 100, y: -100 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                          viewport={{ once: true }}
                          className="absolute top-[51.5%] left-[26.5%] w-[9.375%] aspect-square bg-[#f2bbbf] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[10px] md:text-[1.146vw] text-normal text-center tracking-[-0.35px] text-[#1b1b1b]">홈쇼핑<br/>커머스팀</p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 100, y: -100 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                          viewport={{ once: true }}
                          className="absolute top-[64%] left-[19.3%] w-[9.375%] aspect-square bg-[#f2bbbf] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[10px] md:text-[1.146vw] text-normal text-center tracking-[-0.35px] text-[#1b1b1b]">온라인<br/>커머스팀</p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: 100, y: -100 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.7 }}
                          viewport={{ once: true }}
                          className="absolute top-[67%] left-[30%] w-[9.375%] aspect-square bg-[#f2bbbf] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[10px] md:text-[1.146vw] text-normal text-center tracking-[-0.35px] text-[#1b1b1b]">오프라인<br/>커머스팀</p>
                        </motion.div> */}

                        {/* 오른쪽 아래 그룹 */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: -100, y: -100 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          viewport={{ once: true }}
                          className="absolute top-[52.6%] right-[25%] w-[13.5%] aspect-1 bg-[#e6646c] rounded-full flex items-center justify-center z-10"
                        >
                          <p className="text-[13px] md:text-[2vw] 2xl:text-[32px] text-normal text-center tracking-[-0.51px] text-[#ffffff]">유통본부</p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: -50, y: -50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          viewport={{ once: true }}
                          className="absolute top-[58%] right-[17.2%] w-[6.25%] aspect-1 bg-[#fbdadc] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[7px] md:text-[1vw] 2xl:text-[16px] text-normal text-center tracking-[-0.26px] text-[#1b1b1b]"><span className="font-poppins font-normal">OFF-</span>커머스</p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: -50, y: -50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.6}}
                          viewport={{ once: true }}
                          className="absolute top-[69%] right-[18.7%] w-[6.25%] aspect-1 bg-[#fbdadc] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[7px] md:text-[1vw] 2xl:text-[16px] text-normal text-center tracking-[-0.26px] text-[#1b1b1b]">무인매장</p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: -50, y: -50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.7 }}
                          viewport={{ once: true }}
                          className="absolute top-[75%] right-[25.2%] w-[6.25%] aspect-1 bg-[#fbdadc] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[7px] md:text-[1vw] 2xl:text-[16px] text-normal text-center tracking-[-0.26px] text-[#1b1b1b]"><span className="font-poppins font-normal">E</span>-커머스</p>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, scale: 0, x: -50, y: -50 }}
                          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                          viewport={{ once: true }}
                          className="absolute top-[74%] right-[32.8%] w-[6.25%] aspect-1 bg-[#fbdadc] rounded-full flex items-center justify-center"
                        >
                          <p className="text-[7px] md:text-[1vw] 2xl:text-[16px] text-normal text-center tracking-[-0.26px] text-[#1b1b1b]"><span className="font-poppins font-normal">T</span>-커머스</p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 조직도 컨테이너 끝 */}
                {/* 히스토리 */}
                <div id="organization" className="relative w-full h-fit mt-[20px] md:mt-[100px] xl:mt-[200px] flex flex-col sm:flex-row items-start justify-evenly bg-white overflow-visible">
                  {/* 히스토리 타이틀 */}
                  <div className="sm:right-[64%] top-[50px] pt-[30px] w-full sm:w-fit md:top-[250px] xl:top-[300px] h-fit z-10 sticky-title px-5 md:px-8 xl:px-[0px] bg-white max-sm:flex max-sm:flex-col max-sm:items-center max-sm:justify-center flex-shrink-0">
                    {/* ... 타이틀 컨텐츠 ... */}
                    <motion.p 
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      className="text-[17px] sm:text-[24px] md:text-[26px] xl:text-[30px] font-poppins font-medium sm:font-semibold text-center sm:text-start text-[#1b1b1b]"
                    >
                      History
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="pt-[12px] md:pt-[20px] xl:pt-[24px] text-[32px] sm:text-[36px] md:text-[42px] 2xl:text-[56px] font-medium text-center sm:text-start text-[#92000a] tracking-[-1.8px] md:tracking-[-2.3px] xl:tracking-[-2.8px] leading-[48px] md:leading-[62px] xl:leading-[74px] z-50"
                    >
                      가치를 만들어 온 여정
                    </motion.p>
                  </div>

                  {/* 히스토리 스크롤 영역 */}
                  <ReactLenis
                    ref={historyContainerRef}
                    options={{
                      ...lenisOptions,
                      orientation: 'vertical',
                      gestureOrientation: 'vertical',
                    }}
                    className="relative w-full sm:w-[50%] xl:w-[30%] 2xl:w-[50%] mt-[40px] sm:mt-[50px] sm:px-5 md:px-8 xl:px-0 2xl:left-[10%] z-0 flex flex-col items-center justify-start flex-shrink-0 h-[250px] sm:h-[700px] overflow-y-auto"
                    style={{ 
                      WebkitOverflowScrolling: 'touch',
                      msOverflowStyle: 'none',
                      scrollbarWidth: 'none',
                    }}
                    onScroll={updateHistoryColors}
                  >
                    <div 
                      ref={historyScrollRef} // 실제 스크롤 컨테이너에 ref 추가
                      className="w-full h-full"
                    >
                      <div className="hidden sm:block absolute w-full h-full z-20"></div>
                      {/* 히스토리 아이템들 */}
                      {/* ... 기존 히스토리 아이템 컨텐츠 ... */}
                      <div className="history-item relative w-auto h-auto sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2026
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            코스트코 오프라인 입점
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            평택 미군기지 팝업 행사
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:mt-[0px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2025
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            라페어 인견팬티 &quot;1000만장&quot; 돌파
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            퀸잇 입점
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            라페어라운지 (무인매장)
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:mt-[0px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2024
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            라페어 카카오 메이커스 입점
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:mt-[0px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2023
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            GS홈쇼핑 L&apos;AFFAIR 채널 확장
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            마켓컬리 입점
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2022
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            브라런닝 자체 개발 
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                            선데이라운지 카카오메이커스 런칭
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2021
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                        베트남 호치민에 ㈜더블유아이엘 법인 생산 공장 설립
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                        라페어 언더웨어 쿠팡 입점
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                        선데이라운지 카카오톡 선물하기 입점
                          </p>
                          
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2019
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                        신세계TV쇼핑 패션카테고리 판매 1위

                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          SK스토아 L&apos;AFFAIR 런칭
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2018
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          쇼핑엔티 라페어 런칭/ 신세계TV쇼핑 신세계백화점 PB브랜드 ELLACONIC 런칭
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          현대백화점 판교점 / 신세계백화점 하남 스타필드점 / 현대시티아울렛 가든파이브 /
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          인천공항 제 2청사 트레블메이트 입점 / 라페어 청담 SSG 입점
                          </p>
                          
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2017
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          선데이라운지 29CM, MUSINSA(무신사) / ETC.SEOUL 가로수길점 입점
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2016
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          신세계 백화점 대구, 김해, 센텀시티, 강남, 인천점 / 갤러리아 타임월드점(대전) 입점
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          스타필드 하남 WONDER A MARKET / 메세나 폴리스 REST AND GOODS / 10x10 입점
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2015
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          현대 백화점 판교점 라운징샵 입점
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          L&apos;AFFAIR 신세계 백화점 경기점 런칭 / L&apos;AFFAIR 라운지웨어 라인 전개
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          선데이라운지 런칭
                          </p>
                          
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2014
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          중국 스촨 매장 오픈
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2013
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          대만 타이중 L&apos;AFFAIR 매장 오픈

                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          자사몰 L&apos;AFFAIR 리뉴얼 오픈
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2011
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          프랑스 란제리 라이선스 브랜드 ROSY 롯데/현대홈쇼핑 런칭
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2010
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          사명 주식회사 더싸인 (THE SIGN) 으로 개명
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          CACHAREL 300억 돌파
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          CACHAREL 갤러리아 백화점 압구정점 / 신세계 백화점 인천점 / 런칭
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          프랑스 란제리 브랜드 ROSY 라이선스 계약 체결
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          CLARA YOON 현대홈쇼핑 런칭
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          평양 봉화 제 2공장 생산라인 설비투자
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          프랑스 란제리 브랜드 CACHAREL 라이선스 계약체결
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2009
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          CLARA YOON 라이선스 계약체결
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          CJ O쇼핑 PB브랜드 THE GUY 생산, 납품
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          lollipops 신세계 백화점 본점 / 강남점 입점
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          프랑스 언더웨어 브랜드 lollipops 라이선스, 직수입 계약체결
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          (주)형지어패럴 크로커다일 레이디 언더웨어 디자인, 생산, 납품
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          CACHAREL 100억 돌파(신세계백화점 강남점 입점)
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2008
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          현대홈쇼핑 PB브랜드 H.only U 생산, 납품
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          ㈜트라이브랜즈 & STYLE 디자인, 생산, 납품
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2007
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          CJ홈쇼핑 PB브랜드 피델리아 생산, 납품
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          CACHAREL 현대홈쇼핑 / INVU CJ홈쇼핑 런칭
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          자체 쇼핑몰 www.lebody.co.kr 구축
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          프랑스 명품 브랜드 CACHAREL(까샤렐) 라이센스 계약 체결
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          NEAT SOUL 선우용녀 연예인 실버타겟 니트브랜드 CJ홈쇼핑 방송런칭
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          엘리프리 블랙라벨 판매 100억 돌파
                          </p>
                          
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2006
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          평양 봉화 제 2공장 생산라인 구축
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          아씨우리옷 아동한복 우리홈쇼핑, CJ홈쇼핑 방송런칭
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          INVU underwear 라이센스 계약, 기획, 온라인 런칭
                          </p>
                          
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2005
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          현대홈쇼핑 독점 황신혜 브랜드
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          엘리프리 블랙라벨(ELYPRY BLACK LABEL) 런칭
                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          UCLA 언더웨어 현대홈쇼핑 방송 런칭
                          </p>
                          
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2004
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          글로벌 브랜드 제휴를 통한 홈쇼핑 상품개발 - 이랜드, 디즈니, UCLA
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2002
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          GS홈쇼핑,우리홈쇼핑,농수산홈쇼핑,현대홈쇼핑 홈쇼핑 사업 전개
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          2001
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          ㈜THE SIGN ENTERPRISE 법인 설립
                          </p>
                        </div>
                      </div>

                      <div className="history-item relative w-auto h-auto mt-[25px] sm:pb-[60px] md:pb-[80px] xl:pb-[100px] max-sm:flex max-sm:flex-row max-sm:items-start max-sm:justify-start max-sm:gap-[25px]">
                        <p className="relative text-[47px] md:text-[82px] xl:text-[102px] font-poppins font-semibold flex items-start sm:items-end leading-none max-sm:w-[120px] h-[60px] md:h-[86px] xl:h-[107px] text-[#979797]">
                          1998
                        </p>
                        <div className="w-fit max-sm:w-[calc(130px+15vw)] h-auto sm:mt-[20px] md:mt-[50px] xl:mt-[60px] max-sm:flex max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-[4px]">
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          장은 카드, 외환카드, 삼성카드 등 카드사 통신 판매

                          </p>
                          <p className="text-[12px] md:text-[18px] xl:text-[22px] font-normal text-left tracking-[-0.25px] md:tracking-[-0.3px] xl:tracking-[-0.35px] text-[#979797]">
                          THE SIGN 설립
                          </p>
                        </div>
                      </div>

                      <div className="block history-item relative w-auto h-[150px] sm:h-[500px] md:h-[380px] lg:h-[400px] xl:h-[300px] 2xl:h-[300px] mt-[25px]">
                       
                      </div>
                    </div>
                  </ReactLenis>
                </div>
              </div>
            </div>

            {/* 함께 하는 협력사 섹션 */}
            <div className="relative w-full h-[fit] bg-white">
              <div className="relative w-auto h-[fit] mt-[100px] md:mt-[150px] xl:mt-[200px] left-1/2 translate-x-[-50%] flex flex-col items-center justify-center">
                <motion.p 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-[18px] sm:text-[24px] md:text-[26px] xl:text-[30px] font-poppins font-medium sm:font-semibold text-center text-[#1b1b1b]"
                >
                  cooperative company
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="pt-[12px] md:pt-[20px] xl:pt-[24px] text-[32px] sm:text-[36px] md:text-[46px] xl:text-[56px] font-medium text-center text-[#92000a] tracking-[-1.6px] md:tracking-[-2.3px] xl:tracking-[-2.8px] leading-[48px] md:leading-[62px] xl:leading-[74px]"
                >
                  함께 하는 협력사
                </motion.p>
              </div>
              <div className="relative w-full   h-[80px] sm:h-[120px] md:h-[240px] xl:h-[280.8px] mt-[40px] md:mt-[80px] xl:mt-[100px] overflow-hidden">
                {/* 첫 번째 줄 - 왼쪽으로 이동 */}
                <div className="relative w-auto h-auto flex items-start">
                  <motion.div 
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear"
                    }}
                    className="flex items-center justify-center h-[40px] md:h-[56px] xl:h-[73px] shrink-0"
                  >
                    <div className="flex items-center gap-[40px] md:gap-[70px] xl:gap-[100px] pr-[40px] md:pr-[70px] xl:pr-[100px]">
                      <img src="/Images/company/etc/m.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 m 로고"/>
                      <img src="/Images/company/etc/29-cm.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 29CM 로고"/>
                      <img src="/Images/company/etc/w.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 w 로고"/>
                      <img src="/Images/company/etc/ssg.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 SSG 로고"/>
                      <img src="/Images/company/etc/h.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 h 로고"/>
                      <img src="/Images/company/etc/s.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 s 로고"/>
                      <img src="/Images/company/etc/ss.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 ss 로고"/>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear"
                    }}
                    className="flex items-center justify-center h-[40px] md:h-[56px] xl:h-[73px] shrink-0"
                  >
                    <div className="flex items-center gap-[40px] md:gap-[70px] xl:gap-[100px] pr-[40px] md:pr-[70px] xl:pr-[100px]">
                      <img src="/Images/company/etc/m.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 m 로고"/>
                      <img src="/Images/company/etc/29-cm.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 29CM 로고"/>
                      <img src="/Images/company/etc/w.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 w 로고"/>
                      <img src="/Images/company/etc/ssg.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 SSG 로고"/>
                      <img src="/Images/company/etc/h.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 h 로고"/>
                      <img src="/Images/company/etc/s.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 s 로고"/>
                      <img src="/Images/company/etc/ss.webp" className="h-[16px] sm:h-[24px] md:h-[28px] xl:h-auto w-auto" alt="파트너사 ss 로고"/>
                    </div>
                  </motion.div>
                </div>

                {/* 두 번째 줄 - 오른쪽으로 이동 */}
                <div className="relative w-auto h-auto mt-[0px] sm:mt-[20px] md:mt-[80px] xl:mt-[100px] flex items-start">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear"
                    }}
                    className="flex items-center justify-center h-[50px] md:h-[70px] xl:h-[90px] shrink-0"
                  >
                    <div className="flex items-center justify-center gap-[40px] md:gap-[70px] xl:gap-[100px] pr-[40px] md:pr-[70px] xl:pr-[100px]">
                      <img src="/Images/company/etc/sk.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 SK 로고"/>
                      <img src="/Images/company/etc/l.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 L 로고"/>
                      <img src="/Images/company/etc/ns.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 NS 로고"/>
                      <img src="/Images/company/etc/kt.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 KT 로고"/>
                      <img src="/Images/company/etc/gs.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 GS 로고"/>
                      <img src="/Images/company/etc/hs.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 HS 로고"/>
                      <img src="/Images/company/etc/hh.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 HH 로고"/>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear"
                    }}
                    className="flex items-center justify-center h-[50px] md:h-[70px] xl:h-[90px] shrink-0"
                  >
                    <div className="flex items-center justify-center gap-[40px] md:gap-[70px] xl:gap-[100px] pr-[40px] md:pr-[70px] xl:pr-[100px]">
                      <img src="/Images/company/etc/sk.webp" className="h-[16px] sm:h-[24px]  md:h-[35px] xl:h-auto w-auto" alt="파트너사 SK 로고"/>
                      <img src="/Images/company/etc/l.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 L 로고"/>
                      <img src="/Images/company/etc/ns.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 NS 로고"/>
                      <img src="/Images/company/etc/kt.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 KT 로고"/>
                      <img src="/Images/company/etc/gs.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 GS 로고"/>
                      <img src="/Images/company/etc/hs.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 HS 로고"/>
                      <img src="/Images/company/etc/hh.webp" className="h-[16px] sm:h-[24px] md:h-[35px] xl:h-auto w-auto" alt="파트너사 HH 로고"/>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* 오시는 길 섹션 */}
            {/*<div id="location" className="relative w-full h-auto bg-white">
              <div className="relative w-auto h-auto mt-[90px] md:mt-[150px] lg:mt-[180px] xl:mt-[200px] px-5 md:px-8 lg:px-[60px] xl:px-0 flex flex-col items-center justify-center">
                <motion.p 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-[17px] md:text-[26px] lg:text-[28px] xl:text-[30px] font-poppins font-medium sm:font-semibold text-center text-[#1b1b1b]"
                >
                  Address
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="pt-[12px] md:pt-[20px] lg:pt-[22px] xl:pt-[24px] text-[32px] md:text-[46px] lg:text-[50px] xl:text-[56px] font-medium text-center text-[#92000a] tracking-[-1.8px] md:tracking-[-2.3px] lg:tracking-[-2.5px] xl:tracking-[-2.8px] leading-[48px] md:leading-[62px] lg:leading-[68px] xl:leading-[74px]"
                >
                  무인매장 오시는 길
                </motion.p>
              </div>

              {// 매장 위치 정보 컨테이너 //}
              <div className="relative w-full h-auto mt-[30px] sm:mt-[60px] md:mt-[80px] lg:mt-[90px] xl:mt-[100px] flex flex-col items-center justify-center gap-[22px] md:gap-[60px] lg:gap-[60px] xl:gap-[60px] px-[30px] md:px-8 lg:px-[60px] xl:px-[117px]">
                {// 신사역점 //}
                <div className="relative w-full flex flex-col lg:flex-row xl:flex-row items-center justify-center  lg:gap-[40px] xl:gap-[54px]">
                  <div className="relative w-full md:w-[700px] lg:w-[320px] xl:w-[380px] h-[144px] md:h-[220px] lg:h-[380px] xl:h-[446px] flex items-center justify-start sm:justify-center bg-[#323232] ">
                    <div className="relative w-auto h-auto flex-col items-start justify-start px-[37px] md:px-[30px] lg:px-[35px] xl:px-[40px]">
                      <p className="text-[17px] md:text-[26px] lg:text-[28px] xl:text-[30px] font-semibold text-left text-[#ffffff]">신사역점</p>
                      <p className="mt-[0px] md:mt-[16px] lg:mt-[19px] xl:mt-[22px] text-[12px] md:text-[18px] lg:text-[20px] xl:text-[22px] font-normal text-left text-[#ffffff] tracking-[-0.4px] leading-[24px] md:leading-[28px] lg:leading-[32px] xl:leading-[36px]">
                        서울 강남구 도산대로 102
                        <br className="hidden sm:block"/> 신분당선 신사역
                        </p>
                    </div>
                  </div>
                  <div className="relative w-full md:w-[700px] lg:w-[644px] xl:w-[1069px] h-[280px] md:h-[400px] lg:h-[380px] xl:h-[446px]  overflow-hidden">
                    <div id="sinsa-map" className="relative w-full md:w-[700px] lg:w-[644px] xl:w-[1069px] h-[280px] md:h-[400px] lg:h-[380px] xl:h-[446px]  overflow-hidden"></div>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10">
                    </div>
                  </div>
                </div>

                {// 신논현역점 //}
                <div className="relative w-full flex flex-col-reverse lg:flex-row xl:flex-row items-center justify-center lg:gap-[40px] xl:gap-[54px]">
                  <div className="relative w-full md:w-[700px] lg:w-[644px] xl:w-[1069px] h-[280px] md:h-[400px] lg:h-[380px] xl:h-[446px]  overflow-hidden">
                    <div id="sinnonhyeon-map"
                    className="relative w-full md:w-[700px] lg:w-[644px] xl:w-[1069px] h-[280px] md:h-[400px] lg:h-[380px] xl:h-[446px]   overflow-hidden"></div>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10">
                    </div>
                  </div>
                  <div className="relative w-full md:w-[700px] lg:w-[320px] xl:w-[380px] h-[144px] md:h-[220px] lg:h-[380px] xl:h-[446px] flex items-center justify-start sm:justify-center bg-[#323232]  ">
                    <div className="relative w-auto h-auto flex-col items-start justify-start pl-[37px] md:px-[30px] lg:px-[35px] xl:px-[40px]">
                      <p className="text-[17px] md:text-[26px] lg:text-[28px] xl:text-[30px] font-semibold text-left text-[#ffffff]">신논현역점</p>
                      <p className="mt-[0px] md:mt-[16px] lg:mt-[19px] xl:mt-[22px] text-[12px] md:text-[18px] lg:text-[20px] xl:text-[22px] font-normal text-left text-[#ffffff] tracking-[-0.4px] leading-[24px] md:leading-[28px] lg:leading-[32px] xl:leading-[36px]">
                        서울 강남구 봉은사로 102
                        <br className="hidden sm:block"/> 신분당선 신논현역
                        </p>
                    </div>
                  </div>
                </div>

                {// 논현역점 //}
                <div className="relative w-full flex flex-col lg:flex-row xl:flex-row items-center justify-center  lg:gap-[40px] xl:gap-[54px]">
                  <div className="relative w-full md:w-[700px] lg:w-[320px] xl:w-[380px] h-[144px] md:h-[220px] lg:h-[380px] xl:h-[446px] flex items-center sm:justify-center justify-start bg-[#323232]  ">
                    <div className="relative w-auto h-auto flex-col items-start justify-start pl-[37px] md:px-[30px] lg:px-[35px] xl:px-[40px]">
                      <p className="text-[17px] md:text-[26px] lg:text-[28px] xl:text-[30px] font-semibold text-left text-[#ffffff]">논현역점</p>
                      <p className="mt-[0px] md:mt-[16px] lg:mt-[19px] xl:mt-[22px] text-[12px] md:text-[18px] lg:text-[20px] xl:text-[22px] font-normal text-left text-[#ffffff] tracking-[-0.4px] leading-[24px] md:leading-[28px] lg:leading-[32px] xl:leading-[36px]">
                        서울 강남구 학동로 102
                        <br className="hidden sm:block"/>신분당선 논현역
                        </p>
                    </div>
                  </div>
                  <div className="relative w-full md:w-[700px] lg:w-[644px] xl:w-[1069px] h-[280px] md:h-[400px] lg:h-[380px] xl:h-[446px]  overflow-hidden">
                    <div id="nonhyeon-map" className="relative w-full md:w-[700px] lg:w-[644px] xl:w-[1069px] h-[280px] md:h-[400px] lg:h-[380px] xl:h-[446px]   overflow-hidden"></div>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10">
                    </div>
                  </div>
                </div>
              </div>
            </div>*/}

            {/* 본사 위치 섹션 */}
            <div id="location" className="relative w-full mt-[90px] sm:mt-[200px] mb-[100px] sm:mb-[200px] h-fit bg-[#ffffff] flex flex-col items-center justify-start">
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-[17px] md:text-[26px] xl:text-[30px] font-poppins font-medium sm:font-semibold text-center text-[#1b1b1b]"
              >
                Address
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="pt-[12px] md:pt-[20px] xl:pt-[24px] text-[32px] md:text-[46px] xl:text-[56px] font-medium text-center text-[#92000a] tracking-[-1.8px] md:tracking-[-2.3px] xl:tracking-[-2.8px] leading-[48px] md:leading-[62px] xl:leading-[74px]"
              >
                더블유아이엘 오시는 길
              </motion.p>
              <div className="relative w-full md:w-[700px] xl:w-[1251px] h-auto xl:h-[701px] mt-[36px] md:mt-[80px] xl:mt-[100px] flex-col items-start justify-start px-0 sm:px-5 md:px-0">
                <div className="relative w-auto h-auto flex flex-wrap md:flex-nowrap items-center justify-center gap-[20px] md:gap-[30px] xl:gap-[50px]">
                  <button 
                    onClick={() => handleTabChange('headquarters')}
                    className={`text-[12px] md:text-[20px] xl:text-[24px] text-center tracking-[-0.45px] md:tracking-[-0.5px] xl:tracking-[-0.62px] ${selectedTab === 'headquarters' ? 'text-[#2f2e2c] font-bold' : 'text-[#999999] font-normal'}`}
                  >
                    본사
                  </button>
                  <button 
                    onClick={() => handleTabChange('logistics')}
                    className={`text-[12px] md:text-[20px] xl:text-[24px] text-center tracking-[-0.45px] md:tracking-[-0.5px] xl:tracking-[-0.62px] ${selectedTab === 'logistics' ? 'text-[#2f2e2c] font-bold' : 'text-[#999999] font-normal'}`}
                  >
                    물류센터
                  </button>
                  <button 
                    onClick={() => handleTabChange('vietnam')}
                    className={`text-[12px] md:text-[20px] xl:text-[24px] text-center tracking-[-0.45px] md:tracking-[-0.5px] xl:tracking-[-0.62px] ${selectedTab === 'vietnam' ?  'text-[#2f2e2c] font-bold' : 'text-[#999999] font-normal'}`}
                  >
                    베트남법인
                  </button>
                  <button 
                    onClick={() => handleTabChange('shinsegae')}
                    className={`text-[12px] md:text-[20px] xl:text-[24px] text-center tracking-[-0.45px] md:tracking-[-0.5px] xl:tracking-[-0.62px] ${selectedTab === 'shinsegae' ?  'text-[#2f2e2c] font-bold' : 'text-[#999999] font-normal'}`}
                  >
                    신세계백화점 김해점
                  </button>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => handleArrowClick('prev')} 
                    className="hidden 2xl:block absolute -left-[60px] top-[50%] z-10 hover:opacity-70 transition-opacity"
                  >
                    <SlArrowLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <div className="relative w-full mt-[16px] sm:mt-[32px] h-[258px] sm:h-[400px] md:h-[500px] xl:h-[516px] bg-[#f8f8f2]"> {/* 지도 컨테이너 wrapper */}
                    <div 
                      id="kakao-map-container" 
                      className="absolute top-0 left-0 w-full h-full"
                      style={{ 
                        display: selectedTab === 'vietnam' ? 'none' : 'block'
                      }}
                    />
                    <div 
                      id="google-map-container" 
                      className="absolute top-0 left-0 w-full h-full"
                      style={{ 
                        display: selectedTab === 'vietnam' ? 'block' : 'none'
                      }}
                    />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10"></div>
                  </div>
                    <button 
                    onClick={() => handleArrowClick('next')}
                    className="hidden 2xl:block absolute -right-[60px] top-[50%] z-10 hover:opacity-70 transition-opacity"
                  >
                    <SlArrowRight className="w-6 h-6 text-gray-600" />
                  </button>  
                </div>
                <div className="relative pl-[28px] sm:pl-[0px] mt-[20px] md:mt-[50px] xl:mt-[60px] w-full md:w-[700px] xl:w-[1250px] h-auto flex flext-row sm:flex-col md:flex-row items-start">
                  <p className="text-[20px] w-[40%] pr-[20px] sm:pr-[0px] md:text-[32px] xl:text-[40px] font-bold text-left text-[#2f2e2c] tracking-[-0.7px] md:tracking-[-0.8px] xl:tracking-[-1.04px] break-keep">
                    {locations[selectedTab].title}
                  </p>
                  <div className="flex-col items-start justify-start w-[55%] mt-[0px] md:mt-0 xl:absolute xl:left-[40%]">
                  <div className="flex items-start justify-start">
                    <p className="text-[11px] md:text-[18px] xl:text-[22px] font-bold text-left text-[#2f2e2c] tracking-[-0.4px] md:tracking-[-0.45px] xl:tracking-[-0.57px] w-[32px] md:w-[55px] xl:w-[60px]">주소</p>
                    <p className="ml-[12px] md:ml-[15px] xl:ml-[17px] text-[11px] md:text-[18px] xl:text-[22px] w-full font-normal text-left text-[#2f2e2c] tracking-[-0.4px] md:tracking-[-0.45px] xl:tracking-[-0.57px] break-keep">
                      {locations[selectedTab].address}
                    </p>
                  </div>
                  <div className="flex items-start justify-start mt-[8px] md:mt-[10px] xl:mt-[12px]">
                    <p className="text-[11px] md:text-[18px] xl:text-[22px] font-bold text-left text-[#2f2e2c] tracking-[-0.4px] md:tracking-[-0.45px] xl:tracking-[-0.57px] w-[32px] md:w-[55px] xl:w-[60px]">전화</p>
                    <p className="ml-[12px] md:ml-[15px] xl:ml-[17px] text-[11px] md:text-[18px] xl:text-[22px] w-full font-normal text-left text-[#2f2e2c] tracking-[-0.4px] md:tracking-[-0.45px] xl:tracking-[-0.57px]">
                      {locations[selectedTab].phone}
                    </p>
                  </div>
                </div>
                </div>
                
              </div>
            </div>
          </main>
        </div>
      </div>
    </ReactLenis>
  );
};

export default Company;
