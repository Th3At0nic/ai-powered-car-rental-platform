import { NavLink } from "react-router-dom";
import { TSidebarItem, TUserPath } from "../types";

export const sidebarItemsGenerator = (items: TUserPath[], role: string) => {
  const sidebarItems = items.reduce((acc: TSidebarItem[], item) => {
    if (item.name && item.path) {
      acc.push({
        key: item.name,
        label: <NavLink to={`/${role}/${item.path}`}> {item.name} </NavLink>,
      });
    }

    if (item.children) {
      acc.push({
        key: item.name as string,
        label: item.name,
        children: item.children.flatMap((child) =>
          child.name
            ? [
                {
                  key: child.name,
                  label: (
                    <NavLink to={`/${role}/${child.path}`}>
                      {child.name}
                    </NavLink>
                  ),
                },
              ]
            : []
        ),
      });
    }
    return acc;
  }, []);

  return sidebarItems;
};
