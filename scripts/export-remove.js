// This file is a helper for the sapper export
// https://github.com/sveltejs/sapper/issues/1419#issuecomment-676562717
// sapper only crawls through the index.svelte component for the links to export routes
// since we don't have links to all routes on our homepage (only at other routes), we need a workaround
// an element with links to all routes needs to be injected into the index.svelte before running export (and removed after completed)
// this script REMOVES these routes