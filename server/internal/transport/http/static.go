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
	gamePathPrefix := config.HTTP().GameUrlPrefix

	if strings.HasPrefix(staticFilesLocation, "http://") {
		staticUrl, err := url.Parse(staticFilesLocation)
		if err != nil {
			return err
		}

		// staticServer = httputil.NewSingleHostReverseProxy(staticUrl)
		staticServer = &httputil.ReverseProxy{
			Director: func(r *http.Request) {
				r.Host = staticUrl.Host
				r.URL.Scheme = staticUrl.Scheme
				r.URL.Host = staticUrl.Host

				pathToServe := r.URL.Path
				if len(pathToServe) >= len(gamePathPrefix) {
					pathToServe = pathToServe[len(gamePathPrefix):]
				}
				if pathToServe == "" {
					pathToServe = "/"
				}

				r.URL.Path = pathToServe
			},
		}
	} else {
		staticServer = http.FileServer(http.Dir("../ui/out"))
	}

	// TODO: implement serving different bundles to different clients
	// a slash at the end is needed to match as a wildcard
	srv.server.Handle(gamePathPrefix+"/", staticServer)
	return nil
}
