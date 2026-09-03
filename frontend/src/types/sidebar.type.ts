import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { ReactNode } from "react";

export type TSidebarItem = ItemType<MenuItemType>;
// export type TSidebarItem =
//   | {
//       key: string;
//       label: ReactNode;
//       children?: TSidebarItem[];
//     }
//   | undefined;

export type TUserPath = {
  name?: string;
  path?: string;
  element?: ReactNode;
  children?: TUserPath[];
};

export type TRoute = {
  path: string;
  element: ReactNode;
};
