import { cn } from "@/lib/utils";
import { Bug, ExternalLink, StarIcon } from "lucide-react";
import { favouritedChat } from "@/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { extractChatId, queryChatScrollContainer } from "@/lib/chatgptElementUtils";

export function FavItem({ favChat, removeFav, uniqueKey, chatProvider }: { favChat: favouritedChat, removeFav: CallableFunction, uniqueKey: string, chatProvider: any }) {
  const isOnPage = extractChatId(window.location.href) == favChat.chatId

  function goToFav(e: React.MouseEvent) {
    if (!isOnPage) {
       // If we have a stored URL, use it. Otherwise construct one (fallback).
       if (favChat.url) {
         window.open(favChat.url, "_blank")
       } else {
         window.open(`https://chat.com/c/${favChat.chatId}`, "_blank")
       }
       return
    }
    // If we are on the page, scroll to the position.
    const scrollContainer = queryChatScrollContainer(chatProvider)
    if (scrollContainer) {
      scrollContainer.scrollTo(0, favChat.scrollTop)
    }
  }

  const { icon: ProviderIcon, isImage } = getProviderIcon(favChat.provider)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            className={cn("group flex items-center gap-1 p-2 hover:bg-muted relative cursor-pointer", isOnPage && "pl-4 border-l-2 border-primary")}
            onClick={goToFav}
          >
            {!isOnPage && <ExternalLink size={12} />}
            <div className="shrink-0 flex items-center justify-center size-3" title={favChat.provider || "Unknown Provider"}>
               {isImage ? (
                  <img src={ProviderIcon} className="w-full h-full object-contain" />
               ) : (
                  <ProviderIcon size={12} />
               )}
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
        <TooltipContent side="left" className="max-w-[250px] break-words bg-popover text-popover-foreground shadow-md z-[99999]" sideOffset={10} avoidCollisions={true}>
           {favChat.title && <div className="font-bold text-xs mb-1 border-b pb-1">{favChat.title}</div>}
           <div className="text-xs">{favChat.preview}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function getProviderIcon(provider?: string): { icon: any, isImage: boolean } {
    if (!provider) return { icon: Bug, isImage: false };
    if (provider.includes('chatgpt')) return { icon: "https://chatgpt.com/favicon.ico", isImage: true };
    if (provider.includes('gemini')) return { icon: "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=32", isImage: true };
    if (provider.includes('claude')) return { icon: "https://claude.ai/favicon.ico", isImage: true };
    return { icon: Bug, isImage: false };
}
