"use client";

import { BrandText } from "@/components/ui/BrandText";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const goBackOrHome = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <main className="bg-background-2 -translate-y-1/5 min-h-screen text-foreground flex items-center justify-center px-6 py-16 selection:bg-[var(--color-accent)] selection:text-[var(--color-accent-foreground)]">
      <div className="w-full max-w-xl">
        <div className="mb-5">
          <BackLink
            onClick={(e) => {
              e.preventDefault();
              goBackOrHome();
            }}
          >
            이전 페이지로
          </BackLink>
        </div>

        <div className="relative mb-6 flex justify-center">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 blur-3xl bg-accent/10" />
          <div className="relative text-center">
            <div className="select-none font-bungee text-[clamp(88px,16vw,180px)] leading-none tracking-tight text-[var(--color-accent)]">
              404
            </div>
          </div>
        </div>

        <Card className="border-0 bg-background-2">
          <CardHeader className="text-left">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              페이지를 찾을 수 없어요
            </CardTitle>
            <CardDescription className="text-base">
              주소가 잘못되었거나, 페이지가 이동/삭제되었을 수 있어요.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-sm text-muted-foreground space-y-3">
            <div className="flex items-start gap-2">
              <span className="mt-[0.45em] inline-block size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              <span className="block max-w-[46ch]">
                링크를 타고 오셨다면, 새 경로로 변경되었는지 확인해보세요.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-[0.45em] inline-block size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              <span className="block max-w-[46ch]">
                문제가 계속되면 <BrandText>Tuno</BrandText> 홈에서 다시 시작하는
                게 가장 빠릅니다.
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
