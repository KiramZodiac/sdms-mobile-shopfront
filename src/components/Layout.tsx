
import { Outlet } from "react-router-dom"
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import NavigatorBar from "./NavigatorBar";
import { Marquee } from "./Marquee";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Marquee />
      <Navbar />
      <main>
        <Outlet />
      </main>
      
      <Footer />
      <NavigatorBar />
    </div>
  );
};
