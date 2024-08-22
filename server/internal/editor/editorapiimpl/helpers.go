package editorapiimpl

import (
	"encoding/json"
	"net/http"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

func respondJson(w http.ResponseWriter, statusCode int, jsonData interface{}) {
	w.WriteHeader(statusCode)
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jsonData)
}

func respondError(w http.ResponseWriter, statusCode int, err common.Error) {
	respondJson(w, statusCode, api.ApiError{
		Code:    err.Code(),
		Message: err.Error(),
		Details: err.Details().Encode(),
	})
}

func respondEmpty(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}
