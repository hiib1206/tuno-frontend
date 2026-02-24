"use client";

import { BrandText } from "@/components/ui/BrandText";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 border-t border-white/10 pt-20 pb-10 text-white relative">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-16 flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
        {/* Brand */}
        <div>
          <h2 className="text-3xl mb-4">
            <BrandText className="text-accent text-3xl">Tuno</BrandText>
            <span className="text-[#00AE43]">.</span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            AI 기반 투자 분석 플랫폼
            <br />
            더 나은 투자 판단을 위한 도구
          </p>
          <p className="text-white/25 text-xs mt-4">
            contact@tunoinvest.com
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-16 sm:gap-20">
          <div>
            <h4 className="font-bold text-sm mb-4">서비스</h4>
            <ul className="space-y-2.5 text-white/40 text-sm">
              <li className="hover:text-white/60 transition-colors cursor-pointer">퀀트 시그널</li>
              <li className="hover:text-white/60 transition-colors cursor-pointer">스냅백 분석</li>
              <li className="hover:text-white/60 transition-colors cursor-pointer">종목 탐색</li>
              <li className="hover:text-white/60 transition-colors cursor-pointer">커뮤니티</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4">지원</h4>
            <ul className="space-y-2.5 text-white/40 text-sm">
              <li className="hover:text-white/60 transition-colors cursor-pointer">이용약관</li>
              <li className="hover:text-white/60 transition-colors cursor-pointer">개인정보처리방침</li>
              <li className="hover:text-white/60 transition-colors cursor-pointer">문의하기</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-16 mt-16 text-white/40 text-xs flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 Tuno. All rights reserved.</span>
        <span>본 서비스에서 제공되는 모든 정보는 투자판단의 참고자료이며, 서비스 이용에 따른 최종 책임은 이용자에게 있습니다.</span>
      </div>
    </footer>
  );
};

export default Footer;
