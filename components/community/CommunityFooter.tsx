import { BrandText } from "@/components/ui/BrandText";

export function CommunityFooter() {
  return (
    <footer className=" border-t border-border-2 bg-background-1 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-5xl mx-auto container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="mb-2">
              <BrandText className="text-xl">Tuno</BrandText>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2026 Tuno. All rights reserved.
            </p>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              이용약관
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              개인정보처리방침
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              문의하기
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
