'use client'
import React from 'react';
import { motion } from 'framer-motion';
import KakaoMap from '../Company/KakaoMap';

const STORE_LOCATIONS = {
  sinsa: { address: '서울 강남구 도산대로 102', label: '신사역점' },
  sinnonhyeon: { address: '서울특별시 강남구 봉은사로 102, 신논현역 신분당선 B3-1호 LAFFAIR매장', label: '신논현역점' },
  nonhyeon: { address: '서울특별시 강남구 학동로 102, 논현역 신분당선 B2-1호 LAFFAIR매장', label: '논현역점' }
};

const MuinStore = () => {
  return (
    <main className="relative w-full flex flex-col items-center justify-start pt-[90px] pb-[90px] md:pt-[150px] xl:pt-[200px] bg-white">
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-[17px] md:text-[26px] xl:text-[30px] font-poppins font-medium sm:font-semibold text-center text-[#1b1b1b]"
      >
        무인매장 안내
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="pt-[12px] md:pt-[20px] xl:pt-[24px] text-[32px] md:text-[46px] xl:text-[56px] font-medium text-center text-[#91000a] tracking-[-1.8px] md:tracking-[-2.3px] xl:tracking-[-2.8px] leading-[48px] md:leading-[62px] xl:leading-[74px]"
      >
        무인매장 오시는 길
      </motion.p>
      <section className="relative w-full h-auto mt-[30px] sm:mt-[60px] md:mt-[80px] lg:mt-[90px] xl:mt-[100px] flex flex-col items-center justify-center gap-[22px] md:gap-[60px] lg:gap-[60px] xl:gap-[60px] px-[30px] md:px-8 lg:px-[60px] xl:px-[117px]">
        {/* 신사역점 */}
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
          <div className="relative w-full md:w-[700px] lg:w-[644px] xl:w-[1069px] h-[280px] md:h-[400px] lg:h-[380px] xl:h-[446px] overflow-hidden">
            <KakaoMap location={{ address: STORE_LOCATIONS.sinsa.address }} label={STORE_LOCATIONS.sinsa.label} />
          </div>
        </div>
        {/* 신논현역점 */}
        <div className="relative w-full flex flex-col-reverse lg:flex-row xl:flex-row items-center justify-center lg:gap-[40px] xl:gap-[54px]">
          <div className="relative w-full md:w-[700px] lg:w-[644px] xl:w-[1069px] h-[280px] md:h-[400px] lg:h-[380px] xl:h-[446px]  overflow-hidden">
            <KakaoMap location={{ address: STORE_LOCATIONS.sinnonhyeon.address }} label={STORE_LOCATIONS.sinnonhyeon.label} />
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
        {/* 논현역점 */}
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
            <KakaoMap location={{ address: STORE_LOCATIONS.nonhyeon.address }} label={STORE_LOCATIONS.nonhyeon.label} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default MuinStore; 