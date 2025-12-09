import { RouterProvider, createBrowserRouter } from "react-router";
import { useCalculateRouter } from "@/hooks/useCalculateRouter";
import { Suspense } from "react";
import { Loading } from "react-vant";
const RouterView = () => {
  const { routerList } = useCalculateRouter();
  return (
    <Suspense
      fallback={
        <Loading
          color="#3f45ff"
          style={{ display: "inline-flex" }}
          size="24px"
          vertical
        ></Loading>
      }
    >
      <RouterProvider router={createBrowserRouter(routerList)}></RouterProvider>
    </Suspense>
  );
};

export default RouterView;
