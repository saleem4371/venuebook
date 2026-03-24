"use client";

import { Menu } from "@headlessui/react";

export default function UserDropdown() {
  return (
    <Menu as="div" className="relative">

      <Menu.Button>
        <img
          src="/user.jpg"
          className="w-9 h-9 rounded-full"
        />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-40">

        <Menu.Item>
          <button className="block px-4 py-2 w-full text-left">
            Profile
          </button>
        </Menu.Item>

        <Menu.Item>
          <button className="block px-4 py-2 w-full text-left">
            My Bookings
          </button>
        </Menu.Item>

        <Menu.Item>
          <button className="block px-4 py-2 w-full text-left text-red-500">
            Logout
          </button>
        </Menu.Item>

      </Menu.Items>

    </Menu>
  );
}
