"use client";

import BackNavigation from "@/components/ui/BackNavigation";
import NavigationPath from "@/components/ui/NavigationPath";
import WishList from "@/components/templates/User/Wishlist";

export default function WishListPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <NavigationPath />
      <BackNavigation />
      <div className="container mx-auto px-4 pb-10 pt-6 md:px-8">
        <WishList />
      </div>
    </main>
  );
}
