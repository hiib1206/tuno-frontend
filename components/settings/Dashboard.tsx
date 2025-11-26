// "use client";

// import { Card } from "@/components/ui/card";
// import { TrendingUp, Star, BarChart3 } from "lucide-react";

// export function Dashboard() {
//   return (
//     <div className="space-y-6">
//       <Card className="p-6">
//         <h2 className="mb-6 text-2xl font-bold">대시보드</h2>

//         <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <div className="rounded-lg border border-border bg-card p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">총 예측 횟수</p>
//                 <p className="mt-1 text-2xl font-bold">127</p>
//               </div>
//               <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
//                 <TrendingUp className="h-6 w-6 text-accent" />
//               </div>
//             </div>
//           </div>

//           <div className="rounded-lg border border-border bg-card p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">평균 정확도</p>
//                 <p className="mt-1 text-2xl font-bold text-accent">89%</p>
//               </div>
//               <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
//                 <BarChart3 className="h-6 w-6 text-accent" />
//               </div>
//             </div>
//           </div>

//           <div className="rounded-lg border border-border bg-card p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">즐겨찾기</p>
//                 <p className="mt-1 text-2xl font-bold">8</p>
//               </div>
//               <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
//                 <Star className="h-6 w-6 text-accent" />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <h3 className="font-semibold">최근 활동</h3>
//           <div className="space-y-3">
//             {[
//               {
//                 action: "AI 예측 완료",
//                 detail: "AAPL - Apple Inc.",
//                 time: "10분 전",
//               },
//               {
//                 action: "즐겨찾기 추가",
//                 detail: "TSLA - Tesla Inc.",
//                 time: "2시간 전",
//               },
//               {
//                 action: "AI 예측 완료",
//                 detail: "005930 - 삼성전자",
//                 time: "5시간 전",
//               },
//             ].map((activity, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between rounded-lg border border-border p-3"
//               >
//                 <div>
//                   <p className="text-sm font-medium">{activity.action}</p>
//                   <p className="text-xs text-muted-foreground">
//                     {activity.detail}
//                   </p>
//                 </div>
//                 <span className="text-xs text-muted-foreground">
//                   {activity.time}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// }
