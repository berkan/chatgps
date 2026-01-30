import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink } from "lucide-react";
import { favouritedChat } from "@/types";
import { toast } from "sonner";
import { FavItem } from "./fav-item";

interface FavoritesViewProps {
  favourites: Record<string, favouritedChat>;
  setFavourites: CallableFunction;
  chatProvider: any;
  showExternalLinkButton?: boolean;
}

export function FavoritesView({ favourites, setFavourites, chatProvider, showExternalLinkButton = false }: FavoritesViewProps) {
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

  const openInNewTab = () => {
     const url = browser.runtime.getURL("/favorites.html");
     window.open(url, "_blank");
  }

  return (
    <div className="w-full h-full flex flex-col">
         <div className="p-2 flex gap-2 border-b border-accent">
            <Button variant="outline" size="sm" className="flex-1 text-xs cursor-pointer" onClick={copyToClipboard}>
                <Copy className="mr-2 h-3 w-3" /> Copy
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs cursor-pointer" onClick={saveToFile}>
                <Download className="mr-2 h-3 w-3" /> Save JSON
            </Button>
            {showExternalLinkButton && (
                <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={openInNewTab} title="Open in new tab">
                    <ExternalLink className="h-4 w-4" />
                </Button>
            )}
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
  )
}
