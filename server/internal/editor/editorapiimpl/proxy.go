package editorapiimpl

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"srv/internal/globals/config"
	"srv/internal/globals/logger"
	"strings"
)

func newProxyHandler() http.Handler {
	var staticServer http.Handler
	staticFilesLocation := config.HTTP().StaticFilesLocation

	logger.Info(logger.FromMessage(
		"editor",
		fmt.Sprintf("Using static files from %s", staticFilesLocation)),
	)

	if strings.HasPrefix(staticFilesLocation, "http://") {
		url, err := url.Parse(staticFilesLocation)
		if err != nil {
			panic(err)
		}

		staticServer = httputil.NewSingleHostReverseProxy(url)
	} else {
		staticServer = http.FileServer(http.Dir("../ui/out"))
	}

	return staticServer
}
