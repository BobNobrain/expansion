package http

import (
	"net/http"
	"srv/internal/config"
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
	cfg    *config.SrvConfig
}

func NewHTTPServer(auth domain.Authenticator, comms *ws.WSComms, cfg *config.SrvConfig) (HTTPServer, error) {
	srv := &httpServerImpl{
		server: http.DefaultServeMux,
		auth:   auth,
		comms:  comms,
		cfg:    cfg,
	}

	srv.serveAuthAPI()

	err := srv.serveStatic()
	if err != nil {
		return nil, err
	}

	srv.serveSocket()

	return srv, nil
}

func (srv *httpServerImpl) Run(addr string) error {
	return http.ListenAndServe(addr, srv.server)
}
