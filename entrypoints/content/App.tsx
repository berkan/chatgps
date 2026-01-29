import "@/assets/tailwind.css";
import { cn } from "@/lib/utils";
import icon from "@/assets/icon.png"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bug, ChevronDown, ChevronUp, Filter, X, ExternalLink, StarIcon, Copy, Download, Bot, Sparkles, Brain } from "lucide-react";
import ChatOutline from "@/components/chat-outline";
import useThemeDetection from "@/hooks/use-theme-detection";
import useScrollContainer from "@/hooks/use-scroll-container";
import { navigateToNextChat, navigateToPreviousChat, extractChatId, queryChatScrollContainer, ICON_MAP } from "@/lib/chatgptElementUtils";
import { SELECTOR_MAP } from "@/lib/constants";
import { favouritedChat } from "@/types";
import useChatProvider from "@/hooks/use-chat-provider";
import { useSyncedStorage } from "@/hooks/use-synced-storage";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DEFAULT_FILTERS = {
    "user": true,
    "assistant": true,
    "code blocks": false,
    "section headers": true,
  }

export default function App() {
  useThemeDetection()
  const [isOpen, setIsOpen] = useSyncedStorage("sidebarOpen", false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const chatProvider = useChatProvider()
  const scrollContainer = useScrollContainer(chatProvider)
  const [textFilter, setTextFilter] = useState<string>("")
  const [options, setOptions] = useSyncedStorage<Record<string, boolean>>("filterOptions", DEFAULT_FILTERS)
  const [favourites, setFavourites] = useSyncedStorage<Record<string, favouritedChat>>("favouritedChats", {})
  const [activeTab, setActiveTab] = useState<'outline' | 'favorites'>('outline')

  const anyFilters = Object.values(options).some((value) => !value)
  const selectorMap = SELECTOR_MAP[chatProvider]
  const fixedPosClass = "fixed top-15 right-5"

  const goToNextChat = () => {
    if (scrollContainer) navigateToNextChat(scrollContainer, selectorMap)
  }

  const goToPreviousChat = () => {
    if (scrollContainer) navigateToPreviousChat(scrollContainer, selectorMap)
  }
  const onToggleOption = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, key: string) => {
    e.preventDefault()
    setOptions((old: Record<string, boolean>) => {
      return { ...old, [key]: !old[key] }
    }
    )
  }

  function removeFavourite(uniqueId: string) {
    setFavourites((old: Record<string, favouritedChat>) => {
      const newFavs = { ...old }
      delete newFavs[uniqueId]
      return newFavs
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(favourites, null, 2))
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"))
  }

  const saveToFile = () => {
    const blob = new Blob([JSON.stringify(favourites, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chatgps-favorites.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    function handler(msg: any) {
      if (msg.type === "TOGGLE_UI") {
        setIsOpen(prev => !prev);
      }
      if (msg.type === "NEXT_CHAT") {
        goToNextChat();
      }
      if (msg.type === "PREVIOUS_CHAT") {
        goToPreviousChat();
      }
    }
    browser.runtime.onMessage.addListener(handler);
    return () => browser.runtime.onMessage.removeListener(handler);
  }, [scrollContainer, selectorMap]);

  useEffect(() => {
    if (isOpen) {
      const input = inputRef.current;
      if (input) input.focus();
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [setIsOpen]);


  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className={cn("w-fit cursor-pointer p-2 border-accent border-2 rounded-xl ", fixedPosClass)}
        title="Toggle chatgps"
      >
        <img src={icon} width={32} />
      </div>
    );
  }

  return (
    <div
      className={"flex flex-col w-75 h-[calc(100vh-200px)] rounded-2xl border-accent border-2 overflow-hidden bg-background " + fixedPosClass + " animate-in fade-in slide-in-from-right duration-200"}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="w-full p-2 text-foreground border-b-accent border-b-2 flex justify-between items-center">
        <div className="font-extrabold">
          ChatGPS
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-0.5">
            <button
              onClick={goToPreviousChat}
              className="h-3.5 px-1 rounded bg-accent hover:bg-accent-foreground hover:text-accent cursor-pointer flex items-center justify-center"
              title="Previous chat (Alt+Up)"
            >
              <ChevronUp className="size-3" />
            </button>
            <button
              onClick={goToNextChat}
              className="h-3.5 px-1 rounded bg-accent hover:bg-accent-foreground hover:text-accent cursor-pointer flex items-center justify-center"
              title="Next chat (Alt+Down)"
            >
              <ChevronDown className="size-3" />
            </button>
          </div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSd33FU9cCdtj019p3WSIXfoFm8uuMgY8qRDaAPYfNl-D4JKUg/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="size-7 rounded-md border-2 bg-accent hover:bg-accent-foreground hover:text-accent cursor-pointer flex items-center justify-center"
            title="Report a bug"
          >
            <Bug className="size-4" />
          </a>
          <button className="size-7 rounded-md border-2 bg-accent hover:bg-accent-foreground hover:text-accent cursor-pointer" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>
      </div>
      <div className="w-full border-b-2 border-accent flex flex-col">
          <div className="flex justify-center items-center p-2 gap-2">
            <input
              ref={inputRef}
              type="text"
              className="w-full flex-1 rounded-md bg-accent outline-none text-accent-foreground p-2 pl-3"
              placeholder="🔎 search chat"
              value={textFilter}
              onChange={(event) => setTextFilter(event.target.value)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className={"cursor-pointer h-full " + (anyFilters ? "" : "bg-accent")}>
                  <Filter className={"size-4 " + (anyFilters ? "text-accent" : "text-foreground")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.entries(options).map(([key, value]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={value}
                    onClick={(e) => onToggleOption(e, key)}
                  >
                    {key}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex w-full">
            <button
                className={cn("flex-1 p-2 text-sm font-medium border-b-2 transition-colors cursor-pointer", activeTab === 'outline' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                onClick={() => setActiveTab('outline')}
            >
                Minimap
            </button>
            <button
                className={cn("flex-1 p-2 text-sm font-medium border-b-2 transition-colors cursor-pointer", activeTab === 'favorites' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                onClick={() => setActiveTab('favorites')}
            >
                Favorites
            </button>
          </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'outline' ? (
          <ChatOutline
            scrollContainer={scrollContainer}
            options={options}
            textFilter={textFilter}
            favourites={favourites}
            setFavourites={setFavourites}
          />
        ) : (
            <div className="w-full h-full flex flex-col">
                 <div className="p-2 flex gap-2 border-b border-accent">
                    <Button variant="outline" size="sm" className="flex-1 text-xs cursor-pointer" onClick={copyToClipboard}>
                        <Copy className="mr-2 h-3 w-3" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs cursor-pointer" onClick={saveToFile}>
                        <Download className="mr-2 h-3 w-3" /> Save JSON
                    </Button>
                 </div>
                 <div className="flex-1 overflow-y-auto">
                    {Object.keys(favourites).length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No favorites yet.
                        </div>
                    ) : (
                         <div className="flex flex-col">
                          {Object.keys(favourites).map((key) => (
                            <FavItem
                                uniqueKey={key}
                                favChat={favourites[key]}
                                removeFav={removeFavourite}
                                key={key}
                                chatProvider={chatProvider}
                            />
                          ))}
                         </div>
                    )}
                 </div>
            </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}

function FavItem({ favChat, removeFav, uniqueKey, chatProvider }: { favChat: favouritedChat, removeFav: CallableFunction, uniqueKey: string, chatProvider: any }) {
  const isOnPage = extractChatId(window.location.href) == favChat.chatId

  function goToFav(e: React.MouseEvent) {
    if (!isOnPage) {
       // If we have a stored URL, use it. Otherwise construct one (fallback).
       if (favChat.url) {
         window.location.href = favChat.url
       } else {
         window.open(`https://chat.com/c/${favChat.chatId}`, "_self")
       }
       return
    }
    // If we are on the page, scroll to the position.
    const scrollContainer = queryChatScrollContainer(chatProvider)
    if (scrollContainer) {
      scrollContainer.scrollTo(0, favChat.scrollTop)
    }
  }

  const ProviderIcon = getProviderIcon(favChat.provider)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            className={cn("group flex items-center gap-1 p-2 hover:bg-muted relative cursor-pointer", isOnPage && "pl-4 border-l-2 border-primary")}
            onClick={goToFav}
          >
            {!isOnPage && <ExternalLink size={12} />}
            <div className="shrink-0" title={favChat.provider || "Unknown Provider"}>
               <ProviderIcon size={12} />
            </div>
            <span className="text-xs truncate select-none flex-1">
              {favChat.preview}
            </span>
            <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    removeFav(uniqueKey);
                }}
              >
                <StarIcon
                    className="h-3 w-3"
                    fill="#01FFA7"
                />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[250px] break-words">
           {favChat.title && <div className="font-bold text-xs mb-1 border-b pb-1">{favChat.title}</div>}
           <div className="text-xs">{favChat.preview}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function getProviderIcon(provider?: string) {
    if (!provider) return Bug;
    if (provider.includes('chatgpt')) return Bot;
    if (provider.includes('gemini')) return Sparkles;
    if (provider.includes('claude')) return Brain;
    return Bug;
}
