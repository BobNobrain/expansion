package http

import (
	"net/http"
	"srv/internal/domain"
	"srv/internal/transport/ws"
)

type HTTPServer interface {
	Run(addr string) error
}

type httpServerImpl struct {
	server *http.ServeMux
	auth   domain.Authenticator
	comms  *ws.WSComms
}

func NewHTTPServer(auth domain.Authenticator, comms *ws.WSComms) HTTPServer {
	srv := &httpServerImpl{
		server: http.DefaultServeMux,
		auth:   auth,
		comms:  comms,
	}

	srv.serveAuthAPI()
	srv.serveStatic()
	srv.serveSocket()

	return srv
}

func (srv *httpServerImpl) Run(addr string) error {
	return http.ListenAndServe(addr, srv.server)
}
