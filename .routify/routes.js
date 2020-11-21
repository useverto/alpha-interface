/**
 * @roxi/routify 2.7.3
 * File generated Sat Nov 21 2020 20:14:31 GMT+0100 (Central European Standard Time)
 */

export const __version = "2.7.3";
export const __timestamp = "2020-11-21T19:14:31.508Z";

//buildRoutes
import { buildClientTree } from "@roxi/routify/runtime/buildRoutes";

//imports

//options
export const options = {};

//tree
export const _tree = {
  name: "root",
  filepath: "/",
  root: true,
  ownMeta: {},
  absolutePath: "src/pages",
  children: [
    {
      isFile: false,
      isDir: true,
      file: "app",
      filepath: "/app",
      name: "app",
      ext: "",
      badExt: false,
      absolutePath:
        "/home/martonlederer/Desktop/projects/verto/verto/src/pages/app",
      children: [
        {
          isFile: true,
          isDir: false,
          file: "all-transactions.svelte",
          filepath: "/app/all-transactions.svelte",
          name: "all-transactions",
          ext: "svelte",
          badExt: false,
          absolutePath:
            "/home/martonlederer/Desktop/projects/verto/verto/src/pages/app/all-transactions.svelte",
          importPath: "../src/pages/app/all-transactions.svelte",
          isLayout: false,
          isReset: false,
          isIndex: false,
          isFallback: false,
          isPage: true,
          ownMeta: {},
          meta: {
            recursive: true,
            preload: false,
            prerender: true,
          },
          path: "/app/all-transactions",
          id: "_app_allTransactions",
          component: () =>
            import("../src/pages/app/all-transactions.svelte").then(
              (m) => m.default
            ),
        },
      ],
      isLayout: false,
      isReset: false,
      isIndex: false,
      isFallback: false,
      isPage: false,
      ownMeta: {},
      meta: {
        recursive: true,
        preload: false,
        prerender: true,
      },
      path: "/app",
    },
    {
      isFile: true,
      isDir: false,
      file: "gallery.svelte",
      filepath: "/gallery.svelte",
      name: "gallery",
      ext: "svelte",
      badExt: false,
      absolutePath:
        "/home/martonlederer/Desktop/projects/verto/verto/src/pages/gallery.svelte",
      importPath: "../src/pages/gallery.svelte",
      isLayout: false,
      isReset: false,
      isIndex: false,
      isFallback: false,
      isPage: true,
      ownMeta: {},
      meta: {
        recursive: true,
        preload: false,
        prerender: true,
      },
      path: "/gallery",
      id: "_gallery",
      component: () =>
        import("../src/pages/gallery.svelte").then((m) => m.default),
    },
    {
      isFile: true,
      isDir: false,
      file: "gate.svelte",
      filepath: "/gate.svelte",
      name: "gate",
      ext: "svelte",
      badExt: false,
      absolutePath:
        "/home/martonlederer/Desktop/projects/verto/verto/src/pages/gate.svelte",
      importPath: "../src/pages/gate.svelte",
      isLayout: false,
      isReset: false,
      isIndex: false,
      isFallback: false,
      isPage: true,
      ownMeta: {},
      meta: {
        recursive: true,
        preload: false,
        prerender: true,
      },
      path: "/gate",
      id: "_gate",
      component: () =>
        import("../src/pages/gate.svelte").then((m) => m.default),
    },
    {
      isFile: true,
      isDir: false,
      file: "index.svelte",
      filepath: "/index.svelte",
      name: "index",
      ext: "svelte",
      badExt: false,
      absolutePath:
        "/home/martonlederer/Desktop/projects/verto/verto/src/pages/index.svelte",
      importPath: "../src/pages/index.svelte",
      isLayout: false,
      isReset: false,
      isIndex: true,
      isFallback: false,
      isPage: true,
      ownMeta: {},
      meta: {
        recursive: true,
        preload: false,
        prerender: true,
      },
      path: "/index",
      id: "_index",
      component: () =>
        import("../src/pages/index.svelte").then((m) => m.default),
    },
    {
      isFile: true,
      isDir: false,
      file: "login.svelte",
      filepath: "/login.svelte",
      name: "login",
      ext: "svelte",
      badExt: false,
      absolutePath:
        "/home/martonlederer/Desktop/projects/verto/verto/src/pages/login.svelte",
      importPath: "../src/pages/login.svelte",
      isLayout: false,
      isReset: false,
      isIndex: false,
      isFallback: false,
      isPage: true,
      ownMeta: {},
      meta: {
        recursive: true,
        preload: false,
        prerender: true,
      },
      path: "/login",
      id: "_login",
      component: () =>
        import("../src/pages/login.svelte").then((m) => m.default),
    },
    {
      isFile: true,
      isDir: false,
      file: "post.svelte",
      filepath: "/post.svelte",
      name: "post",
      ext: "svelte",
      badExt: false,
      absolutePath:
        "/home/martonlederer/Desktop/projects/verto/verto/src/pages/post.svelte",
      importPath: "../src/pages/post.svelte",
      isLayout: false,
      isReset: false,
      isIndex: false,
      isFallback: false,
      isPage: true,
      ownMeta: {},
      meta: {
        recursive: true,
        preload: false,
        prerender: true,
      },
      path: "/post",
      id: "_post",
      component: () =>
        import("../src/pages/post.svelte").then((m) => m.default),
    },
    {
      isFile: true,
      isDir: false,
      file: "tokens.svelte",
      filepath: "/tokens.svelte",
      name: "tokens",
      ext: "svelte",
      badExt: false,
      absolutePath:
        "/home/martonlederer/Desktop/projects/verto/verto/src/pages/tokens.svelte",
      importPath: "../src/pages/tokens.svelte",
      isLayout: false,
      isReset: false,
      isIndex: false,
      isFallback: false,
      isPage: true,
      ownMeta: {},
      meta: {
        recursive: true,
        preload: false,
        prerender: true,
      },
      path: "/tokens",
      id: "_tokens",
      component: () =>
        import("../src/pages/tokens.svelte").then((m) => m.default),
    },
    {
      isFile: true,
      isDir: false,
      file: "trade.svelte",
      filepath: "/trade.svelte",
      name: "trade",
      ext: "svelte",
      badExt: false,
      absolutePath:
        "/home/martonlederer/Desktop/projects/verto/verto/src/pages/trade.svelte",
      importPath: "../src/pages/trade.svelte",
      isLayout: false,
      isReset: false,
      isIndex: false,
      isFallback: false,
      isPage: true,
      ownMeta: {},
      meta: {
        recursive: true,
        preload: false,
        prerender: true,
      },
      path: "/trade",
      id: "_trade",
      component: () =>
        import("../src/pages/trade.svelte").then((m) => m.default),
    },
    {
      isFile: true,
      isDir: false,
      file: "usa.svelte",
      filepath: "/usa.svelte",
      name: "usa",
      ext: "svelte",
      badExt: false,
      absolutePath:
        "/home/martonlederer/Desktop/projects/verto/verto/src/pages/usa.svelte",
      importPath: "../src/pages/usa.svelte",
      isLayout: false,
      isReset: false,
      isIndex: false,
      isFallback: false,
      isPage: true,
      ownMeta: {},
      meta: {
        recursive: true,
        preload: false,
        prerender: true,
      },
      path: "/usa",
      id: "_usa",
      component: () => import("../src/pages/usa.svelte").then((m) => m.default),
    },
  ],
  isLayout: false,
  isReset: false,
  isIndex: false,
  isFallback: false,
  meta: {
    recursive: true,
    preload: false,
    prerender: true,
  },
  path: "/",
};

export const { tree, routes } = buildClientTree(_tree);
