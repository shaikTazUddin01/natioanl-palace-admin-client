"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Avatar, Space, Grid, Drawer } from "antd";
import {
  AppstoreOutlined,
  BarChartOutlined,
  DashboardOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout } from "@/src/redux/features/auth/authSlice";
import logo from "@/src/assets/logo.png";
import Image from "next/image";
const { Header, Content, Footer, Sider } = Layout;
const { useBreakpoint } = Grid;

interface NavLayoutProps {
  children: ReactNode;
}

const NavLayout: React.FC<NavLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const screens = useBreakpoint();

  const isDesktop = !!screens.lg; // lg+ = desktop
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ Mobile drawer route change হলে auto close
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ✅ Header title based on route (আপনার মতোই রাখা হয়েছে)
  const activeKey = useMemo(() => {
    if (pathname.startsWith("/products/create")) return "Create Product";
    if (pathname.startsWith("/products")) return "Manage Products";
    if (pathname.startsWith("/categories/create")) return "Add Category";
    if (pathname.startsWith("/categories")) return "Manage Categories";

    if (pathname.startsWith("/purchase/create")) return "New Purchase";
    if (pathname.startsWith("/purchase/due")) return "Supplier Due";
    if (pathname.startsWith("/purchase")) return "Purchase List";

    if (pathname.startsWith("/sales/create")) return "New Sale";
    if (pathname.startsWith("/sales/due")) return "Customer Due";
    if (pathname.startsWith("/sales")) return "Sales List";

    if (pathname.startsWith("/stock")) return "Current Stock";

    if (pathname.startsWith("/accounts/customers")) return "Customer Due";
    if (pathname.startsWith("/accounts/suppliers")) return "Supplier Payable";
    if (pathname.startsWith("/accounts/total")) return "Total Amount";

    return "Dashboard";
  }, [pathname]);

  // ✅ Sidebar menu items
  const menuItems = useMemo(
    () => [
      {
        key: "1-dashboard",
        icon: <DashboardOutlined />,
        label: <Link href="/">Dashboard</Link>,
      },

      {
        key: "2-product",
        icon: <AppstoreOutlined />,
        label: "Product Management",
        children: [
          {
            key: "2-1-product-create",
            label: <Link href="/products/create">Create Product</Link>,
          },
          {
            key: "2-2-product-list",
            label: <Link href="/products">Manage Products</Link>,
          },
          {
            key: "2-3-category-create",
            label: <Link href="/categories/create">Add Category</Link>,
          },
          {
            key: "2-4-category-list",
            label: <Link href="/categories">Manage Categories</Link>,
          },
        ],
      },

      {
        key: "3-purchase",
        icon: <ShoppingCartOutlined />,
        label: "Purchase Management",
        children: [
          {
            key: "3-1-purchase-create",
            label: <Link href="/purchase/create">New Purchase</Link>,
          },
          {
            key: "3-2-purchase-list",
            label: <Link href="/purchase">Purchase List</Link>,
          },
          {
            key: "3-3-purchase-due",
            label: <Link href="/purchase/due">Supplier Due</Link>,
          },
        ],
      },

      {
        key: "4-sales",
        icon: <DollarOutlined />,
        label: "Sales Management",
        children: [
          {
            key: "4-1-sales-create",
            label: <Link href="/sales/create">New Sale</Link>,
          },
          {
            key: "4-2-sales-list",
            label: <Link href="/sales">Sales List</Link>,
          },
          {
            key: "4-7-sales-due",
            label: <Link href="/sales/due">Customer Due</Link>,
          },
        ],
      },

      {
        key: "5-stock",
        icon: <BarChartOutlined />,
        label: "Stock Management",
        children: [
          {
            key: "5-1-stock-current",
            label: <Link href="/stock">Current Stock</Link>,
          },
        ],
      },

      {
        key: "6-accounts",
        icon: <TeamOutlined />,
        label: "Accounts Management",
        children: [
          {
            key: "6-1-accounts-customers",
            label: <Link href="/accounts/customers">Customers (Due)</Link>,
          },
          {
            key: "6-2-accounts-suppliers",
            label: <Link href="/accounts/suppliers">Suppliers (Payable)</Link>,
          },
          {
            key: "6-3-accounts-total",
            label: <Link href="/accounts/total">Total Amount</Link>,
          },
        ],
      },
    ],
    [],
  );

  // ✅ Root submenu keys (parent menus)
  const rootSubmenuKeys = useMemo(
    () => ["2-product", "3-purchase", "4-sales", "5-stock", "6-accounts"],
    [],
  );

  // ✅ Accordion openKeys (একটা parent ওপেন থাকলে অন্যটা ক্লোজ)
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    let parentKey: string | null = null;

    if (pathname.startsWith("/products") || pathname.startsWith("/categories"))
      parentKey = "2-product";
    else if (pathname.startsWith("/purchase")) parentKey = "3-purchase";
    else if (pathname.startsWith("/sales")) parentKey = "4-sales";
    else if (pathname.startsWith("/stock")) parentKey = "5-stock";
    else if (pathname.startsWith("/accounts")) parentKey = "6-accounts";

    setOpenKeys(parentKey ? [parentKey] : []);
  }, [pathname]);

  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find((k) => !openKeys.includes(k));

    if (latestOpenKey && rootSubmenuKeys.includes(latestOpenKey)) {
      setOpenKeys([latestOpenKey]); // ✅ only keep latest parent open
    } else {
      setOpenKeys(keys); // closing case
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  // ✅ White sidebar content + mobile close (X) button
  const SidebarContent = (
    <div className="h-full flex flex-col ">
      {/* Sidebar Header */}
      <div className="h-20 flex items-center justify-between px-6 shrink-0">
        <div className="h-28 w-32 relative">
          <Image
            src={logo}
            alt="logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* ✅ Mobile close icon */}
        {!isDesktop && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-md hover:bg-slate-100"
          >
            <CloseOutlined className="text-slate-600 text-lg" />
          </button>
        )}
      </div>

      {/* ✅ Only sidebar scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Menu
          theme="dark"
          mode="inline"
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={menuItems}
          className="border-r-0"
        />
      </div>
    </div>
  );

  return (
    <Layout className="">
      {/* ✅ Desktop Fixed Sidebar */}
      {isDesktop ? (
        <Sider
          width={240}
          className=" !fixed !left-0 !top-0 !bottom-0 border-r"
        >
          {SidebarContent}
        </Sider>
      ) : (
        // ✅ Mobile Drawer Sidebar
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          placement="left"
          size="default"
          styles={{
            body: { padding: 0 },
            header: { display: "none" },
          }}
        >
          {SidebarContent}
        </Drawer>
      )}

      {/* ✅ Main Layout offset for desktop */}
      <Layout className={isDesktop ? "ml-[240px]" : ""}>
        {/* ✅ Header (dark so hamburger icon white looks good) */}
        <Header className="bg-slate-900 px-6 
      flex items-center justify-between shadow-sm ">
          <div className="flex items-center gap-3">
            {/* ✅ Mobile hamburger icon (white) */}
            {!isDesktop && (
              <button
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                onClick={() => setMobileOpen(true)}
              >
                {/* <MenuOutlined className="text-white text-lg" /> */}
                <MenuOutlined style={{ color: "#ffffff", fontSize: "18px" }} />
              </button>
            )}

            <h1 className="text-sm font-medium text-slate-200 capitalize">
              {activeKey}
            </h1>
          </div>

          <Space>
            <span className="text-sm text-slate-200">Admin</span>
            <Avatar size="small" icon={<UserOutlined />} />
            <button
              className="!text-red-300 font-medium ml-2 cursor-pointer hover:!text-red-200"
              onClick={handleLogout}
            >
              Logout
            </button>
          </Space>
        </Header>

        {/* Content */}
        <Content className="p-6 bg-slate-100">
          <div className="bg-white rounded-xl shadow-sm p-6 ">
            {children}
          </div>
        </Content>

        {/* Footer */}
        {/* <Footer className="text-center text-xs text-slate-500 ">
          © {new Date().getFullYear()} National Palace
        </Footer> */}
      </Layout>
    </Layout>
  );
};

export default NavLayout;
