package http

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"srv/internal/globals/config"
	"strings"
)

func (srv *httpServerImpl) serveStatic() error {
	var staticServer http.Handler
	staticFilesLocation := config.HTTP().StaticFilesLocation
	if strings.HasPrefix(staticFilesLocation, "http://") {
		url, err := url.Parse(staticFilesLocation)
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
