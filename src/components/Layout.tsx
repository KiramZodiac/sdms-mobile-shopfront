
import { Outlet } from "react-router-dom"
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";


export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
