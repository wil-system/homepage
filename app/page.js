import Footer from './components/Footer.js'
import Main from './components/Main/index.js'

export const metadata = {
  title: "라페어라운지",
  description: "라페어라운지는 프리미엄 언더웨어, 파자마, 라운지웨어 전문 쇼핑몰입니다. 라페어라운지에서 편안하고 스타일리시한 라페어라운지 제품을 만나보세요. 전국 라페어라운지 무인매장에서도 24시간 구매 가능합니다.",
  openGraph: {
    title: "라페어라운지",
    description: "라페어라운지는 프리미엄 언더웨어, 파자마, 라운지웨어 전문 쇼핑몰입니다. 라페어라운지에서 편안하고 스타일리시한 라페어라운지 제품을 만나보세요.",
    url: "https://www.laffairlounge.co.kr",
    images: [
      {
        url: "https://www.laffairlounge.co.kr/Images/main_img/main.webp",
        width: 1200,
        height: 630,
        alt: "라페어라운지 대표 이미지"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "라페어라운지",
    description: "라페어라운지는 프리미엄 언더웨어, 파자마, 라운지웨어 전문 쇼핑몰입니다. 라페어라운지에서 편안하고 스타일리시한 라페어라운지 제품을 만나보세요.",
    images: ["https://www.laffairlounge.co.kr/Images/main_img/main.webp"]
  }
}

export default function Home() {
  return (
    <div className='min-h-screen'>
      <Main />
      <Footer />
    </div>
  )
}