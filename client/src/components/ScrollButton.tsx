import { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function ScrollButton() {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setVisible(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => setVisible(false), 3000);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed right-5 bottom-20 flex flex-col gap-2 z-50 transition-opacity duration-500 ${
        visible ? "opacity-90" : "opacity-0 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        className="p-2 rounded-full bg-gray-100/70 text-gray-700 shadow-sm hover:bg-gray-200/80 hover:scale-105 transform transition-all duration-200"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
      <button
        onClick={scrollToBottom}
        className="p-2 rounded-full bg-gray-100/70 text-gray-700 shadow-sm hover:bg-gray-200/80 hover:scale-105 transform transition-all duration-200"
        aria-label="Scroll to bottom"
      >
        <ArrowDown className="w-5 h-5" />
      </button>
    </div>
  );
}
