"use client";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

interface Review {
  name: string;
  role: string;
  content: string;
  rating: number;
}

const reviews: Review[] = [
  {
    name: "현우",
    role: "직장인",
    content:
      "퀀트 시그널 보고 처음에 반신반의했는데, 실제로 BUY 뜬 종목 며칠 뒤에 오르더라구요. 물론 매번 맞는 건 아닌데 참고용으로는 진짜 괜찮습니다. 출근 전에 한번 훑어보는 게 루틴이 됐어요 ㅎㅎ",
    rating: 5,
  },
  {
    name: "수빈",
    role: "대학생",
    content:
      "주식 처음 시작했는데 차트 볼 줄 몰라서 막막했거든요. 여기서 AI가 차트 분석해주는 거 보고 이해가 좀 되기 시작했어요. 초보한테 진짜 유용합니다.",
    rating: 5,
  },
  {
    name: "민재",
    role: "프리랜서",
    content:
      "웹에서 바로 되니까 따로 앱 안 깔아도 되는 게 편하고, PC랑 폰이랑 왔다갔다 하면서 볼 수 있어서 좋아요. 관심종목 등록해두면 어디서든 바로 확인 가능하구요.",
    rating: 4,
  },
  {
    name: "지영",
    role: "개인 투자자",
    content:
      "커뮤니티에서 다른 분들 의견 보는 재미가 있어요. 혼자 판단하면 불안한데 여기서 종목별로 이야기 나누니까 시야가 넓어지는 느낌? 가끔 꿀정보도 올라옵니다 ㅋㅋ",
    rating: 4,
  },
  {
    name: "승호",
    role: "직장인",
    content:
      "솔직히 UI가 깔끔해서 처음 들어갔을 때 좀 놀랐어요. 증권사 앱들은 너무 복잡한데 여긴 딱 필요한 것만 보기 좋게 정리돼 있어서 보기 편합니다. 종목 검색도 빠르고요.",
    rating: 5,
  },
  {
    name: "예진",
    role: "주부",
    content:
      "남편이 추천해줘서 써봤는데 생각보다 쉽더라구요. 관심 있는 종목 넣어두면 알아서 분석해주니까 따로 공부 안 해도 흐름 파악이 되요. 아이 재우고 틈틈이 보기 딱 좋아요.",
    rating: 5,
  },
];

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`w-3.5 h-3.5 ${filled ? "text-[#00AE43]" : "text-slate-200"}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TiltCard = ({ review, index }: { review: Review; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    rotateX.set(-(y / rect.height) * 12);
    rotateY.set((x / rect.width) * 12);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      viewport={{ once: true, margin: "-60px" }}
      style={{ perspective: 800 }}
      className="h-full"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full flex flex-col bg-white rounded-2xl p-7 md:p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,174,67,0.1)] transition-shadow duration-500 cursor-default group/card"
      >
        {/* Quote mark */}
        <div
          className="absolute top-5 right-7 text-[4rem] font-serif leading-none text-[#00AE43]/[0.07] select-none pointer-events-none transition-colors duration-500 group-hover/card:text-[#00AE43]/[0.15]"
          style={{ transform: "translateZ(20px)" }}
        >
          &ldquo;
        </div>

        {/* Stars */}
        <div className="flex gap-0.5 mb-5" style={{ transform: "translateZ(15px)" }}>
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} filled={i < review.rating} />
          ))}
        </div>

        {/* Content */}
        <p
          className="flex-1 text-slate-600 text-xs mobile:text-sm md:text-[0.938rem] leading-[1.8] mb-7 break-keep whitespace-pre-line relative z-10"
          style={{ transform: "translateZ(30px)" }}
        >
          {review.content}
        </p>

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-5 group-hover/card:bg-[#00AE43]/20 transition-colors duration-500" />

        {/* Author */}
        <div className="flex items-center gap-3" style={{ transform: "translateZ(20px)" }}>
          <div className="w-9 h-9 rounded-full bg-[#00AE43]/10 flex items-center justify-center text-[#00AE43] font-bold text-xs shrink-0">
            {review.name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 leading-tight">
              {review.name}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{review.role}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ReviewMarquee() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-28 md:py-40 bg-[#f8f8f8]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-[#00AE43] font-bold tracking-widest uppercase text-[10px] mobile:text-sm mb-4 block">
            Reviews
          </span>
          <h2 className="text-xl mobile:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight break-keep">
            사용자들의 이야기
          </h2>
        </motion.div>

        {/* Mobile: Carousel with arrows */}
        <div className="sm:hidden">
          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TiltCard review={reviews[currentIndex]} index={0} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation: arrows + dots */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-[#00AE43] transition-colors"
              aria-label="이전 리뷰"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? "bg-[#00AE43]" : "bg-slate-300"
                  }`}
                  aria-label={`리뷰 ${i + 1}로 이동`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-[#00AE43] transition-colors"
              aria-label="다음 리뷰"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {reviews.map((review, i) => (
            <TiltCard key={i} review={review} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
