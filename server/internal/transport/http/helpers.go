package http

import (
	"encoding/json"
	"net/http"
	"srv/internal/components"
	"srv/internal/transport"
	"time"
)

const tokenCookieName = "token"

func setTokenCookie(w http.ResponseWriter, auth components.AuthenticatorToken) {
	http.SetCookie(w, &http.Cookie{
		Name:     tokenCookieName,
		Value:    auth.Token,
		Expires:  auth.Expires,
		Path:     "/",
		Secure:   false, // TODO: for local development
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}

func clearTokenCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     tokenCookieName,
		Value:    "",
		Expires:  time.Now(),
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}

func checkTokenCookie(r *http.Request, auth components.Authenticator) (*components.AuthenticatorLoginResponse, error) {
	tokenCookie, err := r.Cookie(tokenCookieName)
	if err != nil {
		return nil, err
	}

	return auth.CheckToken(tokenCookie.Value)
}

func respondJson(w http.ResponseWriter, statusCode int, jsonData interface{}) {
	w.WriteHeader(statusCode)
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jsonData)
}

func respondError(w http.ResponseWriter, statusCode int, err *transport.TransportError) {
	respondJson(w, statusCode, err.ToApiError())
}
