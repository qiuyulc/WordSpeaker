import { useMemo, lazy, type ComponentType, type ReactNode } from "react";
import { type RouteObject, Navigate } from "react-router";
import Layout from "@/layout/layout";
import Empty from "@/layout/empty";

const paths = import.meta.glob("@/views/**/*.tsx");
export interface RouteMetaProps {
  path: string;
  component: string;
  id: string;
  parentId: string | null;
  children?: RouteMetaProps[];
  meta?: {
    title?: string;
    icon?: string;
    menu?: boolean;
    layout?: boolean; //根目录
  };
}

const getElement = (
  path: string,
  paths: Record<string, () => Promise<unknown>>
): ReactNode => {
  if (path === "layout") {
    return <Layout />;
  }
  if (path === "empty") {
    return <Empty />;
  }
  const key = `/src/views/${path}/index.tsx`;
  try {
    const Element = lazy(
      paths[key] as () => Promise<{ default: ComponentType<unknown> }>
    );
    return <Element />;
  } catch (e) {
    console.log(e);
    return <></>;
  }
};

function buildRouteTree(
  data: RouteMetaProps[],
  parentId = "0",
  paths: Record<string, () => Promise<unknown>>
): RouteObject[] {
  return data
    .filter((item) => item.parentId === parentId)
    .map((item) => {
      const children: RouteObject[] = buildRouteTree(data, item.id, paths);
      const { path, component, ...rest } = item;
      const router = {
        path: path,
        element: getElement(component, paths),
        children: children.length ? children : undefined,
        ...rest,
      };
      return router;
    });
}

export const getFirstPath = (routes: RouteObject[]) => {
  let fullPath = "";

  let current = routes?.[0];
  while (current) {
    // 确保 path 存在并去除首尾斜杠
    if (current.path) {
      // 保证路径拼接规范，避免两个斜杠
      fullPath += "/" + current.path.replace(/^\/|\/$/g, "");
    }
    // 继续进入 children 的第一条
    if (!current.children?.[0]) break;

    current = current.children?.[0];
  }

  return fullPath || "/";
};

export const useCalculateRouter: () => {
  routerList: RouteObject[] | [];
} = () => {
  const routerList = useMemo(() => {
    const routes = [
      {
        path: "/",
        component: "layout",
        id: "1",
        parentId: "0",
        meta: {
          layout: true,
        },
      },
      {
        path: "home",
        component: "WordSpeaker",
        id: "2",
        parentId: "1",
        meta: {
          title: "首页",
        },
      },
      {
        path: "trial",
        component: "TrialPractice",
        id: "3",
        parentId: "1",
        meta: {
          title: "试练模式",
        },
      },
      {
        path: "trial_list",
        component: "TrialList",
        id: "4",
        parentId: "0",
        meta: {},
      },
      {
        path: "order_list",
        component: "OrderList",
        id: "5",
        parentId: "0",
        meta: {},
      },
    ];

    const tree = buildRouteTree(routes, "0", paths);

    return [
      {
        path: "/",
        // 使用 index: true 而不是重定向
        index: true,
        element: <Navigate to="/home" replace />,
      },
      ...tree,
      { path: "/*", id: "empty", element: <Empty /> },
    ];
  }, []);
  return {
    routerList,
  };
};
