package http

import (
	"encoding/json"
	"net/http"
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/transport"
	"srv/pkg/api"
)

func (srv *httpServerImpl) serveAuthAPI() {
	srv.server.HandleFunc("/api/login", func(w http.ResponseWriter, r *http.Request) {
		var loginRequest api.LoginRequestBody
		err := json.NewDecoder(r.Body).Decode(&loginRequest)

		if err != nil {
			respondError(w, http.StatusBadRequest, transport.NewBadJSONError())
			return
		}

		result, err := srv.auth.Login(components.AuthenticatorLoginRequest{
			Username: domain.Username(loginRequest.Username),
			Password: loginRequest.Password,
		})

		if err != nil {
			respondError(w, http.StatusUnauthorized, transport.NewUnauthorizedError())
			return
		}

		setTokenCookie(w, result.Auth)
		respondJson(w, http.StatusOK, &api.LoginResponseBody{
			Username: string(result.User.Username),
		})
	})

	srv.server.HandleFunc("/api/logout", func(w http.ResponseWriter, r *http.Request) {
		_, err := checkTokenCookie(r, srv.auth)
		if err != nil {
			respondError(w, http.StatusUnauthorized, transport.NewUnauthorizedError())
			return
		}

		clearTokenCookie(w)
		respondJson(w, http.StatusOK, &api.LogoutResponseBody{Ok: true})
	})
}
