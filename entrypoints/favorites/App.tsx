import { Toaster } from "@/components/ui/sonner";
import { useSyncedStorage } from "@/hooks/use-synced-storage";
import { favouritedChat } from "@/types";
import { FavoritesView } from "@/components/favorites-view";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  const [favourites, setFavourites] = useSyncedStorage<Record<string, favouritedChat>>("favouritedChats", {})

  return (
    <ThemeProvider wrapperRoot={document.documentElement} defaultTheme="system">
      <div className="w-full h-screen bg-background text-foreground flex flex-col items-center">
        <div className="w-full max-w-4xl h-full flex flex-col p-4">
             <h1 className="text-2xl font-bold mb-4">Chat GPS Favorites</h1>
             <div className="flex-1 border rounded-md overflow-hidden bg-card text-card-foreground shadow-sm">
                <FavoritesView
                    favourites={favourites}
                    setFavourites={setFavourites}
                    chatProvider={null}
                    showExternalLinkButton={false}
                />
             </div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
