package http

import (
	"net/http"
	"srv/internal/components"
	"srv/internal/transport/ws"
)

type HTTPServer interface {
	Run(addr string) error
}

type httpServerImpl struct {
	server *http.ServeMux
	auth   components.Authenticator
	comms  *ws.WSComms
}

func NewHTTPServer(auth components.Authenticator, comms *ws.WSComms) (HTTPServer, error) {
	srv := &httpServerImpl{
		server: http.DefaultServeMux,
		auth:   auth,
		comms:  comms,
	}

	srv.serveAuthAPI()
	srv.serveSocket()

	err := srv.serveStatic()
	if err != nil {
		return nil, err
	}

	return srv, nil
}

func (srv *httpServerImpl) Run(addr string) error {
	return http.ListenAndServe(addr, srv.server)
}
