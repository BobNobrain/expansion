package api

type LoginRequestBody struct {
	Username   string `json:"username"`
	Password   string `json:"password"`
	RememberMe bool   `json:"rememberMe"`
}

type LoginResponseBody struct {
	Username string `json:"username"`
}

type LogoutResponseBody struct {
	Ok bool `json:"ok"`
}
