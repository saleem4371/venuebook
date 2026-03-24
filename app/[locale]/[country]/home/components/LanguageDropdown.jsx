"use client";

import { Menu } from "@headlessui/react";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useParams } from "next/navigation";

export default function LanguageDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale || "en";

  const changeLanguage = (selectedLocale) => {
    // Replace current locale segment in the URL with the new one
    const newPath = pathname.replace(`/${currentLocale}`, `/${selectedLocale}`);
    router.push(newPath);
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2">
        <Globe size={18} />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-32">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => changeLanguage("en")}
              className={`block px-4 py-2 w-full text-left ${
                active ? "bg-gray-100" : ""
              }`}
            >
              English
            </button>
          )}
        </Menu.Item>

        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => changeLanguage("hi")}
              className={`block px-4 py-2 w-full text-left ${
                active ? "bg-gray-100" : ""
              }`}
            >
              Hindi
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}