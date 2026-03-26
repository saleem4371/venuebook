// import { getDictionary } from "@/lib/getDictionary";
// import { DictionaryProvider } from "@/context/DictionaryContext";

// import Navbar from "./home/components/Navbar";
// import Footer from "./home/components/PremiumFooter";
// import BottomMenu from "./home/components/BottomMenu";

// export default async function LocaleLayout({ children, params }) {

//   const { locale } = await params;   // ✅ FIX

//   const dict = await getDictionary(locale);

//   return (
//     <>
    
//      <DictionaryProvider dict={dict}>
//       <Navbar/>
//       {children}
//        <BottomMenu />
//       <Footer/>
//     </DictionaryProvider>
//     </>
   
//   );
// }
import { getDictionary } from "@/lib/getDictionary";
import Navbar from "./home/components/Navbar";
import Footer from "./home/components/PremiumFooter";
import BottomMenu from "./home/components/BottomMenu";
import { DictionaryProvider } from "@/context/DictionaryContext";
import { DropdownProvider } from "@/context/DropdownContext";

import { UIProvider } from "@/context/UIContext";

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  
  const dict = await getDictionary(locale);

  return (
    <DictionaryProvider dict={dict}>
      <UIProvider> {/* ✅ ADD THIS */}
      <DropdownProvider> {/* ✅ ADD THIS */}
        <Navbar />
        {children}
        <BottomMenu />
        <Footer />
      </DropdownProvider>
      </UIProvider>
    </DictionaryProvider>
  );
}