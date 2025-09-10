import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Package,
  FileText,
  Newspaper,
  Handshake,
  X,
  Send,
  Bot,
  Settings,
  Save,
  Menu,
  Grip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface NavigationItem {
  path: string;
  title: string;
  icon: React.ReactNode;
  x: number;
  y: number;
}

interface ChatbotPosition {
  x: number;
  y: number;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    path: "/",
    title: "Giới thiệu",
    icon: <Home className="h-5 w-5" />,
    x: 0,
    y: 0,
  },
  {
    path: "/trang-chu",
    title: "Trang chủ",
    icon: <Home className="h-5 w-5" />,
    x: -80,
    y: 0,
  },
  {
    path: "/khoa-hoc",
    title: "Khóa học",
    icon: <BookOpen className="h-5 w-5" />,
    x: -56,
    y: -56,
  },
  {
    path: "/san-pham",
    title: "Sản phẩm",
    icon: <Package className="h-5 w-5" />,
    x: 0,
    y: -80,
  },
  {
    path: "/tai-nguyen",
    title: "Tài nguyên",
    icon: <FileText className="h-5 w-5" />,
    x: 56,
    y: -56,
  },
  {
    path: "/blog",
    title: "Blog",
    icon: <Newspaper className="h-5 w-5" />,
    x: 80,
    y: 0,
  },
  {
    path: "/hop-tac",
    title: "Hợp tác",
    icon: <Handshake className="h-5 w-5" />,
    x: 56,
    y: 56,
  },
];

const defaultChatbotPosition: ChatbotPosition = { x: 0, y: 56 };

export function FloatingNavigation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [layoutItems, setLayoutItems] = useState<NavigationItem[]>(
    defaultNavigationItems
  );
  const [chatbotPosition, setChatbotPosition] = useState<ChatbotPosition>(
    defaultChatbotPosition
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Xin chào! Tôi là trợ lý AI của Nam Long Center. Bạn cần hỗ trợ gì?",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Handle navigation with smooth scroll to top
  const handleNavigation = (path: string) => {
    if (isLayoutOpen) return;

    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Close navigation menu
    setIsExpanded(false);
  };

  // Load saved positions from localStorage on component mount
  useEffect(() => {
    if (isInitialized) return; // Prevent multiple loads

    const savedNavigation = localStorage.getItem(
      "namlong-navigation-positions"
    );
    const savedChatbot = localStorage.getItem("namlong-chatbot-position");

    console.log("Loading saved navigation:", savedNavigation);
    console.log("Loading saved chatbot:", savedChatbot);

    if (savedNavigation) {
      try {
        const savedData = JSON.parse(savedNavigation);
        console.log("Parsed navigation data:", savedData);
        // Reconstruct navigation items with React elements
        const reconstructedItems = savedData.map(
          (savedItem: { path: string; x: number; y: number }) => {
            const defaultItem = defaultNavigationItems.find(
              (item) => item.path === savedItem.path
            );
            if (defaultItem) {
              return {
                ...defaultItem,
                x: savedItem.x,
                y: savedItem.y,
              };
            }
            return savedItem;
          }
        );
        console.log("Reconstructed items:", reconstructedItems);
        setLayoutItems(reconstructedItems);
      } catch (error) {
        console.error("Error loading saved navigation:", error);
        // Don't reset to defaults if there's an error, keep current state
      }
    }

    if (savedChatbot) {
      try {
        const savedChatbotData = JSON.parse(savedChatbot);
        console.log("Parsed chatbot data:", savedChatbotData);
        setChatbotPosition(savedChatbotData);
      } catch (error) {
        console.error("Error loading saved chatbot position:", error);
        // Don't reset to defaults if there's an error, keep current state
      }
    }

    setIsInitialized(true);
  }, [isInitialized]);

  // Auto save function
  const autoSave = (
    newLayoutItems: NavigationItem[],
    newChatbotPosition?: ChatbotPosition
  ) => {
    // Save navigation
    const cleanNavigationData = newLayoutItems.map((item) => ({
      path: item.path,
      title: item.title,
      x: item.x,
      y: item.y,
    }));
    localStorage.setItem(
      "namlong-navigation-positions",
      JSON.stringify(cleanNavigationData)
    );

    // Save chatbot if provided
    if (newChatbotPosition) {
      localStorage.setItem(
        "namlong-chatbot-position",
        JSON.stringify(newChatbotPosition)
      );
    }
  };

  // Drag handlers
  const handleDragStart = (itemPath: string) => {
    setIsDragging(itemPath);
  };

  const handleDragEnd = () => {
    setIsDragging(null);
  };

  const handleItemDrag = (itemPath: string, deltaX: number, deltaY: number) => {
    if (itemPath === "chatbot") {
      const newPosition = {
        x: chatbotPosition.x + deltaX,
        y: chatbotPosition.y + deltaY,
      };
      setChatbotPosition(newPosition);
      autoSave(layoutItems, newPosition);
    } else {
      const updatedItems = layoutItems.map((item) => {
        if (item.path === itemPath) {
          return {
            ...item,
            x: item.x + deltaX,
            y: item.y + deltaY,
          };
        }
        return item;
      });
      setLayoutItems(updatedItems);
      autoSave(updatedItems);
    }
  };

  const toggleExpanded = () => {
    // If layout is open, close it first
    if (isLayoutOpen) {
      setIsLayoutOpen(false);
      console.log("Layout mode closed via main toggle");
    }
    setIsExpanded(!isExpanded);
  };
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isLayoutOpen) setIsLayoutOpen(false);
  };
  const toggleLayout = () => {
    setIsLayoutOpen(!isLayoutOpen);
    if (isChatOpen) setIsChatOpen(false);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Cảm ơn bạn đã liên hệ! Tôi sẽ phản hồi sớm nhất có thể.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const updateItemPosition = (
    index: number,
    axis: "x" | "y",
    value: number
  ) => {
    setLayoutItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [axis]: value } : item))
    );
  };

  const updateChatbotPosition = (axis: "x" | "y", value: number) => {
    setChatbotPosition((prev) => ({ ...prev, [axis]: value }));
  };

  const saveAsDefault = () => {
    console.log("Current layoutItems before saving:", layoutItems);
    console.log("Current chatbotPosition before saving:", chatbotPosition);

    // Create clean data structure without React elements for localStorage
    const cleanNavigationData = layoutItems.map((item) => ({
      path: item.path,
      title: item.title,
      x: item.x,
      y: item.y,
    }));

    console.log("Clean navigation data to save:", cleanNavigationData);

    // Save navigation positions
    localStorage.setItem(
      "namlong-navigation-positions",
      JSON.stringify(cleanNavigationData)
    );
    // Save chatbot position
    localStorage.setItem(
      "namlong-chatbot-position",
      JSON.stringify(chatbotPosition)
    );

    console.log("Data saved to localStorage");

    // Show success message (you can add a toast notification here)
    alert("Đã lưu cài đặt làm mặc định!");
  };

  const resetToDefault = () => {
    setLayoutItems(defaultNavigationItems);
    setChatbotPosition(defaultChatbotPosition);

    // Clear saved positions
    localStorage.removeItem("namlong-navigation-positions");
    localStorage.removeItem("namlong-chatbot-position");

    alert("Đã khôi phục về mặc định!");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {/* Main Navigation */}
      <motion.div
        className="relative"
        initial={false}
        animate={{ scale: isExpanded ? 1 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Center Toggle Button (Red) - Origin Point (0,0) */}
        <motion.button
          onClick={toggleExpanded}
          className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-red-600 transition-colors z-20 relative border-4 border-white/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            boxShadow:
              "0 8px 32px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Menu className="h-7 w-7 text-white drop-shadow-lg" />
          </motion.div>
        </motion.button>

        {/* Navigation Items - Dynamic coordinates from layoutItems */}
        <AnimatePresence>
          {isExpanded && (
            <>
              {layoutItems.slice(1).map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: isDragging === item.path ? 1.2 : 1,
                    x: item.x,
                    y: item.y,
                  }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: (index + 1) * 0.05,
                  }}
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 group"
                  drag={isLayoutOpen}
                  dragMomentum={false}
                  onDragStart={() => handleDragStart(item.path)}
                  onDragEnd={() => handleDragEnd()}
                  onDrag={(event, info) => {
                    if (isLayoutOpen) {
                      handleItemDrag(item.path, info.delta.x, info.delta.y);
                    }
                  }}
                  whileDrag={{
                    scale: 1.3,
                    zIndex: 100,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  }}
                >
                  {isLayoutOpen && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs cursor-grab active:cursor-grabbing z-10"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Grip className="h-3 w-3" />
                    </motion.div>
                  )}
                  <Link
                    to={isLayoutOpen ? "#" : item.path}
                    onClick={
                      isLayoutOpen
                        ? (e) => e.preventDefault()
                        : () => handleNavigation(item.path)
                    }
                  >
                    <motion.div
                      className={`w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer ${
                        isLayoutOpen
                          ? "cursor-grab active:cursor-grabbing ring-2 ring-blue-400 ring-opacity-50"
                          : ""
                      }`}
                      whileHover={{
                        scale: isLayoutOpen ? 1 : 1.15,
                        boxShadow: isLayoutOpen
                          ? undefined
                          : "0 8px 25px rgba(0,0,0,0.3)",
                      }}
                      whileTap={{
                        scale: isLayoutOpen ? 1 : 0.95,
                      }}
                      style={{
                        backgroundColor: [
                          "rgb(59, 130, 246)", // blue
                          "rgb(34, 197, 94)", // green
                          "rgb(147, 51, 234)", // purple
                          "rgb(249, 115, 22)", // orange
                          "rgb(236, 72, 153)", // pink
                          "rgb(99, 102, 241)", // indigo
                        ][index],
                      }}
                      title={item.title}
                    >
                      {item.icon}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}

              {/* AI Assistant Button - Dynamic position */}
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 1,
                  scale: isDragging === "chatbot" ? 1.2 : 1,
                  x: chatbotPosition.x,
                  y: chatbotPosition.y,
                }}
                exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="absolute top-1/2 left-0 transform -translate-y-1/2 group"
                drag={isLayoutOpen}
                dragMomentum={false}
                onDragStart={() => handleDragStart("chatbot")}
                onDragEnd={() => handleDragEnd()}
                onDrag={(event, info) => {
                  if (isLayoutOpen) {
                    handleItemDrag("chatbot", info.delta.x, info.delta.y);
                  }
                }}
                whileDrag={{
                  scale: 1.3,
                  zIndex: 100,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
              >
                {isLayoutOpen && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs cursor-grab active:cursor-grabbing z-10"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Grip className="h-3 w-3" />
                  </motion.div>
                )}
                <motion.button
                  onClick={isLayoutOpen ? undefined : toggleChat}
                  className={`w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer ${
                    isLayoutOpen
                      ? "cursor-grab active:cursor-grabbing ring-2 ring-blue-400 ring-opacity-50"
                      : "hover:bg-emerald-600"
                  }`}
                  whileHover={!isLayoutOpen ? { scale: 1.1 } : {}}
                  whileTap={!isLayoutOpen ? { scale: 0.9 } : {}}
                  title="AI Assistant"
                  disabled={isLayoutOpen}
                >
                  <Bot className="h-5 w-5" />
                </motion.button>
              </motion.div>

              {/* Layout Settings Button (green = drag mode only, no panel) */}
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: -80 }}
                exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="absolute top-1/2 left-0 transform -translate-y-1/2"
              >
                <motion.button
                  onClick={toggleLayout}
                  className={`w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer relative z-30 ${
                    isLayoutOpen
                      ? "bg-green-500 hover:bg-green-600 ring-2 ring-green-300"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={
                    isLayoutOpen ? "Thoát chế độ chỉnh sửa" : "Chế độ chỉnh sửa"
                  }
                >
                  <Settings
                    className={`h-5 w-5 transition-transform duration-300 ${
                      isLayoutOpen ? "rotate-90" : ""
                    }`}
                  />
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Drag mode only (green) - coordinate panel removed per request */}

      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-full right-0 mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  <h4 className="font-semibold">AI Assistant</h4>
                </div>
                <Button
                  onClick={toggleChat}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleChatSubmit}
              className="flex p-4 border-t border-gray-100"
            >
              <Input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
