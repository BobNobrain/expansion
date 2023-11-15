package http

import "net/http"

func (srv *httpServerImpl) serveStatic() {
	staticServer := http.FileServer(http.Dir("../ui/out"))
	srv.server.Handle("/", staticServer)
}
