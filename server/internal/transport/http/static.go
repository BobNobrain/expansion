package http

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

func (srv *httpServerImpl) serveStatic() error {
	var staticServer http.Handler
	if strings.HasPrefix(srv.cfg.StaticFilesLocation, "http://") {
		url, err := url.Parse(srv.cfg.StaticFilesLocation)
		if err != nil {
			return err
		}

		staticServer = httputil.NewSingleHostReverseProxy(url)
	} else {
		staticServer = http.FileServer(http.Dir("../ui/out"))
	}

	srv.server.Handle("/", staticServer)
	return nil
}
