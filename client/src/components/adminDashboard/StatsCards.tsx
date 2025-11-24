import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// Custom hook for smooth animated numbers with intersection observer
function useAnimatedNumber(
  targetValue: number,
  duration: number = 2000,
  isLoading: boolean = false
) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const lastTargetRef = useRef(targetValue);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * Math.max(targetValue, 10)));
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading, targetValue]);

  useEffect(() => {
    if (isLoading) return;

    lastTargetRef.current = targetValue;
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.round(targetValue * eased);

      setDisplayValue((prev) => (prev !== newValue ? newValue : prev));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration, isLoading]);

  return { value: displayValue, ref: elementRef };
}


interface StatsCardsProps {
  favoritesCount: number;
  totalBooksCount: number;
  totalUsersCount: number;
  commentsCount: number;
  reactionsCount: number;
  recentUploads: number;
  isLoading?: boolean;
  isReactionsLoading?: boolean;
}

// Shimmer loading component
function StatCardSkeleton() {
  return (
    <div className="relative bg-white rounded-xl shadow-sm p-6 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-300 rounded-md w-20 animate-pulse"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

export function StatsCards({
  favoritesCount,
  totalBooksCount,
  totalUsersCount,
  commentsCount,
  reactionsCount,
  recentUploads,
  isLoading = false,
  isReactionsLoading = false,
}: StatsCardsProps) {
  const booksAnim = useAnimatedNumber(totalBooksCount, 2000);
  const usersAnim = useAnimatedNumber(totalUsersCount, 2200);
  const commentsAnim = useAnimatedNumber(commentsCount, 2400);
  const favoritesAnim = useAnimatedNumber(favoritesCount, 2600);
  const reactionsAnim = useAnimatedNumber(reactionsCount, 2800, isReactionsLoading);
  const recentAnim = useAnimatedNumber(recentUploads, 2000);

  const handleCardClick = (scrollTo?: string) => {
    if (scrollTo) {
      const element = document.getElementById(scrollTo);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const stats = [
    {
      id: "books",
      title: "Total Books",
      animation: booksAnim,
      icon: <BookOpen className="h-6 w-6 text-green-600" />,
      iconBg: "bg-gradient-to-br from-green-100 to-green-50",
      gradient: "from-green-500/10 to-green-500/5",
      scrollTo: "total-books-section",
    },
    {
      id: "users",
      title: "Total Users",
      animation: usersAnim,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-50",
      gradient: "from-blue-500/10 to-blue-500/5",
      scrollTo: "users-list-section",
    },
    {
      id: "comments",
      title: "Total Comments",
      animation: commentsAnim,
      icon: <MessageSquare className="h-6 w-6 text-purple-600" />,
      iconBg: "bg-gradient-to-br from-purple-100 to-purple-50",
      gradient: "from-purple-500/10 to-purple-500/5",
      scrollTo: "total-comments-section",
    },
    {
      id: "favorites",
      title: "Total Favorites",
      animation: favoritesAnim,
      icon: <Heart className="h-6 w-6 text-red-600" />,
      iconBg: "bg-gradient-to-br from-red-100 to-red-50",
      gradient: "from-red-500/10 to-red-500/5",
    },
  ];

  const averageReactionsPerComment =
    commentsAnim.value > 0
      ? (reactionsAnim.value / commentsAnim.value).toFixed(1)
      : "0.0";

  if (isLoading) {
    return (
      <>
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="relative bg-white rounded-xl shadow-sm p-6 overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-8 bg-gray-300 rounded w-40"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={item.id}
            ref={item.animation.ref}
            className={`group relative bg-gradient-to-br ${item.gradient} backdrop-blur-sm bg-white rounded-xl shadow-sm p-6 transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 overflow-hidden`}
            onClick={() => handleCardClick(item.scrollTo)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Sparkle effect on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-[pulse-glow_2s_ease-in-out_infinite]" />
            </div>

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium tracking-wide uppercase">
                  {item.title}
                </p>
                <p className="text-4xl font-bold text-gray-900 tabular-nums">
                  {item.animation.value.toLocaleString()}
                </p>
              </div>
              <div
                className={`${item.iconBg} p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}
              >
                {item.icon}
              </div>
            </div>

            {/* Bottom border accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Engagement */}
        <div
          ref={reactionsAnim.ref}
          className="group relative bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-sm bg-white rounded-xl shadow-sm p-6 transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 overflow-hidden"
          onClick={() => handleCardClick("total-comments-section")}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-[pulse-glow_2s_ease-in-out_infinite]" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium tracking-wide uppercase">
                  Engagement
                </p>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {reactionsAnim.value.toLocaleString()}
                  <span className="text-lg text-gray-600 font-normal ml-2">
                    Reactions
                  </span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex-1 bg-orange-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      (parseFloat(averageReactionsPerComment) / 10) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <span className="text-gray-700 font-semibold tabular-nums whitespace-nowrap">
                {averageReactionsPerComment} avg
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">reactions per comment</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        {/* Recent uploads */}
        <div
          ref={recentAnim.ref}
          className="group relative bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 backdrop-blur-sm bg-white rounded-xl shadow-sm p-6 transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 overflow-hidden"
          onClick={() => handleCardClick("total-books-section")}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-[pulse-glow_2s_ease-in-out_infinite]" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium tracking-wide uppercase">
                  Activity
                </p>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {recentAnim.value.toLocaleString()}
                  <span className="text-lg text-gray-600 font-normal ml-2">
                    Recent
                  </span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm">
                <AlertCircle className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-indigo-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      (recentAnim.value / Math.max(booksAnim.value, 1)) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <span className="text-gray-700 font-semibold text-sm tabular-nums whitespace-nowrap">
                {booksAnim.value > 0
                  ? Math.round((recentAnim.value / booksAnim.value) * 100)
                  : 0}
                %
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              of total books added recently
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
      </div>
    </>
  );
}
